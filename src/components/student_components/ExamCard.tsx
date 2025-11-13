// src/components/student_components/ExamCard.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const ExamCard: React.FC<{ exam: any; onClick: (exam: any) => void }> = ({ exam, onClick }) => {
  return (
    <Card
      className="shadow-lg border-slate-200 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1 duration-300"
      onClick={() => onClick(exam)}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 h-16 w-16 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
            {exam.subject?.[0] ?? "?"}
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xl text-slate-900">{exam.subject}</h4>
                <p className="text-sm text-slate-600 truncate">{exam.title}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-3xl font-bold text-slate-900">{exam.grade}</div>
                <div className="text-sm text-slate-600">
                  {exam.score}/{exam.maxScore}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-500">{exam.date}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-slate-900 text-white">
                  {String(exam.status ?? "unknown").charAt(0).toUpperCase() + String(exam.status ?? "unknown").slice(1)}
                </span>
                <span className="text-xs text-slate-500">Click to view details →</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamCard;
