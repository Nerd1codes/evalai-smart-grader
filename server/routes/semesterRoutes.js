import express from "express";
import {
  getSemesters,
  addSemester,
  addSection,
  addStudent,
  updateStudentMarks,
  deleteStudent,
  addPaper,
  deletePaper,
} from "../controller/semesterController.js";
// import { verifyToken } from "../middleware/verifyToken.js"; // Protect routes

const router = express.Router();

// All routes are protected by default (uncomment verifyToken)
// router.use(verifyToken);

// Semester routes
router.get("/", getSemesters);
router.post("/", addSemester);

// Section routes
router.post("/:semId/sections", addSection);

// Student routes
router.post("/:semId/sections/:secId/students", addStudent);
router.put("/:semId/sections/:secId/students/:studentId", updateStudentMarks);
router.delete("/:semId/sections/:secId/students/:studentId", deleteStudent);

// Paper routes
router.post("/:semId/sections/:secId/papers", addPaper);
router.delete("/:semId/sections/:secId/papers/:paperId", deletePaper);

export default router;