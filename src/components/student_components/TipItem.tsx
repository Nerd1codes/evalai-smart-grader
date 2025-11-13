// src/components/student_components/TipItem.tsx
import React from "react";
import { CheckCircle } from "lucide-react";

export const TipItem: React.FC<{ text: string }> = ({ text }) => {
  return (
    <li className="flex items-start gap-3">
      <div className="flex-shrink-0 h-5 w-5 bg-slate-900 rounded-full flex items-center justify-center mt-0.5">
        <CheckCircle className="h-3 w-3 text-white" />
      </div>
      <span className="text-sm text-slate-700 leading-relaxed">{text}</span>
    </li>
  );
};

export default TipItem;
