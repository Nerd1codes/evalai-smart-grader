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
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { api } from "@/controllers/apiService";

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
  aiMaxScore?: number | null;
  aiFeedback?: string;
  teacherScore?: number | null;
  teacherComment?: string;
  status?: string;
}

interface StudentDetailsPageProps {
  student: Student;
  examId: string | null;
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
  const loadAnswers = async () => {
    if (!examId) {
      setError("No exam selected for this student.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 👇 Use centralized API service
      const data = await api.getStudentAnswers(
        examId,
        String(student.id)
      );

      const fetchedAnswers: AnswerRecord[] = data.answers || [];

      setAnswers(fetchedAnswers);

      // Prefill teacherComments + questionMarks from existing data (if any)
      const initialComments: { [key: string]: string } = {};
      const initialMarks: { [key: string]: number } = {};

      fetchedAnswers.forEach((a) => {
        if (a.teacherComment) {
          initialComments[a._id] = a.teacherComment;
        }
        const effectiveMarks =
          a.teacherScore ?? a.aiScore ?? 0;
        initialMarks[a._id] = effectiveMarks;
      });

      setTeacherComments(initialComments);
      setQuestionMarks(initialMarks);
    } catch (err: any) {
      console.error("Failed to load student answers:", err);
      setError(err?.message || "Failed to load student answers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnswers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, student.id]);

  // ---------- Derived exam summary ----------
  // Use teacherScore if present, otherwise fallback to aiScore
  const totalMarks =
    answers.reduce((sum, a) => {
      const effective = a.teacherScore ?? a.aiScore ?? 0;
      return sum + effective;
    }, 0) || 0;

  const maxMarks =
    answers.reduce((sum, a) => sum + (a.maxMarks ?? 0), 0) || 1;

  const percentage = ((totalMarks / maxMarks) * 100).toFixed(1);
  const examName = "Exam Evaluation"; // Later you can pass subject/exam name as a prop

  // ---------- Handlers ----------
  const handleCommentChange = (answerId: string, value: string) => {
    setTeacherComments({ ...teacherComments, [answerId]: value });
  };

  const handleSaveComment = async (answerId: string) => {
    const comment = teacherComments[answerId] || "";

    console.log(`Saved comment for answer ${answerId}:`, comment);

    // TODO: when backend route exists, do something like:
    // await api.updateAnswerTeacherComment(answerId, comment);

    // For now, update local state so it appears as part of the answer
    setAnswers((prev) =>
      prev.map((a) =>
        a._id === answerId ? { ...a, teacherComment: comment } : a
      )
    );
  };

  const handleEditQuestionMarks = (answer: AnswerRecord) => {
    const current =
      questionMarks[answer._id] ??
      answer.teacherScore ??
      answer.aiScore ??
      0;
    setEditingQuestion(answer._id);
    setQuestionMarks({ ...questionMarks, [answer._id]: current });
  };

  const handleSaveQuestionMarks = async (answer: AnswerRecord) => {
    const newMarks =
      questionMarks[answer._id] ??
      answer.teacherScore ??
      answer.aiScore ??
      0;

    console.log(
      `Saved marks for answer ${answer._id} (Q${answer.questionNumber}):`,
      newMarks
    );

    // TODO: when backend route exists, do something like:
    // await api.updateAnswerTeacherScore(answer._id, newMarks);

    // Update local state so totals and UI refresh
    setAnswers((prev) =>
      prev.map((a) =>
        a._id === answer._id ? { ...a, teacherScore: newMarks } : a
      )
    );

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
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span>Student Performance Analysis</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={loadAnswers}
              >
                Refresh
              </Button>
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
              <div className="text-sm text-slate-300 mb-1">
                Overall Score (Teacher-adjusted)
              </div>
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
            const aiMarks = ans.aiScore ?? 0;
            const teacherOverride = ans.teacherScore ?? null;

            const currentMarks =
              editingQuestion === ans._id
                ? questionMarks[ans._id] ??
                  ans.teacherScore ??
                  ans.aiScore ??
                  0
                : ans.teacherScore ?? ans.aiScore ?? 0;

            const scorePercentage = max > 0 ? (currentMarks / max) * 100 : 0;

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
                      <div className="flex flex-col items-end gap-1">
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

                        {/* Show AI vs Teacher scoring info */}
                        <div className="text-xs text-slate-500">
                          AI Score:{" "}
                          <span className="font-semibold">
                            {aiMarks}/{max}
                          </span>
                          {teacherOverride !== null && (
                            <>
                              {"  •  "}
                              Teacher Override:{" "}
                              <span className="font-semibold">
                                {teacherOverride}/{max}
                              </span>
                            </>
                          )}
                        </div>

                        {editingQuestion === ans._id ? (
                          <Button
                            size="sm"
                            className="bg-slate-900 text-white hover:bg-slate-800 h-7 mt-1"
                            onClick={() => handleSaveQuestionMarks(ans)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-slate-900 hover:bg-slate-100 h-7 text-xs mt-1"
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
