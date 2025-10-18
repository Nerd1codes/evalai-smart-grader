import { Button } from "@/components/ui/button";
import { GraduationCap, Upload, BarChart3, Shield, ArrowRight, Sparkles, CheckCircle, Zap, Brain, FileText, ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative container mx-auto px-6 py-32 lg:py-40">
          <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg animate-fade-in">
              <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
              <span className="text-sm font-medium text-white">AI-Powered Exam Evaluation</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-bold text-white mb-8 tracking-tight">
              <span className="inline-block hover:scale-105 transition-transform duration-300">Eval</span>
              <span className="inline-block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">AI</span>
            </h1>
            
            <p className="text-xl lg:text-3xl text-white/90 mb-6 leading-relaxed font-light">
              Transform handwritten answers into instant grades
            </p>
            
            <p className="text-lg lg:text-xl text-white/70 mb-12 leading-relaxed max-w-3xl mx-auto">
              Advanced OCR and NLP technology evaluates descriptive answers with semantic understanding,
              providing consistent, objective grading in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/auth/teacher">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="group text-lg px-10 h-14 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  Teacher Login
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/auth/student">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="group text-lg px-10 h-14 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  Student Login
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-8 border-t border-white/20">
              <StatCard number="10x" label="Faster Grading" />
              <StatCard number="99%" label="Accuracy" />
              <StatCard number="24/7" label="Available" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Intelligent evaluation powered by cutting-edge AI technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <ProcessCard
              icon={<Upload className="h-8 w-8" />}
              step="1"
              title="Upload"
              description="Submit handwritten answer sheets"
            />
            <ProcessCard
              icon={<FileText className="h-8 w-8" />}
              step="2"
              title="Extract"
              description="Tesseract OCR converts handwriting to text"
            />
            <ProcessCard
              icon={<Brain className="h-8 w-8" />}
              step="3"
              title="Analyze"
              description="Sentence-BERT compares semantic similarity"
            />
            <ProcessCard
              icon={<CheckCircle className="h-8 w-8" />}
              step="4"
              title="Grade"
              description="Instant marks with detailed feedback"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for modern educational assessment
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Brain className="h-10 w-10" />}
              title="Semantic Understanding"
              description="Advanced NLP evaluates meaning, not just keywords. Understands context and concepts for accurate grading."
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10" />}
              title="Lightning Fast"
              description="Grade entire classes in minutes. What used to take hours now happens in seconds with consistent quality."
            />
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10" />}
              title="Deep Analytics"
              description="Track performance trends, identify learning gaps, and generate comprehensive reports automatically."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10" />}
              title="Objective Grading"
              description="Eliminate bias with consistent evaluation criteria. Every student gets fair, standardized assessment."
            />
            <FeatureCard
              icon={<ImageIcon className="h-10 w-10" />}
              title="Diagram Evaluation"
              description="New: AI evaluates student-drawn diagrams by comparing structure and accuracy against reference images."
            />
            <FeatureCard
              icon={<GraduationCap className="h-10 w-10" />}
              title="Student Portal"
              description="Instant access to results with transparent breakdowns. Students see exactly where they earned marks."
            />
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24 bg-gradient-to-b from-background to-slate-950">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold mb-4 text-white">Built with Advanced AI</h2>
              <p className="text-xl text-white/70">
                Combining the best of computer vision and natural language processing
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <TechCard
                title="Tesseract OCR"
                description="Industry-leading optical character recognition converts handwritten text with high accuracy"
              />
              <TechCard
                title="Sentence-BERT"
                description="State-of-the-art transformer model creates semantic embeddings for intelligent comparison"
              />
              <TechCard
                title="Image Embeddings"
                description="Deep learning evaluates diagram structure and similarity for comprehensive visual assessment"
              />
              <TechCard
                title="Similarity Scoring"
                description="Multi-dimensional analysis ensures nuanced understanding of student responses"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary via-accent to-primary text-white rounded-3xl p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="relative">
              <Sparkles className="h-12 w-12 mx-auto mb-6 animate-pulse" />
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Ready to Transform Your Evaluation Process?
              </h2>
              <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
                Join forward-thinking educators who are saving hours every week while improving grading consistency and student feedback.
              </p>
              <Link to="/auth/teacher">
                <Button size="lg" variant="secondary" className="text-lg px-12 h-16 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ number, label }: { number: string; label: string }) => {
  return (
    <div className="text-center group cursor-default">
      <div className="text-4xl lg:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
        {number}
      </div>
      <div className="text-sm lg:text-base text-white/70">{label}</div>
    </div>
  );
};

const ProcessCard = ({ icon, step, title, description }: { icon: React.ReactNode; step: string; title: string; description: string }) => {
  return (
    <div className="relative group">
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
        {step}
      </div>
      <div className="p-8 bg-card rounded-2xl border h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 pt-10">
        <div className="mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="group p-10 bg-card rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50">
      <div className="mb-6 text-primary group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

const TechCard = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-white/70 leading-relaxed">{description}</p>
    </div>
  );
};

export default Index;