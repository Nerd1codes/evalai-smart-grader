import { Button } from "@/components/ui/button";
import { GraduationCap, Upload, BarChart3, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[image:linear-gradient(135deg,hsl(0,0%,4%)_0%,hsl(0,0%,12%)_100%)]" />
        <div className="relative container mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Shield className="h-4 w-4 text-white" />
              <span className="text-sm text-white">AI-Powered Exam Evaluation</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              EvalAI
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/90 mb-12 leading-relaxed">
              Professional exam evaluation platform powered by artificial intelligence.
              <br />
              Streamline grading, save time, ensure accuracy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/teacher">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="group text-base px-8 h-12"
                >
                  Teacher Login
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/auth/student">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="group text-base px-8 h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                >
                  Student Login
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built for Excellence</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed for modern educational assessment
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Upload className="h-8 w-8" />}
              title="Smart Upload"
              description="Upload exam papers and let AI handle the evaluation process with precision and speed."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Real-time Analytics"
              description="Track student performance with comprehensive analytics and detailed insights."
            />
            <FeatureCard
              icon={<GraduationCap className="h-8 w-8" />}
              title="Student Portal"
              description="Students access their results instantly with transparent grading breakdowns."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary to-accent text-white rounded-2xl p-12 shadow-2xl">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Transform Your Evaluation Process?
            </h2>
            <p className="text-lg mb-8 text-white/90">
              Join educators who are already saving hours with EvalAI
            </p>
            <Link to="/auth/teacher">
              <Button size="lg" variant="secondary" className="text-base px-8 h-12">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="group p-8 bg-card rounded-xl border transition-all duration-300 hover:shadow-xl hover:scale-105">
      <div className="mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

export default Index;
