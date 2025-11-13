// import React, { useEffect, useState } from "react";
// import { Award } from "lucide-react";
// import { Header } from "@/components/teacher_components/Header";
// import { SemesterSectionSelector } from "@/components/teacher_components/SemesterSectionSelector";
// import { AddSemesterSectionModal } from "@/components/teacher_components/AddSemesterSectionModal";
// import { OCRResultModal } from "@/components/teacher_components/OCRResultModal";
// import { QuestionPapersCard } from "@/components/teacher_components/QuestionPapersCard";
// import { StudentsTable } from "@/components/teacher_components/StudentsTable";
// import { StudentDetailsPage } from "@/pages/StudentDetailsPage";
// import { useDropdown } from "@/hooks/useDropdown";
// import { OCRService } from "@/controllers/ocrService";
// import { getInitialSemesters, clampMarks } from "@/utils";
// import { Semesters, Student, UploadedPaper, OCRModalData } from "@/types";
// import { api } from "@/controllers/apiService";

// import { AddStudentDialog } from "@/components/teacher_components/AddStudentDialog";
// import { DeleteConfirmDialog } from "@/components/teacher_components/DeleteConfirmDialog";

// const TeacherDashboard: React.FC = () => {
//   const [userName] = useState("Dr. Smith");
//   const [semesters, setSemesters] = useState<Semesters>(getInitialSemesters());
//   const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
//   const [selectedSection, setSelectedSection] = useState<string | null>(null);
//   const [editingStudent, setEditingStudent] = useState<string | null>(null);
//   const [marks, setMarks] = useState<{ [key: string]: number }>({});
//   const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

//   // Question papers state
//   const [questionPapers, setQuestionPapers] = useState<{
//     [key: string]: UploadedPaper[];
//   }>({});

//   // Modals
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [modalType, setModalType] = useState<"semester" | "section">("semester");
//   const [ocrModalOpen, setOcrModalOpen] = useState(false);
//   const [ocrModalData, setOcrModalData] = useState<OCRModalData | null>(null);

//   const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
//   const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

//   // Dropdowns
//   const semesterDropdown = useDropdown();
//   const sectionDropdown = useDropdown();

//   // ---------- Helpers to transform server data <-> frontend shape ----------
//   const transformServerToFrontend = (serverSemesters: any[]): Semesters => {
//     const out: any = {};
//     serverSemesters.forEach((s) => {
//       out[s.name] = { sections: {} };
//       (s.sections || []).forEach((sec: any) => {
//         out[s.name].sections[sec.name] = (sec.students || []).map((st: any) => ({
//           ...st,
//           id: st._id,
//           _id: st._id,
//         }));
//       });
//     });
//     return out;
//   };

//   const findServerSemAndSection = async (
//     semesterName: string,
//     sectionName: string
//   ) => {
//     const serverSemesters = await api.getSemesters();
//     const sem = serverSemesters.find((s: any) => s.name === semesterName);
//     if (!sem) return null;
//     const sec = (sem.sections || []).find((s: any) => s.name === sectionName);
//     return { sem, sec };
//   };

//   // ---------- Load initial data ----------
//   const loadSemesters = async () => {
//     try {
//       const serverSemesters = await api.getSemesters();
//       setSemesters(transformServerToFrontend(serverSemesters));
//       if (selectedSemester) {
//         const semExists = serverSemesters.some(
//           (s: any) => s.name === selectedSemester
//         );
//         if (!semExists) setSelectedSemester(null);
//       }
//       if (selectedSemester && selectedSection) {
//         const sem = serverSemesters.find(
//           (s: any) => s.name === selectedSemester
//         );
//         const secExists =
//           sem &&
//           sem.sections.some((sec: any) => sec.name === selectedSection);
//         if (!secExists) setSelectedSection(null);
//       }
//     } catch (err) {
//       console.error("Failed to load semesters:", err);
//     }
//   };

//   useEffect(() => {
//     loadSemesters();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------- Selection handlers ----------
//   const handleSemesterSelect = (semester: string) => {
//     setSelectedSemester(semester);
//     setSelectedSection(null);
//     semesterDropdown.close();
//   };

//   const handleSectionSelect = (section: string) => {
//     setSelectedSection(section);
//     sectionDropdown.close();
//   };

//   // ---------- Add handlers (call backend and refresh) ----------
//   const handleAddSemester = async (name: string) => {
//     if (!name?.trim()) {
//       alert("Semester name cannot be empty.");
//       return;
//     }
//     try {
//       await api.addSemester(name.trim());
//       await loadSemesters();
//       setShowAddModal(false);
//     } catch (err: any) {
//       console.error("Add semester failed:", err);
//       alert(err?.message || "Failed to add semester");
//     }
//   };

//   const handleAddSection = async (name: string) => {
//     if (!selectedSemester) {
//       alert("Select a semester first.");
//       return;
//     }
//     if (!name?.trim()) {
//       alert("Section name cannot be empty.");
//       return;
//     }

//     try {
//       const mapping = await findServerSemAndSection(selectedSemester, "__dummy__");
//       if (!mapping?.sem) {
//         alert("Selected semester not found on server. Refreshing...");
//         await loadSemesters();
//         return;
//       }
//       await api.addSection(mapping.sem._id, name.trim());
//       await loadSemesters();
//       setShowAddModal(false);
//     } catch (err: any) {
//       console.error("Add section failed:", err);
//       alert(err?.message || "Failed to add section");
//     }
//   };

//   const handleAddStudent = async (formData: {
//     name: string;
//     rollNumber: string;
//   }) => {
//     if (!selectedSemester || !selectedSection) {
//       alert("Select semester and section first.");
//       return false;
//     }
//     try {
//       const mapping = await findServerSemAndSection(
//         selectedSemester,
//         selectedSection
//       );
//       if (!mapping?.sem || !mapping?.sec) {
//         alert("Selected semester/section not found. Refreshing...");
//         await loadSemesters();
//         return false;
//       }

//       await api.addStudent(mapping.sem._id, mapping.sec._id, {
//         name: formData.name,
//         rollNumber: formData.rollNumber,
//         marks: 0,
//       });

//       await loadSemesters();
//       setIsAddStudentModalOpen(false);
//       return true;
//     } catch (err: any) {
//       console.error("Add student failed:", err);
//       alert(err?.message || "Failed to add student");
//       return false;
//     }
//   };

//   // ---------- Marks / edit handlers ----------
//   const handleEditMarks = (studentId: string, currentMarks: number) => {
//     setEditingStudent(studentId);
//     setMarks({ ...marks, [studentId]: currentMarks });
//   };

//   const handleSaveMarks = async (studentId: string) => {
//     if (!selectedSemester || !selectedSection) return;

//     const newMarks = marks[studentId];
//     if (typeof newMarks === "undefined") {
//       setEditingStudent(null);
//       return;
//     }

//     try {
//       const mapping = await findServerSemAndSection(
//         selectedSemester,
//         selectedSection
//       );
//       if (!mapping?.sem || !mapping?.sec) {
//         alert("Could not find semester/section. Refreshing...");
//         await loadSemesters();
//         return;
//       }

//       await api.updateStudentMarks(
//         mapping.sem._id,
//         mapping.sec._id,
//         studentId,
//         newMarks
//       );

//       // ✅ FIX: Update state immutably to trigger re-render
//       setSemesters((prev) => {
//         // Ensure the selected semester and section exist before updating
//         if (!prev[selectedSemester] || !prev[selectedSemester].sections[selectedSection]) {
//           return prev;
//         }
        
//         // Return new state object
//         return {
//           ...prev,
//           [selectedSemester]: { // New semester object
//             ...prev[selectedSemester],
//             sections: { // New sections object
//               ...prev[selectedSemester].sections,
//               // Map over the student array to create a new array
//               [selectedSection]: prev[selectedSemester].sections[selectedSection].map(
//                 (student) =>
//                   student.id === studentId
//                     ? { ...student, marks: newMarks } // Create a new student object
//                     : student // Return original student reference
//               ),
//             },
//           },
//         };
//       });

//       setEditingStudent(null);
//     } catch (err: any) {
//       console.error("Save marks failed:", err);
//       alert(err?.message || "Failed to save marks");
//     }
//   };

//   const handleMarksChange = (studentId: string, value: string) => {
//     const numValue = parseInt(value) || 0;
//     setMarks({ ...marks, [studentId]: clampMarks(numValue) });
//   };

//   const handleConfirmDelete = (student: Student) => {
//     setStudentToDelete(student);
//   };

//   const executeDeleteStudent = async () => {
//     if (!studentToDelete || !selectedSemester || !selectedSection) {
//       setStudentToDelete(null);
//       return;
//     }

//     try {
//       const mapping = await findServerSemAndSection(
//         selectedSemester,
//         selectedSection
//       );
//       if (!mapping || !mapping.sem || !mapping.sec) {
//         alert("Could not find semester/section on server. Refreshing...");
//         await loadSemesters();
//         return;
//       }

//       await api.deleteStudent(
//         mapping.sem._id,
//         mapping.sec._id,
//         studentToDelete.id
//       );
//       await loadSemesters(); // Refresh data
//     } catch (err: any) {
//       console.error("Delete student failed:", err);
//       alert(err?.message || "Failed to delete student");
//       await loadSemesters();
//     } finally {
//       setStudentToDelete(null);
//     }
//   };

//   // ---------- Student click / upload ----------
//   const handleStudentClick = (student: Student) => {
//     setSelectedStudent(student);
//   };

//   const handleStudentScriptUpload = (studentId: string) => {
//     console.log(`Upload triggered for ${studentId}`);
//   };

//   const handleStudentFileSelect = (
//     event: React.ChangeEvent<HTMLInputElement>,
//     studentId: string,
//     studentName: string
//   ) => {
//     const files = event.target.files;
//     if (files && files.length > 0) {
//       const selectedFile = files[0];
//       console.log(
//         `Uploaded script for ${studentName} (ID: ${studentId}):`,
//         selectedFile.name
//       );
//     }
//   };

//   // ---------- Question Paper handlers ----------
//   const updatePaperAt = (
//     key: string,
//     index: number,
//     patch: Partial<UploadedPaper>
//   ) => {
//     setQuestionPapers((prev) => {
//       const curr = prev[key] ? [...prev[key]] : [];
//       curr[index] = { ...curr[index], ...patch };
//       return { ...prev, [key]: curr };
//     });
//   };

//   const handleQuestionPaperUpload = async (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const files = event.target.files;
//     if (!files || files.length === 0) return;

//     const selectedFile = files[0];
//     const fileName = selectedFile.name;
//     const currentKey = `${selectedSemester}-${selectedSection}`;

//     const subject = prompt("Enter the subject name for this question paper:");
//     if (!subject) {
//       event.currentTarget.value = "";
//       return;
//     }

//     const paperEntry: UploadedPaper = {
//       name: fileName,
//       subject,
//       ocrStatus: "processing",
//     };

//     setQuestionPapers((prev) => ({
//       ...prev,
//       [currentKey]: [...(prev[currentKey] || []), paperEntry],
//     }));

//     const idx = questionPapers[currentKey]?.length || 0;

//     try {
//       const data = await OCRService.processFile(selectedFile);

//       updatePaperAt(currentKey, idx, {
//         ocrStatus: "done",
//         ocrText: data?.text || "",
//         pages: typeof data?.pages === "number" ? data.pages : undefined,
//         ocrError: undefined,
//       });

//       if (selectedSemester && selectedSection) {
//         const mapping = await findServerSemAndSection(
//           selectedSemester,
//           selectedSection
//         );
//         if (mapping && mapping.sem && mapping.sec) {
//           await api.addPaper(mapping.sem._id, mapping.sec._id, {
//             name: fileName,
//             subject,
//             ocrStatus: "done",
//             ocrText: data?.text || "",
//             pages: data?.pages,
//           });
//           await loadSemesters();
//         }
//       }

//       setOcrModalData({
//         subject,
//         filename: fileName,
//         text: data?.text || "",
//         pages: typeof data?.pages === "number" ? data.pages : undefined,
//       });
//       setOcrModalOpen(true);
//     } catch (err: any) {
//       console.error("OCR error:", err);
//       updatePaperAt(currentKey, idx, {
//         ocrStatus: "error",
//         ocrError: err?.message || "Unknown OCR error",
//       });
//       alert(`Failed to OCR "${fileName}": ${err?.message || "Unknown error"}`);
//     } finally {
//       event.currentTarget.value = "";
//     }
//   };

//   const handleRetryOCR = async (index: number) => {
//     const currentKey = `${selectedSemester}-${selectedSection}`;
//     const paper = questionPapers[currentKey]?.[index];
//     if (!paper) return;

//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = ".pdf";
//     input.onchange = async (e: any) => {
//       const file = e?.target?.files?.[0];
//       if (!file) return;

//       try {
//         updatePaperAt(currentKey, index, {
//           ocrStatus: "processing",
//           ocrError: undefined,
//         });

//         const data = await OCRService.retryOCR(file);

//         updatePaperAt(currentKey, index, {
//           ocrStatus: "done",
//           ocrText: data?.text || "",
//           pages: typeof data?.pages === "number" ? data.pages : undefined,
//         });

//         if (selectedSemester && selectedSection) {
//           const mapping = await findServerSemAndSection(
//             selectedSemester,
//             selectedSection
//           );
//           if (mapping && mapping.sem && mapping.sec) {
//             await api.addPaper(mapping.sem._id, mapping.sec._id, {
//               name: file.name,
//               subject: paper.subject,
//               ocrStatus: "done",
//               ocrText: data?.text || "",
//               pages: data?.pages,
//             });
//             await loadSemesters();
//           }
//         }

//         setOcrModalData({
//           subject: paper.subject,
//           filename: file.name,
//           text: data?.text || "",
//           pages: typeof data?.pages === "number" ? data.pages : undefined,
//         });
//         setOcrModalOpen(true);
//       } catch (err: any) {
//         updatePaperAt(currentKey, index, {
//           ocrStatus: "error",
//           ocrError: err?.message || "Unknown OCR error",
//         });
//         alert(`Retry failed: ${err?.message || "Unknown error"}`);
//       }
//     };
//     input.click();
//   };

//   const handleDeleteQuestionPaper = async (index: number) => {
//     if (!selectedSemester || !selectedSection) {
//       alert("Select semester and section.");
//       return;
//     }
//     const ok = confirm("⚠️ This will permanently delete the question paper. Proceed?");
//     if (!ok) return;

//     try {
//       const mapping = await findServerSemAndSection(
//         selectedSemester,
//         selectedSection
//       );
//       if (!mapping?.sem || !mapping?.sec) {
//         alert("Could not find semester/section on server. Refreshing...");
//         await loadSemesters();
//         return;
//       }

//       const serverPaper = (mapping.sec.papers || [])[index];
//       if (serverPaper && (serverPaper as any)._id) {
//         await api.deletePaper(
//           mapping.sem._id,
//           mapping.sec._id,
//           (serverPaper as any)._id
//         );
//       }

//       await loadSemesters();
//       setQuestionPapers((prev) => {
//         const key = `${selectedSemester}-${selectedSection}`;
//         const arr = prev[key] ? [...prev[key]] : [];
//         arr.splice(index, 1);
//         return { ...prev, [key]: arr };
//       });
//     } catch (err: any) {
//       console.error("Delete paper failed:", err);
//       alert(err?.message || "Failed to delete paper");
//       await loadSemesters();
//     }
//   };

//   const handleViewOCR = (paper: UploadedPaper) => {
//     setOcrModalData({
//       subject: paper.subject,
//       filename: paper.name,
//       text: paper.ocrText,
//       pages: paper.pages,
//     });
//     setOcrModalOpen(true);
//   };

//   const handleCopyOCRText = async () => {
//     if (!ocrModalData?.text) return;
//     try {
//       const textArea = document.createElement("textarea");
//       textArea.value = ocrModalData.text;
//       document.body.appendChild(textArea);
//       textArea.focus();
//       textArea.select();
//       document.execCommand("copy");
//       document.body.removeChild(textArea);
//     } catch (err) {
//       console.error("Failed to copy text:", err);
//     }
//   };

//   // ---------- Derived current lists ----------
//   const currentStudents: any[] =
//     selectedSemester && selectedSection
//       ? semesters[selectedSemester]?.sections[selectedSection] || []
//       : [];

//   const currentKey =
//     selectedSemester && selectedSection
//       ? `${selectedSemester}-${selectedSection}`
//       : "";
//   const currentPapers = currentKey ? questionPapers[currentKey] || [] : [];

//   // ---------- Render ----------
//   if (selectedStudent) {
//     return (
//       <StudentDetailsPage
//         student={selectedStudent}
//         onBack={() => setSelectedStudent(null)}
//       />
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <Header userName={userName} />

//       <main className="container mx-auto px-6 py-8">
//         <div className="mb-8 relative overflow-hidden rounded-2xl bg-slate-900 p-10 text-white shadow-xl border border-slate-800">
//           <div className="relative">
//             <div className="flex items-center gap-2 mb-3">
//               <Award className="h-5 w-5" />
//               <span className="text-sm font-medium text-slate-300">
//                 Welcome back
//               </span>
//             </div>
//             <h2 className="text-4xl font-bold mb-2">{userName}</h2>
//             <p className="text-lg text-slate-300">
//               Manage exam evaluations and track student performance with
//               AI-powered tools
//             </p>
//           </div>
//         </div>

//         <SemesterSectionSelector
//           semesters={semesters}
//           selectedSemester={selectedSemester}
//           selectedSection={selectedSection}
//           isSemesterDropdownOpen={semesterDropdown.isOpen}
//           isSectionDropdownOpen={sectionDropdown.isOpen}
//           onSemesterSelect={handleSemesterSelect}
//           onSectionSelect={handleSectionSelect}
//           onToggleSemesterDropdown={semesterDropdown.toggle}
//           onToggleSectionDropdown={sectionDropdown.toggle}
//           onAddSemester={() => {
//             setModalType("semester");
//             setShowAddModal(true);
//           }}
//           onAddSection={() => {
//             setModalType("section");
//             setShowAddModal(true);
//           }}
//         />

//         {selectedSemester && selectedSection && (
//           <QuestionPapersCard
//             selectedSemester={selectedSemester}
//             selectedSection={selectedSection}
//             papers={currentPapers}
//             onUpload={handleQuestionPaperUpload}
//             onDelete={handleDeleteQuestionPaper}
//             onRetryOCR={handleRetryOCR}
//             onViewOCR={handleViewOCR}
//           />
//         )}

//         <StudentsTable
//           students={currentStudents}
//           selectedSemester={selectedSemester}
//           selectedSection={selectedSection}
//           editingStudent={editingStudent}
//           marks={marks}
//           onStudentClick={handleStudentClick}
//           onEditMarks={handleEditMarks}
//           onSaveMarks={handleSaveMarks}
//           onMarksChange={handleMarksChange}
//           onConfirmDelete={handleConfirmDelete}
//           onUploadScript={handleStudentScriptUpload}
//           onScriptFileSelect={handleStudentFileSelect}
//           onAddStudent={() => setIsAddStudentModalOpen(true)}
//         />
//       </main>

//       {/* Modals */}
//       <AddSemesterSectionModal
//         isOpen={showAddModal}
//         onClose={() => setShowAddModal(false)}
//         onAdd={modalType === "semester" ? handleAddSemester : handleAddSection}
//         type={modalType}
//       />

//       <OCRResultModal
//         isOpen={ocrModalOpen}
//         onClose={() => setOcrModalOpen(false)}
//         subject={ocrModalData?.subject || ""}
//         filename={ocrModalData?.filename || ""}
//         text={ocrModalData?.text}
//         pages={ocrModalData?.pages}
//         onCopy={handleCopyOCRText}
//       />

//       <AddStudentDialog
//         open={isAddStudentModalOpen}
//         onOpenChange={setIsAddStudentModalOpen}
//         onSubmit={handleAddStudent}
//       />

//       <DeleteConfirmDialog
//         open={!!studentToDelete}
//         onOpenChange={() => setStudentToDelete(null)}
//         onConfirm={executeDeleteStudent}
//         studentName={studentToDelete?.name || ""}
//       />
//     </div>
//   );
// };

// export default TeacherDashboard;





import React, { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { Header } from "@/components/teacher_components/Header";
import { SemesterSectionSelector } from "@/components/teacher_components/SemesterSectionSelector";
import { AddSemesterSectionModal } from "@/components/teacher_components/AddSemesterSectionModal";
import { OCRResultModal } from "@/components/teacher_components/OCRResultModal";
import { QuestionPapersCard } from "@/components/teacher_components/QuestionPapersCard";
import { StudentsTable } from "@/components/teacher_components/StudentsTable";
import { StudentDetailsPage } from "@/pages/StudentDetailsPage";
import { useDropdown } from "@/hooks/useDropdown";
import { OCRService } from "@/controllers/ocrService";
import { getInitialSemesters, clampMarks } from "@/utils";
import { Semesters, Student, UploadedPaper, OCRModalData } from "@/types";
import { api } from "@/controllers/apiService";

import { AddStudentDialog } from "@/components/teacher_components/AddStudentDialog";
import { DeleteConfirmDialog } from "@/components/teacher_components/DeleteConfirmDialog";

const TeacherDashboard: React.FC = () => {
  // ✅ UPDATED: userName state is now dynamic
  const [userName, setUserName] = useState<string | null>(null);
  const [semesters, setSemesters] = useState<Semesters>(getInitialSemesters());
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [marks, setMarks] = useState<{ [key: string]: number }>({});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Question papers state
  const [questionPapers, setQuestionPapers] = useState<{
    [key: string]: UploadedPaper[];
  }>({});

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<"semester" | "section">("semester");
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [ocrModalData, setOcrModalData] = useState<OCRModalData | null>(null);

  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Dropdowns
  const semesterDropdown = useDropdown();
  const sectionDropdown = useDropdown();

  // ---------- Helpers to transform server data <-> frontend shape ----------
  const transformServerToFrontend = (serverSemesters: any[]): Semesters => {
    const out: any = {};
    serverSemesters.forEach((s) => {
      out[s.name] = { sections: {} };
      (s.sections || []).forEach((sec: any) => {
        out[s.name].sections[sec.name] = (sec.students || []).map((st: any) => ({
          ...st,
          id: st._id,
          _id: st._id,
        }));
      });
    });
    return out;
  };

  const findServerSemAndSection = async (
    semesterName: string,
    sectionName: string
  ) => {
    const serverSemesters = await api.getSemesters();
    const sem = serverSemesters.find((s: any) => s.name === semesterName);
    if (!sem) return null;
    const sec = (sem.sections || []).find((s: any) => s.name === sectionName);
    return { sem, sec };
  };

  // ---------- Load initial data ----------
  const loadSemesters = async () => {
    try {
      const serverSemesters = await api.getSemesters();
      setSemesters(transformServerToFrontend(serverSemesters));
      if (selectedSemester) {
        const semExists = serverSemesters.some(
          (s: any) => s.name === selectedSemester
        );
        if (!semExists) setSelectedSemester(null);
      }
      if (selectedSemester && selectedSection) {
        const sem = serverSemesters.find(
          (s: any) => s.name === selectedSemester
        );
        const secExists =
          sem &&
          sem.sections.some((sec: any) => sec.name === selectedSection);
        if (!secExists) setSelectedSection(null);
      }
    } catch (err) {
      console.error("Failed to load semesters:", err);
    }
  };

  // ✅ UPDATED: Fetches teacher name and semesters on load
  useEffect(() => {
    const fetchTeacherName = async () => {
      try {
        const profile = await api.getTeacherProfile();
        setUserName(profile.name);
      } catch (error) {
        console.error("Failed to fetch teacher name:", error);
        setUserName("Teacher"); // Fallback name
      }
    };

    fetchTeacherName();
    loadSemesters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Selection handlers ----------
  const handleSemesterSelect = (semester: string) => {
    setSelectedSemester(semester);
    setSelectedSection(null);
    semesterDropdown.close();
  };

  const handleSectionSelect = (section: string) => {
    setSelectedSection(section);
    sectionDropdown.close();
  };

  // ---------- Add handlers (call backend and refresh) ----------
  const handleAddSemester = async (name: string) => {
    if (!name?.trim()) {
      alert("Semester name cannot be empty.");
      return;
    }
    try {
      await api.addSemester(name.trim());
      await loadSemesters();
      setShowAddModal(false);
    } catch (err: any) {
      console.error("Add semester failed:", err);
      alert(err?.message || "Failed to add semester");
    }
  };

  const handleAddSection = async (name: string) => {
    if (!selectedSemester) {
      alert("Select a semester first.");
      return;
    }
    if (!name?.trim()) {
      alert("Section name cannot be empty.");
      return;
    }

    try {
      const mapping = await findServerSemAndSection(selectedSemester, "__dummy__");
      if (!mapping?.sem) {
        alert("Selected semester not found on server. Refreshing...");
        await loadSemesters();
        return;
      }
      await api.addSection(mapping.sem._id, name.trim());
      await loadSemesters();
      setShowAddModal(false);
    } catch (err: any) {
      console.error("Add section failed:", err);
      alert(err?.message || "Failed to add section");
    }
  };

  const handleAddStudent = async (formData: {
    name: string;
    rollNumber: string;
  }) => {
    if (!selectedSemester || !selectedSection) {
      alert("Select semester and section first.");
      return false;
    }
    try {
      const mapping = await findServerSemAndSection(
        selectedSemester,
        selectedSection
      );
      if (!mapping?.sem || !mapping?.sec) {
        alert("Selected semester/section not found. Refreshing...");
        await loadSemesters();
        return false;
      }

      await api.addStudent(mapping.sem._id, mapping.sec._id, {
        name: formData.name,
        rollNumber: formData.rollNumber,
        marks: 0,
      });

      await loadSemesters();
      setIsAddStudentModalOpen(false);
      return true;
    } catch (err: any) {
      console.error("Add student failed:", err);
      alert(err?.message || "Failed to add student");
      return false;
    }
  };

  // ---------- Marks / edit handlers ----------
  const handleEditMarks = (studentId: string, currentMarks: number) => {
    setEditingStudent(studentId);
    setMarks({ ...marks, [studentId]: currentMarks });
  };

  const handleSaveMarks = async (studentId: string) => {
    if (!selectedSemester || !selectedSection) return;

    const newMarks = marks[studentId];
    if (typeof newMarks === "undefined") {
      setEditingStudent(null);
      return;
    }

    try {
      const mapping = await findServerSemAndSection(
        selectedSemester,
        selectedSection
      );
      if (!mapping?.sem || !mapping?.sec) {
        alert("Could not find semester/section. Refreshing...");
        await loadSemesters();
        return;
      }

      await api.updateStudentMarks(
        mapping.sem._id,
        mapping.sec._id,
        studentId,
        newMarks
      );

      // ✅ FIX: Update state immutably to trigger re-render
      setSemesters((prev) => {
        // Ensure the selected semester and section exist before updating
        if (!prev[selectedSemester] || !prev[selectedSemester].sections[selectedSection]) {
          return prev;
        }
        
        // Return new state object
        return {
          ...prev,
          [selectedSemester]: { // New semester object
            ...prev[selectedSemester],
            sections: { // New sections object
              ...prev[selectedSemester].sections,
              // Map over the student array to create a new array
              [selectedSection]: prev[selectedSemester].sections[selectedSection].map(
                (student) =>
                  student.id === studentId
                    ? { ...student, marks: newMarks } // Create a new student object
                    : student // Return original student reference
              ),
            },
          },
        };
      });

      setEditingStudent(null);
    } catch (err: any) {
      console.error("Save marks failed:", err);
      alert(err?.message || "Failed to save marks");
    }
  };

  const handleMarksChange = (studentId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setMarks({ ...marks, [studentId]: clampMarks(numValue) });
  };

  const handleConfirmDelete = (student: Student) => {
    setStudentToDelete(student);
  };

  const executeDeleteStudent = async () => {
    if (!studentToDelete || !selectedSemester || !selectedSection) {
      setStudentToDelete(null);
      return;
    }

    try {
      const mapping = await findServerSemAndSection(
        selectedSemester,
        selectedSection
      );
      if (!mapping || !mapping.sem || !mapping.sec) {
        alert("Could not find semester/section on server. Refreshing...");
        await loadSemesters();
        return;
      }

      await api.deleteStudent(
        mapping.sem._id,
        mapping.sec._id,
        studentToDelete.id
      );
      await loadSemesters(); // Refresh data
    } catch (err: any) {
      console.error("Delete student failed:", err);
      alert(err?.message || "Failed to delete student");
      await loadSemesters();
    } finally {
      setStudentToDelete(null);
    }
  };

  // ---------- Student click / upload ----------
  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleStudentScriptUpload = (studentId: string) => {
    console.log(`Upload triggered for ${studentId}`);
  };

  const handleStudentFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    studentId: string,
    studentName: string
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      console.log(
        `Uploaded script for ${studentName} (ID: ${studentId}):`,
        selectedFile.name
      );
    }
  };

  // ---------- Question Paper handlers ----------
  const updatePaperAt = (
    key: string,
    index: number,
    patch: Partial<UploadedPaper>
  ) => {
    setQuestionPapers((prev) => {
      const curr = prev[key] ? [...prev[key]] : [];
      curr[index] = { ...curr[index], ...patch };
      return { ...prev, [key]: curr };
    });
  };

  const handleQuestionPaperUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    const fileName = selectedFile.name;
    const currentKey = `${selectedSemester}-${selectedSection}`;

    const subject = prompt("Enter the subject name for this question paper:");
    if (!subject) {
      event.currentTarget.value = "";
      return;
    }

    const paperEntry: UploadedPaper = {
      name: fileName,
      subject,
      ocrStatus: "processing",
    };

    setQuestionPapers((prev) => ({
      ...prev,
      [currentKey]: [...(prev[currentKey] || []), paperEntry],
    }));

    const idx = questionPapers[currentKey]?.length || 0;

    try {
      const data = await OCRService.processFile(selectedFile);

      updatePaperAt(currentKey, idx, {
        ocrStatus: "done",
        ocrText: data?.text || "",
        pages: typeof data?.pages === "number" ? data.pages : undefined,
        ocrError: undefined,
      });

      if (selectedSemester && selectedSection) {
        const mapping = await findServerSemAndSection(
          selectedSemester,
          selectedSection
        );
        if (mapping && mapping.sem && mapping.sec) {
          await api.addPaper(mapping.sem._id, mapping.sec._id, {
            name: fileName,
            subject,
            ocrStatus: "done",
            ocrText: data?.text || "",
            pages: data?.pages,
          });
          await loadSemesters();
        }
      }

      setOcrModalData({
        subject,
        filename: fileName,
        text: data?.text || "",
        pages: typeof data?.pages === "number" ? data.pages : undefined,
      });
      setOcrModalOpen(true);
    } catch (err: any) {
      console.error("OCR error:", err);
      updatePaperAt(currentKey, idx, {
        ocrStatus: "error",
        ocrError: err?.message || "Unknown OCR error",
      });
      alert(`Failed to OCR "${fileName}": ${err?.message || "Unknown error"}`);
    } finally {
      event.currentTarget.value = "";
    }
  };

  const handleRetryOCR = async (index: number) => {
    const currentKey = `${selectedSemester}-${selectedSection}`;
    const paper = questionPapers[currentKey]?.[index];
    if (!paper) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";
    input.onchange = async (e: any) => {
      const file = e?.target?.files?.[0];
      if (!file) return;

      try {
        updatePaperAt(currentKey, index, {
          ocrStatus: "processing",
          ocrError: undefined,
        });

        const data = await OCRService.retryOCR(file);

        updatePaperAt(currentKey, index, {
          ocrStatus: "done",
          ocrText: data?.text || "",
          pages: typeof data?.pages === "number" ? data.pages : undefined,
        });

        if (selectedSemester && selectedSection) {
          const mapping = await findServerSemAndSection(
            selectedSemester,
            selectedSection
          );
          if (mapping && mapping.sem && mapping.sec) {
            await api.addPaper(mapping.sem._id, mapping.sec._id, {
              name: file.name,
              subject: paper.subject,
              ocrStatus: "done",
              ocrText: data?.text || "",
              pages: data?.pages,
            });
            await loadSemesters();
          }
        }

        setOcrModalData({
          subject: paper.subject,
          filename: file.name,
          text: data?.text || "",
          pages: typeof data?.pages === "number" ? data.pages : undefined,
        });
        setOcrModalOpen(true);
      } catch (err: any) {
        updatePaperAt(currentKey, index, {
          ocrStatus: "error",
          ocrError: err?.message || "Unknown OCR error",
        });
        alert(`Retry failed: ${err?.message || "Unknown error"}`);
      }
    };
    input.click();
  };

  const handleDeleteQuestionPaper = async (index: number) => {
    if (!selectedSemester || !selectedSection) {
      alert("Select semester and section.");
      return;
    }
    const ok = confirm("⚠️ This will permanently delete the question paper. Proceed?");
    if (!ok) return;

    try {
      const mapping = await findServerSemAndSection(
        selectedSemester,
        selectedSection
      );
      if (!mapping?.sem || !mapping?.sec) {
        alert("Could not find semester/section on server. Refreshing...");
        await loadSemesters();
        return;
      }

      const serverPaper = (mapping.sec.papers || [])[index];
      if (serverPaper && (serverPaper as any)._id) {
        await api.deletePaper(
          mapping.sem._id,
          mapping.sec._id,
          (serverPaper as any)._id
        );
      }

      await loadSemesters();
      setQuestionPapers((prev) => {
        const key = `${selectedSemester}-${selectedSection}`;
        const arr = prev[key] ? [...prev[key]] : [];
        arr.splice(index, 1);
        return { ...prev, [key]: arr };
      });
    } catch (err: any) {
      console.error("Delete paper failed:", err);
      alert(err?.message || "Failed to delete paper");
      await loadSemesters();
    }
  };

  const handleViewOCR = (paper: UploadedPaper) => {
    setOcrModalData({
      subject: paper.subject,
      filename: paper.name,
      text: paper.ocrText,
      pages: paper.pages,
    });
    setOcrModalOpen(true);
  };

  const handleCopyOCRText = async () => {
    if (!ocrModalData?.text) return;
    try {
      const textArea = document.createElement("textarea");
      textArea.value = ocrModalData.text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // ---------- Derived current lists ----------
  const currentStudents: Student[] =
    selectedSemester && selectedSection
      ? semesters[selectedSemester]?.sections[selectedSection] || []
      : [];

  const currentKey =
    selectedSemester && selectedSection
      ? `${selectedSemester}-${selectedSection}`
      : "";
  const currentPapers = currentKey ? questionPapers[currentKey] || [] : [];

  // ---------- Render ----------
  if (selectedStudent) {
    return (
      <StudentDetailsPage
        student={selectedStudent}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header userName={userName || "Loading..."} />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-slate-900 p-10 text-white shadow-xl border border-slate-800">
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-5 w-5" />
              <span className="text-sm font-medium text-slate-300">
                Welcome back
              </span>
            </div>
            <h2 className="text-4xl font-bold mb-2">{userName || "Welcome"}</h2>
            <p className="text-lg text-slate-300">
              Manage exam evaluations and track student performance with
              AI-powered tools
            </p>
          </div>
        </div>

        <SemesterSectionSelector
          semesters={semesters}
          selectedSemester={selectedSemester}
          selectedSection={selectedSection}
          isSemesterDropdownOpen={semesterDropdown.isOpen}
          isSectionDropdownOpen={sectionDropdown.isOpen}
          onSemesterSelect={handleSemesterSelect}
          onSectionSelect={handleSectionSelect}
          onToggleSemesterDropdown={semesterDropdown.toggle}
          onToggleSectionDropdown={sectionDropdown.toggle}
          onAddSemester={() => {
            setModalType("semester");
            setShowAddModal(true);
          }}
          onAddSection={() => {
            setModalType("section");
            setShowAddModal(true);
          }}
        />

        {selectedSemester && selectedSection && (
          <QuestionPapersCard
            selectedSemester={selectedSemester}
            selectedSection={selectedSection}
            papers={currentPapers}
            onUpload={handleQuestionPaperUpload}
            onDelete={handleDeleteQuestionPaper}
            onRetryOCR={handleRetryOCR}
            onViewOCR={handleViewOCR}
          />
        )}

        <StudentsTable
          students={currentStudents}
          selectedSemester={selectedSemester}
          selectedSection={selectedSection}
          editingStudent={editingStudent}
          marks={marks}
          onStudentClick={handleStudentClick}
          onEditMarks={handleEditMarks}
          onSaveMarks={handleSaveMarks}
          onMarksChange={handleMarksChange}
          onConfirmDelete={handleConfirmDelete}
          onUploadScript={handleStudentScriptUpload}
          onScriptFileSelect={handleStudentFileSelect}
          onAddStudent={() => setIsAddStudentModalOpen(true)}
        />
      </main>

      {/* Modals */}
      <AddSemesterSectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={modalType === "semester" ? handleAddSemester : handleAddSection}
        type={modalType}
      />

      <OCRResultModal
        isOpen={ocrModalOpen}
        onClose={() => setOcrModalOpen(false)}
        subject={ocrModalData?.subject || ""}
        filename={ocrModalData?.filename || ""}
        text={ocrModalData?.text}
        pages={ocrModalData?.pages}
        onCopy={handleCopyOCRText}
      />

      <AddStudentDialog
        open={isAddStudentModalOpen}
        onOpenChange={setIsAddStudentModalOpen}
        onSubmit={handleAddStudent}
      />

      <DeleteConfirmDialog
        open={!!studentToDelete}
        onOpenChange={() => setStudentToDelete(null)}
        onConfirm={executeDeleteStudent}
        studentName={studentToDelete?.name || ""}
      />
    </div>
  );
};

export default TeacherDashboard;