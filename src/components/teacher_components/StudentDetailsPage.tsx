// src/components/teacher_components/StudentDetailsPage.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import type { Student } from "../../types";

export const StudentDetailsPage: React.FC<{ student: Student; onBack: () => void }> = ({ student, onBack }) => {
  return (
    <div className="container mx-auto px-6 py-8">
      <Button onClick={onBack} variant="outline">
        Back
      </Button>
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold">{student.name}</h2>
        <p className="text-slate-600">Marks: {student.marks}</p>
        <p className="mt-4">Here you can show detailed analytics, past attempts, OCR-ed answers and feedback components.</p>
      </div>
    </div>
  );
};
