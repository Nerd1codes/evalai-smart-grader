// src/components/student_components/ExamDetailsPage.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, AlertCircle, MessageSquare, CheckCircle } from "lucide-react";

export const ExamDetailsPage: React.FC<{ exam: any; onBack: () => void }> = ({ exam, onBack }) => {
  const percentage = ((exam.score / exam.maxScore) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-px flex-1 bg-slate-200" />
            <div className="text-sm text-slate-600">Detailed Exam Results</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 bg-white text-slate-900 rounded-full flex items-center justify-center text-2xl font-bold">
                {exam.subject?.[0] ?? "?"}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{exam.subject}</h1>
                <p className="text-slate-300 mb-1">{exam.title}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm bg-white/10 px-3 py-1 rounded-full">{exam.date}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-slate-300 mb-1">Your Score</div>
              <div className="text-5xl font-bold">{exam.score}</div>
              <div className="text-xl text-slate-300">/ {exam.maxScore}</div>
              <div
                className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                  parseFloat(percentage) >= 80 ? "bg-green-500/20 text-green-300" : parseFloat(percentage) >= 60 ? "bg-blue-500/20 text-blue-300" : "bg-yellow-500/20 text-yellow-300"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                {percentage}%
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-300">Grade: {exam.grade}</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Question-wise Performance</h2>

          {Array.isArray(exam.questions) &&
            exam.questions.map((question: any, index: number) => {
              const scorePercentage = (question.scored / question.max) * 100;
              return (
                <Card key={question.id ?? index} className="border-slate-200 shadow-md bg-white">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="flex items-center justify-center h-8 w-8 bg-slate-900 text-white rounded-full text-sm font-bold">{index + 1}</span>
                          <CardTitle className="text-lg text-slate-900">Question {index + 1}</CardTitle>
                        </div>
                        <CardDescription className="text-slate-700 mt-2">{question.question}</CardDescription>
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-slate-900">
                          {question.scored}/{question.max}
                        </div>
                        <div
                          className={`text-sm font-semibold mt-1 ${
                            scorePercentage >= 80 ? "text-green-600" : scorePercentage >= 60 ? "text-blue-600" : scorePercentage >= 40 ? "text-yellow-600" : "text-red-600"
                          }`}
                        >
                          {Number.isFinite(scorePercentage) ? scorePercentage.toFixed(0) : "0"}%
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

                    {question.missed && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Areas for Improvement
                        </h4>
                        <p className="text-sm text-red-800">{question.missed}</p>
                      </div>
                    )}

                    {question.strengths && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          What You Did Well
                        </h4>
                        <p className="text-sm text-green-800">{question.strengths}</p>
                      </div>
                    )}

                    {question.teacherComment && (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-slate-900 rounded-lg text-white">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-2">Teacher's Feedback</h4>
                            <p className="text-sm text-slate-700 italic">"{question.teacherComment}"</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {exam.overallComment && (
          <Card className="mt-8 border-slate-200 shadow-md bg-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-slate-900" />
                <CardTitle className="text-xl text-slate-900">Overall Teacher Feedback</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">{exam.overallComment}</p>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8 border-slate-200 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Recommendations for Improvement</CardTitle>
            <CardDescription>Focus on these areas to boost your performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-slate-700">
              {Array.isArray(exam.recommendations) &&
                exam.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 h-6 w-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ExamDetailsPage;
