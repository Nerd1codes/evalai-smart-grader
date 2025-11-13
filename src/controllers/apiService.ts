// src/controllers/apiService.ts
// const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const API_BASE =  "http://localhost:5000/api";


function handleJSON(res: Response) {
  if (!res.ok) return res.json().then((e) => Promise.reject(e));
  return res.json();
}

export const api = {
  // Semesters
  getSemesters: () => fetch(`${API_BASE}/semesters`, { credentials: "include" }).then(handleJSON),
  addSemester: (name: string) =>
    fetch(`${API_BASE}/semesters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name }),
    }).then(handleJSON),
  deleteSemester: (semId: string) =>
    fetch(`${API_BASE}/semesters/${semId}`, {
      method: "DELETE",
      credentials: "include",
    }).then(handleJSON),

  // Sections
  addSection: (semId: string, name: string) =>
    fetch(`${API_BASE}/semesters/${semId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name }),
    }).then(handleJSON),
  deleteSection: (semId: string, sectionId: string) =>
    fetch(`${API_BASE}/semesters/${semId}/sections/${sectionId}`, {
      method: "DELETE",
      credentials: "include",
    }).then(handleJSON),

  // Students
  addStudent: (semId: string, sectionId: string, payload: any) =>
    fetch(`${API_BASE}/semesters/${semId}/sections/${sectionId}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }).then(handleJSON),
  deleteStudent: (semId: string, sectionId: string, studentId: string) =>
    fetch(`${API_BASE}/semesters/${semId}/sections/${sectionId}/students/${studentId}`, {
      method: "DELETE",
      credentials: "include",
    }).then(handleJSON),

  // Papers
  addPaper: (semId: string, sectionId: string, payload: any) =>
    fetch(`${API_BASE}/semesters/${semId}/sections/${sectionId}/papers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }).then(handleJSON),
  deletePaper: (semId: string, sectionId: string, paperId: string) =>
    fetch(`${API_BASE}/semesters/${semId}/sections/${sectionId}/papers/${paperId}`, {
      method: "DELETE",
      credentials: "include",
    }).then(handleJSON),
};
