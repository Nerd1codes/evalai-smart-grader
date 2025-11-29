import os
import pickle
import numpy as np
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
import requests

# config.py must define:
#   MISTRAL_SERVER_URL = "http://<zerotier-ip-of-work-pc>:8000/grade"
#   MISTRAL_API_TOKEN  = "<same as API_TOKEN in server.py>"
from config import MISTRAL_SERVER_URL, MISTRAL_API_TOKEN

# ============================================================
# 1. Load index safely at startup
# ============================================================

INDEX_PATH = os.path.join(os.path.dirname(__file__), "all_pdfs_chunks (1).pkl")

try:
    with open(INDEX_PATH, "rb") as f:
        index_data = pickle.load(f)
except FileNotFoundError:
    print(f"[model.py] Error: Index file not found at {INDEX_PATH}")
    raise SystemExit(1)
except Exception as e:
    print(f"[model.py] Error loading pickle file: {e}")
    raise SystemExit(1)

print("[model.py] Loaded index_data type:", type(index_data))

embeddings = None
texts: List[str] = []

# ---------- Detect data format ----------

if isinstance(index_data, dict):
    # Case 1: direct dict {"embeddings": ..., "texts": ...}
    print("[model.py] index_data is dict with keys:", list(index_data.keys()))
    if "embeddings" in index_data and "texts" in index_data:
        embeddings = index_data["embeddings"]
        texts = index_data["texts"]
    else:
        raise ValueError(
            f"index_data is dict but missing 'embeddings'/'texts' keys: {index_data.keys()}"
        )

elif isinstance(index_data, (list, tuple)):
    # Case 2: list/tuple – several possible layouts
    print("[model.py] index_data is", type(index_data), "of length", len(index_data))

    if len(index_data) == 0:
        raise ValueError("index_data is an empty list/tuple")

    first = index_data[0]
    print("[model.py] First element type:", type(first))

    if isinstance(first, dict) and "embedding" in first and "text" in first:
        # 2a: list of dicts with 'embedding' and 'text'
        print("[model.py] Detected format: list of {'embedding', 'text'} dicts")
        embeddings_list = []
        texts_list = []
        for item in index_data:
            embeddings_list.append(item["embedding"])
            texts_list.append(item["text"])
        embeddings = np.array(embeddings_list)
        texts = texts_list

    elif isinstance(first, (list, tuple)) and len(first) == 2:
        # 2b: list of (embedding, text) pairs
        print("[model.py] Detected format: list of (embedding, text) pairs")
        embeddings_list = []
        texts_list = []
        for emb, txt in index_data:
            embeddings_list.append(emb)
            texts_list.append(txt)
        embeddings = np.array(embeddings_list)
        texts = texts_list

    elif isinstance(first, str):
        # 2c: list of plain text chunks
        print("[model.py] Detected format: list of text chunks only. Will compute embeddings at startup.")
        texts = list(index_data)
        embeddings = None  # will be computed after we load the SentenceTransformer

    else:
        raise TypeError(
            "index_data is a list/tuple but not in a recognized format. "
            "Expected one of:\n"
            " - list of {'embedding', 'text'} dicts,\n"
            " - list of (embedding, text) pairs,\n"
            " - list of text strings, or\n"
            " - dict with 'embeddings' and 'texts' keys."
        )

else:
    raise TypeError(
        f"Unsupported index_data type: {type(index_data)}. Expected dict or list/tuple."
    )

print(f"[model.py] texts length: {len(texts)}")

# ============================================================
# 2. Load embedding model & compute embeddings if needed
# ============================================================

print("[model.py] Loading SentenceTransformer model...")
embedder = SentenceTransformer("all-mpnet-base-v2")

if embeddings is None:
    print("[model.py] No precomputed embeddings found. Encoding texts now...")
    if not texts:
        raise ValueError("Cannot encode empty 'texts' list.")

    embeddings = embedder.encode(
        texts,
        convert_to_numpy=True,
        batch_size=32,
        show_progress_bar=True,
    )
else:
    embeddings = np.array(embeddings)

print("[model.py] embeddings ndim:", embeddings.ndim, "shape:", embeddings.shape)

if embeddings.ndim != 2:
    raise ValueError(f"Expected embeddings to be 2D, got shape {embeddings.shape}")

print("[model.py] ✅ Loaded embeddings and texts successfully.")

# ============================================================
# 3. Retrieval: find most similar chunks
# ============================================================

def find_most_similar_chunks(query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Encodes the query and finds the top_k most similar chunks from the loaded index.
    """
    query_embedding = embedder.encode(query_text, convert_to_numpy=True)
    similarities = np.dot(query_embedding, embeddings.T)
    top_k_indices = np.argsort(similarities)[::-1][:top_k]

    results: List[Dict[str, Any]] = []
    for i in top_k_indices:
        results.append(
            {
                "text": texts[i],
                "similarity": float(similarities[i]),
            }
        )

    return results

# ============================================================
# 4. Call remote Mistral grading server (WORK PC on port 8000)
# ============================================================

def get_mistral_response(
    question: str,
    student_answer: str,
    context: str,
    max_marks: float,
) -> Dict[str, Any]:
    """
    Calls the Mistral grading server /grade endpoint defined in server.py on WORK PC.

    server.py expects:
      - Header: x-api-token: <MISTRAL_API_TOKEN>
      - JSON body: {question, student_answer, context, max_marks}

    and returns:
      {
        "marks_awarded": number,
        "feedback": "...",
        "raw": "full generated text"
      }
    """
    headers = {
        "x-api-token": MISTRAL_API_TOKEN,
        "Content-Type": "application/json",
    }

    payload = {
        "question": question,
        "student_answer": student_answer,
        "context": context,
        "max_marks": max_marks,
    }

    try:
        resp = requests.post(MISTRAL_SERVER_URL, headers=headers, json=payload, timeout=120)
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.RequestException as e:
        print(f"[model.py] Error communicating with Mistral grading server: {e}")
        return {
            "error": str(e),
            "llm_error": True,
        }

# ============================================================
# 5. Main entry point used by app.py
# ============================================================

def grade_answer(question: str, student_answer: str, max_marks: float) -> Dict[str, Any]:
    """
    Main entry point used by app.py

    app.py does:
      result = await anyio.to_thread.run_sync(
          grade_answer,
          payload.question,
          payload.student_answer,
          payload.max_marks,
      )

    This function:
      1. Uses RAG to retrieve relevant context from the local index.
      2. Calls the remote Mistral grading server (/grade) on the WORK PC.
      3. Normalizes the response into:
         {
           "score": ...,
           "max_score": ...,
           "feedback": "...",
           "raw": <original server response>
         }
    """

    # 1. Build retrieval query (simple combo, tweak if you want)
    retrieval_query = f"{question}\n{student_answer}"

    # 2. Get top-k context chunks
    context_chunks = find_most_similar_chunks(retrieval_query, top_k=3)
    context_text = "\n---\n".join([c["text"] for c in context_chunks])

    # 3. Call remote grading server
    grader_response = get_mistral_response(
        question=question,
        student_answer=student_answer,
        context=context_text,
        max_marks=max_marks,
    )

    # If the request failed, bubble up the error so FastAPI can handle it
    if grader_response.get("llm_error"):
        return grader_response

    # server.py returns: {"marks_awarded": ..., "feedback": ..., "raw": ...}
    marks_awarded = grader_response.get("marks_awarded")
    feedback = grader_response.get("feedback", "")

    score = float(marks_awarded) if marks_awarded is not None else None

    result: Dict[str, Any] = {
        "score": score,
        "max_score": float(max_marks),
        "feedback": feedback,
        "raw": grader_response,
    }

    return result
