

# import os
# import sys
# import base64
# import json
# import time
# import requests

# # --- CONFIGURATION ---
# # IMPORTANT: Either set GEMINI_API_KEY in your environment, or put your key directly here.
# API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyDrqEOOecUKrwQ1Yy-TddWTwM79wMNoPBc")  # <-- replace if not using env
# API_URL_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent"

# # Instructions for the model
# SYSTEM_PROMPT = (
#     "You are an expert transcriber. Your task is to accurately transcribe all "
#     "handwritten cursive text present in the provided image. Preserve all formatting, "
#     "including line breaks, paragraph structure, and punctuation. The text must be "
#     "returned exactly as read."
# )


# def file_to_base64(filepath):
#     """Converts a local image file to a Base64 string and determines its MIME type."""
#     try:
#         with open(filepath, "rb") as image_file:
#             encoded_string = base64.b64encode(image_file.read()).decode("utf-8")

#         extension = os.path.splitext(filepath)[1].lower()
#         if extension in [".jpg", ".jpeg"]:
#             mime_type = "image/jpeg"
#         elif extension == ".png":
#             mime_type = "image/png"
#         else:
#             raise ValueError(
#                 f"Unsupported image file type: {extension}. Use PNG or JPEG."
#             )

#         return encoded_string, mime_type
#     except Exception as e:
#         print(f"Error reading or encoding file {filepath}: {e}")
#         return None, None


# def call_gemini_api(base64_data, mime_type, page_index=0, total_pages=1):
#     """Makes a single API call to the Gemini model for transcription."""

#     prompt = f"Page {page_index + 1} of {total_pages}: {SYSTEM_PROMPT}"

#     payload = {
#         "contents": [
#             {
#                 "role": "user",
#                 "parts": [
#                     {"text": prompt},
#                     {
#                         "inlineData": {
#                             "mimeType": mime_type,
#                             "data": base64_data,
#                         }
#                     },
#                 ],
#             }
#         ],
#         "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
#     }

#     headers = {"Content-Type": "application/json"}
#     api_url = f"{API_URL_BASE}?key={API_KEY}"

#     response = requests.post(api_url, headers=headers, data=json.dumps(payload))
#     response.raise_for_status()

#     result = response.json()

#     # Safely handle cases where 'candidates' might be missing
#     candidates = result.get("candidates")
#     if not candidates:
#         print("⚠️ Unexpected Gemini response (no 'candidates' field). Full response below:")
#         print(json.dumps(result, indent=2))
#         raise Exception("No 'candidates' field in Gemini response.")

#     parts = candidates[0].get("content", {}).get("parts", [])
#     if not parts or "text" not in parts[0]:
#         print("⚠️ Unexpected Gemini response structure. Full response below:")
#         print(json.dumps(result, indent=2))
#         raise Exception("No text found in Gemini response parts.")

#     generated_text = parts[0]["text"]
#     if not generated_text:
#         raise Exception("Empty transcription result received from the model.")

#     return generated_text


# def with_exponential_backoff(api_call_func, retries=5, delay=1.0):
#     """Implements exponential backoff retry logic for reliable API calls."""
#     for i in range(retries):
#         try:
#             return api_call_func()
#         except requests.exceptions.RequestException as e:
#             if i == retries - 1:
#                 print(f"Failed after {retries} attempts.")
#                 raise e
#             wait_time = delay * (2 ** i)
#             print(f"Request failed: {e}. Retrying in {wait_time:.2f} seconds...")
#             time.sleep(wait_time)
#         except Exception as e:
#             if i == retries - 1:
#                 print(f"Application error failed after {retries} attempts.")
#                 raise e
#             wait_time = delay * (2 ** i)
#             print(f"Application error: {e}. Retrying in {wait_time:.2f} seconds...")
#             time.sleep(wait_time)


# def process_single_file(image_path):
#     """
#     Process a single image file and print the extracted text.
#     """
#     if API_KEY == "YOUR_GEMINI_API_KEY":
#         print(
#             "ERROR: Please update the 'API_KEY' variable or set GEMINI_API_KEY "
#             "environment variable with your actual Gemini API key."
#         )
#         return

#     if not os.path.isfile(image_path):
#         print(f"ERROR: File does not exist: {image_path}")
#         return

#     print(f"\n--- Processing single image: {image_path} ---")

#     base64_data, mime_type = file_to_base64(image_path)
#     if not base64_data:
#         print("Failed to encode image.")
#         return

#     try:
#         transcription = with_exponential_backoff(
#             lambda: call_gemini_api(base64_data, mime_type, 0, 1)
#         )
#         print("\n===== EXTRACTED TEXT START =====\n")
#         print(transcription)
#         print("\n===== EXTRACTED TEXT END =====\n")
#     except Exception as e:
#         print(f"ERROR: Failed to transcribe image: {e}")


# def process_files(input_dir, output_file="transcribed_document.txt"):
#     """
#     Process all image files in a directory, call the API, and save the combined results.
#     """
#     if API_KEY == "YOUR_GEMINI_API_KEY":
#         print(
#             "ERROR: Please update the 'API_KEY' variable or set GEMINI_API_KEY "
#             "environment variable with your actual Gemini API key."
#         )
#         return

#     image_files = sorted(
#         [
#             f
#             for f in os.listdir(input_dir)
#             if f.lower().endswith((".png", ".jpg", ".jpeg"))
#         ],
#         key=lambda x: [
#             int(s) if s.isdigit() else s.lower()
#             for s in os.path.splitext(x)[0].split("_")
#         ],
#     )

#     total_pages = len(image_files)

#     if total_pages == 0:
#         print(f"No image files found in the directory: {input_dir}")
#         return

#     print(f"Found {total_pages} page images to process.")

#     combined_transcription = []

#     for i, filename in enumerate(image_files):
#         page_num = i + 1
#         filepath = os.path.join(input_dir, filename)

#         print(f"\n--- Processing Page {page_num}/{total_pages} ({filename}) ---")

#         base64_data, mime_type = file_to_base64(filepath)
#         if not base64_data:
#             combined_transcription.append(f"!! PAGE BREAK - ERROR ON PAGE {page_num} !!\n")
#             continue

#         try:
#             transcription = with_exponential_backoff(
#                 lambda: call_gemini_api(base64_data, mime_type, i, total_pages)
#             )

#             print(
#                 f"Successfully transcribed Page {page_num}. "
#                 f"Length: {len(transcription)} characters."
#             )

#             combined_transcription.append(transcription)
#             combined_transcription.append(f"\n\n-- PAGE BREAK: {page_num} --\n\n")

#         except Exception as e:
#             error_message = (
#                 f"Failed to transcribe page {page_num} due to API/Network error: {e}"
#             )
#             print(f"ERROR: {error_message}")
#             combined_transcription.append(
#                 f"!! PAGE BREAK - ERROR: {e} ON PAGE {page_num} !!\n"
#             )

#     if combined_transcription and combined_transcription[-1].startswith(
#         "\n\n-- PAGE BREAK"
#     ):
#         combined_transcription.pop()

#     try:
#         with open(output_file, "w", encoding="utf-8") as f:
#             f.writelines(combined_transcription)
#         print("\n*** Transcription Complete! ***")
#         print(
#             f"All {total_pages} pages were processed. "
#             f"Results saved to '{output_file}'"
#         )
#     except Exception as e:
#         print(f"FATAL ERROR: Could not write output file {output_file}: {e}")


# if __name__ == "__main__":
#     if len(sys.argv) != 2:
#         print("Usage:")
#         print("  python transcriber.py <path_to_image_or_directory>")
#         print("\nExamples:")
#         print("  python transcriber.py ./page_01.png      # single image")
#         print("  python transcriber.py ./my_pdf_pages     # directory of images")
#     else:
#         input_path = sys.argv[1]
#         if os.path.isfile(input_path):
#             process_single_file(input_path)
#         elif os.path.isdir(input_path):
#             process_files(input_path)
#         else:
#             print(f"ERROR: Path is neither a file nor a directory: {input_path}")

import os
import base64
import json
import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

# ==========================
# CONFIGURATION
# ==========================
API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyDrqEOOecUKrwQ1Yy-TddWTwM79wMNoPBc")
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
