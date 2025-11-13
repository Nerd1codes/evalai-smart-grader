// routes/semesterRoutes.js
import express from "express";
import * as ctrl from "../controller/semesterController.js";

const router = express.Router();

router.get("/", ctrl.getSemesters);
router.post("/", ctrl.addSemester);
router.delete("/:semId", ctrl.deleteSemester);

router.post("/:semId/sections", ctrl.addSection);
router.delete("/:semId/sections/:sectionId", ctrl.deleteSection);

router.post("/:semId/sections/:sectionId/students", ctrl.addStudentToSection);
router.delete("/:semId/sections/:sectionId/students/:studentId", ctrl.deleteStudentFromSection);

router.post("/:semId/sections/:sectionId/papers", ctrl.addPaperToSection);
router.delete("/:semId/sections/:sectionId/papers/:paperId", ctrl.deletePaperFromSection);

export default router;
