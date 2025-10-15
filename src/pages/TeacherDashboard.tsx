import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, LogOut, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TeacherDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth/teacher");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth/teacher");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold">
              E
            </div>
            <div>
              <h1 className="text-xl font-bold">EvalAI</h1>
              <p className="text-sm text-muted-foreground">Teacher Dashboard</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {user.user_metadata?.name || "Teacher"}</h2>
          <p className="text-muted-foreground">Manage your exam evaluations and student records</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-3">
                <Upload className="h-6 w-6" />
              </div>
              <CardTitle>Upload Papers</CardTitle>
              <CardDescription>Upload exam papers for AI evaluation</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload New Paper
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-3">
                <FileText className="h-6 w-6" />
              </div>
              <CardTitle>Manage Marks</CardTitle>
              <CardDescription>Edit and review student marks</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                View All Marks
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-3">
                <BarChart3 className="h-6 w-6" />
              </div>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View performance statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest evaluations and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              No recent activity. Upload your first exam paper to get started.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TeacherDashboard;
