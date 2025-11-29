import { UploadedPaper, Question } from "@/types"; // Make sure Question and UploadedPaper are imported

const API_BASE = "http://localhost:5000/api"; // Your backend URL

/**
 * Helper to handle fetch responses
 */
const handleResponse = async (response: Response) => {
	const data = await response.json();
	if (!response.ok) {
		// Include the server's message in the error
		throw new Error(data.message || "API request failed");
	}
	return data;
};

/**
 * Main API service object
 */
export const api = {
	getTeacherProfile: async (): Promise<{ id: string; name: string; email: string }> => {
		return handleResponse(
			await fetch(`${API_BASE}/teachers/me`, {
				method: "GET",
				credentials: "include", // This is crucial for sending the auth cookie
			})
		);
	},

	/**
	 * Fetches all semesters, sections, and students.
	 */
	getSemesters: async (): Promise<any[]> => {
		return handleResponse(
			await fetch(`${API_BASE}/semesters`, { credentials: "include" })
		);
	},

	/**
	 * Adds a new semester.
	 */
	addSemester: async (name: string): Promise<any> => {
		return handleResponse(
			await fetch(`${API_BASE}/semesters`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ name }),
			})
		);
	},

	/**
	 * Adds a new section to a semester.
	 */
	addSection: async (semId: string, name: string): Promise<any> => {
		return handleResponse(
			await fetch(`${API_BASE}/semesters/${semId}/sections`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ name }),
			})
		);
	},

	/**
	 * Adds a new student to a section.
	 */
	addStudent: async (
		semId: string,
		secId: string,
		studentData: { name: string; rollNumber: string; marks: number }
	): Promise<any> => {
		return handleResponse(
			await fetch(`${API_BASE}/semesters/${semId}/sections/${secId}/students`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(studentData),
			})
		);
	},

	/**
	 * Updates a student's marks.
	 */
	updateStudentMarks: async (
		semId: string,
		secId: string,
		studentId: string,
		marks: number
	): Promise<any> => {
		return handleResponse(
			await fetch(
				`${API_BASE}/semesters/${semId}/sections/${secId}/students/${studentId}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ marks }),
				}
			)
		);
	},

	/**
	 * Deletes a student from a section.
	 */
	deleteStudent: async (
		semId: string,
		secId: string,
		studentId: string | number
	): Promise<any> => {
		return handleResponse(
			await fetch(
				`${API_BASE}/semesters/${semId}/sections/${secId}/students/${studentId}`,
				{
					method: "DELETE",
					credentials: "include",
				}
			)
		);
	},

	// 🎯 STEP 1: NEW FUNCTION TO CREATE THE EXAM RECORD
	createExam: async (examData: {
		semesterId: string;
		sectionId: string;
		subject: string;
		rawQuestionPaperText: string;
	}): Promise<{ examId: string; rawQuestionPaperText: string }> => {
		return handleResponse(
			await fetch(`${API_BASE}/exams/create`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(examData),
			})
		);
	},
		
	/**
	 * Fetches a single exam record by ID, including its structured questions.
	 */
	getExamById: async (examId: string): Promise<{ exam: any }> => {
		return handleResponse(
			await fetch(`${API_BASE}/exams/${examId}`, {
				method: "GET",
				credentials: "include",
			})
		);
	},

	// 🎯 STEP 2 (original): save structured questions
	saveStructuredQuestions: async (
		examId: string,
		questions: Question[]
	): Promise<{ questions: Question[] }> => {
		return handleResponse(
			await fetch(`${API_BASE}/exams/${examId}/questions`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ questions }),
			})
		);
	},

	// 🎯 STEP 2 (alias used by TeacherDashboard): saveExamQuestions
	// This wraps the same endpoint as saveStructuredQuestions.
	saveExamQuestions: async (
		examId: string,
		questions: { number: number; text: string }[]
	): Promise<{ questions: Question[] }> => {
		// If your Question type has more fields (like maxMarks), you can map/extend here later.
		return handleResponse(
			await fetch(`${API_BASE}/exams/${examId}/questions`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ questions }),
			})
		);
	},

	/**
	 * Adds a paper to a section. (Keep this for now, but your `createExam` replaces its core functionality)
	 */
	addPaper: async (
		semId: string,
		secId: string,
		paperData: Partial<UploadedPaper>
	): Promise<any> => {
		return handleResponse(
			await fetch(`${API_BASE}/semesters/${semId}/sections/${secId}/papers`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(paperData),
			})
		);
	},

	saveStudentAnswers: async (examId: string, studentId: string, answers: { questionId: string; answerText: string }[]) => {
		return handleResponse(
			await fetch(`${API_BASE}/exams/${examId}/students/${studentId}/answers`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ answers }),
			})
		);
	},

	/**
	 * Deletes a paper from a section.
	 */
	deletePaper: async (
		semId: string,
		secId: string,
		paperId: string
	): Promise<any> => {
		return handleResponse(
			await fetch(
				`${API_BASE}/semesters/${semId}/sections/${secId}/papers/${paperId}`,
				{
					method: "DELETE",
					credentials: "include",
				}
			)
		);
	},

	// NEW METHOD: Triggers the evaluation of student answers
	evaluateStudentAnswers: async (examId: string, studentId: string) => {
		return handleResponse(
			await fetch(`${API_BASE}/exams/${examId}/students/${studentId}/evaluate`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
			})
		);
	},
};