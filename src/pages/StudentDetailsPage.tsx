import { useState } from "react";
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

// Types
export interface Student {
  id: number;
  name: string;
  marks: number;
  scriptUrl: string;
}

interface Question {
  id: number;
  question: string;
  maxMarks: number;
  scoredMarks: number;
  aiAnalysis: string;
  missed: string;
  strengths: string;
}

interface StudentDetailsPageProps {
  student: Student;
  onBack: () => void;
}

// Student Details Page Component
export const StudentDetailsPage = ({ 
  student, 
  onBack 
}: StudentDetailsPageProps) => {
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
    ] as Question[],
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