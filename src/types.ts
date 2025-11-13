export interface Student {
  id: string;
  name: string;
  marks: number;
  scriptUrl: string;
  // Add _id and rollNumber as optional for API data
  _id?: any;
  rollNumber?: string;
}

export interface UploadedPaper {
  name: string;
  subject: string;
  ocrStatus?: "idle" | "processing" | "done" | "error";
  ocrText?: string;
  ocrError?: string;
  pages?: number;
}

// Type for the sections object within a semester
export interface Section {
  [sectionName: string]: Student[];
}

// Type for a single semester object
export interface Semester {
  sections: Section;
}

// Type for the main semesters state object
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