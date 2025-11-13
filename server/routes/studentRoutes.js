import express from "express";
import { verifyToken } from "../middleware/verifyToken.js"; // Assuming you have auth

const router = express.Router();

// Mock database (replace with Mongoose models)
let studentsDB = [
  {
    id: 1,
    name: "Alice Smith",
    rollNumber: "S01",
    marks: 88,
    scriptUrl: null,
    semesterId: "sem1",
    sectionId: "secA",
  },
  {
    id: 2,
    name: "Bob Johnson",
    rollNumber: "S02",
    marks: 92,
    scriptUrl: null,
    semesterId: "sem1",
    sectionId: "secA",
  },
];
let nextStudentId = 3;

// GET /api/students?semesterId=...&sectionId=...
router.get("/", verifyToken, (req, res) => {
  const { semesterId, sectionId } = req.query;
  if (!semesterId || !sectionId) {
    return res.status(400).json({ message: "Semester and Section are required" });
  }
  const students = studentsDB.filter(
    (s) => s.semesterId === semesterId && s.sectionId === sectionId
  );
  res.json(students);
});

// POST /api/students
router.post("/", verifyToken, (req, res) => {
  const { name, rollNumber, marks, semesterId, sectionId } = req.body;
  const newStudent = {
    id: nextStudentId++,
    name,
    rollNumber,
    marks,
    semesterId,
    sectionId,
    scriptUrl: null,
  };
  studentsDB.push(newStudent);
  res.status(201).json(newStudent);
});

// PUT /api/students/:id/marks
router.put("/:id/marks", verifyToken, (req, res) => {
  const { marks } = req.body;
  const studentId = parseInt(req.params.id, 10);
  const student = studentsDB.find((s) => s.id === studentId);

  if (student) {
    student.marks = marks;
    res.json(student);
  } else {
    res.status(404).json({ message: "Student not found" });
  }
});

// DELETE /api/students/:id
router.delete("/:id", verifyToken, (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  studentsDB = studentsDB.filter((s) => s.id !== studentId);
  res.status(200).json({ message: "Student deleted" });
});

// POST /api/students/:id/upload-script
// You would use 'multer' here for a real file upload
router.post("/:id/upload-script", verifyToken, (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  const student = studentsDB.find((s) => s.id === studentId);
  
  // This is a mock. In reality, 'multer' would process the file
  // and you'd save it to a cloud storage (like S3) or a local folder.
  const mockFileUrl = `/uploads/script_${studentId}_${Date.now()}.pdf`;
  
  if (student) {
    student.scriptUrl = mockFileUrl;
    res.json({ scriptUrl: mockFileUrl });
  } else {
    res.status(404).json({ message: "Student not found" });
  }
});

export default router;