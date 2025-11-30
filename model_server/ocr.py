import os
import base64
import json
import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

# ==========================
# CONFIGURATION
# ==========================
API_KEY = "api"
API_URL_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent"

SYSTEM_PROMPT = (
    "You are an expert transcriber. Your task is to accurately transcribe all "
    "handwritten cursive and printed text present in the provided image. Preserve all formatting, "
    "including line breaks, paragraph structure, and punctuation. The text must be "
    "returned exactly as read."
)

app = Flask(__name__)
CORS(app)  # allow all origins; you can restrict later if needed


# ==========================
# HELPER FUNCTIONS
# ==========================

def infer_mime_type(filename: str) -> str:
    """Infer MIME type based on file extension."""
    extension = os.path.splitext(filename)[1].lower()
    if extension in [".jpg", ".jpeg"]:
        return "image/jpeg"
    elif extension == ".png":
        return "image/png"
    else:
        raise ValueError(
            f"Unsupported image file type: {extension}. Use PNG or JPEG."
        )


def call_gemini_api(base64_data: str, mime_type: str, page_index: int = 0, total_pages: int = 1) -> str:
    """Makes a single API call to the Gemini model for transcription."""
    if not API_KEY:
        raise RuntimeError("Missing Gemini API key. Set GEMINI_API_KEY or API_KEY.")

    prompt = f"Page {page_index + 1} of {total_pages}: {SYSTEM_PROMPT}"

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": prompt},
                    {
                        "inlineData": {
                            "mimeType": mime_type,
                            "data": base64_data,
                        }
                    },
                ],
            }
        ],
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
    }

    headers = {"Content-Type": "application/json"}
    api_url = f"{API_URL_BASE}?key={API_KEY}"

    response = requests.post(api_url, headers=headers, data=json.dumps(payload))
    response.raise_for_status()

    result = response.json()

    # Safely handle cases where 'candidates' might be missing
    candidates = result.get("candidates")
    if not candidates:
        # Log full response on server for debugging
        print("⚠️ Unexpected Gemini response (no 'candidates' field):")
        print(json.dumps(result, indent=2))
        raise Exception("No 'candidates' field in Gemini response.")

    parts = candidates[0].get("content", {}).get("parts", [])
    if not parts or "text" not in parts[0]:
        print("⚠️ Unexpected Gemini response structure:")
        print(json.dumps(result, indent=2))
        raise Exception("No text found in Gemini response parts.")

    generated_text = parts[0]["text"]
    if not generated_text:
        raise Exception("Empty transcription result received from the model.")

    return generated_text


def with_exponential_backoff(api_call_func, retries: int = 5, delay: float = 1.0):
    """Implements exponential backoff retry logic for reliable API calls."""
    for i in range(retries):
        try:
            return api_call_func()
        except requests.exceptions.RequestException as e:
            if i == retries - 1:
                print(f"Failed after {retries} attempts.")
                raise e
            wait_time = delay * (2 ** i)
            print(f"Request failed: {e}. Retrying in {wait_time:.2f} seconds...")
            time.sleep(wait_time)
        except Exception as e:
            if i == retries - 1:
                print(f"Application error failed after {retries} attempts.")
                raise e
            wait_time = delay * (2 ** i)
            print(f"Application error: {e}. Retrying in {wait_time:.2f} seconds...")
            time.sleep(wait_time)


# ==========================
# FLASK ROUTE
# ==========================

@app.route("/ocr", methods=["POST"])
def ocr_endpoint():
    """
    Accepts multipart/form-data with a single file field named 'file'.
    Returns JSON: { "text": "...", "pages": 1 } or { "error": "..." }.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file part in request. Expected field name 'file'."}), 400

    uploaded_file = request.files["file"]

    if uploaded_file.filename == "":
        return jsonify({"error": "No selected file."}), 400

    try:
        mime_type = infer_mime_type(uploaded_file.filename)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    try:
        # Read file contents in memory
        file_bytes = uploaded_file.read()
        base64_data = base64.b64encode(file_bytes).decode("utf-8")
    except Exception as e:
        return jsonify({"error": f"Failed to read/encode file: {e}"}), 500

    try:
        transcription = with_exponential_backoff(
            lambda: call_gemini_api(base64_data, mime_type, 0, 1)
        )
        # Success response shape expected by OCRService.ts
        return jsonify({
            "text": transcription,
            "pages": 1
        }), 200

    except Exception as e:
        # Log server-side for debugging
        print(f"ERROR in /ocr: {e}")
        return jsonify({
            "error": f"OCR processing failed: {str(e)}"
        }), 500


# ==========================
# MAIN ENTRYPOINT
# ==========================

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5001"))
    # Run on 0.0.0.0 so your frontend can reach it via 127.0.0.1
    app.run(host="0.0.0.0", port=port, debug=True)
