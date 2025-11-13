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
//   Plus,
// } from "lucide-react";
// import { Student } from "@/types";
// import { calculateGrade, getGradeColor, getInitials } from "@/utils";

// interface StudentsTableProps {
//   students: Student[];
//   selectedSemester: string | null;
//   selectedSection: string | null;
//   // ✅ FIX: studentId is a string
//   editingStudent: string | null;
//   marks: { [key: string]: number };
//   onStudentClick: (student: Student) => void;
//   // ✅ FIX: studentId is a string
//   onEditMarks: (studentId: string, currentMarks: number) => void;
//   // ✅ FIX: studentId is a string
//   onSaveMarks: (studentId: string) => void;
//   // ✅ FIX: studentId is a string
//   onMarksChange: (studentId: string, value: string) => void;
//   onConfirmDelete: (student: Student) => void;
//   // ✅ FIX: studentId is a string
//   onUploadScript: (studentId: string) => void;
//   onScriptFileSelect: (
//     event: React.ChangeEvent<HTMLInputElement>,
//     // ✅ FIX: studentId is a string
//     studentId: string,
//     studentName: string
//   ) => void;
//   onAddStudent: () => void;
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
//   onConfirmDelete,
//   onUploadScript,
//   onScriptFileSelect,
//   onAddStudent,
// }: StudentsTableProps) => {
//   // ✅ FIX: The key for refs is a string
//   const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

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
//               Please select a semester and section from the dropdowns above to
//               view and manage student marks
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="border-slate-200 shadow-lg bg-white">
//       <CardHeader>
//         <div className="flex justify-between items-start">
//           <div>
//             <CardTitle className="text-2xl text-slate-900">
//               Student Marks - {selectedSemester} / {selectedSection}
//             </CardTitle>
//             <CardDescription className="mt-1">
//               Click on a student to view detailed performance analysis. Upload
//               scripts and edit marks here.
//             </CardDescription>
//           </div>
//           <Button onClick={onAddStudent}>
//             <Plus className="mr-2 h-4 w-4" /> Add Student
//           </Button>
//         </div>
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
//                 // student.id is now a string, so this all works
//                 const currentMarks =
//                   editingStudent === student.id
//                     ? marks[student.id]
//                     : student.marks;
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
//                         <span className="font-medium text-slate-900">
//                           {student.name}
//                         </span>
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
//                           onChange={(e) =>
//                             onMarksChange(student.id, e.target.value)
//                           }
//                           onClick={(e) => e.stopPropagation()}
//                           className="w-20 px-3 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
//                         />
//                       ) : (
//                         <span className="text-slate-900 font-semibold">
//                           {currentMarks}
//                         </span>
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
//                             fileInputRefs.current[student.id]?.click();
//                           }}
//                           className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
//                           title="Upload Answer Script"
//                         >
//                           <Upload className="h-4 w-4" />
//                         </button>
//                         <a
//                           href={student.scriptUrl || "#"}
//                           download
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           onClick={(e) => {
//                             if (!student.scriptUrl) e.preventDefault();
//                             e.stopPropagation();
//                           }}
//                           className={`p-2 rounded-md transition-colors ${
//                             student.scriptUrl
//                               ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
//                               : "text-slate-300 cursor-not-allowed"
//                           }`}
//                           title={
//                             student.scriptUrl
//                               ? "Download Answer Script"
//                               : "No script uploaded"
//                           }
//                         >
//                           <FileText className="h-4 w-4" />
//                         </a>
//                         <input
//                           type="file"
//                           ref={(el) =>
//                             (fileInputRefs.current[student.id] = el)
//                           }
//                           onChange={(e) =>
//                             onScriptFileSelect(e, student.id, student.name)
//                           }
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
//                                 onConfirmDelete(student);
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
  Plus,
} from "lucide-react";
import { Student } from "@/types";
import { calculateGrade, getGradeColor, getInitials } from "@/utils";

interface StudentsTableProps {
  students: Student[];
  selectedSemester: string | null;
  selectedSection: string | null;
  editingStudent: string | null;
  marks: { [key: string]: number };
  onStudentClick: (student: Student) => void;
  onEditMarks: (studentId: string, currentMarks: number) => void;
  onSaveMarks: (studentId: string) => void;
  onMarksChange: (studentId: string, value: string) => void;
  onConfirmDelete: (student: Student) => void;
  onUploadScript: (studentId: string) => void;
  onScriptFileSelect: (
    event: React.ChangeEvent<HTMLInputElement>,
    studentId: string,
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
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

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
                // ✅ FIX: This ensures `currentMarks` is never undefined
                // It falls back to the student's original marks if the
                // 'marks' state prop isn't updated yet.
                const currentMarks =
                  editingStudent === student.id
                    ? marks[student.id] ?? student.marks
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
                          // ✅ FIX: Use the calculated currentMarks
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
D                    >
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
                            fileInputRefs.current[student.id]?.click();
                          }}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Upload Answer Script"
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                        <a
                          href={student.scriptUrl || "#"}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (!student.scriptUrl) e.preventDefault();
                            e.stopPropagation();
                          }}
                          className={`p-2 rounded-md transition-colors ${
                            student.scriptUrl
                              ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              : "text-slate-300 cursor-not-allowed"
                          }`}
                          title={
                            student.scriptUrl
                              ? "Download Answer Script"
                              : "No script uploaded"
                          }
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
                                // Pass the *current* marks to edit
                                onEditMarks(student.id, currentMarks);
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
                                onConfirmDelete(student);
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