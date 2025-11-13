// src/components/student_components/StatCard.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; description: string }> = ({ icon, label, value, description }) => {
  return (
    <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-slate-900 rounded-lg text-white">{icon}</div>
        </div>
        <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
        <p className="text-4xl font-bold text-slate-900 mb-2">{value}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
};

export default StatCard;
