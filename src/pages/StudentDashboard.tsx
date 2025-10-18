import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Award, TrendingUp, BookOpen, Target, Clock, CheckCircle, FileText } from "lucide-react";

const StudentDashboard = () => {
  const [userName] = useState("Alex Johnson");

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
              <Button variant="outline" className="hover:bg-slate-100 transition-colors">
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
            value="12"
            description="Evaluated exams"
          />
          <StatCard
            icon={<Target className="h-6 w-6" />}
            label="Average Score"
            value="82%"
            description="Overall performance"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            label="Latest Grade"
            value="A-"
            description="Physics Exam"
          />
        </div>

        {/* Recent Exams */}
        <Card className="shadow-lg border-slate-200 mb-8">
          <CardHeader className="border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-slate-900">Recent Exam Results</CardTitle>
                <CardDescription className="text-slate-600">Your latest evaluated exams and detailed scores</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <div className="space-y-4">
              <ExamResultItem
                subject="Physics"
                title="Final Exam - Semester 1"
                score="85"
                maxScore="100"
                grade="A-"
                date="2 days ago"
                status="graded"
              />
              <ExamResultItem
                subject="Chemistry"
                title="Mid-term Assessment"
                score="78"
                maxScore="100"
                grade="B+"
                date="1 week ago"
                status="graded"
              />
              <ExamResultItem
                subject="Mathematics"
                title="Chapter 5 Test"
                score="92"
                maxScore="100"
                grade="A"
                date="2 weeks ago"
                status="graded"
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-slate-700" />
                <CardTitle className="text-xl text-slate-900">Performance Trends</CardTitle>
              </div>
              <CardDescription className="text-slate-600">Your academic progress over time</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <TrendItem
                  subject="Physics"
                  change="+8%"
                  isPositive={true}
                />
                <TrendItem
                  subject="Chemistry"
                  change="+3%"
                  isPositive={true}
                />
                <TrendItem
                  subject="Mathematics"
                  change="-2%"
                  isPositive={false}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-slate-200">
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-slate-700" />
                <CardTitle className="text-xl text-slate-900">Achievements</CardTitle>
              </div>
              <CardDescription className="text-slate-600">Your academic milestones</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <AchievementItem
                  title="Top Performer"
                  description="Scored above 90% in Mathematics"
                />
                <AchievementItem
                  title="Consistent Progress"
                  description="Improved scores in last 3 exams"
                />
                <AchievementItem
                  title="Subject Expert"
                  description="Maintained A grade in Physics"
                />
              </div>
            </CardContent>
          </Card>
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
              <TipItem text="Review your exam feedback carefully to understand areas for improvement" />
              <TipItem text="Track your performance trends to identify subjects that need more attention" />
              <TipItem text="Set realistic goals based on your current performance metrics" />
              <TipItem text="Contact your teachers if you have questions about your evaluation" />
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

const ExamResultItem = ({ subject, title, score, maxScore, grade, date, status }: {
  subject: string;
  title: string;
  score: string;
  maxScore: string;
  grade: string;
  date: string;
  status: string;
}) => {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
      <div className="flex-shrink-0 h-12 w-12 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">
        {subject[0]}
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-start justify-between gap-4 mb-1">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-slate-900">{subject}</h4>
            <p className="text-sm text-slate-600">{title}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-slate-900">{grade}</div>
            <div className="text-xs text-slate-500">{score}/{maxScore}</div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-500">{date}</span>
          <span className="text-xs px-3 py-1 rounded-full font-medium bg-slate-900 text-white">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

const TrendItem = ({ subject, change, isPositive }: {
  subject: string;
  change: string;
  isPositive: boolean;
}) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-slate-700" />
        </div>
        <span className="font-medium text-slate-900">{subject}</span>
      </div>
      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
        isPositive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
      }`}>
        <TrendingUp className={`h-4 w-4 ${!isPositive && 'rotate-180'}`} />
        {change}
      </div>
    </div>
  );
};

const AchievementItem = ({ title, description }: {
  title: string;
  description: string;
}) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
      <div className="flex-shrink-0 h-10 w-10 bg-slate-900 rounded-lg flex items-center justify-center">
        <Award className="h-5 w-5 text-white" />
      </div>
      <div>
        <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
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