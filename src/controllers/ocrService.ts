// src/controllers/ocrService.ts

import { OCRResponse } from "../types";

// Configuration - you can move this to .env
const BACKEND_OCR_BASE = "http://127.0.0.1:5001";
const OCR_ENDPOINT = `${BACKEND_OCR_BASE.replace(/\/$/, "")}/ocr`;

export class OCRService {
  static async processFile(file: File): Promise<OCRResponse> {
    const form = new FormData();
    form.append("file", file, file.name);

    const response = await fetch(OCR_ENDPOINT, {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      const msg = await response.text().catch(() => "");
      const hint =
        response.status === 404
          ? " (Hint: your Flask route should be POST /ocr — update your frontend URL or server route)"
          : "";
      throw new Error((msg || `OCR API failed with ${response.status}`) + hint);
    }

    return await response.json();
  }

  static async retryOCR(file: File): Promise<OCRResponse> {
    return this.processFile(file);
  }
}