// import { useState, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Upload,
//   FileText,
//   LogOut,
//   Award,
//   CheckCircle,
//   ChevronDown,
//   BookOpen,
//   Trash2,
//   Plus,
//   X,
//   Loader2,
//   RefreshCcw,
//   Clipboard,
//   Eye,
// } from "lucide-react";
// // Import the StudentDetailsPage component
// import { StudentDetailsPage } from "./StudentDetailsPage";

// /** ===========================================
//  *  CONFIG — set your OCR API base here
//  *  =========================================== */
// // You can set either with or without trailing slash; we’ll normalize it.
// const BACKEND_OCR_BASE = "http://127.0.0.1:5001"; // flask dev server base
// const OCR_ENDPOINT = `${BACKEND_OCR_BASE.replace(/\/$/, "")}/ocr`;

// // Types
// interface Student {
//   id: number;
//   name: string;
//   marks: number;
//   scriptUrl: string;
// }

// interface UploadedPaper {
//   name: string;
//   subject: string;
//   ocrStatus?: "idle" | "processing" | "done" | "error";
//   ocrText?: string;
//   ocrError?: string;
//   pages?: number;
// }

// interface Section {
//   [sectionName: string]: Student[];
// }

// interface Semester {
//   sections: Section;
// }

// interface Semesters {
//   [semesterName: string]: Semester;
// }

// // Initial data structure
// const getInitialSemesters = (): Semesters => ({
//   "Semester 1": {
//     sections: {
//       "Section A": [
//         { id: 1, name: "John Doe", marks: 85, scriptUrl: "#" },
//         { id: 2, name: "Jane Smith", marks: 92, scriptUrl: "#" },
//         { id: 3, name: "Mike Johnson", marks: 78, scriptUrl: "#" },
//         { id: 4, name: "Sarah Williams", marks: 88, scriptUrl: "#" },
//       ],
//       "Section B": [
//         { id: 5, name: "Tom Brown", marks: 76, scriptUrl: "#" },
//         { id: 6, name: "Emily Davis", marks: 91, scriptUrl: "#" },
//         { id: 7, name: "Chris Wilson", marks: 83, scriptUrl: "#" },
//       ],
//     },
//   },
//   "Semester 2": {
//     sections: {
//       "Section A": [
//         { id: 8, name: "Alex Martinez", marks: 89, scriptUrl: "#" },
//         { id: 9, name: "Lisa Anderson", marks: 94, scriptUrl: "#" },
//         { id: 10, name: "David Taylor", marks: 81, scriptUrl: "#" },
//       ],
//       "Section B": [
//         { id: 11, name: "Nina Patel", marks: 87, scriptUrl: "#" },
//         { id: 12, name: "Ryan Lee", marks: 79, scriptUrl: "#" },
//       ],
//     },
//   },
// });

// /** -----------------------------
//  *  Small modal to add semester/section
//  *  ----------------------------- */
// const AddSemesterSectionModal = ({
//   isOpen,
//   onClose,
//   onAdd,
//   type,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   onAdd: (name: string) => void;
//   type: "semester" | "section";
// }) => {
//   const [name, setName] = useState("");

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (name.trim()) {
//       onAdd(name.trim());
//       setName("");
//       onClose();
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-bold text-slate-900">
//             Add New {type === "semester" ? "Semester" : "Section"}
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-slate-400 hover:text-slate-600 transition-colors"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <input
//             type="text"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             placeholder={`Enter ${type} name...`}
//             className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 mb-4"
//             autoFocus
//           />
//           <div className="flex gap-2 justify-end">
//             <Button type="button" variant="outline" onClick={onClose}>
//               Cancel
//             </Button>
//             <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
//               Add {type === "semester" ? "Semester" : "Section"}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// /** -----------------------------
//  *  Modal to view OCR text
//  *  ----------------------------- */
// const OCRResultModal = ({
//   isOpen,
//   onClose,
//   subject,
//   filename,
//   text,
//   pages,
//   onCopy,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   subject: string;
//   filename: string;
//   text?: string;
//   pages?: number;
//   onCopy: () => void;
// }) => {
//   if (!isOpen) return null;
//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-xl border border-slate-200">
//         <div className="flex items-start justify-between gap-4 mb-4">
//           <div>
//             <h3 className="text-xl font-bold text-slate-900">OCR Result</h3>
//             <p className="text-sm text-slate-600">
//               <span className="font-medium">{subject}</span> • {filename}
//               {typeof pages === "number" ? ` • ${pages} page(s)` : null}
//             </p>
//           </div>
//           <div className="flex items-center gap-2">
//             <Button variant="outline" onClick={onCopy}>
//               <Clipboard className="h-4 w-4 mr-2" />
//               Copy
//             </Button>
//             <Button variant="outline" onClick={onClose}>
//               <X className="h-4 w-4 mr-2" />
//               Close
//             </Button>
//           </div>
//         </div>
//         <div className="h-[60vh] overflow-auto bg-slate-50 border border-slate-200 rounded-xl p-4 leading-relaxed text-slate-900 whitespace-pre-wrap">
//           {text || "No text available."}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Main Teacher Dashboard Component
// const TeacherDashboard = () => {
//   const [userName] = useState("Dr. Smith");
//   const [semesters, setSemesters] = useState<Semesters>(getInitialSemesters());
//   const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
//   const [selectedSection, setSelectedSection] = useState<string | null>(null);
//   const [editingStudent, setEditingStudent] = useState<number | null>(null);
//   const [marks, setMarks] = useState<{ [key: number]: number }>({});
//   const [isSemesterDropdownOpen, setIsSemesterDropdownOpen] = useState(false);
//   const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

//   // key: `${semester}-${section}` -> array of UploadedPaper
//   const [questionPapers, setQuestionPapers] = useState<{ [key: string]: UploadedPaper[] }>({});

//   // Add/section modal
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [modalType, setModalType] = useState<"semester" | "section">("semester");

//   // Upload refs
//   const studentFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
//   const questionPaperInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // OCR modal
//   const [ocrModalOpen, setOcrModalOpen] = useState(false);
//   const [ocrModalData, setOcrModalData] = useState<{
//     subject: string;
//     filename: string;
//     text?: string;
//     pages?: number;
//   } | null>(null);

//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (files && files.length > 0) {
//       const selectedFile = files[0];
//       console.log("Selected file:", selectedFile.name);
//     }
//   };

//   const handleEditMarks = (studentId: number, currentMarks: number) => {
//     setEditingStudent(studentId);
//     setMarks({ ...marks, [studentId]: currentMarks });
//   };

//   const handleSaveMarks = (studentId: number) => {
//     setEditingStudent(null);
//     console.log(`Saved marks for student ${studentId}:`, marks[studentId]);
//   };

//   const handleMarksChange = (studentId: number, value: string) => {
//     const numValue = parseInt(value) || 0;
//     setMarks({ ...marks, [studentId]: Math.min(100, Math.max(0, numValue)) });
//   };

//   const handleStudentScriptUpload = (studentId: number) => {
//     if (studentFileInputRefs.current[studentId]) {
//       studentFileInputRefs.current[studentId]?.click();
//     }
//   };

//   const handleStudentFileSelect = (
//     event: React.ChangeEvent<HTMLInputElement>,
//     studentId: number,
//     studentName: string
//   ) => {
//     const files = event.target.files;
//     if (files && files.length > 0) {
//       const selectedFile = files[0];
//       console.log(`Uploaded script for ${studentName} (ID: ${studentId}):`, selectedFile.name);
//     }
//   };

//   const handleStudentClick = (student: Student) => {
//     setSelectedStudent(student);
//   };

//   const handleQuestionPaperUpload = (key: string) => {
//     if (questionPaperInputRefs.current[key]) {
//       questionPaperInputRefs.current[key]?.click();
//     }
//   };

//   // Helper: update a single paper entry immutably
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

//   const handleQuestionPaperSelect = async (
//     event: React.ChangeEvent<HTMLInputElement>,
//     key: string
//   ) => {
//     const files = event.target.files;
//     if (!files || files.length === 0) return;

//     const selectedFile = files[0];
//     const fileName = selectedFile.name;

//     // Ask subject (simple prompt for now)
//     const subject = window.prompt("Enter the subject name for this question paper:");
//     if (!subject) {
//       event.currentTarget.value = "";
//       return;
//     }

//     // 1) Add placeholder entry with "processing"
//     const paperEntry: UploadedPaper = {
//       name: fileName,
//       subject,
//       ocrStatus: "processing",
//     };
//     setQuestionPapers((prev) => ({
//       ...prev,
//       [key]: [...(prev[key] || []), paperEntry],
//     }));

//     const idx = questionPapers[key]?.length || 0; // index of newly added paper

//     try {
//       // 2) Send to backend OCR API
//       const form = new FormData();
//       form.append("file", selectedFile, fileName);

//       const resp = await fetch(OCR_ENDPOINT, {
//         method: "POST",
//         body: form,
//       });

//       if (!resp.ok) {
//         const msg = await resp.text().catch(() => "");
//         // Surface the "common misconfig" hint on 404
//         const hint =
//           resp.status === 404
//             ? " (Hint: your Flask route should be POST /ocr — update your frontend URL or server route)"
//             : "";
//         throw new Error((msg || `OCR API failed with ${resp.status}`) + hint);
//       }

//       const data = (await resp.json()) as { text?: string; pages?: number; meta?: any };

//       // 3) Save OCR results
//       updatePaperAt(key, idx, {
//         ocrStatus: "done",
//         ocrText: data?.text || "",
//         pages: typeof data?.pages === "number" ? data.pages : undefined,
//         ocrError: undefined,
//       });

//       // 4) Show modal
//       setOcrModalData({
//         subject,
//         filename: fileName,
//         text: data?.text || "",
//         pages: typeof data?.pages === "number" ? data.pages : undefined,
//       });
//       setOcrModalOpen(true);
//     } catch (err: any) {
//       console.error("OCR error:", err);
//       updatePaperAt(key, idx, {
//         ocrStatus: "error",
//         ocrError: err?.message || "Unknown OCR error",
//       });
//       window.alert(`Failed to OCR "${fileName}": ${err?.message || "Unknown error"}`);
//     } finally {
//       event.currentTarget.value = "";
//     }
//   };

//   const handleRetryOCR = async (key: string, index: number) => {
//     const paper = questionPapers[key]?.[index];
//     if (!paper) return;

//     // Ask user to pick the PDF again for retry
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = ".pdf";
//     input.onchange = async (e: any) => {
//       const file = e?.target?.files?.[0];
//       if (!file) return;

//       try {
//         updatePaperAt(key, index, { ocrStatus: "processing", ocrError: undefined });

//         const form = new FormData();
//         form.append("file", file, file.name);
//         const resp = await fetch(OCR_ENDPOINT, { method: "POST", body: form });

//         if (!resp.ok) {
//           const msg = await resp.text().catch(() => "");
//           const hint =
//             resp.status === 404
//               ? " (Hint: your Flask route should be POST /ocr — update your frontend URL or server route)"
//               : "";
//           throw new Error((msg || `OCR API failed with ${resp.status}`) + hint);
//         }
//         const data = (await resp.json()) as { text?: string; pages?: number; meta?: any };

//         updatePaperAt(key, index, {
//           ocrStatus: "done",
//           ocrText: data?.text || "",
//           pages: typeof data?.pages === "number" ? data.pages : undefined,
//         });

//         setOcrModalData({
//           subject: paper.subject,
//           filename: file.name,
//           text: data?.text || "",
//           pages: typeof data?.pages === "number" ? data.pages : undefined,
//         });
//         setOcrModalOpen(true);
//       } catch (err: any) {
//         updatePaperAt(key, index, { ocrStatus: "error", ocrError: err?.message || "Unknown OCR error" });
//         window.alert(`Retry failed: ${err?.message || "Unknown error"}`);
//       }
//     };
//     input.click();
//   };

//   const handleOpenOCRModal = (paper: UploadedPaper) => {
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
//       await navigator.clipboard.writeText(ocrModalData.text);
//     } catch {
//       // no-op
//     }
//   };

//   const handleDeleteQuestionPaper = (key: string, index: number) => {
//     setQuestionPapers((prev) => {
//       const updated = [...(prev[key] || [])];
//       updated.splice(index, 1);
//       return { ...prev, [key]: updated };
//     });
//   };

//   const handleAddSemester = (name: string) => {
//     setSemesters({
//       ...semesters,
//       [name]: { sections: {} },
//     });
//   };

//   const handleAddSection = (name: string) => {
//     if (selectedSemester) {
//       setSemesters({
//         ...semesters,
//         [selectedSemester]: {
//           ...semesters[selectedSemester],
//           sections: {
//             ...semesters[selectedSemester].sections,
//             [name]: [],
//           },
//         },
//       });
//     }
//   };

//   const handleDeleteStudent = (studentId: number) => {
//     if (selectedSemester && selectedSection) {
//       const updatedStudents = currentStudents.filter((s) => s.id !== studentId);
//       setSemesters({
//         ...semesters,
//         [selectedSemester]: {
//           ...semesters[selectedSemester],
//           sections: {
//             ...semesters[selectedSemester].sections,
//             [selectedSection]: updatedStudents,
//           },
//         },
//       });
//     }
//   };

//   const currentStudents =
//     selectedSemester && selectedSection
//       ? semesters[selectedSemester]?.sections[selectedSection] || []
//       : [];

//   const currentKey =
//     selectedSemester && selectedSection ? `${selectedSemester}-${selectedSection}` : "";

//   // If a student is selected, show the StudentDetailsPage
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
//       <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
//         <div className="container mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div className="h-12 w-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-md">
//                 E
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-slate-900">EvalAI</h1>
//                 <p className="text-sm text-slate-600">Teacher Dashboard</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-4">
//               <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
//                 <div className="h-8 w-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-semibold">
//                   {userName[0]}
//                 </div>
//                 <span className="text-sm font-medium text-slate-900">{userName}</span>
//               </div>
//               <Button
//                 variant="outline"
//                 className="hover:bg-slate-100 transition-colors"
//                 onClick={() => (window.location.href = "/")}
//               >
//                 <LogOut className="h-4 w-4 mr-2" />
//                 Logout
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="container mx-auto px-6 py-8">
//         <div className="mb-8 relative overflow-hidden rounded-2xl bg-slate-900 p-10 text-white shadow-xl border border-slate-800">
//           <div className="relative">
//             <div className="flex items-center gap-2 mb-3">
//               <Award className="h-5 w-5" />
//               <span className="text-sm font-medium text-slate-300">Welcome back</span>
//             </div>
//             <h2 className="text-4xl font-bold mb-2">{userName}</h2>
//             <p className="text-lg text-slate-300">
//               Manage exam evaluations and track student performance with AI-powered tools
//             </p>
//           </div>
//         </div>

//         {/* Semester & Section Selection */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-xl font-bold text-slate-900">Select Semester and Section</h3>
//             <div className="flex gap-2">
//               <Button
//                 size="sm"
//                 className="bg-slate-900 text-white hover:bg-slate-800"
//                 onClick={() => {
//                   setModalType("semester");
//                   setShowAddModal(true);
//                 }}
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Semester
//               </Button>
//               {selectedSemester && (
//                 <Button
//                   size="sm"
//                   className="bg-slate-900 text-white hover:bg-slate-800"
//                   onClick={() => {
//                     setModalType("section");
//                     setShowAddModal(true);
//                   }}
//                 >
//                   <Plus className="h-4 w-4 mr-2" />
//                   Add Section
//                 </Button>
//               )}
//             </div>
//           </div>
//           <div className="flex flex-wrap gap-3 items-center">
//             {/* Semester Dropdown */}
//             <div className="relative">
//               <button
//                 onClick={() => setIsSemesterDropdownOpen(!isSemesterDropdownOpen)}
//                 className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-900 font-medium"
//               >
//                 {selectedSemester || "Select Semester"}
//                 <ChevronDown className="h-4 w-4" />
//               </button>

//               {isSemesterDropdownOpen && (
//                 <div className="absolute top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
//                   {Object.keys(semesters).map((sem) => (
//                     <button
//                       key={sem}
//                       onClick={() => {
//                         setSelectedSemester(sem);
//                         setSelectedSection(null);
//                         setIsSemesterDropdownOpen(false);
//                       }}
//                       className={`w-full text-left px-4 py-3 hover:bg-slate-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${
//                         selectedSemester === sem
//                           ? "bg-slate-900 text-white hover:bg-slate-800"
//                           : "text-slate-900"
//                       }`}
//                     >
//                       {sem}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Section Dropdown */}
//             {selectedSemester && (
//               <div className="relative">
//                 <button
//                   onClick={() => setIsSectionDropdownOpen(!isSectionDropdownOpen)}
//                   className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-900 font-medium"
//                 >
//                   {selectedSection || "Select Section"}
//                   <ChevronDown className="h-4 w-4" />
//                 </button>

//                 {isSectionDropdownOpen && (
//                   <div className="absolute top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
//                     {Object.keys(semesters[selectedSemester].sections).map((section) => (
//                       <button
//                         key={section}
//                         onClick={() => {
//                           setSelectedSection(section);
//                           setIsSectionDropdownOpen(false);
//                         }}
//                         className={`w-full text-left px-4 py-3 hover:bg-slate-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${
//                           selectedSection === section
//                             ? "bg-slate-900 text-white hover:bg-slate-800"
//                             : "text-slate-900"
//                         }`}
//                       >
//                         {section}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Question Papers Section */}
//         {selectedSemester && selectedSection && (
//           <Card className="mb-8 border-slate-200 shadow-lg bg-white">
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
//                     <BookOpen className="h-5 w-5" />
//                     Question Papers - {selectedSemester} / {selectedSection}
//                   </CardTitle>
//                   <CardDescription>Upload and OCR question papers</CardDescription>
//                 </div>
//                 <Button
//                   className="bg-slate-900 text-white hover:bg-slate-800 shadow-md"
//                   onClick={() => handleQuestionPaperUpload(currentKey)}
//                 >
//                   <Upload className="h-4 w-4 mr-2" />
//                   Upload Question Paper
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent>
//               {questionPapers[currentKey] && questionPapers[currentKey].length > 0 ? (
//                 <div className="space-y-3">
//                   {questionPapers[currentKey].map((paper, index) => (
//                     <div
//                       key={`${paper.name}-${index}`}
//                       className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg"
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 bg-slate-900 rounded-lg text-white">
//                           <FileText className="h-5 w-5" />
//                         </div>
//                         <div>
//                           <p className="font-semibold text-slate-900">{paper.subject}</p>
//                           <p className="text-sm text-slate-600">{paper.name}</p>
//                           {paper.pages ? (
//                             <p className="text-xs text-slate-500">{paper.pages} page(s)</p>
//                           ) : null}
//                           {paper.ocrStatus === "processing" && (
//                             <div className="mt-1 inline-flex items-center gap-2 text-xs text-slate-600">
//                               <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                               Running OCR…
//                             </div>
//                           )}
//                           {paper.ocrStatus === "error" && (
//                             <p className="mt-1 text-xs text-red-600">
//                               OCR failed: {paper.ocrError || "Unknown error"}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           className="text-slate-900 hover:bg-slate-100"
//                           onClick={() => {
//                             if (paper.ocrStatus === "done") {
//                               handleOpenOCRModal(paper);
//                             } else {
//                               window.alert("OCR not ready yet for this file.");
//                             }
//                           }}
//                         >
//                           <Eye className="h-4 w-4 mr-1" />
//                           View OCR
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => handleRetryOCR(currentKey, index)}
//                           className="hover:bg-slate-100"
//                         >
//                           <RefreshCcw className="h-4 w-4 mr-1" />
//                           Retry OCR
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           className="text-red-600 hover:bg-red-50 hover:text-red-700"
//                           onClick={() => handleDeleteQuestionPaper(currentKey, index)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-8 text-slate-500">
//                   <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
//                   <p>No question papers uploaded yet</p>
//                   <p className="text-sm">Click "Upload Question Paper" to add one</p>
//                 </div>
//               )}

//               <input
//                 type="file"
//                 ref={(el) => (questionPaperInputRefs.current[currentKey] = el)}
//                 onChange={(e) => handleQuestionPaperSelect(e, currentKey)}
//                 className="hidden"
//                 accept=".pdf"
//               />
//             </CardContent>
//           </Card>
//         )}

//         {/* Students Table */}
//         {selectedSemester && selectedSection ? (
//           <Card className="border-slate-200 shadow-lg bg-white">
//             <CardHeader>
//               <CardTitle className="text-2xl text-slate-900">
//                 Student Marks - {selectedSemester} / {selectedSection}
//               </CardTitle>
//               <CardDescription>
//                 Click on a student to view detailed performance analysis. Upload scripts and edit marks here.
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="border-b border-slate-200">
//                       <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">
//                         Student Name
//                       </th>
//                       <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">
//                         Marks
//                       </th>
//                       <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">
//                         Grade
//                       </th>
//                       <th className="text-center py-4 px-4 text-sm font-semibold text-slate-900">
//                         Answer Script
//                       </th>
//                       <th className="text-right py-4 px-4 text-sm font-semibold text-slate-900">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {currentStudents.map((student) => {
//                       const currentMarks =
//                         editingStudent === student.id ? marks[student.id] : student.marks;
//                       const grade =
//                         currentMarks >= 90
//                           ? "A+"
//                           : currentMarks >= 80
//                           ? "A"
//                           : currentMarks >= 70
//                           ? "B"
//                           : currentMarks >= 60
//                           ? "C"
//                           : "D";

//                       return (
//                         <tr
//                           key={student.id}
//                           className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
//                         >
//                           <td
//                             className="py-4 px-4 cursor-pointer"
//                             onClick={() => handleStudentClick(student)}
//                           >
//                             <div className="flex items-center gap-3">
//                               <div className="h-10 w-10 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-semibold">
//                                 {student.name
//                                   .split(" ")
//                                   .map((n) => n[0])
//                                   .join("")}
//                               </div>
//                               <span className="font-medium text-slate-900">{student.name}</span>
//                             </div>
//                           </td>
//                           <td
//                             className="py-4 px-4 cursor-pointer"
//                             onClick={() => handleStudentClick(student)}
//                           >
//                             {editingStudent === student.id ? (
//                               <input
//                                 type="number"
//                                 min="0"
//                                 max="100"
//                                 value={currentMarks}
//                                 onChange={(e) => handleMarksChange(student.id, e.target.value)}
//                                 onClick={(e) => e.stopPropagation()}
//                                 className="w-20 px-3 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
//                               />
//                             ) : (
//                               <span className="text-slate-900 font-semibold">{currentMarks}</span>
//                             )}
//                           </td>
//                           <td
//                             className="py-4 px-4 cursor-pointer"
//                             onClick={() => handleStudentClick(student)}
//                           >
//                             <span
//                               className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
//                                 grade === "A+" || grade === "A"
//                                   ? "bg-green-100 text-green-800"
//                                   : grade === "B"
//                                   ? "bg-blue-100 text-blue-800"
//                                   : grade === "C"
//                                   ? "bg-yellow-100 text-yellow-800"
//                                   : "bg-red-100 text-red-800"
//                               }`}
//                             >
//                               {grade}
//                             </span>
//                           </td>
//                           <td className="py-4 px-4">
//                             <div className="flex items-center justify-center gap-2">
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleStudentScriptUpload(student.id);
//                                 }}
//                                 className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
//                                 title="Upload Answer Script"
//                               >
//                                 <Upload className="h-4 w-4" />
//                               </button>
//                               <a
//                                 href={student.scriptUrl}
//                                 download
//                                 onClick={(e) => e.stopPropagation()}
//                                 className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
//                                 title="Download Answer Script"
//                               >
//                                 <FileText className="h-4 w-4" />
//                               </a>
//                               <input
//                                 type="file"
//                                 ref={(el) => (studentFileInputRefs.current[student.id] = el)}
//                                 onChange={(e) => handleStudentFileSelect(e, student.id, student.name)}
//                                 className="hidden"
//                                 accept=".pdf"
//                               />
//                             </div>
//                           </td>
//                           <td className="py-4 px-4">
//                             <div className="flex items-center justify-end gap-2">
//                               {editingStudent === student.id ? (
//                                 <Button
//                                   size="sm"
//                                   className="bg-slate-900 text-white hover:bg-slate-800"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleSaveMarks(student.id);
//                                   }}
//                                 >
//                                   <CheckCircle className="h-4 w-4 mr-1" />
//                                   Save
//                                 </Button>
//                               ) : (
//                                 <>
//                                   <Button
//                                     size="sm"
//                                     variant="outline"
//                                     className="text-slate-900 hover:bg-slate-100"
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       handleEditMarks(student.id, student.marks);
//                                     }}
//                                   >
//                                     Edit
//                                   </Button>
//                                   <Button
//                                     size="sm"
//                                     variant="outline"
//                                     className="text-red-600 hover:bg-red-50 hover:text-red-700"
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       if (
//                                         confirm(`Are you sure you want to delete ${student.name}?`)
//                                       ) {
//                                         handleDeleteStudent(student.id);
//                                       }
//                                     }}
//                                   >
//                                     <Trash2 className="h-4 w-4" />
//                                   </Button>
//                                 </>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </CardContent>
//           </Card>
//         ) : (
//           <Card className="border-slate-200 shadow-lg bg-white">
//             <CardContent className="p-12 text-center">
//               <div className="max-w-md mx-auto">
//                 <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <BookOpen className="h-10 w-10 text-slate-400" />
//                 </div>
//                 <h3 className="text-xl font-bold text-slate-900 mb-2">
//                   Select Semester and Section
//                 </h3>
//                 <p className="text-slate-600">
//                   Please select a semester and section from the dropdowns above to view and manage student marks
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         <input
//           type="file"
//           ref={fileInputRef}
//           onChange={handleFileSelect}
//           className="hidden"
//           accept=".pdf"
//         />
//       </main>

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
//     </div>
//   );
// };

// export default TeacherDashboard;

// src/pages/TeacherDashboard.tsx

import { useState } from "react";
import { Award } from "lucide-react";
import { Header } from "../components/teacher_components/Header";
import { SemesterSectionSelector } from "../components/teacher_components/SemesterSectionSelector";
import { AddSemesterSectionModal } from "../components/teacher_components/AddSemesterSectionModal";
import { OCRResultModal } from "../components/teacher_components/OCRResultModal";
import { QuestionPapersCard } from "../components/teacher_components/QuestionPapersCard";
import { StudentsTable } from "../components/teacher_components/StudentsTable";
import { StudentDetailsPage } from "../components/teacher_components/StudentDetailsPage";
import { useDropdown } from "../hooks/useDropdown";
import { OCRService } from "../controllers/ocrService";
import { getInitialSemesters, clampMarks } from "../utils";
import { Semesters, Student, UploadedPaper, OCRModalData } from "../types";

const TeacherDashboard = () => {
  const [userName] = useState("Dr. Smith");
  const [semesters, setSemesters] = useState<Semesters>(getInitialSemesters());
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<number | null>(null);
  const [marks, setMarks] = useState<{ [key: number]: number }>({});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Question papers state
  const [questionPapers, setQuestionPapers] = useState<{ [key: string]: UploadedPaper[] }>({});

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<"semester" | "section">("semester");
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [ocrModalData, setOcrModalData] = useState<OCRModalData | null>(null);

  // Dropdowns
  const semesterDropdown = useDropdown();
  const sectionDropdown = useDropdown();

  // Handlers
  const handleSemesterSelect = (semester: string) => {
    setSelectedSemester(semester);
    setSelectedSection(null);
    semesterDropdown.close();
  };

  const handleSectionSelect = (section: string) => {
    setSelectedSection(section);
    sectionDropdown.close();
  };

  const handleAddSemester = (name: string) => {
    setSemesters({
      ...semesters,
      [name]: { sections: {} },
    });
  };

  const handleAddSection = (name: string) => {
    if (selectedSemester) {
      setSemesters({
        ...semesters,
        [selectedSemester]: {
          ...semesters[selectedSemester],
          sections: {
            ...semesters[selectedSemester].sections,
            [name]: [],
          },
        },
      });
    }
  };

  const handleEditMarks = (studentId: number, currentMarks: number) => {
    setEditingStudent(studentId);
    setMarks({ ...marks, [studentId]: currentMarks });
  };

  const handleSaveMarks = (studentId: number) => {
    setEditingStudent(null);
    console.log(`Saved marks for student ${studentId}:`, marks[studentId]);
  };

  const handleMarksChange = (studentId: number, value: string) => {
    const numValue = parseInt(value) || 0;
    setMarks({ ...marks, [studentId]: clampMarks(numValue) });
  };

  const handleDeleteStudent = (studentId: number) => {
    if (selectedSemester && selectedSection) {
      const updatedStudents = currentStudents.filter((s) => s.id !== studentId);
      setSemesters({
        ...semesters,
        [selectedSemester]: {
          ...semesters[selectedSemester],
          sections: {
            ...semesters[selectedSemester].sections,
            [selectedSection]: updatedStudents,
          },
        },
      });
    }
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleStudentScriptUpload = (studentId: number) => {
    // Trigger file input for specific student
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";
    input.onchange = (e: any) => {
      const file = e?.target?.files?.[0];
      if (file) {
        console.log(`Uploaded script for student ${studentId}:`, file.name);
      }
    };
    input.click();
  };

  const handleStudentFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    studentId: number,
    studentName: string
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      console.log(`Uploaded script for ${studentName} (ID: ${studentId}):`, selectedFile.name);
    }
  };

  // Question Paper handlers
  const updatePaperAt = (key: string, index: number, patch: Partial<UploadedPaper>) => {
    setQuestionPapers((prev) => {
      const curr = prev[key] ? [...prev[key]] : [];
      curr[index] = { ...curr[index], ...patch };
      return { ...prev, [key]: curr };
    });
  };

  const handleQuestionPaperUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    const fileName = selectedFile.name;
    const currentKey = `${selectedSemester}-${selectedSection}`;

    const subject = window.prompt("Enter the subject name for this question paper:");
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
      window.alert(`Failed to OCR "${fileName}": ${err?.message || "Unknown error"}`);
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
        updatePaperAt(currentKey, index, { ocrStatus: "processing", ocrError: undefined });

        const data = await OCRService.retryOCR(file);

        updatePaperAt(currentKey, index, {
          ocrStatus: "done",
          ocrText: data?.text || "",
          pages: typeof data?.pages === "number" ? data.pages : undefined,
        });

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
        window.alert(`Retry failed: ${err?.message || "Unknown error"}`);
      }
    };
    input.click();
  };

  const handleDeleteQuestionPaper = (index: number) => {
    const currentKey = `${selectedSemester}-${selectedSection}`;
    setQuestionPapers((prev) => {
      const updated = [...(prev[currentKey] || [])];
      updated.splice(index, 1);
      return { ...prev, [currentKey]: updated };
    });
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
      await navigator.clipboard.writeText(ocrModalData.text);
    } catch {
      // no-op
    }
  };

  const currentStudents =
    selectedSemester && selectedSection
      ? semesters[selectedSemester]?.sections[selectedSection] || []
      : [];

  const currentKey =
    selectedSemester && selectedSection ? `${selectedSemester}-${selectedSection}` : "";

  const currentPapers = currentKey ? questionPapers[currentKey] || [] : [];

  if (selectedStudent) {
    return <StudentDetailsPage student={selectedStudent} onBack={() => setSelectedStudent(null)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header userName={userName} />

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-slate-900 p-10 text-white shadow-xl border border-slate-800">
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-5 w-5" />
              <span className="text-sm font-medium text-slate-300">Welcome back</span>
            </div>
            <h2 className="text-4xl font-bold mb-2">{userName}</h2>
            <p className="text-lg text-slate-300">
              Manage exam evaluations and track student performance with AI-powered tools
            </p>
          </div>
        </div>

        {/* Semester & Section Selection */}
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

        {/* Question Papers Section */}
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

        {/* Students Table */}
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
          onDeleteStudent={handleDeleteStudent}
          onUploadScript={handleStudentScriptUpload}
          onScriptFileSelect={handleStudentFileSelect}
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
    </div>
  );
};

export default TeacherDashboard;

