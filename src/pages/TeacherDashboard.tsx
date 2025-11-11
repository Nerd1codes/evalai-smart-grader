import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  FileText,
  LogOut,
  Award,
  CheckCircle,
  ChevronDown,
  ArrowLeft,
  MessageSquare,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Trash2,
  Plus,
  X,
} from "lucide-react";

// Types
interface Student {
  id: number;
  name: string;
  marks: number;
  scriptUrl: string;
}

interface Section {
  [sectionName: string]: Student[];
}

interface Semester {
  sections: Section;
}

interface Semesters {
  [semesterName: string]: Semester;
}

// Initial data structure
const getInitialSemesters = (): Semesters => ({
  "Semester 1": {
    sections: {
      "Section A": [
        { id: 1, name: "John Doe", marks: 85, scriptUrl: "#" },
        { id: 2, name: "Jane Smith", marks: 92, scriptUrl: "#" },
        { id: 3, name: "Mike Johnson", marks: 78, scriptUrl: "#" },
        { id: 4, name: "Sarah Williams", marks: 88, scriptUrl: "#" },
      ],
      "Section B": [
        { id: 5, name: "Tom Brown", marks: 76, scriptUrl: "#" },
        { id: 6, name: "Emily Davis", marks: 91, scriptUrl: "#" },
        { id: 7, name: "Chris Wilson", marks: 83, scriptUrl: "#" },
      ],
    },
  },
  "Semester 2": {
    sections: {
      "Section A": [
        { id: 8, name: "Alex Martinez", marks: 89, scriptUrl: "#" },
        { id: 9, name: "Lisa Anderson", marks: 94, scriptUrl: "#" },
        { id: 10, name: "David Taylor", marks: 81, scriptUrl: "#" },
      ],
      "Section B": [
        { id: 11, name: "Nina Patel", marks: 87, scriptUrl: "#" },
        { id: 12, name: "Ryan Lee", marks: 79, scriptUrl: "#" },
      ],
    },
  },
});

// Student Details Page Component
const StudentDetailsPage = ({ 
  student, 
  onBack 
}: { 
  student: Student;
  onBack: () => void;
}) => {
  const [teacherComments, setTeacherComments] = useState<{ [key: number]: string }>({});
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [questionMarks, setQuestionMarks] = useState<{ [key: number]: number }>({});

  // Sample exam data with AI feedback
  const examData = {
    totalMarks: student.marks,
    maxMarks: 100,
    examName: "Mid-Term Mathematics Exam",
    questions: [
      {
        id: 1,
        question: "Solve the quadratic equation: x² - 5x + 6 = 0",
        maxMarks: 10,
        scoredMarks: 8,
        aiAnalysis: "Student correctly identified the roots as x = 2 and x = 3, but made a minor calculation error in the verification step.",
        missed: "Did not verify the solution by substituting values back into the original equation.",
        strengths: "Good understanding of factorization method and proper algebraic steps.",
      },
      {
        id: 2,
        question: "Find the derivative of f(x) = 3x³ - 2x² + 5x - 1",
        maxMarks: 15,
        scoredMarks: 15,
        aiAnalysis: "Perfect answer with clear step-by-step working. Student demonstrated excellent understanding of differentiation rules.",
        missed: "Nothing - Complete answer.",
        strengths: "Excellent application of power rule and proper notation throughout.",
      },
      {
        id: 3,
        question: "Calculate the area under the curve y = x² from x = 0 to x = 3",
        maxMarks: 20,
        scoredMarks: 12,
        aiAnalysis: "Student set up the integral correctly but made errors in the calculation of definite integral bounds.",
        missed: "Incorrect evaluation of the antiderivative at the upper bound. Did not show proper substitution steps.",
        strengths: "Correct integral setup and understanding of area under curve concept.",
      },
      {
        id: 4,
        question: "Prove that the sum of angles in a triangle is 180°",
        maxMarks: 15,
        scoredMarks: 10,
        aiAnalysis: "Student provided a valid proof but lacked some geometric rigor in the explanation.",
        missed: "Did not clearly label all angles and missed mentioning alternate interior angles property.",
        strengths: "Good intuitive understanding and correct final conclusion.",
      },
      {
        id: 5,
        question: "Word problem: A train travels at varying speeds - solve for average velocity",
        maxMarks: 20,
        scoredMarks: 18,
        aiAnalysis: "Excellent problem-solving approach with clear methodology. Minor arithmetic slip in final calculation.",
        missed: "Small calculation error when adding fractional values in the final step.",
        strengths: "Strong analytical skills and well-organized solution structure.",
      },
    ],
  };

  const handleCommentChange = (questionId: number, value: string) => {
    setTeacherComments({ ...teacherComments, [questionId]: value });
  };

  const handleSaveComment = (questionId: number) => {
    console.log(`Saved comment for question ${questionId}:`, teacherComments[questionId]);
  };

  const handleEditQuestionMarks = (questionId: number, currentMarks: number) => {
    setEditingQuestion(questionId);
    setQuestionMarks({ ...questionMarks, [questionId]: currentMarks });
  };

  const handleSaveQuestionMarks = (questionId: number) => {
    setEditingQuestion(null);
    console.log(`Saved marks for question ${questionId}:`, questionMarks[questionId]);
  };

  const handleQuestionMarksChange = (questionId: number, value: string, maxMarks: number) => {
    const numValue = parseInt(value) || 0;
    setQuestionMarks({ ...questionMarks, [questionId]: Math.min(maxMarks, Math.max(0, numValue)) });
  };

  const percentage = ((examData.totalMarks / examData.maxMarks) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-px flex-1 bg-slate-200" />
            <div className="text-sm text-slate-600">Student Performance Analysis</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 bg-white text-slate-900 rounded-full flex items-center justify-center text-2xl font-bold">
                {student.name.split(" ").map((n: string) => n[0]).join("")}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{student.name}</h1>
                <p className="text-slate-300 mb-1">{examData.examName}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm bg-white/10 px-3 py-1 rounded-full">
                    Roll No: #{student.id}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-300 mb-1">Overall Score</div>
              <div className="text-5xl font-bold">{examData.totalMarks}</div>
              <div className="text-xl text-slate-300">/ {examData.maxMarks}</div>
              <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                parseFloat(percentage) >= 80 ? "bg-green-500/20 text-green-300" : 
                parseFloat(percentage) >= 60 ? "bg-blue-500/20 text-blue-300" : 
                "bg-yellow-500/20 text-yellow-300"
              }`}>
                {parseFloat(percentage) >= student.marks ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {percentage}%
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Question-wise Performance</h2>
          
          {examData.questions.map((question, index) => {
            const currentMarks = editingQuestion === question.id 
              ? questionMarks[question.id] 
              : question.scoredMarks;
            const scorePercentage = (currentMarks / question.maxMarks) * 100;
            
            return (
              <Card key={question.id} className="border-slate-200 shadow-md bg-white">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex items-center justify-center h-8 w-8 bg-slate-900 text-white rounded-full text-sm font-bold">
                          {index + 1}
                        </span>
                        <CardTitle className="text-lg text-slate-900">
                          Question {index + 1}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-slate-700 mt-2">
                        {question.question}
                      </CardDescription>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        {editingQuestion === question.id ? (
                          <>
                            <input
                              type="number"
                              min="0"
                              max={question.maxMarks}
                              value={currentMarks}
                              onChange={(e) =>
                                handleQuestionMarksChange(question.id, e.target.value, question.maxMarks)
                              }
                              className="w-16 px-2 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-right text-lg font-bold"
                            />
                            <span className="text-lg font-bold text-slate-900">/{question.maxMarks}</span>
                          </>
                        ) : (
                          <div className="text-2xl font-bold text-slate-900">
                            {currentMarks}/{question.maxMarks}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <div className={`text-sm font-semibold ${
                          scorePercentage >= 80 ? "text-green-600" : 
                          scorePercentage >= 60 ? "text-blue-600" : 
                          scorePercentage >= 40 ? "text-yellow-600" : "text-red-600"
                        }`}>
                          {scorePercentage.toFixed(0)}%
                        </div>
                        {editingQuestion === question.id ? (
                          <Button
                            size="sm"
                            className="bg-slate-900 text-white hover:bg-slate-800 h-7"
                            onClick={() => handleSaveQuestionMarks(question.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-slate-900 hover:bg-slate-100 h-7 text-xs"
                            onClick={() => handleEditQuestionMarks(question.id, question.scoredMarks)}
                          >
                            Edit Marks
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-600 rounded-lg text-white">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-2">AI Analysis</h4>
                        <p className="text-sm text-slate-700">{question.aiAnalysis}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      What was missed
                    </h4>
                    <p className="text-sm text-red-800">{question.missed}</p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Strengths
                    </h4>
                    <p className="text-sm text-green-800">{question.strengths}</p>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                      <MessageSquare className="h-4 w-4" />
                      Teacher's Comment
                    </label>
                    <textarea
                      value={teacherComments[question.id] || ""}
                      onChange={(e) => handleCommentChange(question.id, e.target.value)}
                      placeholder="Add your feedback and suggestions for improvement..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        className="bg-slate-900 text-white hover:bg-slate-800"
                        onClick={() => handleSaveComment(question.id)}
                      >
                        Save Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 border-slate-200 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Overall Recommendations</CardTitle>
            <CardDescription>AI-generated suggestions for improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                <span>Focus on verification steps - always substitute answers back into original equations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                <span>Practice more definite integral problems with careful attention to bound evaluation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                <span>In geometry proofs, ensure all angles and lines are properly labeled for clarity</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                <span>Strong foundation in differentiation - maintain this level of performance</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

// Add Semester/Section Modal Component
const AddSemesterSectionModal = ({
  isOpen,
  onClose,
  onAdd,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
  type: "semester" | "section";
}) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      setName("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">
            Add New {type === "semester" ? "Semester" : "Section"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Enter ${type} name...`}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 mb-4"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
              Add {type === "semester" ? "Semester" : "Section"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Teacher Dashboard Component
const TeacherDashboard = () => {
  const [userName] = useState("Dr. Smith");
  const [semesters, setSemesters] = useState<Semesters>(getInitialSemesters());
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<number | null>(null);
  const [marks, setMarks] = useState<{ [key: number]: number }>({});
  const [isSemesterDropdownOpen, setIsSemesterDropdownOpen] = useState(false);
  const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [questionPapers, setQuestionPapers] = useState<{ [key: string]: Array<{ name: string; subject: string }> }>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<"semester" | "section">("semester");
  const studentFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const questionPaperInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      console.log("Selected file:", selectedFile.name);
    }
  };

  const handleOpenFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
    setMarks({ ...marks, [studentId]: Math.min(100, Math.max(0, numValue)) });
  };

  const handleStudentScriptUpload = (studentId: number) => {
    if (studentFileInputRefs.current[studentId]) {
      studentFileInputRefs.current[studentId]?.click();
    }
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

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleQuestionPaperUpload = (key: string) => {
    if (questionPaperInputRefs.current[key]) {
      questionPaperInputRefs.current[key]?.click();
    }
  };

  const handleQuestionPaperSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      const fileName = selectedFile.name;
      const subject = prompt("Enter the subject name for this question paper:");
      
      if (subject) {
        setQuestionPapers({
          ...questionPapers,
          [key]: [...(questionPapers[key] || []), { name: fileName, subject }],
        });
        console.log(`Uploaded question paper for ${key}:`, fileName, `Subject: ${subject}`);
      }
    }
  };

  const handleDeleteQuestionPaper = (key: string, index: number) => {
    const updated = [...(questionPapers[key] || [])];
    updated.splice(index, 1);
    setQuestionPapers({ ...questionPapers, [key]: updated });
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

  const handleDeleteStudent = (studentId: number) => {
    if (selectedSemester && selectedSection) {
      const updatedStudents = currentStudents.filter(s => s.id !== studentId);
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

  const currentStudents =
    selectedSemester && selectedSection
      ? semesters[selectedSemester]?.sections[selectedSection] || []
      : [];

  const currentKey = selectedSemester && selectedSection ? `${selectedSemester}-${selectedSection}` : "";

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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-md">
                E
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">EvalAI</h1>
                <p className="text-sm text-slate-600">Teacher Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
                <div className="h-8 w-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {userName[0]}
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {userName}
                </span>
              </div>
              <Button
                variant="outline"
                className="hover:bg-slate-100 transition-colors"
                onClick={() => (window.location.href = "/")}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-slate-900 p-10 text-white shadow-xl border border-slate-800">
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-5 w-5" />
              <span className="text-sm font-medium text-slate-300">
                Welcome back
              </span>
            </div>
            <h2 className="text-4xl font-bold mb-2">{userName}</h2>
            <p className="text-lg text-slate-300">
              Manage exam evaluations and track student performance with
              AI-powered tools
            </p>
          </div>
        </div>

        {/* Semester & Section Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">Select Semester and Section</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-slate-900 text-white hover:bg-slate-800"
                onClick={() => {
                  setModalType("semester");
                  setShowAddModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Semester
              </Button>
              {selectedSemester && (
                <Button
                  size="sm"
                  className="bg-slate-900 text-white hover:bg-slate-800"
                  onClick={() => {
                    setModalType("section");
                    setShowAddModal(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Semester Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSemesterDropdownOpen(!isSemesterDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-900 font-medium"
              >
                {selectedSemester || "Select Semester"}
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {isSemesterDropdownOpen && (
                <div className="absolute top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                  {Object.keys(semesters).map((sem) => (
                    <button
                      key={sem}
                      onClick={() => {
                        setSelectedSemester(sem);
                        setSelectedSection(null);
                        setIsSemesterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        selectedSemester === sem ? "bg-slate-900 text-white hover:bg-slate-800" : "text-slate-900"
                      }`}
                    >
                      {sem}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Section Dropdown - Only show if semester is selected */}
            {selectedSemester && (
              <div className="relative">
                <button
                  onClick={() => setIsSectionDropdownOpen(!isSectionDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-900 font-medium"
                >
                  {selectedSection || "Select Section"}
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {isSectionDropdownOpen && (
                  <div className="absolute top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                    {Object.keys(semesters[selectedSemester].sections).map((section) => (
                      <button
                        key={section}
                        onClick={() => {
                          setSelectedSection(section);
                          setIsSectionDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          selectedSection === section ? "bg-slate-900 text-white hover:bg-slate-800" : "text-slate-900"
                        }`}
                      >
                        {section}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Question Papers Section - Only show if semester and section are selected */}
        {selectedSemester && selectedSection && (
          <Card className="mb-8 border-slate-200 shadow-lg bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Question Papers - {selectedSemester} / {selectedSection}
                  </CardTitle>
                  <CardDescription>
                    Upload and manage question papers for different subjects
                  </CardDescription>
                </div>
                <Button
                  className="bg-slate-900 text-white hover:bg-slate-800 shadow-md"
                  onClick={() => handleQuestionPaperUpload(currentKey)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Question Paper
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {questionPapers[currentKey] && questionPapers[currentKey].length > 0 ? (
                <div className="space-y-3">
                  {questionPapers[currentKey].map((paper, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-lg text-white">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{paper.subject}</p>
                          <p className="text-sm text-slate-600">{paper.name}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDeleteQuestionPaper(currentKey, index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No question papers uploaded yet</p>
                  <p className="text-sm">Click "Upload Question Paper" to add one</p>
                </div>
              )}
              
              {/* Hidden file input for question papers */}
              <input
                type="file"
                ref={(el) => (questionPaperInputRefs.current[currentKey] = el)}
                onChange={(e) => handleQuestionPaperSelect(e, currentKey)}
                className="hidden"
                accept=".pdf"
              />
            </CardContent>
          </Card>
        )}

        {/* Students Table - Only show if semester and section are selected */}
        {selectedSemester && selectedSection ? (
          <Card className="border-slate-200 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900">
                Student Marks - {selectedSemester} / {selectedSection}
              </CardTitle>
              <CardDescription>
                Click on a student to view detailed performance analysis. Upload scripts and edit marks here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">
                        Student Name
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">
                        Marks
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">
                        Grade
                      </th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-slate-900">
                        Answer Script
                      </th>
                      <th className="text-right py-4 px-4 text-sm font-semibold text-slate-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.map((student) => {
                      const currentMarks =
                        editingStudent === student.id
                          ? marks[student.id]
                          : student.marks;
                      const grade =
                        currentMarks >= 90
                          ? "A+"
                          : currentMarks >= 80
                          ? "A"
                          : currentMarks >= 70
                          ? "B"
                          : currentMarks >= 60
                          ? "C"
                          : "D";

                      return (
                        <tr
                          key={student.id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td 
                            className="py-4 px-4 cursor-pointer"
                            onClick={() => handleStudentClick(student)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <span className="font-medium text-slate-900">
                                {student.name}
                              </span>
                            </div>
                          </td>
                          <td 
                            className="py-4 px-4 cursor-pointer"
                            onClick={() => handleStudentClick(student)}
                          >
                            {editingStudent === student.id ? (
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={currentMarks}
                                onChange={(e) =>
                                  handleMarksChange(student.id, e.target.value)
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="w-20 px-3 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                              />
                            ) : (
                              <span className="text-slate-900 font-semibold">
                                {currentMarks}
                              </span>
                            )}
                          </td>
                          <td 
                            className="py-4 px-4 cursor-pointer"
                            onClick={() => handleStudentClick(student)}
                          >
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                grade === "A+" || grade === "A"
                                  ? "bg-green-100 text-green-800"
                                  : grade === "B"
                                  ? "bg-blue-100 text-blue-800"
                                  : grade === "C"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {grade}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStudentScriptUpload(student.id);
                                }}
                                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                                title="Upload Answer Script"
                              >
                                <Upload className="h-4 w-4" />
                              </button>
                              <a
                                href={student.scriptUrl}
                                download
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                                title="Download Answer Script"
                              >
                                <FileText className="h-4 w-4" />
                              </a>
                              <input
                                type="file"
                                ref={(el) => (studentFileInputRefs.current[student.id] = el)}
                                onChange={(e) => handleStudentFileSelect(e, student.id, student.name)}
                                className="hidden"
                                accept=".pdf"
                              />
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              {editingStudent === student.id ? (
                                <Button
                                  size="sm"
                                  className="bg-slate-900 text-white hover:bg-slate-800"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveMarks(student.id);
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-slate-900 hover:bg-slate-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditMarks(student.id, student.marks);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm(`Are you sure you want to delete ${student.name}?`)) {
                                        handleDeleteStudent(student.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-200 shadow-lg bg-white">
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Select Semester and Section
                </h3>
                <p className="text-slate-600">
                  Please select a semester and section from the dropdowns above to view and manage student marks
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf"
        />
      </main>

      {/* Add Semester/Section Modal */}
      <AddSemesterSectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={modalType === "semester" ? handleAddSemester : handleAddSection}
        type={modalType}
      />
    </div>
  );
};

export default TeacherDashboard;