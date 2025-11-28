// 
// src/components/student_components/StudentDashboard.tsx
import React, { useState } from "react";
// Lucide Icons
import { BookOpen, Award, FileText, Target, TrendingUp, ChevronDown, LogOut, CheckCircle } from "lucide-react";

// UI Components (Assuming "@/components/ui" is the correct alias)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Custom Student Components (Corrected relative paths from pages/ to components/student_components/)
import StatCard from "../components/student_components/StatCard";
import TipItem from "../components/student_components/TipItem";
import ExamCard from "../components/student_components/ExamCard";
import ExamDetailsPage from "../components/student_components/ExamDetailsPage";

// Sample Data Structure
const sampleExams = [
  {
    id: 1,
    subject: "Physics",
    title: "Final Exam - Semester 1",
    score: 85,
    maxScore: 100,
    grade: "A-",
    date: "2 days ago",
    status: "graded",
    overallComment:
      "Excellent work overall! You demonstrated strong understanding of core concepts. Focus on improving problem-solving speed in complex numerical questions.",
    questions: [
      {
        id: 1,
        question: "Explain Newton's Second Law and derive the equation F = ma",
        scored: 8,
        max: 10,
        aiAnalysis: "Strong theoretical understanding demonstrated with clear derivation steps.",
        missed: "Minor notation inconsistency in the final equation representation.",
        strengths: "Excellent explanation of the law with real-world examples.",
        teacherComment: "Great work! Just ensure consistent notation throughout your derivations.",
      },
      {
        id: 2,
        question: "Calculate the velocity of a projectile at maximum height",
        scored: 15,
        max: 15,
        aiAnalysis: "Perfect solution with proper methodology and correct final answer.",
        missed: null,
        strengths: "Excellent use of kinematic equations and clear step-by-step solution.",
        teacherComment: "Outstanding! Your approach was very methodical.",
      },
      {
        id: 3,
        question: "Solve the circuit problem involving Ohm's Law",
        scored: 12,
        max: 20,
        aiAnalysis: "Correct approach but calculation errors affected the final answer.",
        missed: "Incorrect calculation of total resistance in the parallel circuit section.",
        strengths: "Good understanding of circuit analysis principles.",
        teacherComment: "Review parallel resistance formulas. Your concept is clear but practice more calculations.",
      },
    ],
    recommendations: [
      "Practice more complex circuit problems with both series and parallel combinations",
      "Work on calculation speed and accuracy under timed conditions",
      "Review notation standards for physics equations",
      "Excellent grasp of theoretical concepts - maintain this standard",
    ],
  },
  {
    id: 2,
    subject: "Chemistry",
    title: "Mid-term Assessment",
    score: 78,
    maxScore: 100,
    grade: "B+",
    date: "1 week ago",
    status: "graded",
    overallComment:
      "Good understanding of chemical reactions. Need more practice with organic chemistry nomenclature and balancing complex equations.",
    questions: [
      {
        id: 1,
        question: "Balance the redox equation and identify oxidizing agent",
        scored: 14,
        max: 15,
        aiAnalysis: "Correct balancing with proper identification of redox species.",
        missed: "Did not explicitly state the oxidation states in the explanation.",
        strengths: "Excellent systematic approach to balancing redox reactions.",
        teacherComment: "Very good! Remember to always show oxidation states clearly.",
      },
      {
        id: 2,
        question: "Name the organic compound and draw its structure",
        scored: 10,
        max: 20,
        aiAnalysis: "Partial credit for structural drawing, but nomenclature had errors.",
        missed: "IUPAC naming convention not followed correctly for the branched structure.",
        strengths: "Good attempt at drawing the molecular structure.",
        teacherComment: "Practice IUPAC naming rules more thoroughly, especially for branched compounds.",
      },
    ],
    recommendations: [
      "Focus on IUPAC nomenclature for organic compounds",
      "Practice drawing complex organic structures",
      "Always show oxidation states in redox reactions",
      "Good foundation in inorganic chemistry - keep it up!",
    ],
  },
  {
    id: 3,
    subject: "Mathematics",
    title: "Chapter 5 Test",
    score: 92,
    maxScore: 100,
    grade: "A",
    date: "2 weeks ago",
    status: "graded",
    overallComment: "Exceptional performance! Your problem-solving skills are excellent. Minor errors in one integration problem.",
    questions: [
      {
        id: 1,
        question: "Solve the differential equation dy/dx = 2x + 3",
        scored: 20,
        max: 20,
        aiAnalysis: "Perfect solution with correct integration and constant handling.",
        missed: null,
        strengths: "Excellent understanding of integration techniques and proper notation.",
        teacherComment: "Perfect answer! Your work is very clean and organized.",
      },
      {
        id: 2,
        question: "Find the area between two curves",
        scored: 18,
        max: 20,
        aiAnalysis: "Correct setup and methodology with a minor calculation error.",
        missed: "Small arithmetic mistake in the final evaluation step.",
        strengths: "Excellent graphical understanding and proper integral setup.",
        teacherComment: "Almost perfect! Just double-check your final calculations.",
      },
    ],
    recommendations: ["Continue your excellent work in calculus", "Review arithmetic carefully in final steps to avoid small errors", "Your conceptual understanding is outstanding - maintain this level"],
  },
];

const subjectsList = ["All Subjects", "Physics", "Chemistry", "Mathematics"];

const StudentDashboard: React.FC = () => {
  const [userName] = useState("Alex Johnson");
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

  const examsData = sampleExams;
  const subjects = subjectsList;

  const filteredExams = selectedSubject === "All Subjects" ? examsData : examsData.filter((exam) => exam.subject === selectedSubject);
  const handleExamClick = (exam: any) => setSelectedExam(exam);
  const totalExams = examsData.length;
  // Calculate average score as a percentage of max score, then average the percentages
  const averageScore = (examsData.reduce((acc, exam) => acc + (exam.score / exam.maxScore) * 100, 0) / totalExams).toFixed(1);
  const latestExam = examsData[0];

  if (selectedExam) return <ExamDetailsPage exam={selectedExam} onBack={() => setSelectedExam(null)} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-md">E</div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">EvalAI</h1>
                <p className="text-sm text-slate-600">Student Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
                <div className="h-8 w-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-semibold">{userName[0]}</div>
                <span className="text-sm font-medium text-slate-900">{userName}</span>
              </div>
              <Button variant="outline" className="hover:bg-slate-100 transition-colors" onClick={() => { /* Logout logic here */ }}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Hero Section / Welcome Banner */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-slate-900 p-10 text-white shadow-xl border border-slate-800">
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-slate-300" />
              <span className="text-sm font-medium text-slate-300">Your Academic Journey</span>
            </div>
            <h2 className="text-4xl font-bold mb-2">Welcome, {userName}</h2>
            <p className="text-lg text-slate-300">Track your exam results and monitor your academic progress</p>
          </div>
          <div className="absolute right-8 bottom-8 opacity-10">
            <Award className="h-32 w-32 text-slate-600" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={<FileText className="h-6 w-6 text-indigo-500" />} label="Total Exams" value={totalExams.toString()} description="Evaluated exams" />
          <StatCard icon={<Target className="h-6 w-6 text-green-500" />} label="Average Score" value={`${averageScore}%`} description="Overall performance" />
          <StatCard icon={<TrendingUp className="h-6 w-6 text-yellow-500" />} label="Latest Grade" value={latestExam.grade} description={latestExam.subject} />
        </div>

        {/* Results Header and Filter */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-900">Your Exam Results</h3>
          <div className="relative">
            <button 
              onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)} 
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-900 font-medium shadow-sm"
              aria-expanded={isSubjectDropdownOpen}
            >
              {selectedSubject}
              <ChevronDown className={`h-4 w-4 transition-transform ${isSubjectDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>

            {isSubjectDropdownOpen && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-10 overflow-hidden">
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => {
                      setSelectedSubject(subject);
                      setIsSubjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${selectedSubject === subject 
                      ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                      : "text-slate-700 hover:bg-slate-100"}`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Exam List */}
        <div className="space-y-4 mb-8">
          {filteredExams.length > 0 ? (
            filteredExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} onClick={handleExamClick} />
            ))
          ) : (
            <div className="text-center py-10 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
              No exams found for {selectedSubject}.
            </div>
          )}
        </div>

        {/* Study Tips Card */}
        <Card className="border-slate-200 shadow-lg bg-white">
          <CardHeader className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-xl text-slate-900 font-semibold">Study Tips & Next Steps</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-3">
              <TipItem text="Click on any exam card to view detailed question-wise feedback" />
              <TipItem text="Review teacher comments carefully to understand how to improve" />
              <TipItem text="Focus on questions where you scored below 60% for maximum improvement" />
              <TipItem text="Use the AI analysis to identify patterns in your mistakes" />
              <TipItem text="Track your performance trends across different subjects" />
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StudentDashboard;

// ---------------------------
// DUMMY COMPONENTS FOR SINGLE FILE COMPILATION
// ---------------------------

// ExamCard.tsx
const GradeDisplay = ({ grade }) => {
  let color = 'bg-gray-500';
  if (grade.startsWith('A')) color = 'bg-green-600';
  else if (grade.startsWith('B')) color = 'bg-blue-600';
  else if (grade.startsWith('C')) color = 'bg-yellow-600';
  else if (grade.startsWith('D')) color = 'bg-orange-600';
  
  return (
    <div className={`px-3 py-1 text-sm font-bold text-white rounded-full shadow-md ${color}`}>
      {grade}
    </div>
  );
}

const ExamCard = ({ exam, onClick }) => (
  <Card 
    className="hover:shadow-xl transition-shadow duration-300 cursor-pointer border-slate-200"
    onClick={() => onClick(exam)}
  >
    <CardContent className="p-5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xl font-bold">
          {exam.subject[0]}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-800">{exam.title}</p>
          <p className="text-sm text-slate-500">{exam.subject} - Graded {exam.date}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xl font-bold text-slate-900">{exam.score}/{exam.maxScore}</p>
          <p className="text-xs text-slate-500">Score</p>
        </div>
        <GradeDisplay grade={exam.grade} />
        <ChevronDown className="h-5 w-5 text-slate-400 transform -rotate-90"/>
      </div>
    </CardContent>
  </Card>
);

// StatCard.tsx
const StatCard = ({ icon, label, value, description }) => (
  <Card className="shadow-md border-slate-200">
    <CardHeader className="p-5 flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-600">
        {label}
      </CardTitle>
      <div className="text-slate-500">{icon}</div>
    </CardHeader>
    <CardContent className="px-5 pb-5">
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <p className="text-xs text-slate-500 pt-1">{description}</p>
    </CardContent>
  </Card>
);

// TipItem.tsx
const TipItem = ({ text }) => (
  <li className="flex items-start gap-3">
    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-indigo-500" />
    <span className="text-slate-700 text-base">{text}</span>
  </li>
);

// ExamDetailsPage.tsx
const QuestionAnalysis = ({ questionData }) => (
  <Card className="border-l-4 border-indigo-500 bg-indigo-50 shadow-sm transition-all duration-300 hover:shadow-md">
    <CardHeader className="p-4 sm:p-6 pb-2">
      <CardTitle className="text-lg font-semibold text-indigo-900">
        Question {questionData.id}: {questionData.question}
      </CardTitle>
      <div className="text-sm font-medium text-indigo-700">
        Score: {questionData.scored}/{questionData.max}
      </div>
    </CardHeader>
    <CardContent className="p-4 sm:p-6 pt-2 space-y-4">
      
      {/* AI Analysis */}
      <div className="border-t pt-4 border-indigo-200">
        <p className="text-sm font-semibold text-slate-700 mb-1">AI Analysis:</p>
        <p className="text-sm text-slate-600 italic">"{questionData.aiAnalysis}"</p>
      </div>

      {/* Strengths */}
      <div className="bg-green-100 p-3 rounded-lg">
        <p className="text-sm font-semibold text-green-800">Strengths:</p>
        <p className="text-sm text-green-700">{questionData.strengths}</p>
      </div>
      
      {/* Missed/Errors */}
      {questionData.missed && (
        <div className="bg-red-100 p-3 rounded-lg">
          <p className="text-sm font-semibold text-red-800">Area for Review:</p>
          <p className="text-sm text-red-700">{questionData.missed}</p>
        </div>
      )}

      {/* Teacher Comment */}
      <div className="border-t pt-4 border-indigo-200">
        <p className="text-sm font-semibold text-slate-700 mb-1">Teacher Feedback:</p>
        <p className="text-sm text-slate-900 font-medium">"{questionData.teacherComment}"</p>
      </div>
    </CardContent>
  </Card>
);

const ExamDetailsPage = ({ exam, onBack }) => {
  // Score percentage
  const scorePercentage = ((exam.score / exam.maxScore) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <Button variant="outline" onClick={onBack} className="hover:bg-slate-100 transition-colors">
            <ChevronDown className="h-4 w-4 mr-2 transform rotate-90" /> Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Exam Summary Header */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">{exam.title}</h1>
          <h2 className="text-xl font-semibold text-indigo-600 mb-4">{exam.subject}</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-700">{exam.grade}</p>
              <p className="text-xs text-indigo-500">Final Grade</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-700">{exam.score}/{exam.maxScore}</p>
              <p className="text-xs text-indigo-500">Total Score</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-700">{scorePercentage}%</p>
              <p className="text-xs text-indigo-500">Percentage</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-700">{exam.status.toUpperCase()}</p>
              <p className="text-xs text-indigo-500">Status</p>
            </div>
          </div>
        </div>
        
        {/* Overall Feedback */}
        <Card className="mb-8 shadow-md border-green-500 border-l-4">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" /> Overall Teacher Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-base text-slate-700 italic">"{exam.overallComment}"</p>
          </CardContent>
        </Card>

        {/* Question-by-Question Analysis */}
        <h3 className="text-2xl font-bold text-slate-900 mb-4 border-b pb-2">Question Analysis</h3>
        <div className="space-y-6">
          {exam.questions.map((q) => (
            <QuestionAnalysis key={q.id} questionData={q} />
          ))}
        </div>

        {/* Recommendations */}
        <Card className="mt-8 shadow-md border-yellow-500 border-l-4">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-yellow-600" /> Improvement Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <ul className="list-disc pl-5 space-y-2 text-base text-slate-700">
              {exam.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
      </main>
    </div>
  );
};