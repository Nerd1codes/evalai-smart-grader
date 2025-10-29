import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LogOut, 
  Award, 
  TrendingUp, 
  BookOpen, 
  Target, 
  FileText,
  ArrowLeft,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  ChevronDown
} from "lucide-react";

// Exam Details Page Component
const ExamDetailsPage = ({ 
  exam, 
  onBack 
}: { 
  exam: any;
  onBack: () => void;
}) => {
  const percentage = ((exam.score / exam.maxScore) * 100).toFixed(1);

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
            <div className="text-sm text-slate-600">Detailed Exam Results</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Exam Info Header */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 bg-white text-slate-900 rounded-full flex items-center justify-center text-2xl font-bold">
                {exam.subject[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{exam.subject}</h1>
                <p className="text-slate-300 mb-1">{exam.title}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm bg-white/10 px-3 py-1 rounded-full">
                    {exam.date}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-300 mb-1">Your Score</div>
              <div className="text-5xl font-bold">{exam.score}</div>
              <div className="text-xl text-slate-300">/ {exam.maxScore}</div>
              <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                parseFloat(percentage) >= 80 ? "bg-green-500/20 text-green-300" : 
                parseFloat(percentage) >= 60 ? "bg-blue-500/20 text-blue-300" : 
                "bg-yellow-500/20 text-yellow-300"
              }`}>
                <TrendingUp className="h-4 w-4" />
                {percentage}%
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-300">
                Grade: {exam.grade}
              </div>
            </div>
          </div>
        </div>

        {/* Question-wise Breakdown */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Question-wise Performance</h2>
          
          {exam.questions.map((question: any, index: number) => {
            const scorePercentage = (question.scored / question.max) * 100;
            
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
                      <div className="text-2xl font-bold text-slate-900">
                        {question.scored}/{question.max}
                      </div>
                      <div className={`text-sm font-semibold mt-1 ${
                        scorePercentage >= 80 ? "text-green-600" : 
                        scorePercentage >= 60 ? "text-blue-600" : 
                        scorePercentage >= 40 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {scorePercentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* AI Feedback */}
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

                  {/* What you missed */}
                  {question.missed && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Areas for Improvement
                      </h4>
                      <p className="text-sm text-red-800">{question.missed}</p>
                    </div>
                  )}

                  {/* Your Strengths */}
                  {question.strengths && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        What You Did Well
                      </h4>
                      <p className="text-sm text-green-800">{question.strengths}</p>
                    </div>
                  )}

                  {/* Teacher's Comment */}
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

        {/* Overall Teacher Comment */}
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

        {/* Recommendations */}
        <Card className="mt-8 border-slate-200 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Recommendations for Improvement</CardTitle>
            <CardDescription>Focus on these areas to boost your performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-slate-700">
              {exam.recommendations.map((rec: string, idx: number) => (
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

// Main Student Dashboard Component
const StudentDashboard = () => {
  const [userName] = useState("Alex Johnson");
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

  // Sample exam data with detailed breakdowns
  const examsData = [
    {
      id: 1,
      subject: "Physics",
      title: "Final Exam - Semester 1",
      score: 85,
      maxScore: 100,
      grade: "A-",
      date: "2 days ago",
      status: "graded",
      overallComment: "Excellent work overall! You demonstrated strong understanding of core concepts. Focus on improving problem-solving speed in complex numerical questions.",
      questions: [
        {
          id: 1,
          question: "Explain Newton's Second Law and derive the equation F = ma",
          scored: 8,
          max: 10,
          aiAnalysis: "Strong theoretical understanding demonstrated with clear derivation steps.",
          missed: "Minor notation inconsistency in the final equation representation.",
          strengths: "Excellent explanation of the law with real-world examples.",
          teacherComment: "Great work! Just ensure consistent notation throughout your derivations."
        },
        {
          id: 2,
          question: "Calculate the velocity of a projectile at maximum height",
          scored: 15,
          max: 15,
          aiAnalysis: "Perfect solution with proper methodology and correct final answer.",
          missed: null,
          strengths: "Excellent use of kinematic equations and clear step-by-step solution.",
          teacherComment: "Outstanding! Your approach was very methodical."
        },
        {
          id: 3,
          question: "Solve the circuit problem involving Ohm's Law",
          scored: 12,
          max: 20,
          aiAnalysis: "Correct approach but calculation errors affected the final answer.",
          missed: "Incorrect calculation of total resistance in the parallel circuit section.",
          strengths: "Good understanding of circuit analysis principles.",
          teacherComment: "Review parallel resistance formulas. Your concept is clear but practice more calculations."
        }
      ],
      recommendations: [
        "Practice more complex circuit problems with both series and parallel combinations",
        "Work on calculation speed and accuracy under timed conditions",
        "Review notation standards for physics equations",
        "Excellent grasp of theoretical concepts - maintain this standard"
      ]
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
      overallComment: "Good understanding of chemical reactions. Need more practice with organic chemistry nomenclature and balancing complex equations.",
      questions: [
        {
          id: 1,
          question: "Balance the redox equation and identify oxidizing agent",
          scored: 14,
          max: 15,
          aiAnalysis: "Correct balancing with proper identification of redox species.",
          missed: "Did not explicitly state the oxidation states in the explanation.",
          strengths: "Excellent systematic approach to balancing redox reactions.",
          teacherComment: "Very good! Remember to always show oxidation states clearly."
        },
        {
          id: 2,
          question: "Name the organic compound and draw its structure",
          scored: 10,
          max: 20,
          aiAnalysis: "Partial credit for structural drawing, but nomenclature had errors.",
          missed: "IUPAC naming convention not followed correctly for the branched structure.",
          strengths: "Good attempt at drawing the molecular structure.",
          teacherComment: "Practice IUPAC naming rules more thoroughly, especially for branched compounds."
        }
      ],
      recommendations: [
        "Focus on IUPAC nomenclature for organic compounds",
        "Practice drawing complex organic structures",
        "Always show oxidation states in redox reactions",
        "Good foundation in inorganic chemistry - keep it up!"
      ]
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
          teacherComment: "Perfect answer! Your work is very clean and organized."
        },
        {
          id: 2,
          question: "Find the area between two curves",
          scored: 18,
          max: 20,
          aiAnalysis: "Correct setup and methodology with a minor calculation error.",
          missed: "Small arithmetic mistake in the final evaluation step.",
          strengths: "Excellent graphical understanding and proper integral setup.",
          teacherComment: "Almost perfect! Just double-check your final calculations."
        }
      ],
      recommendations: [
        "Continue your excellent work in calculus",
        "Review arithmetic carefully in final steps to avoid small errors",
        "Your conceptual understanding is outstanding - maintain this level"
      ]
    }
  ];

  const subjects = ["All Subjects", "Physics", "Chemistry", "Mathematics"];

  const filteredExams = selectedSubject === "All Subjects" 
    ? examsData 
    : examsData.filter(exam => exam.subject === selectedSubject);

  const handleExamClick = (exam: any) => {
    setSelectedExam(exam);
  };

  const totalExams = examsData.length;
  const averageScore = (examsData.reduce((acc, exam) => acc + (exam.score / exam.maxScore) * 100, 0) / totalExams).toFixed(1);
  const latestExam = examsData[0];

  // If an exam is selected, show the details page
  if (selectedExam) {
    return (
      <ExamDetailsPage 
        exam={selectedExam} 
        onBack={() => setSelectedExam(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-md">
                E
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">EvalAI</h1>
                <p className="text-sm text-slate-600">Student Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
                <div className="h-8 w-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {userName[0]}
                </div>
                <span className="text-sm font-medium text-slate-900">{userName}</span>
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

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-slate-900 p-10 text-white shadow-xl border border-slate-800">
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-medium text-slate-300">Your Academic Journey</span>
            </div>
            <h2 className="text-4xl font-bold mb-2">Welcome, {userName}</h2>
            <p className="text-lg text-slate-300">Track your exam results and monitor your academic progress</p>
          </div>
          
          <div className="absolute right-8 bottom-8 opacity-10">
            <Award className="h-32 w-32" />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <StatCard
            icon={<FileText className="h-6 w-6" />}
            label="Total Exams"
            value={totalExams.toString()}
            description="Evaluated exams"
          />
          <StatCard
            icon={<Target className="h-6 w-6" />}
            label="Average Score"
            value={`${averageScore}%`}
            description="Overall performance"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            label="Latest Grade"
            value={latestExam.grade}
            description={latestExam.subject}
          />
        </div>

        {/* Subject Filter */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-900">Your Exam Results</h3>
          <div className="relative">
            <button
              onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-900 font-medium"
            >
              {selectedSubject}
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {isSubjectDropdownOpen && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => {
                      setSelectedSubject(subject);
                      setIsSubjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      selectedSubject === subject ? "bg-slate-900 text-white hover:bg-slate-800" : "text-slate-900"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Exam Cards */}
        <div className="space-y-4 mb-8">
          {filteredExams.map((exam) => (
            <Card 
              key={exam.id} 
              className="shadow-lg border-slate-200 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1 duration-300"
              onClick={() => handleExamClick(exam)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 h-16 w-16 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                    {exam.subject[0]}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xl text-slate-900">{exam.subject}</h4>
                        <p className="text-sm text-slate-600">{exam.title}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-3xl font-bold text-slate-900">{exam.grade}</div>
                        <div className="text-sm text-slate-600">{exam.score}/{exam.maxScore}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-slate-500">{exam.date}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-3 py-1 rounded-full font-medium bg-slate-900 text-white">
                          {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                        </span>
                        <span className="text-xs text-slate-500">Click to view details →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Study Tips */}
        <Card className="border-slate-200 shadow-lg bg-slate-50">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-slate-700" />
              <CardTitle className="text-xl text-slate-900">Study Tips</CardTitle>
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

const StatCard = ({ icon, label, value, description }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  description: string;
}) => {
  return (
    <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-slate-900 rounded-lg text-white">
            {icon}
          </div>
        </div>
        <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
        <p className="text-4xl font-bold text-slate-900 mb-2">{value}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
};

const TipItem = ({ text }: { text: string }) => {
  return (
    <li className="flex items-start gap-3">
      <div className="flex-shrink-0 h-5 w-5 bg-slate-900 rounded-full flex items-center justify-center mt-0.5">
        <CheckCircle className="h-3 w-3 text-white" />
      </div>
      <span className="text-sm text-slate-700 leading-relaxed">{text}</span>
    </li>
  );
};

export default StudentDashboard;