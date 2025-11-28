// src/controllers/ocrService.ts

import { OCRResponse } from "../types";

// =======================
// CONFIGURATION
// =======================
// Example: Flask backend running Gemini OCR on:
// POST http://127.0.0.1:5001/ocr
//
// You can move to .env → VITE_OCR_API_URL
// =======================
const BACKEND_OCR_BASE =
  "http://127.0.0.1:5001";

const OCR_ENDPOINT = `${BACKEND_OCR_BASE.replace(/\/$/, "")}/ocr`;

// Returned shape:
// interface OCRResponse {
//   text: string;
//   pages?: number;
// }

export class OCRService {
  // --------------------------------------------------
  // Process file normally (initial upload)
  // --------------------------------------------------
  static async processFile(file: File): Promise<OCRResponse> {
    const formData = new FormData();
    formData.append("file", file); // Flask expects request.files["file"]

    let response: Response;

    try {
      response = await fetch(OCR_ENDPOINT, {
        method: "POST",
        body: formData,
      });
    } catch (err) {
      console.error("OCR network error:", err);
      throw new Error(
        "Could not reach OCR server. Check if your Python backend is running."
      );
    }

    if (!response.ok) {
      // Try extracting error from backend
      let errorMessage = `OCR API failed with ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson?.error) errorMessage = errJson.error;
      } catch {
        // ignore JSON parse errors
      }

      // Helpful hint for 404 routing problems
      if (response.status === 404) {
        errorMessage +=
          " (Tip: Your Flask backend must have a POST /ocr route. Check backend URL.)";
      }

      throw new Error(errorMessage);
    }

    // Successful → normal response
    const data = await response.json();

    return {
      text: data?.text ?? "",
      pages:
        typeof data?.pages === "number" && !Number.isNaN(data.pages)
          ? data.pages
          : undefined,
    };
  }

  // --------------------------------------------------
  // Retry OCR → same API call
  // --------------------------------------------------
  static async retryOCR(file: File): Promise<OCRResponse> {
    return this.processFile(file);
  }
}
