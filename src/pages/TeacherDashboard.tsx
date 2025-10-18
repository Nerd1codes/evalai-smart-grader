import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, LogOut, BarChart3, Users, TrendingUp, Clock, CheckCircle, Award } from "lucide-react";

const TeacherDashboard = () => {
  const [userName] = useState("Dr. Smith");

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
                <p className="text-sm text-slate-600">Teacher Dashboard</p>
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
              <Award className="h-5 w-5" />
              <span className="text-sm font-medium text-slate-300">Welcome back</span>
            </div>
            <h2 className="text-4xl font-bold mb-2">{userName}</h2>
            <p className="text-lg text-slate-300">Manage exam evaluations and track student performance with AI-powered tools</p>
          </div>
          
          <div className="absolute right-8 bottom-8 opacity-10">
            <BarChart3 className="h-32 w-32" />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            icon={<FileText className="h-6 w-6" />}
            label="Total Papers"
            value="24"
            trend="+3 this week"
          />
          <StatCard
            icon={<Users className="h-6 w-6" />}
            label="Students"
            value="156"
            trend="Across 6 classes"
          />
          <StatCard
            icon={<CheckCircle className="h-6 w-6" />}
            label="Evaluated"
            value="18"
            trend="6 pending review"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            label="Avg Score"
            value="78%"
            trend="+5% from last month"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <ActionCard
              icon={<Upload className="h-6 w-6" />}
              title="Upload Papers"
              description="Upload exam papers for AI-powered evaluation and instant grading"
              buttonText="Upload New Paper"
              buttonVariant="default"
              isPrimary={true}
            />
            
            <ActionCard
              icon={<FileText className="h-6 w-6" />}
              title="Manage Marks"
              description="Review, edit and finalize student marks before publishing results"
              buttonText="View All Marks"
              buttonVariant="outline"
              isPrimary={false}
            />
            
            <ActionCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Analytics"
              description="View detailed performance statistics and identify learning trends"
              buttonText="View Analytics"
              buttonVariant="outline"
              isPrimary={false}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-lg border-slate-200 mb-8">
          <CardHeader className="border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-slate-900">Recent Activity</CardTitle>
                <CardDescription className="text-slate-600">Your latest evaluations and updates</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <div className="space-y-4">
              <ActivityItem
                title="Physics Exam - Grade 12"
                description="18 papers evaluated automatically"
                time="2 hours ago"
                status="completed"
              />
              <ActivityItem
                title="Chemistry Quiz - Grade 11"
                description="Awaiting review and finalization"
                time="5 hours ago"
                status="pending"
              />
              <ActivityItem
                title="Mathematics Test - Grade 10"
                description="All marks finalized and published"
                time="1 day ago"
                status="published"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="border-slate-200 shadow-lg bg-slate-50">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-slate-700" />
              <CardTitle className="text-xl text-slate-900">Best Practices</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-3">
              <TipItem text="Ensure exam papers are clearly scanned or photographed for optimal OCR accuracy" />
              <TipItem text="Upload reference answer keys to improve evaluation precision" />
              <TipItem text="Review AI-generated marks before finalizing to maintain quality standards" />
              <TipItem text="Utilize analytics dashboards to identify patterns and areas needing attention" />
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: string }) => {
  return (
    <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-slate-900 rounded-lg text-white">
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
        <p className="text-sm font-medium text-slate-900 mb-1">{label}</p>
        <p className="text-xs text-slate-500">{trend}</p>
      </CardContent>
    </Card>
  );
};

const ActionCard = ({ icon, title, description, buttonText, buttonVariant, isPrimary }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonVariant: "default" | "outline";
  isPrimary: boolean;
}) => {
  return (
    <Card className="border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white group">
      <CardHeader className="space-y-4">
        <div className={`inline-flex h-14 w-14 ${isPrimary ? 'bg-slate-900' : 'bg-slate-100'} ${isPrimary ? 'text-white' : 'text-slate-900'} rounded-xl items-center justify-center shadow-md group-hover:scale-110 transition-all duration-300`}>
          {icon}
        </div>
        <div>
          <CardTitle className="text-xl text-slate-900 mb-2">{title}</CardTitle>
          <CardDescription className="text-sm text-slate-600 leading-relaxed">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Button variant={buttonVariant} className="w-full shadow-sm hover:shadow-md transition-all">
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

const ActivityItem = ({ title, description, time, status }: {
  title: string;
  description: string;
  time: string;
  status: "completed" | "pending" | "published";
}) => {
  const statusStyles = {
    completed: "bg-slate-900 text-white",
    pending: "bg-slate-200 text-slate-900",
    published: "bg-slate-100 text-slate-700 border border-slate-300"
  };

  const statusLabels = {
    completed: "Completed",
    pending: "Pending",
    published: "Published"
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
      <div className="flex-shrink-0 h-10 w-10 bg-slate-900 rounded-lg flex items-center justify-center text-white">
        <FileText className="h-5 w-5" />
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${statusStyles[status]}`}>
            {statusLabels[status]}
          </span>
        </div>
        <p className="text-xs text-slate-500">{time}</p>
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

export default TeacherDashboard;