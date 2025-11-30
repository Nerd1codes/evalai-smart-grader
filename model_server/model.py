import os
import pickle
import numpy as np
from typing import List, Dict, Any
import requests
import json
import re
from sentence_transformers import SentenceTransformer

# ---------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------

# Work PC Mistral grading FastAPI URL
# Make sure the port (8100) matches your uvicorn command there.
MISTRAL_SERVER_URL = os.getenv(
    "MISTRAL_SERVER_URL",
    "http://192.168.195.100:8100/grade",
)

# Must match the x-api-token expected by the Mistral grading server
MISTRAL_API_TOKEN = os.getenv("MISTRAL_API_TOKEN", "supersecret123")

INDEX_PATH = os.path.join(os.path.dirname(__file__), "all_pdfs_chunks (1).pkl")

# ---------------------------------------------------------------------
# LOAD INDEX
# ---------------------------------------------------------------------

try:
    with open(INDEX_PATH, "rb") as f:
        index_data = pickle.load(f)
except FileNotFoundError:
    print(f"[model.py] Error: Index file not found at {INDEX_PATH}")
    raise
except Exception as e:
    print(f"[model.py] Error loading pickle file: {e}")
    raise

print("[model.py] Loaded index_data type:", type(index_data))

embeddings = None
texts: List[str] = []

if isinstance(index_data, dict):
    print("[model.py] index_data is dict with keys:", list(index_data.keys()))
    if "embeddings" in index_data and "texts" in index_data:
        embeddings = index_data["embeddings"]
        texts = index_data["texts"]
    else:
        raise ValueError(
            f"index_data is dict but missing 'embeddings'/'texts' keys: {index_data.keys()}"
        )

elif isinstance(index_data, (list, tuple)):
    print("[model.py] index_data is", type(index_data), "of length", len(index_data))

    if len(index_data) == 0:
        raise ValueError("index_data is an empty list/tuple")

    first = index_data[0]
    print("[model.py] First element type:", type(first))

    if isinstance(first, dict) and "embedding" in first and "text" in first:
        print("[model.py] Detected format: list of {'embedding', 'text'} dicts")
        embeddings_list = []
        texts_list = []
        for item in index_data:
            embeddings_list.append(item["embedding"])
            texts_list.append(item["text"])
        embeddings = np.array(embeddings_list)
        texts = texts_list

    elif isinstance(first, (list, tuple)) and len(first) == 2:
        print("[model.py] Detected format: list of (embedding, text) pairs")
        embeddings_list = []
        texts_list = []
        for emb, txt in index_data:
            embeddings_list.append(emb)
            texts_list.append(txt)
        embeddings = np.array(embeddings_list)
        texts = texts_list

    elif isinstance(first, str):
        print("[model.py] Detected format: list of text chunks only. Will compute embeddings at startup.")
        texts = list(index_data)
        embeddings = None  # will encode below

    else:
        raise TypeError(
            "index_data is a list/tuple but not in a recognized format. "
            "Expected list of {'embedding','text'} dicts, "
            "list of (embedding,text) pairs, or list of text strings."
        )

else:
    raise TypeError(
        f"Unsupported index_data type: {type(index_data)}. "
        "Expected dict or list/tuple."
    )

print(f"[model.py] texts length: {len(texts)}")

# ---------------------------------------------------------------------
# LOAD EMBEDDING MODEL & CREATE EMBEDDINGS
# ---------------------------------------------------------------------

print("[model.py] Loading SentenceTransformer model...")
embedder = SentenceTransformer("all-mpnet-base-v2")

if embeddings is None:
    print("[model.py] No precomputed embeddings found. Encoding texts now...")
    if not texts:
        raise ValueError("Cannot encode empty 'texts' list.")
    embeddings = embedder.encode(
        texts, convert_to_numpy=True, batch_size=32, show_progress_bar=True
    )
else:
    embeddings = np.array(embeddings)

print("[model.py] embeddings ndim:", embeddings.ndim, "shape:", embeddings.shape)
if embeddings.ndim != 2:
    raise ValueError(f"Expected embeddings to be 2D, got shape {embeddings.shape}")

print("[model.py] ✅ Loaded embeddings and texts successfully.")
print("[model.py] Using MISTRAL_SERVER_URL:", MISTRAL_SERVER_URL)

# ---------------------------------------------------------------------
# RAG: FIND MOST SIMILAR CHUNKS
# ---------------------------------------------------------------------

def find_most_similar_chunks(query_text: str, top_k: int = 3):
    """Return the top_k most similar chunks from the index."""
    query_embedding = embedder.encode(query_text, convert_to_numpy=True)
    similarities = np.dot(query_embedding, embeddings.T)
    top_k_indices = np.argsort(similarities)[::-1][:top_k]

    results = []
    for i in top_k_indices:
        results.append(
            {
                "text": texts[i],
                "similarity": float(similarities[i]),
            }
        )
    return results

# ---------------------------------------------------------------------
# Helper: extract {"marks_awarded", "feedback"} from big response string
# ---------------------------------------------------------------------

def extract_json_block_from_response_text(text: str) -> Dict[str, Any]:
    """
    Your Mistral server returns:
      {"response": " ... prompt ... {\"marks_awarded\": 2.5, \"feedback\": \"...\"}"}

    This tries to find the LAST JSON object in that string that has
    'marks_awarded' and 'feedback'.
    """
    # 1) quick attempt: maybe whole text is JSON
    try:
        obj = json.loads(text)
        if isinstance(obj, dict) and "marks_awarded" in obj and "feedback" in obj:
            return obj
    except Exception:
        pass

    # 2) regex-find all {...} blocks
    matches = re.findall(r"\{.*?\}", text, flags=re.DOTALL)
    for candidate in reversed(matches):  # check from end; last one is usually the answer
        candidate_clean = candidate.replace("\n", " ").replace("\r", " ").strip()
        try:
            obj = json.loads(candidate_clean)
            if isinstance(obj, dict) and "marks_awarded" in obj and "feedback" in obj:
                return obj
        except Exception:
            continue

    # 3) fallback: we couldn't parse; return text as feedback
    return {"marks_awarded": None, "feedback": text.strip()}

# ---------------------------------------------------------------------
# CALL MISTRAL GRADING SERVER (WORK PC)
# ---------------------------------------------------------------------

def call_mistral_grader(
    question: str,
    student_answer: str,
    context: str,
    max_marks: float,
) -> Dict[str, Any]:
    """
    Call the Mistral grading FastAPI on the work PC.

    Expected response from /grade (based on your curl):
      { "response": "<big text with embedded JSON>" }
    """
    payload = {
        "question": question,
        "student_answer": student_answer,
        "context": context,
        "max_marks": max_marks,
    }

    headers = {
        "Content-Type": "application/json",
        "x-api-token": MISTRAL_API_TOKEN,
    }

    try:
        resp = requests.post(MISTRAL_SERVER_URL, json=payload, headers=headers, timeout=60)
        resp.raise_for_status()
        data = resp.json()  # e.g. {"response": "..."}
    except Exception as e:
        print("[model.py] Error communicating with Mistral grading server:", e)
        return {"error": str(e), "llm_error": True}

    # Case 1: already good JSON
    if isinstance(data, dict) and "marks_awarded" in data and "feedback" in data:
        return data

    # Case 2: has "response" with our embedded JSON
    if isinstance(data, dict) and isinstance(data.get("response"), str):
        parsed = extract_json_block_from_response_text(data["response"])
        print("[model.py] Parsed grader JSON:", parsed)
        return parsed

    # Unknown format
    return {"error": f"Unexpected grader response format: {data}", "llm_error": True}

# ---------------------------------------------------------------------
# MAIN ENTRY: grade_answer (used by app.py /evaluate)
# ---------------------------------------------------------------------

def grade_answer(question: str, student_answer: str, max_marks: float) -> Dict[str, Any]:
    """
    Main function used by FastAPI /evaluate endpoint.

    1) Retrieve context using RAG.
    2) Call remote Mistral grader.
    3) Normalize into {score, max_score, feedback, raw}.
    """
    # 1. Retrieve context based on question
    context_chunks = find_most_similar_chunks(question, top_k=3)
    context_text = "\n---\n".join(c["text"] for c in context_chunks)

    # 2. Call the Mistral grading server
    grader_resp = call_mistral_grader(
        question=question,
        student_answer=student_answer,
        context=context_text,
        max_marks=max_marks,
    )

    # If explicit error from grader, propagate
    if "error" in grader_resp and grader_resp.get("llm_error"):
        print("[model.py] Grader returned llm_error:", grader_resp)
        return grader_resp

    marks_awarded = grader_resp.get("marks_awarded")
    feedback = grader_resp.get("feedback", "")

    result: Dict[str, Any] = {
        "score": float(marks_awarded) if marks_awarded is not None else None,
        "max_score": float(max_marks),
        "feedback": feedback,
        "raw": grader_resp,
    }

    print("[model.py] grade_answer result:", result)
    return result
