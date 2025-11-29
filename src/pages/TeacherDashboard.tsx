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
    console.log(`📂 Upload triggered for studentId=${studentId}`);
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

    const examPaper = papers.find((p) => p.examId);
    return examPaper?.examId ?? null;
  };

  // 🔥 NEW: call backend AI evaluation after answers are saved
  const evaluateStudentWithAI = async (
  examId: string,
  studentId: string,
  studentName: string
) => {
  try {
    console.log(
      `🤖 Triggering AI evaluation for ${studentName} (studentId=${studentId}) in examId=${examId}`
    );

    const data = await api.evaluateStudentAnswers(examId, studentId);
    console.log("🤖 AI evaluation response:", data);

    const evaluatedCount = Array.isArray(data?.results)
      ? data.results.length
      : data?.evaluatedCount ?? 0;

    if (typeof data?.totalScore === "number" && selectedSemester && selectedSection) {
      setSemesters((prev) => {
        const sem = prev[selectedSemester];
        if (!sem) return prev;
        const secStudents = sem.sections[selectedSection] || [];
        const updatedStudents = secStudents.map((s) =>
          s.id === studentId ? { ...s, marks: data.totalScore } : s
        );
        return {
          ...prev,
          [selectedSemester]: {
            ...sem,
            sections: {
              ...sem.sections,
              [selectedSection]: updatedStudents,
            },
          },
        };
      });
    }

    alert(
      `AI evaluation completed for ${studentName}. Evaluated ${evaluatedCount} answer(s).`
    );
  } catch (err: any) {
    console.error("❌ AI evaluation failed:", err);
    alert(err?.message || "AI evaluation failed. Please check the evaluation service.");
  }
};



  const handleStudentFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    studentId: string,
    studentName: string
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const selectedFile = files[0];

    // Reset input so the same file can be chosen again
    event.target.value = "";

    if (!selectedSemester || !selectedSection) {
      alert("Please select a semester and section before uploading student scripts.");
      return;
    }

    // 1️⃣ Resolve examId for this semester+section
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
      // 2️⃣ OCR the student script
      const ocrResult = await OCRService.processFile(selectedFile);
      const answerText = ocrResult?.text || "";

      console.log("📝 Extracted answer text:", answerText);

      // 3️⃣ Fetch exam to get questions
      const examRes = await api.getExamById(examId);
      const exam = examRes.exam;
      const questions = exam?.questions || [];

      if (!questions.length) {
        alert("This exam has no questions saved yet. Cannot map answers.");
        return;
      }

      // 4️⃣ Split OCR text into per-question answers by numbers (31., 32., 33., ...)
      const extractedAnswers = extractAnswersFromRawText(answerText);
      console.log("🧩 Extracted answer segments:", extractedAnswers);

      // 5️⃣ Map each segment to the matching question by questionNumber
      const answersPayload: { questionId: string; answerText: string }[] = [];

      for (const seg of extractedAnswers) {
        const matchingQuestion = questions.find(
          (q: any) => q.questionNumber === seg.number
        );

        if (!matchingQuestion) {
          console.warn(
            `⚠ No matching question found in exam for questionNumber=${seg.number}. Skipping.`
          );
          continue;
        }

        answersPayload.push({
          questionId: matchingQuestion._id,
          answerText: seg.text,
        });
      }

      if (answersPayload.length === 0) {
        alert(
          "Could not match any answer segments to questions.\n" +
            "Check the numbering format in the student script (e.g., '31.', '32.')."
        );
        return;
      }

      console.log("🎯 Final answers payload to save:", answersPayload);

      // 6️⃣ Save ALL mapped answers in one go
      const saveRes = await api.saveStudentAnswers(examId, studentId, answersPayload);
      console.log("✅ Saved student answer(s):", saveRes);
      alert(
        `Saved ${answersPayload.length} answers for ${studentName}. Check your 'answers' collection.`
      );

      // 7️⃣ 🔥 Immediately trigger AI evaluation for this student's answers
      await evaluateStudentWithAI(examId, studentId, studentName);
    } catch (err: any) {
      console.error("❌ Error while processing/saving student script:", err);
      alert(
        err?.message ||
          "Failed to OCR or save the student script. Please check backend/OCR server."
      );
    }
  };

  /**
   * Split the student's OCR answer text into per-question chunks.
   * Assumes answers are labeled like:
   *  31. ...
   *  32. ...
   *  33. ...
   */
  function extractAnswersFromRawText(rawText: string): {
    number: number;
    text: string;
  }[] {
    if (!rawText) return [];

    const text = rawText.replace(/\r\n/g, "\n");
    const pattern = /^\s*(?:\|\s*)?(\d+)\s*\.\s/gm;

    const results: { number: number; text: string }[] = [];
    let lastIndex = 0;
    let currentQuestionNumber: number | null = null;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const matchIndex = match.index;
      const qNumStr = match[1];
      const qNum = parseInt(qNumStr, 10);

      if (currentQuestionNumber !== null) {
        const chunk = text.substring(lastIndex, matchIndex).trim();
        if (chunk.length > 0) {
          results.push({
            number: currentQuestionNumber,
            text: chunk,
          });
        }
      }

      currentQuestionNumber = qNum;
      lastIndex = pattern.lastIndex;
    }

    if (currentQuestionNumber !== null && lastIndex < text.length) {
      const chunk = text.substring(lastIndex).trim();
      if (chunk.length > 0) {
        results.push({
          number: currentQuestionNumber,
          text: chunk,
        });
      }
    }

    return results;
  }

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
   */
  function extractQuestionsFromRawText(rawText: string): {
    number: number;
    text: string;
    maxMarks: number;
  }[] {
    if (!rawText) return [];

    const text = rawText.replace(/\r\n/g, "\n");
    const pattern = /^(\d+)\s+/gm;

    const results: { number: number; text: string; maxMarks: number }[] = [];
    let lastIndex = 0;
    let currentQuestionNumber: number | null = null;
    let match: RegExpExecArray | null;

    const getMaxMarksFromSegment = (segment: string): number => {
      let maxVal: number | null = null;

      const marksRegex = /(\d+(?:\.\d+)?)\s*marks?/gi;
      let m: RegExpExecArray | null;
      while ((m = marksRegex.exec(segment)) !== null) {
        maxVal = parseFloat(m[1]);
      }

      if (maxVal === null) {
        const lineNumberRegex = /^(\d+(?:\.\d+)?)\s*$/gm;
        while ((m = lineNumberRegex.exec(segment)) !== null) {
          maxVal = parseFloat(m[1]);
        }
      }

      return maxVal ?? 0;
    };

    while ((match = pattern.exec(text)) !== null) {
      const matchIndex = match.index;
      const qNumStr = match[1];
      const qNum = parseInt(qNumStr, 10);

      if (currentQuestionNumber !== null) {
        const segment = text.substring(lastIndex, matchIndex).trim();
        if (segment.length > 0) {
          const cleaned = segment.trim();
          const maxMarks = getMaxMarksFromSegment(cleaned);

          results.push({
            number: currentQuestionNumber,
            text: cleaned,
            maxMarks,
          });
        }
      }

      currentQuestionNumber = qNum;
      lastIndex = pattern.lastIndex;
    }

    if (currentQuestionNumber !== null && lastIndex < text.length) {
      const segment = text.substring(lastIndex).trim();
      if (segment.length > 0) {
        const cleaned = segment.trim();
        const maxMarks = getMaxMarksFromSegment(cleaned);

        results.push({
          number: currentQuestionNumber,
          text: cleaned,
          maxMarks,
        });
      }
    }

    console.log("📚 [DEBUG] extractQuestionsFromRawText →", results);
    return results;
  }

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
      examId: undefined,
    };

    setQuestionPapers((prev) => ({
      ...prev,
      [currentKey]: [...(prev[currentKey] || []), paperEntry],
    }));

    const idx = questionPapers[currentKey]?.length || 0;

    let createdExamId: string | null = null;

    try {
      const ocrData = await OCRService.processFile(selectedFile);
      const rawText = ocrData?.text || "";

      console.log("📝 OCR Extracted Text:", rawText);

      const mapping = await findServerSemAndSection(
        selectedSemester as string,
        selectedSection as string
      );
      if (!mapping?.sem?._id || !mapping?.sec?._id) {
        throw new Error("Semester or Section IDs not found for Exam creation.");
      }

      const createExamResponse = await api.createExam({
        semesterId: mapping.sem._id,
        sectionId: mapping.sec._id,
        subject,
        rawQuestionPaperText: rawText,
      });

      createdExamId = createExamResponse.examId;

      const extractedQuestions = extractQuestionsFromRawText(rawText);
      console.log("📚 Extracted Questions:", extractedQuestions);

      if (createdExamId && extractedQuestions.length > 0) {
        await api.saveExamQuestions(createdExamId, extractedQuestions);
      }

      updatePaperAt(currentKey, idx, {
        ocrStatus: "done",
        ocrText: rawText,
        pages: typeof ocrData?.pages === "number" ? ocrData.pages : undefined,
        ocrError: undefined,
        examId: createdExamId || undefined,
      });

      setOcrModalData({
        subject,
        filename: fileName,
        text: rawText,
        pages: typeof ocrData?.pages === "number" ? ocrData.pages : undefined,
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
    const activeExamId = getActiveExamIdForCurrentSection();
    return (
      <StudentDetailsPage
        student={selectedStudent}
        examId={activeExamId}
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
