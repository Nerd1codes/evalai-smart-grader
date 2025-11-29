import { useState, useEffect } from "react";
// FIX: Using relative path for use-toast
import { useToast } from "../components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  // FIX: Using relative path for select
} from "../components/ui/select";
// FIX: Using relative paths for teacher components
import { StudentsTable } from "../components/teacher_components/StudentsTable";
import { AddStudentDialog } from "../components/teacher_components/AddStudentDialog";
import { DeleteConfirmDialog } from "../components/teacher_components/DeleteConfirmDialog";
// FIX: Using relative path for types
import { Student, Semester, Section } from "../types";

// Mock API URL. Replace with your actual backend URL.
const API_URL = "/api"; // Assuming a proxy is set up, e.g., http://localhost:5000/api

export function StudentsPage() {
  const { toast } = useToast();

  // Data state
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Selection state
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Inline editing state
  const [editingStudent, setEditingStudent] = useState<number | null>(null);
  const [marks, setMarks] = useState<{ [key: number]: number }>({});

  // --- Data Fetching ---

  // Fetch semesters on mount
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        // MOCK DATA - Replace with fetch
        // const response = await fetch(`${API_URL}/semesters`);
        // const data = await response.json();
        const mockData = [
          { id: "sem1", name: "Semester 1" },
          { id: "sem2", name: "Semester 2" },
        ];
        setSemesters(mockData);
      } catch (error) {
        toast({ title: "Error fetching semesters", variant: "destructive" });
      }
    };
    fetchSemesters();
  }, [toast]);

  // Fetch sections when semester changes
  const handleSemesterChange = async (semesterId: string) => {
    setSelectedSemester(semesterId);
    setSelectedSection(null);
    setStudents([]);
    try {
      // MOCK DATA - Replace with fetch
      // const response = await fetch(`${API_URL}/semesters/${semesterId}/sections`);
      // const data = await response.json();
      const mockData =
        semesterId === "sem1"
          ? [
              { id: "secA", name: "Section A" },
              { id: "secB", name: "Section B" },
            ]
          : [{ id: "secC", name: "Section C" }];
      setSections(mockData);
    } catch (error) {
      toast({ title: "Error fetching sections", variant: "destructive" });
    }
  };

  // Fetch students when section changes
  const handleSectionChange = async (sectionId: string) => {
    setSelectedSection(sectionId);
    setIsLoading(true);
    try {
      // MOCK DATA - Replace with fetch
      // const response = await fetch(`${API_URL}/students?semesterId=${selectedSemester}&sectionId=${sectionId}`);
      // const data = await response.json();
      const mockData = [
        { id: 1, name: "Alice Smith", marks: 88, scriptUrl: null },
        { id: 2, name: "Bob Johnson", marks: 92, scriptUrl: null },
      ];
      setStudents(mockData);
    } catch (error) {
      toast({ title: "Error fetching students", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Student Actions ---

  const handleAddStudent = async (formData: {
    name: string;
    rollNumber: string;
  }) => {
    if (!selectedSemester || !selectedSection) return;

    try {
      const response = await fetch(`${API_URL}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          semesterId: selectedSemester,
          sectionId: selectedSection,
          marks: 0, // Default value
        }),
      });
      if (!response.ok) throw new Error("Failed to add student");
      const newStudent = await response.json();

      setStudents((prev) => [...prev, newStudent]);
      toast({ title: "Student added successfully" });
      setIsAddModalOpen(false); // Close modal on success
      return true;
    } catch (error: any) {
      toast({
        title: "Error adding student",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const handleSaveMarks = async (studentId: number) => {
    const newMarks = marks[studentId];
    try {
      const response = await fetch(`${API_URL}/students/${studentId}/marks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marks: newMarks }),
      });
      if (!response.ok) throw new Error("Failed to update marks");

      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, marks: newMarks } : s))
      );
      setEditingStudent(null);
      toast({ title: "Marks saved!" });
    } catch (error: any) {
      toast({
        title: "Error saving marks",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/students/${studentToDelete.id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete student");

      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      toast({ title: "Student deleted" });
    } catch (error: any) {
      toast({
        title: "Error deleting student",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setStudentToDelete(null); // Close modal
    }
  };

  // --- Other Handlers (passed to table) ---

  const handleEditMarks = (studentId: number, currentMarks: number) => {
    setEditingStudent(studentId);
    setMarks((prev) => ({ ...prev, [studentId]: currentMarks }));
  };

  const onMarksChange = (studentId: number, value: string) => {
    setMarks((prev) => ({ ...prev, [studentId]: Number(value) }));
  };

  const onStudentClick = (student: Student) => {
    console.log("View details for:", student.name);
    // You could navigate to a details page here
    // navigate(`/teacher/student/${student.id}`);
  };

  const onConfirmDelete = (student: Student) => {
    setStudentToDelete(student);
  };

  const onScriptFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    studentId: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("script", file);

    try {
      const response = await fetch(
        `${API_URL}/students/${studentId}/upload-script`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) throw new Error("Upload failed");
      const { scriptUrl } = await response.json();

      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, scriptUrl } : s))
      );
      toast({ title: "Script uploaded!" });
    } catch (error: any) {
      toast({
        title: "Error uploading script",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const onUploadScript = (studentId: number) => {
    // This is handled by the table component's internal fileInputRefs
    // But the upload logic is in `onScriptFileSelect`
    console.log("Upload triggered for", studentId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>

      {/* --- Selectors --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select onValueChange={handleSemesterChange} value={selectedSemester ?? undefined}>
          <SelectTrigger>
            <SelectValue placeholder="Select Semester" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((sem) => (
              <SelectItem key={sem.id} value={sem.id}>
                {sem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={handleSectionChange}
          value={selectedSection ?? undefined}
          disabled={!selectedSemester}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Section" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((sec) => (
              <SelectItem key={sec.id} value={sec.id}>
                {sec.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* --- Students Table --- */}
      <StudentsTable
        students={students}
        selectedSemester={selectedSemester}
        selectedSection={selectedSection}
        editingStudent={editingStudent}
        marks={marks}
        onStudentClick={onStudentClick}
        onEditMarks={handleEditMarks}
        onSaveMarks={handleSaveMarks}
        onMarksChange={onMarksChange}
        onConfirmDelete={onConfirmDelete}
        onUploadScript={onUploadScript}
        onScriptFileSelect={onScriptFileSelect}
        onAddStudent={() => setIsAddModalOpen(true)} // This triggers the modal
      />

      {/* --- Modals --- */}
      <AddStudentDialog
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddStudent}
      />

      <DeleteConfirmDialog
        open={!!studentToDelete}
        onOpenChange={() => setStudentToDelete(null)}
        onConfirm={handleDeleteStudent}
        studentName={studentToDelete?.name || ""}
      />
    </div>
  );
}