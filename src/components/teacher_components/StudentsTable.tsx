// // src/components/teacher_components/StudentsTable.tsx

// import { useRef } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Upload,
//   FileText,
//   CheckCircle,
//   Trash2,
//   BookOpen,
// } from "lucide-react";
// import { Student } from "../../types";
// import { calculateGrade, getGradeColor, getInitials } from "../../utils";

// interface StudentsTableProps {
//   students: Student[];
//   selectedSemester: string | null;
//   selectedSection: string | null;
//   editingStudent: number | null;
//   marks: { [key: number]: number };
//   onStudentClick: (student: Student) => void;
//   onEditMarks: (studentId: number, currentMarks: number) => void;
//   onSaveMarks: (studentId: number) => void;
//   onMarksChange: (studentId: number, value: string) => void;
//   onDeleteStudent: (studentId: number) => void;
//   onUploadScript: (studentId: number) => void;
//   onScriptFileSelect: (
//     event: React.ChangeEvent<HTMLInputElement>,
//     studentId: number,
//     studentName: string
//   ) => void;
// }

// export const StudentsTable = ({
//   students,
//   selectedSemester,
//   selectedSection,
//   editingStudent,
//   marks,
//   onStudentClick,
//   onEditMarks,
//   onSaveMarks,
//   onMarksChange,
//   onDeleteStudent,
//   onUploadScript,
//   onScriptFileSelect,
// }: StudentsTableProps) => {
//   const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

//   if (!selectedSemester || !selectedSection) {
//     return (
//       <Card className="border-slate-200 shadow-lg bg-white">
//         <CardContent className="p-12 text-center">
//           <div className="max-w-md mx-auto">
//             <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <BookOpen className="h-10 w-10 text-slate-400" />
//             </div>
//             <h3 className="text-xl font-bold text-slate-900 mb-2">
//               Select Semester and Section
//             </h3>
//             <p className="text-slate-600">
//               Please select a semester and section from the dropdowns above to view and manage
//               student marks
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="border-slate-200 shadow-lg bg-white">
//       <CardHeader>
//         <CardTitle className="text-2xl text-slate-900">
//           Student Marks - {selectedSemester} / {selectedSection}
//         </CardTitle>
//         <CardDescription>
//           Click on a student to view detailed performance analysis. Upload scripts and edit marks
//           here.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-slate-200">
//                 <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">
//                   Student Name
//                 </th>
//                 <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">
//                   Marks
//                 </th>
//                 <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">
//                   Grade
//                 </th>
//                 <th className="text-center py-4 px-4 text-sm font-semibold text-slate-900">
//                   Answer Script
//                 </th>
//                 <th className="text-right py-4 px-4 text-sm font-semibold text-slate-900">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {students.map((student) => {
//                 const currentMarks =
//                   editingStudent === student.id ? marks[student.id] : student.marks;
//                 const grade = calculateGrade(currentMarks);

//                 return (
//                   <tr
//                     key={student.id}
//                     className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
//                   >
//                     <td
//                       className="py-4 px-4 cursor-pointer"
//                       onClick={() => onStudentClick(student)}
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="h-10 w-10 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-semibold">
//                           {getInitials(student.name)}
//                         </div>
//                         <span className="font-medium text-slate-900">{student.name}</span>
//                       </div>
//                     </td>
//                     <td
//                       className="py-4 px-4 cursor-pointer"
//                       onClick={() => onStudentClick(student)}
//                     >
//                       {editingStudent === student.id ? (
//                         <input
//                           type="number"
//                           min="0"
//                           max="100"
//                           value={currentMarks}
//                           onChange={(e) => onMarksChange(student.id, e.target.value)}
//                           onClick={(e) => e.stopPropagation()}
//                           className="w-20 px-3 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
//                         />
//                       ) : (
//                         <span className="text-slate-900 font-semibold">{currentMarks}</span>
//                       )}
//                     </td>
//                     <td
//                       className="py-4 px-4 cursor-pointer"
//                       onClick={() => onStudentClick(student)}
//                     >
//                       <span
//                         className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getGradeColor(
//                           grade
//                         )}`}
//                       >
//                         {grade}
//                       </span>
//                     </td>
//                     <td className="py-4 px-4">
//                       <div className="flex items-center justify-center gap-2">
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             onUploadScript(student.id);
//                           }}
//                           className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
//                           title="Upload Answer Script"
//                         >
//                           <Upload className="h-4 w-4" />
//                         </button>
//                         <a
//                           href={student.scriptUrl}
//                           download
//                           onClick={(e) => e.stopPropagation()}
//                           className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
//                           title="Download Answer Script"
//                         >
//                           <FileText className="h-4 w-4" />
//                         </a>
//                         <input
//                           type="file"
//                           ref={(el) => (fileInputRefs.current[student.id] = el)}
//                           onChange={(e) => onScriptFileSelect(e, student.id, student.name)}
//                           className="hidden"
//                           accept=".pdf"
//                         />
//                       </div>
//                     </td>
//                     <td className="py-4 px-4">
//                       <div className="flex items-center justify-end gap-2">
//                         {editingStudent === student.id ? (
//                           <Button
//                             size="sm"
//                             className="bg-slate-900 text-white hover:bg-slate-800"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               onSaveMarks(student.id);
//                             }}
//                           >
//                             <CheckCircle className="h-4 w-4 mr-1" />
//                             Save
//                           </Button>
//                         ) : (
//                           <>
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               className="text-slate-900 hover:bg-slate-100"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 onEditMarks(student.id, student.marks);
//                               }}
//                             >
//                               Edit
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               className="text-red-600 hover:bg-red-50 hover:text-red-700"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 if (confirm(`Are you sure you want to delete ${student.name}?`)) {
//                                   onDeleteStudent(student.id);
//                                 }
//                               }}
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };









import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  FileText,
  CheckCircle,
  Trash2,
  BookOpen,
  Plus, // 1. Import the Plus icon
} from "lucide-react";

// --- FIX: In-lined dependencies to resolve compilation error ---

// In-lined from ../../types
interface Student {
  id: number;
  name: string;
  marks: number;
  scriptUrl?: string | null;
}

// In-lined from ../../utils
const getInitials = (name: string) => {
  if (!name) return "";
  const names = name.split(" ");
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (
    names[0].charAt(0).toUpperCase() +
    names[names.length - 1].charAt(0).toUpperCase()
  );
};

// In-lined from ../../utils
const calculateGrade = (marks: number) => {
  if (marks >= 90) return "A+";
  if (marks >= 80) return "A";
  if (marks >= 70) return "B";
  if (marks >= 60) return "C";
  if (marks >= 50) return "D";
  return "F";
};

// In-lined from ../../utils
const getGradeColor = (grade: string) => {
  switch (grade) {
    case "A+":
    case "A":
      return "bg-green-100 text-green-800";
    case "B":
      return "bg-blue-100 text-blue-800";
    case "C":
      return "bg-yellow-100 text-yellow-800";
    case "D":
      return "bg-orange-100 text-orange-800";
    case "F":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};
// --- END FIX ---

interface StudentsTableProps {
  students: Student[];
  selectedSemester: string | null;
  selectedSection: string | null;
  editingStudent: number | null;
  marks: { [key: number]: number };
  onStudentClick: (student: Student) => void;
  onEditMarks: (studentId: number, currentMarks: number) => void;
  onSaveMarks: (studentId: number) => void;
  onMarksChange: (studentId: number, value: string) => void;
  onConfirmDelete: (student: Student) => void;
  onUploadScript: (studentId: number) => void;
  onScriptFileSelect: (
    event: React.ChangeEvent<HTMLInputElement>,
    studentId: number,
    studentName: string
  ) => void;
  onAddStudent: () => void;
}

export const StudentsTable = ({
  students,
  selectedSemester,
  selectedSection,
  editingStudent,
  marks,
  onStudentClick,
  onEditMarks,
  onSaveMarks,
  onMarksChange,
  onConfirmDelete,
  onUploadScript,
  onScriptFileSelect,
  onAddStudent,
}: StudentsTableProps) => {
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  if (!selectedSemester || !selectedSection) {
    return (
      <Card className="border-slate-200 shadow-lg bg-white">
        <CardContent className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Select Semester and Section
            </h3>
            <p className="text-slate-600">
              Please select a semester and section from the dropdowns above to
              view and manage student marks
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-lg bg-white">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl text-slate-900">
              Student Marks - {selectedSemester} / {selectedSection}
            </CardTitle>
            <CardDescription className="mt-1">
              Click on a student to view detailed performance analysis. Upload
              scripts and edit marks here.
            </CardDescription>
          </div>
          <Button onClick={onAddStudent}>
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">
                  Student Name
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">
                  Marks
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900">
                  Grade
                </th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-900">
                  Answer Script
                </th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-slate-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const currentMarks =
                  editingStudent === student.id
                    ? marks[student.id]
                    : student.marks;
                const grade = calculateGrade(currentMarks);

                return (
                  <tr
                    key={student.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td
                      className="py-4 px-4 cursor-pointer"
                      onClick={() => onStudentClick(student)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {getInitials(student.name)}
                        </div>
                        <span className="font-medium text-slate-900">
                          {student.name}
                        </span>
                      </div>
                    </td>
                    <td
                      className="py-4 px-4 cursor-pointer"
                      onClick={() => onStudentClick(student)}
                    >
                      {editingStudent === student.id ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={currentMarks}
                          onChange={(e) =>
                            onMarksChange(student.id, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="w-20 px-3 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      ) : (
                        <span className="text-slate-900 font-semibold">
                          {currentMarks}
                        </span>
                      )}
                    </td>
                    <td
                      className="py-4 px-4 cursor-pointer"
                      onClick={() => onStudentClick(student)}
                    >
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getGradeColor(
                          grade
                        )}`}
                      >
                        {grade}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUploadScript(student.id);
                          }}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Upload Answer Script"
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                        <a
                          href={student.scriptUrl}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Download Answer Script"
                        >
                          <FileText className="h-4 w-4" />
                        </a>
                        <input
                          type="file"
                          ref={(el) =>
                            (fileInputRefs.current[student.id] = el)
                          }
                          onChange={(e) =>
                            onScriptFileSelect(e, student.id, student.name)
                          }
                          className="hidden"
                          accept=".pdf"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {editingStudent === student.id ? (
                          <Button
                            size="sm"
                            className="bg-slate-900 text-white hover:bg-slate-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSaveMarks(student.id);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-slate-900 hover:bg-slate-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditMarks(student.id, student.marks);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                onConfirmDelete(student); // Call prop instead of confirm()
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};