// src/types.ts

export interface Student {
  id: number;
  name: string;
  marks: number;
  scriptUrl: string;
}

export interface UploadedPaper {
  name: string;
  subject: string;
  ocrStatus?: "idle" | "processing" | "done" | "error";
  ocrText?: string;
  ocrError?: string;
  pages?: number;
}

export interface Section {
  [sectionName: string]: Student[];
}

export interface Semester {
  sections: Section;
}

export interface Semesters {
  [semesterName: string]: Semester;
}

export interface OCRModalData {
  subject: string;
  filename: string;
  text?: string;
  pages?: number;
}

export interface OCRResponse {
  text?: string;
  pages?: number;
  meta?: any;
}