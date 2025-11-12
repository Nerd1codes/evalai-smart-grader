// src/utils.ts

import { Semesters } from "./types";

export const getInitialSemesters = (): Semesters => ({
  "Semester 1": {
    sections: {
      "Section A": [
        { id: 1, name: "John Doe", marks: 85, scriptUrl: "#" },
        { id: 2, name: "Jane Smith", marks: 92, scriptUrl: "#" },
        { id: 3, name: "Mike Johnson", marks: 78, scriptUrl: "#" },
        { id: 4, name: "Sarah Williams", marks: 88, scriptUrl: "#" },
      ],
      "Section B": [
        { id: 5, name: "Tom Brown", marks: 76, scriptUrl: "#" },
        { id: 6, name: "Emily Davis", marks: 91, scriptUrl: "#" },
        { id: 7, name: "Chris Wilson", marks: 83, scriptUrl: "#" },
      ],
    },
  },
  "Semester 2": {
    sections: {
      "Section A": [
        { id: 8, name: "Alex Martinez", marks: 89, scriptUrl: "#" },
        { id: 9, name: "Lisa Anderson", marks: 94, scriptUrl: "#" },
        { id: 10, name: "David Taylor", marks: 81, scriptUrl: "#" },
      ],
      "Section B": [
        { id: 11, name: "Nina Patel", marks: 87, scriptUrl: "#" },
        { id: 12, name: "Ryan Lee", marks: 79, scriptUrl: "#" },
      ],
    },
  },
});

export const calculateGrade = (marks: number): string => {
  if (marks >= 90) return "A+";
  if (marks >= 80) return "A";
  if (marks >= 70) return "B";
  if (marks >= 60) return "C";
  return "D";
};

export const getGradeColor = (grade: string): string => {
  if (grade === "A+" || grade === "A") {
    return "bg-green-100 text-green-800";
  }
  if (grade === "B") {
    return "bg-blue-100 text-blue-800";
  }
  if (grade === "C") {
    return "bg-yellow-100 text-yellow-800";
  }
  return "bg-red-100 text-red-800";
};

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
};

export const clampMarks = (value: number): number => {
  return Math.min(100, Math.max(0, value));
};