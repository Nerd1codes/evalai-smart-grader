import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  MessageSquare,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// If you already have a Student type in "@/types", you can import it instead.
export interface Student {
  id: string | number;
  name: string;
  marks?: number;
  scriptUrl?: string;
}

interface AnswerRecord {
  _id: string;
  examId: string;
  studentId: string;
  questionId: string;
  questionNumber: number;
  questionText: string | null;
  answerText: string;
  maxMarks: number;
  aiScore?: number | null;
  aiFeedback?: string;
  teacherScore?: number | null;
  status?: string;
}

interface StudentDetailsPageProps {
  student: Student;
  examId: string | null; // 👈 which exam we are looking at
  onBack: () => void;
}

export const StudentDetailsPage = ({
  student,
  examId,
  onBack,
}: StudentDetailsPageProps) => {
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [teacherComments, setTeacherComments] = useState<{
    [key: string]: string;
  }>({});
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [questionMarks, setQuestionMarks] = useState<{
    [key: string]: number;
  }>({});

  // ---------- Fetch student's answers + questions from backend ----------
  useEffect(() => {
    const loadAnswers = async () => {
      if (!examId) {
        setError("No exam selected for this student.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/exams/${examId}/students/${student.id}/answers`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load answers.");
        }

        const fetchedAnswers: AnswerRecord[] = data.answers || [];
        setAnswers(fetchedAnswers);
      } catch (err: any) {
        console.error("Failed to load student answers:", err);
        setError(err?.message || "Failed to load student answers.");
      } finally {
        setLoading(false);
      }
    };

    loadAnswers();
  }, [examId, student.id]);

  // ---------- Derived exam summary ----------
  const totalMarks =
    answers.reduce(
      (sum, a) => sum + (a.teacherScore ?? a.aiScore ?? 0),
      0
    ) || 0;

  const maxMarks =
    answers.reduce((sum, a) => sum + (a.maxMarks ?? 0), 0) || 1; // avoid /0

  const percentage = ((totalMarks / maxMarks) * 100).toFixed(1);

  const examName = "Exam Evaluation"; // You can later pass subject/exam name as a prop

  // ---------- Handlers ----------
  const handleCommentChange = (answerId: string, value: string) => {
    setTeacherComments({ ...teacherComments, [answerId]: value });
  };

  const handleSaveComment = (answerId: string) => {
    console.log(
      `Saved comment for answer ${answerId}:`,
      teacherComments[answerId]
    );
    // Later: POST/PATCH to backend to persist teacher comments
  };

  const handleEditQuestionMarks = (answer: AnswerRecord) => {
    const current =
      questionMarks[answer._id] ?? answer.teacherScore ?? answer.aiScore ?? 0;
    setEditingQuestion(answer._id);
    setQuestionMarks({ ...questionMarks, [answer._id]: current });
  };

  const handleSaveQuestionMarks = (answer: AnswerRecord) => {
    const newMarks =
      questionMarks[answer._id] ?? answer.teacherScore ?? answer.aiScore ?? 0;

    console.log(
      `Saved marks for answer ${answer._id} (Q${answer.questionNumber}):`,
      newMarks
    );

    // Later: call backend to persist teacherScore override
    // e.g. PATCH /answers/:id { teacherScore: newMarks }

    setEditingQuestion(null);
  };

  const handleQuestionMarksChange = (
    answerId: string,
    value: string,
    maxMarks: number
  ) => {
    const numValue = parseFloat(value) || 0;
    const clamped = Math.min(maxMarks, Math.max(0, numValue));
    setQuestionMarks({ ...questionMarks, [answerId]: clamped });
  };

  // ---------- Render ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600 text-sm">Loading answers...</div>
      </div>
    );
  }

  if (error) {
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
              <div className="text-sm text-slate-600">Student Performance</div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">
          <div className="text-red-600 text-sm">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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
            <div className="text-sm text-slate-600">
              Student Performance Analysis
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Student summary card */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 bg-white text-slate-900 rounded-full flex items-center justify-center text-2xl font-bold">
                {student.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{student.name}</h1>
                <p className="text-slate-300 mb-1">{examName}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm bg-white/10 px-3 py-1 rounded-full">
                    Roll No: #{student.id}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-300 mb-1">Overall Score</div>
              <div className="text-5xl font-bold">{totalMarks}</div>
              <div className="text-xl text-slate-300">/ {maxMarks}</div>
              <div
                className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                  parseFloat(percentage) >= 80
                    ? "bg-green-500/20 text-green-300"
                    : parseFloat(percentage) >= 60
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-yellow-500/20 text-yellow-300"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                {percentage}%
              </div>
            </div>
          </div>
        </div>

        {/* Question-wise performance */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Question-wise Performance
          </h2>

          {answers.map((ans, index) => {
            const max = ans.maxMarks ?? 0;
            const currentMarks =
              editingQuestion === ans._id
                ? questionMarks[ans._id] ??
                  ans.teacherScore ??
                  ans.aiScore ??
                  0
                : ans.teacherScore ?? ans.aiScore ?? 0;

            const scorePercentage =
              max > 0 ? (currentMarks / max) * 100 : 0;

            return (
              <Card
                key={ans._id}
                className="border-slate-200 shadow-md bg-white"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex items-center justify-center h-8 w-8 bg-slate-900 text-white rounded-full text-sm font-bold">
                          {ans.questionNumber ?? index + 1}
                        </span>
                        <CardTitle className="text-lg text-slate-900">
                          Question {ans.questionNumber ?? index + 1}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-slate-700 mt-2 whitespace-pre-wrap">
                        {ans.questionText || "Question text not available."}
                      </CardDescription>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        {editingQuestion === ans._id ? (
                          <>
                            <input
                              type="number"
                              min={0}
                              max={max}
                              value={currentMarks}
                              onChange={(e) =>
                                handleQuestionMarksChange(
                                  ans._id,
                                  e.target.value,
                                  max
                                )
                              }
                              className="w-16 px-2 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-right text-lg font-bold"
                            />
                            <span className="text-lg font-bold text-slate-900">
                              /{max}
                            </span>
                          </>
                        ) : (
                          <div className="text-2xl font-bold text-slate-900">
                            {currentMarks}/{max}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <div
                          className={`text-sm font-semibold ${
                            scorePercentage >= 80
                              ? "text-green-600"
                              : scorePercentage >= 60
                              ? "text-blue-600"
                              : scorePercentage >= 40
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {scorePercentage.toFixed(0)}%
                        </div>
                        {editingQuestion === ans._id ? (
                          <Button
                            size="sm"
                            className="bg-slate-900 text-white hover:bg-slate-800 h-7"
                            onClick={() => handleSaveQuestionMarks(ans)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-slate-900 hover:bg-slate-100 h-7 text-xs"
                            onClick={() => handleEditQuestionMarks(ans)}
                          >
                            Edit Marks
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Student's answer */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">
                      Student's Answer
                    </h4>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap">
                      {ans.answerText}
                    </p>
                  </div>

                  {/* AI Feedback */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-600 rounded-lg text-white">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-2">
                          AI Feedback
                        </h4>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {ans.aiFeedback || "No AI feedback available yet."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Teacher comments */}
                  <div className="border-t border-slate-200 pt-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                      <MessageSquare className="h-4 w-4" />
                      Teacher's Comment
                    </label>
                    <textarea
                      value={teacherComments[ans._id] || ""}
                      onChange={(e) =>
                        handleCommentChange(ans._id, e.target.value)
                      }
                      placeholder="Add your feedback and suggestions for improvement..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        className="bg-slate-900 text-white hover:bg-slate-800"
                        onClick={() => handleSaveComment(ans._id)}
                      >
                        Save Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {answers.length === 0 && (
            <div className="text-sm text-slate-600">
              No answers found for this student in this exam.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
