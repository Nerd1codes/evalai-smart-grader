// types.ts (UPDATED)

export interface Student {
  id: string;
  name: string;
  marks: number;
  scriptUrl: string;
  // Add _id and rollNumber as optional for API data
  _id?: any;
  rollNumber?: string;
}

// 🎯 NEW: Interface for a structured question
export interface Question {
  _id?: string; // This will be the MongoDB generated questionId
  questionNumber: string; // e.g., "Q1", "Q2a"
  text: string;
  maxMarks: number;
}

// 🎯 NEW: Interface for the main Exam entity (optional, but good for backend/API clarity)
export interface Exam {
  _id: string; // The examId
  semesterId: string;
  sectionId: string;
  subject: string;
  rawQuestionPaperText: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}


export interface UploadedPaper {
  name: string;
  subject: string;
  ocrStatus?: "idle" | "processing" | "done" | "error";
  ocrText?: string;
  ocrError?: string;
  pages?: number;
  // 🎯 ADDED: Link to the newly created Exam record
  examId?: string; 
  // 🎯 ADDED: Store the structured questions here if you want them attached to the paper UI entry
  // structuredQuestions?: Question[]; 
}

// Type for the sections object within a semester
export interface Section {
  [sectionName: string]: Student[];
  // NOTE: If you start linking papers/exams directly to sections in the frontend state, 
  // you might need to update this structure later.
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
  // 🎯 ADDED: Pass the new exam ID through the modal data
  examId?: string; 
}

export interface OCRResponse {
  text?: string;
  pages?: number;
  meta?: any;
}