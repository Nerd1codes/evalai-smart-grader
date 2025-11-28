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
  // userName state is dynamic
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

  // Fetches teacher name and semesters on load
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

      // Update state immutably to trigger re-render
      setSemesters((prev) => {
        if (
          !prev[selectedSemester] ||
          !prev[selectedSemester].sections[selectedSection]
        ) {
          return prev;
        }

        return {
          ...prev,
          [selectedSemester]: {
            ...prev[selectedSemester],
            sections: {
              ...prev[selectedSemester].sections,
              [selectedSection]:
                prev[selectedSemester].sections[selectedSection].map((student) =>
                  student.id === studentId
                    ? { ...student, marks: newMarks }
                    : student
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
      await loadSemesters();
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
    // Keep existing behavior: open the student details page
    setSelectedStudent(student);
  };

  const handleStudentScriptUpload = (studentId: string) => {
    // This is usually wired to open the hidden <input type="file"> in StudentsTable.
    // We keep it as a log; actual file selection happens in handleStudentFileSelect.
    console.log(`📂 Upload triggered for studentId=${studentId}`);
  };

  const handleStudentFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    studentId: string,
    studentName: string
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const selectedFile = files[0];

    // Immediately reset the file input so the same file can be re-selected if needed
    event.target.value = "";

    // Ensure context is selected
    if (!selectedSemester || !selectedSection) {
      alert("Please select a semester and section before uploading student scripts.");
      return;
    }

    // Find which exam this script should belong to
    const examId = getActiveExamIdForCurrentSection();
    if (!examId) {
      alert(
        "No exam found for this semester/section.\n" +
        "Upload and process the question paper first so an exam is created."
      );
      return;
    }

    console.log(
      `📄 Student script uploaded for ${studentName} (ID: ${studentId}):`,
      selectedFile.name
    );
    console.log("🧩 Linking to examId:", examId);

    try {
      // 1️⃣ Send script to OCR (Python server) – same OCRService as question paper
      const ocrResult = await OCRService.processFile(selectedFile);
      const answerText = ocrResult?.text || "";

      // 2️⃣ For now, just log the extracted text + mapping info
      console.log("📝 Extracted answer text:", answerText);
      console.log("🔗 Mapping payload candidate:", {
        examId,
        studentId,
        studentName,
        // Later: we’ll break this into per-question answers
        rawAnswerText: answerText,
      });

      // 3️⃣ NEXT STEP (coming later):
      // Here we will:
      //   - Show a modal with exam questions
      //   - Let the teacher map each question to part of this answerText
      //   - Call POST /api/exams/:examId/students/:studentId/answers
      // For now we stop at logging so you can verify OCR + IDs are correct.

    } catch (err: any) {
      console.error("❌ OCR error while processing student script:", err);
      alert(
        err?.message ||
          "Failed to OCR the student script. Please check the OCR server and try again."
      );
    }
  };


    /**
   * Helper: find an "active" examId for the currently selected
   * semester + section, based on uploaded question papers.
   * For now, we just pick the first paper that has an examId.
   */
  const getActiveExamIdForCurrentSection = (): string | null => {
    if (!selectedSemester || !selectedSection) return null;

    const key = `${selectedSemester}-${selectedSection}`;
    const papers = questionPapers[key] || [];

    // Naive choice: first paper with an examId
    const examPaper = papers.find((p) => p.examId);
    return examPaper?.examId ?? null;
  };


  // ---------- Question Paper helpers ----------
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

  /**
   * STEP 2 HELPER:
   * Very simple question extractor from raw OCR text.
   * Looks for lines starting with patterns like:
   *   Q1, Q1), 1., 1)
   * You can improve this later or move it to backend.
   */
  const extractQuestionsFromRawText = (rawText: string) => {
    const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);

    const questions: { number: number; text: string }[] = [];
    let currentQ: { number: number; text: string } | null = null;

    const questionStartRegex = /^(?:Q\s*|Q\.?\s*|Question\s*)?(\d+)[\).\s:-]/i;

    for (const line of lines) {
      const match = line.match(questionStartRegex);
      if (match) {
        // Start of a new question
        const qNum = parseInt(match[1], 10);
        // Push previous question if exists
        if (currentQ) {
          currentQ.text = currentQ.text.trim();
          if (currentQ.text.length > 0) {
            questions.push(currentQ);
          }
        }
        // Start new one
        currentQ = {
          number: qNum,
          text: line, // include the whole line for now
        };
      } else if (currentQ) {
        // Continuation of current question
        currentQ.text += "\n" + line;
      }
    }

    // Push last question
    if (currentQ && currentQ.text.trim().length > 0) {
      questions.push({
        number: currentQ.number,
        text: currentQ.text.trim(),
      });
    }

    return questions;
  };

  // ---------- Question Paper upload (STEP 1 + STEP 2) ----------
  const handleQuestionPaperUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputEl = event.target;
    const files = inputEl.files;
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    const fileName = selectedFile.name;
    const currentKey = `${selectedSemester}-${selectedSection}`;

    const subject = prompt("Enter the subject name for this question paper:");
    if (!subject) {
      inputEl.value = "";
      return;
    }

    const paperEntry: UploadedPaper = {
      name: fileName,
      subject,
      ocrStatus: "processing",
      examId: undefined, // start without an ID
    };

    setQuestionPapers((prev) => ({
      ...prev,
      [currentKey]: [...(prev[currentKey] || []), paperEntry],
    }));

    const idx = questionPapers[currentKey]?.length || 0;

    // Exam ID placeholder
    let createdExamId: string | null = null;

    try {
      // 1. OCR call to Python server
      const ocrData = await OCRService.processFile(selectedFile);
      const rawText = ocrData?.text || "";

      console.log("📝 OCR Extracted Text:", rawText);

      // 2. Find semester/section IDs
      const mapping = await findServerSemAndSection(
        selectedSemester as string,
        selectedSection as string
      );
      if (!mapping?.sem?._id || !mapping?.sec?._id) {
        throw new Error("Semester or Section IDs not found for Exam creation.");
      }

      // 3. Create Exam in backend (STEP 1 – you already planned this)
      const createExamResponse = await api.createExam({
        semesterId: mapping.sem._id,
        sectionId: mapping.sec._id,
        subject,
        rawQuestionPaperText: rawText,
      });

      createdExamId = createExamResponse.examId;

      // 4. STEP 2: Extract questions from OCR text & send to backend
      const extractedQuestions = extractQuestionsFromRawText(rawText);
      console.log("📚 Extracted Questions:", extractedQuestions);

      if (createdExamId && extractedQuestions.length > 0) {
        // Assumes you add this in apiService.ts:
        // saveExamQuestions(examId: string, questions: { number: number; text: string }[])
        await api.saveExamQuestions(createdExamId, extractedQuestions);
      }

      // 5. Update frontend state with OCR + Exam ID
      updatePaperAt(currentKey, idx, {
        ocrStatus: "done",
        ocrText: rawText,
        pages: typeof ocrData?.pages === "number" ? ocrData.pages : undefined,
        ocrError: undefined,
        examId: createdExamId || undefined,
      });

      // 6. Update modal data (can show raw text for now; later you can show question list)
      setOcrModalData({
        subject,
        filename: fileName,
        text: rawText,
        pages: typeof ocrData?.pages === "number" ? ocrData.pages : undefined,
        // optionally include examId in OCRModalData type later
      });
      setOcrModalOpen(true);
    } catch (err: any) {
      console.error("OCR or backend save error:", err);
      updatePaperAt(currentKey, idx, {
        ocrStatus: "error",
        ocrError: err?.message || "Unknown OCR error",
        examId: createdExamId || undefined,
      });
      alert(
        `Failed to process or save "${fileName}": ${
          err?.message || "Unknown error"
        }`
      );
    } finally {
      inputEl.value = "";
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
        console.log("📝 OCR Extracted Text (retry):", data?.text);

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
