// TeacherDashboard.tsx
import React, { useEffect, useState } from "react";
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
import { api } from "../controllers/apiService"; // <-- ensure this exists and exports `api`

const TeacherDashboard: React.FC = () => {
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

  // ---------- Helpers to transform server data <-> frontend shape ----------
  // Server shape: semesters[] containing sections[] containing students[] and papers[]
  // Frontend shape expected earlier: { [semesterName]: { sections: { [sectionName]: students[] } } }

  const transformServerToFrontend = (serverSemesters: any[]): Semesters => {
    const out: any = {};
    serverSemesters.forEach((s) => {
      out[s.name] = { sections: {} };
      (s.sections || []).forEach((sec: any) => {
        // keep student objects with their _id so deletes can use them
        out[s.name].sections[sec.name] = (sec.students || []).map((st: any) => ({
          ...st,
          _id: st._id || st.id || null,
        }));
      });
    });
    return out;
  };

  const findServerSemAndSection = async (semesterName: string, sectionName: string) => {
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
      // keep selected semester/section if they still exist; otherwise clear
      if (selectedSemester) {
        const semExists = serverSemesters.some((s: any) => s.name === selectedSemester);
        if (!semExists) setSelectedSemester(null);
      }
      if (selectedSemester && selectedSection) {
        const sem = serverSemesters.find((s: any) => s.name === selectedSemester);
        const secExists = sem && sem.sections.some((sec: any) => sec.name === selectedSection);
        if (!secExists) setSelectedSection(null);
      }
    } catch (err) {
      console.error("Failed to load semesters:", err);
      // fallback: keep existing local state
    }
  };

  useEffect(() => {
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
      window.alert("Semester name cannot be empty.");
      return;
    }
    try {
      await api.addSemester(name.trim());
      await loadSemesters();
      setShowAddModal(false);
    } catch (err: any) {
      console.error("Add semester failed:", err);
      window.alert(err?.message || "Failed to add semester");
    }
  };

  const handleAddSection = async (name: string) => {
    if (!selectedSemester) {
      window.alert("Select a semester first.");
      return;
    }
    if (!name?.trim()) {
      window.alert("Section name cannot be empty.");
      return;
    }

    try {
      const mapping = await findServerSemAndSection(selectedSemester, "__dummy__");
      // mapping.sem exists if semester exists
      if (!mapping?.sem) {
        window.alert("Selected semester not found on server. Refreshing...");
        await loadSemesters();
        return;
      }
      await api.addSection(mapping.sem._id, name.trim());
      await loadSemesters();
      setShowAddModal(false);
    } catch (err: any) {
      console.error("Add section failed:", err);
      window.alert(err?.message || "Failed to add section");
    }
  };

  // ---------- Marks / edit handlers (unchanged except kept here) ----------
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

  // ---------- Delete student (confirmation + backend + refresh) ----------
  const handleDeleteStudent = async (studentId: string | number) => {
    if (!selectedSemester || !selectedSection) {
      window.alert("Select semester and section first.");
      return;
    }

    // confirm with user
    const ok = window.confirm(
      "⚠️ This will permanently remove the student from this section. Do you want to continue?"
    );
    if (!ok) return;

    try {
      // find server sem & sec ids
      const mapping = await findServerSemAndSection(selectedSemester, selectedSection);
      if (!mapping || !mapping.sem || !mapping.sec) {
        window.alert("Could not find semester/section on server. Refreshing...");
        await loadSemesters();
        return;
      }

      // studentId passed may be index/usn or server _id; prefer using server _id from local state
      const studentsInFront = semesters[selectedSemester].sections[selectedSection] || [];
      const studentObj =
        studentsInFront.find((s: any) => String(s._id) === String(studentId)) ||
        studentsInFront.find((s: any) => String(s.usn) === String(studentId)) ||
        null;

      const sid = studentObj?._id || studentId;

      await api.deleteStudent(mapping.sem._id, mapping.sec._id, sid);
      // refresh local state
      await loadSemesters();
    } catch (err: any) {
      console.error("Delete student failed:", err);
      window.alert(err?.message || "Failed to delete student");
      await loadSemesters();
    }
  };

  // ---------- Student click / upload (unchanged) ----------
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

  // ---------- Question Paper handlers (upload -> OCR -> persist metadata) ----------
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

    // show locally first
    setQuestionPapers((prev) => ({
      ...prev,
      [currentKey]: [...(prev[currentKey] || []), paperEntry],
    }));

    const idx = questionPapers[currentKey]?.length || 0;

    try {
      // run OCR (existing service)
      const data = await OCRService.processFile(selectedFile);

      updatePaperAt(currentKey, idx, {
        ocrStatus: "done",
        ocrText: data?.text || "",
        pages: typeof data?.pages === "number" ? data.pages : undefined,
        ocrError: undefined,
      });

      // persist metadata to backend
      if (selectedSemester && selectedSection) {
        const mapping = await findServerSemAndSection(selectedSemester, selectedSection);
        if (mapping && mapping.sem && mapping.sec) {
          await api.addPaper(mapping.sem._id, mapping.sec._id, {
            name: fileName,
            subject,
            ocrStatus: "done",
            ocrText: data?.text || "",
            pages: data?.pages,
          });
          // refresh semesters (to get server paper ids if needed)
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

        // persist updated paper metadata to backend (optional)
        if (selectedSemester && selectedSection) {
          const mapping = await findServerSemAndSection(selectedSemester, selectedSection);
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
        window.alert(`Retry failed: ${err?.message || "Unknown error"}`);
      }
    };
    input.click();
  };

  // ---------- Delete question paper (confirm + API + refresh) ----------
  const handleDeleteQuestionPaper = async (index: number) => {
    if (!selectedSemester || !selectedSection) {
      window.alert("Select semester and section.");
      return;
    }
    const ok = window.confirm("⚠️ This will permanently delete the question paper. Proceed?");
    if (!ok) return;

    try {
      const mapping = await findServerSemAndSection(selectedSemester, selectedSection);
      if (!mapping?.sem || !mapping?.sec) {
        window.alert("Could not find semester/section on server. Refreshing...");
        await loadSemesters();
        return;
      }

      // try to resolve paper id from server by name (best-effort)
      const serverPaper = (mapping.sec.papers || [])[index];
      if (serverPaper && serverPaper._id) {
        await api.deletePaper(mapping.sem._id, mapping.sec._id, serverPaper._id);
      } else {
        // fallback: simply remove locally (and refresh server data)
        // we still call backend to re-sync by reloading semester list after local splice
      }

      // remove locally and refresh from server
      await loadSemesters();
      setQuestionPapers((prev) => {
        const key = `${selectedSemester}-${selectedSection}`;
        const arr = prev[key] ? [...prev[key]] : [];
        arr.splice(index, 1);
        return { ...prev, [key]: arr };
      });
    } catch (err: any) {
      console.error("Delete paper failed:", err);
      window.alert(err?.message || "Failed to delete paper");
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
      await navigator.clipboard.writeText(ocrModalData.text);
    } catch {
      // no-op
    }
  };

  // ---------- Derived current lists ----------
  const currentStudents: any[] =
    selectedSemester && selectedSection ? semesters[selectedSemester]?.sections[selectedSection] || [] : [];

  const currentKey = selectedSemester && selectedSection ? `${selectedSemester}-${selectedSection}` : "";
  const currentPapers = currentKey ? questionPapers[currentKey] || [] : [];

  // ---------- Render ----------
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
