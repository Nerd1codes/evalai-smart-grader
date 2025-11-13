// // src/controllers/apiService.ts
// // const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
// const API_BASE =  "http://localhost:5000/api";


// function handleJSON(res: Response) {
//   if (!res.ok) return res.json().then((e) => Promise.reject(e));
//   return res.json();
// }

// export const api = {
//   // Semesters
//   getSemesters: () => fetch(`${API_BASE}/semesters`, { credentials: "include" }).then(handleJSON),
//   addSemester: (name: string) =>
//     fetch(`${API_BASE}/semesters`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({ name }),
//     }).then(handleJSON),
//   deleteSemester: (semId: string) =>
//     fetch(`${API_BASE}/semesters/${semId}`, {
//       method: "DELETE",
//       credentials: "include",
//     }).then(handleJSON),

//   // Sections
//   addSection: (semId: string, name: string) =>
//     fetch(`${API_BASE}/semesters/${semId}/sections`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({ name }),
//     }).then(handleJSON),
//   deleteSection: (semId: string, sectionId: string) =>
//     fetch(`${API_BASE}/semesters/${semId}/sections/${sectionId}`, {
//       method: "DELETE",
//       credentials: "include",
//     }).then(handleJSON),

//   // Students
//   addStudent: (semId: string, sectionId: string, payload: any) =>
//     fetch(`${API_BASE}/semesters/${semId}/sections/${sectionId}/students`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify(payload),
//     }).then(handleJSON),
//   deleteStudent: (semId: string, sectionId: string, studentId: string) =>
//     fetch(`${API_BASE}/semesters/${semId}/sections/${sectionId}/students/${studentId}`, {
//       method: "DELETE",
//       credentials: "include",
//     }).then(handleJSON),

//   // Papers
//   addPaper: (semId: string, sectionId: string, payload: any) =>
//     fetch(`${API_BASE}/semesters/${semId}/sections/${sectionId}/papers`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify(payload),
//     }).then(handleJSON),
//   deletePaper: (semId: string, sectionId: string, paperId: string) =>
//     fetch(`${API_BASE}/semesters/${semId}/sections/${sectionId}/papers/${paperId}`, {
//       method: "DELETE",
//       credentials: "include",
//     }).then(handleJSON),
// };




import { Semesters, UploadedPaper } from "@/types";

const API_BASE = "http://localhost:5000/api"; // Your backend URL

/**
 * Helper to handle fetch responses
 */
const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
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
   * Your dashboard's `transformServerToFrontend` will handle this.
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
   * ✅ ADDED: Adds a new student to a section.
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
   * ✅ ADDED: Updates a student's marks.
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

  /**
   * Adds a paper to a section.
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
};