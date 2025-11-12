# # server.py
# import os
# import json
# import base64
# import time
# import fitz  # PyMuPDF
# import requests
# from flask import Flask, request, jsonify
# from flask_cors import CORS

# # Get API key from environment variable
# API_KEY = "AIzaSyDrqEOOecUKrwQ1Yy-TddWTwM79wMNoPBc"
# API_URL_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"

# SYSTEM_PROMPT = (
#     "You are an expert transcriber. Your task is to accurately transcribe all "
#     "handwritten cursive text present in the provided image. Preserve all formatting, "
#     "including line breaks, paragraph structure, and punctuation. The text must be "
#     "returned exactly as read."
# )

# app = Flask(__name__)
# # Enable CORS for all routes
# CORS(app)

# def page_pix_to_base64_png(page, dpi=200):
#     """Convert a PyMuPDF page to base64 PNG"""
#     scale = dpi / 72.0
#     mat = fitz.Matrix(scale, scale)
#     pix = page.get_pixmap(matrix=mat, alpha=False)
#     png_bytes = pix.tobytes("png")
#     return base64.b64encode(png_bytes).decode("utf-8"), "image/png"

# def call_gemini_api(base64_data, mime_type, page_index, total_pages):
#     """Call Gemini API to transcribe a single page"""
#     prompt = f"Page {page_index + 1} of {total_pages}: {SYSTEM_PROMPT}"
#     payload = {
#         "contents": [{
#             "role": "user",
#             "parts": [
#                 {"text": prompt},
#                 {"inlineData": {"mimeType": mime_type, "data": base64_data}}
#             ]
#         }],
#         "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]}
#     }
#     headers = {"Content-Type": "application/json"}
#     api_url = f"{API_URL_BASE}?key={API_KEY}"
    
#     resp = requests.post(api_url, headers=headers, data=json.dumps(payload), timeout=120)
#     resp.raise_for_status()
#     result = resp.json()
    
#     text = (
#         result.get("candidates", [{}])[0]
#               .get("content", {})
#               .get("parts", [{}])[0]
#               .get("text")
#     )
#     if not text:
#         raise RuntimeError("No transcription result received from the model.")
#     return text

# def with_exponential_backoff(fn, retries=5, delay=1.0):
#     """Retry function with exponential backoff"""
#     for i in range(retries):
#         try:
#             return fn()
#         except requests.exceptions.RequestException as e:
#             if i == retries - 1:
#                 raise
#             time.sleep(delay * (2 ** i))
#         except Exception:
#             if i == retries - 1:
#                 raise
#             time.sleep(delay * (2 ** i))

# def transcribe_pdf_bytes(pdf_bytes, dpi=200):
#     """Transcribe all pages of a PDF"""
#     doc = fitz.open(stream=pdf_bytes, filetype="pdf")
#     total_pages = len(doc)
#     combined = []
    
#     for i, page in enumerate(doc):
#         print(f"Processing page {i+1}/{total_pages}...")
#         b64, mime = page_pix_to_base64_png(page, dpi=dpi)
#         text = with_exponential_backoff(lambda: call_gemini_api(b64, mime, i, total_pages))
#         combined.append(text)
        
#         if i != total_pages - 1:
#             combined.append(f"\n\n-- PAGE BREAK: {i+1} --\n\n")
    
#     doc.close()
#     return "".join(combined), total_pages

# @app.route("/ocr", methods=["POST", "OPTIONS"])
# def ocr():
#     """OCR endpoint - note the route is /ocr to match frontend"""
#     # Handle preflight request
#     if request.method == "OPTIONS":
#         return jsonify({"ok": True}), 200
    
#     if not API_KEY:
#         return jsonify({"error": "Server missing GEMINI_API_KEY environment variable"}), 500

#     if "file" not in request.files:
#         return jsonify({"error": "No file part named 'file'"}), 400

#     file = request.files["file"]
#     if file.filename == "":
#         return jsonify({"error": "Empty filename"}), 400

#     if not file.filename.lower().endswith(".pdf"):
#         return jsonify({"error": "Only PDF files are supported"}), 400

#     print(f"\n📄 Processing file: {file.filename}")
#     pdf_bytes = file.read()
    
#     try:
#         text, pages = transcribe_pdf_bytes(pdf_bytes, dpi=200)
        
#         # Print to server console
#         print("\n===== TRANSCRIBED TEXT (BEGIN) =====\n")
#         print(text)
#         print("\n===== TRANSCRIBED TEXT (END) =====\n")
        
#         return jsonify({
#             "text": text,
#             "pages": pages,
#             "meta": {
#                 "filename": file.filename,
#                 "model": "gemini-2.0-flash-exp"
#             }
#         })
#     except Exception as e:
#         print(f"❌ Error: {str(e)}")
#         return jsonify({"error": str(e)}), 500

# @app.route("/health", methods=["GET"])
# def health():
#     """Health check endpoint"""
#     return jsonify({
#         "status": "ok",
#         "api_key_configured": bool(API_KEY)
#     })

# if __name__ == "__main__":
#     if not API_KEY:
#         print("\n⚠️  WARNING: GEMINI_API_KEY environment variable not set!")
#         print("Set it with: export GEMINI_API_KEY='your-key-here'\n")
    
#     print("\n🚀 Starting OCR server on http://127.0.0.1:5001")
#     print("📍 OCR endpoint: POST http://127.0.0.1:5001/ocr")
#     print("📍 Health check: GET http://127.0.0.1:5001/health\n")
    
#     app.run(host="0.0.0.0", port=5001, debug=True)
# server.py
import os
import json
import base64
import time
import traceback
import fitz  # PyMuPDF
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

# Get API key from environment variable
API_KEY = "AIzaSyDrqEOOecUKrwQ1Yy-TddWTwM79wMNoPBc"
API_URL_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"

SYSTEM_PROMPT = (
    "You are an expert transcriber. Your task is to accurately transcribe all "
    "handwritten cursive text present in the provided image. Preserve all formatting, "
    "including line breaks, paragraph structure, and punctuation. The text must be "
    "returned exactly as read."
)

app = Flask(__name__)
# Enable CORS for all routes
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Increase max content length to 50MB
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

def page_pix_to_base64_png(page, dpi=150):
    """Convert a PyMuPDF page to base64 PNG - reduced DPI for faster processing"""
    try:
        scale = dpi / 72.0
        mat = fitz.Matrix(scale, scale)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        png_bytes = pix.tobytes("png")
        b64 = base64.b64encode(png_bytes).decode("utf-8")
        print(f"  ✓ Generated image: {len(b64)} chars, {len(png_bytes)} bytes")
        return b64, "image/png"
    except Exception as e:
        print(f"  ✗ Error converting page to PNG: {str(e)}")
        raise

def call_gemini_api(base64_data, mime_type, page_index, total_pages):
    """Call Gemini API to transcribe a single page"""
    prompt = f"Page {page_index + 1} of {total_pages}: Transcribe all text exactly as written."
    
    payload = {
        "contents": [{
            "role": "user",
            "parts": [
                {"text": prompt},
                {"inlineData": {"mimeType": mime_type, "data": base64_data}}
            ]
        }],
        "generationConfig": {
            "temperature": 0.1,
            "topK": 1,
            "topP": 1,
            "maxOutputTokens": 2048
        }
    }
    
    headers = {"Content-Type": "application/json"}
    api_url = f"{API_URL_BASE}?key={API_KEY}"
    
    print(f"  → Calling Gemini API...")
    start_time = time.time()
    
    try:
        resp = requests.post(
            api_url, 
            headers=headers, 
            data=json.dumps(payload), 
            timeout=90  # 90 second timeout
        )
        elapsed = time.time() - start_time
        print(f"  ✓ API response received in {elapsed:.1f}s (status {resp.status_code})")
        
        resp.raise_for_status()
        result = resp.json()
        
        # Extract text
        text = (
            result.get("candidates", [{}])[0]
                  .get("content", {})
                  .get("parts", [{}])[0]
                  .get("text", "")
        )
        
        if not text:
            print(f"  ⚠ Warning: No text extracted from page {page_index + 1}")
            return "[No text detected on this page]"
        
        print(f"  ✓ Extracted {len(text)} characters")
        return text
        
    except requests.exceptions.Timeout:
        print(f"  ✗ API timeout after {time.time() - start_time:.1f}s")
        raise RuntimeError(f"Gemini API timeout on page {page_index + 1}")
    except requests.exceptions.RequestException as e:
        print(f"  ✗ API request failed: {str(e)}")
        raise RuntimeError(f"Gemini API error on page {page_index + 1}: {str(e)}")
    except Exception as e:
        print(f"  ✗ Unexpected error: {str(e)}")
        raise

def with_exponential_backoff(fn, retries=3, delay=2.0):
    """Retry function with exponential backoff"""
    for i in range(retries):
        try:
            return fn()
        except Exception as e:
            if i == retries - 1:
                print(f"  ✗ All {retries} retry attempts failed")
                raise
            wait_time = delay * (2 ** i)
            print(f"  ⟳ Retry {i+1}/{retries} after {wait_time}s... ({str(e)})")
            time.sleep(wait_time)

def transcribe_pdf_bytes(pdf_bytes, dpi=150):
    """Transcribe all pages of a PDF"""
    print(f"\n📄 Opening PDF ({len(pdf_bytes)} bytes)...")
    
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        total_pages = len(doc)
        print(f"✓ PDF opened: {total_pages} page(s)")
        
        # Limit pages for safety
        if total_pages > 20:
            print(f"⚠ Warning: PDF has {total_pages} pages. Processing first 20 only.")
            total_pages = 20
        
        combined = []
        
        for i in range(total_pages):
            print(f"\n📃 Processing page {i+1}/{total_pages}...")
            
            try:
                page = doc[i]
                b64, mime = page_pix_to_base64_png(page, dpi=dpi)
                
                # Call API with retry
                text = with_exponential_backoff(
                    lambda: call_gemini_api(b64, mime, i, total_pages)
                )
                
                combined.append(text)
                
                if i != total_pages - 1:
                    combined.append(f"\n\n--- PAGE {i+1} END ---\n\n")
                
                print(f"✓ Page {i+1} complete")
                
            except Exception as e:
                error_msg = f"[Error processing page {i+1}: {str(e)}]"
                print(f"✗ {error_msg}")
                combined.append(error_msg)
        
        doc.close()
        final_text = "".join(combined)
        print(f"\n✓ Transcription complete: {len(final_text)} characters total")
        
        return final_text, total_pages
        
    except Exception as e:
        print(f"\n✗ PDF processing failed: {str(e)}")
        print(traceback.format_exc())
        raise

@app.route("/ocr", methods=["POST", "OPTIONS"])
def ocr():
    """OCR endpoint"""
    # Handle preflight request
    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200
    
    print("\n" + "="*60)
    print("🔍 OCR Request Received")
    print("="*60)
    
    # Check API key
    if not API_KEY:
        print("✗ GEMINI_API_KEY not configured")
        return jsonify({
            "error": "Server configuration error: GEMINI_API_KEY not set"
        }), 500
    
    print(f"✓ API key configured: {API_KEY[:10]}...")
    
    # Check file upload
    if "file" not in request.files:
        print("✗ No file in request")
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    
    if not file or file.filename == "":
        print("✗ Empty file")
        return jsonify({"error": "Empty file"}), 400

    if not file.filename.lower().endswith(".pdf"):
        print(f"✗ Invalid file type: {file.filename}")
        return jsonify({"error": "Only PDF files are supported"}), 400

    print(f"✓ File received: {file.filename}")
    
    try:
        # Read file
        pdf_bytes = file.read()
        print(f"✓ File read: {len(pdf_bytes)} bytes ({len(pdf_bytes)/1024:.1f} KB)")
        
        if len(pdf_bytes) == 0:
            return jsonify({"error": "Empty PDF file"}), 400
        
        if len(pdf_bytes) > 50 * 1024 * 1024:
            return jsonify({"error": "PDF too large (max 50MB)"}), 400
        
        # Process PDF
        text, pages = transcribe_pdf_bytes(pdf_bytes, dpi=150)
        
        # Return result
        result = {
            "text": text,
            "pages": pages,
            "meta": {
                "filename": file.filename,
                "size_bytes": len(pdf_bytes),
                "model": "gemini-2.0-flash-exp"
            }
        }
        
        print(f"\n✓ SUCCESS: Returning {len(text)} characters")
        print("="*60 + "\n")
        
        return jsonify(result), 200
        
    except Exception as e:
        error_msg = str(e)
        print(f"\n✗ ERROR: {error_msg}")
        print(traceback.format_exc())
        print("="*60 + "\n")
        
        return jsonify({
            "error": error_msg,
            "type": type(e).__name__
        }), 500

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "api_key_configured": bool(API_KEY),
        "max_file_size_mb": 50
    })

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"error": "File too large (max 50MB)"}), 413

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 EvalAI OCR Server")
    print("="*60)
    
    if not API_KEY:
        print("⚠️  WARNING: GEMINI_API_KEY not set!")
        print("   Set it with: export GEMINI_API_KEY='your-key-here'\n")
    else:
        print(f"✓ API Key: {API_KEY[:10]}...{API_KEY[-4:]}")
    
    print(f"✓ Server: http://127.0.0.1:5001")
    print(f"✓ OCR endpoint: POST /ocr")
    print(f"✓ Health check: GET /health")
    print(f"✓ Max file size: 50MB")
    print("="*60 + "\n")
    
    # Use Werkzeug server with increased timeout
    from werkzeug.serving import run_simple
    run_simple(
        '127.0.0.1', 
        5001, 
        app, 
        use_reloader=True, 
        use_debugger=True,
        threaded=True
    )