// src/components/teacher_components/Header.tsx

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface HeaderProps {
  userName: string;
}

export const Header = ({ userName }: HeaderProps) => {
  return (
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
  );
};