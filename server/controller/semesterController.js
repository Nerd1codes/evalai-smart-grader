// controllers/semesterController.js
import Semester from "../model/Semester.js";

// GET all semesters (with sections)
export const getSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find({});
    res.json(semesters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/semesters  { name }
export const addSemester = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });

    const exists = await Semester.findOne({ name });
    if (exists) return res.status(400).json({ message: "Semester already exists" });

    const newSem = await Semester.create({ name, sections: [] });
    res.status(201).json(newSem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/semesters/:semId
export const deleteSemester = async (req, res) => {
  try {
    const { semId } = req.params;
    const deleted = await Semester.findByIdAndDelete(semId);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted", semId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/semesters/:semId/sections { name }
export const addSection = async (req, res) => {
  try {
    const { semId } = req.params;
    const { name } = req.body;
    const sem = await Semester.findById(semId);
    if (!sem) return res.status(404).json({ message: "Semester not found" });

    if (sem.sections.some((s) => s.name === name))
      return res.status(400).json({ message: "Section exists" });

    sem.sections.push({ name, students: [], papers: [] });
    await sem.save();
    res.status(201).json(sem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/semesters/:semId/sections/:sectionId
export const deleteSection = async (req, res) => {
  try {
    const { semId, sectionId } = req.params;
    const sem = await Semester.findById(semId);
    if (!sem) return res.status(404).json({ message: "Semester not found" });
    sem.sections.id(sectionId)?.remove();
    await sem.save();
    res.json({ message: "Section deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST add student: /api/semesters/:semId/sections/:sectionId/students { name, usn, email, studentId? }
export const addStudentToSection = async (req, res) => {
  try {
    const { semId, sectionId } = req.params;
    const { name, usn, email, studentId } = req.body;
    const sem = await Semester.findById(semId);
    if (!sem) return res.status(404).json({ message: "Semester not found" });

    const section = sem.sections.id(sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    section.students.push({ name, usn, email, studentId });
    await sem.save();
    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE student: /api/semesters/:semId/sections/:sectionId/students/:studentId
export const deleteStudentFromSection = async (req, res) => {
  try {
    const { semId, sectionId, studentId } = req.params;
    const sem = await Semester.findById(semId);
    if (!sem) return res.status(404).json({ message: "Semester not found" });
    const section = sem.sections.id(sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    const studentDoc = section.students.id(studentId);
    if (!studentDoc) return res.status(404).json({ message: "Student not found" });

    studentDoc.remove();
    await sem.save();
    res.json({ message: "Student removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST paper: /api/semesters/:semId/sections/:sectionId/papers  (or /api/papers)
export const addPaperToSection = async (req, res) => {
  try {
    const { semId, sectionId } = req.params;
    const { name, subject, ocrStatus = "processing" } = req.body;
    const sem = await Semester.findById(semId);
    if (!sem) return res.status(404).json({ message: "Semester not found" });
    const section = sem.sections.id(sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });
    const paper = { name, subject, ocrStatus };
    section.papers.push(paper);
    await sem.save();
    // return last pushed paper
    res.status(201).json(section.papers[section.papers.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE paper: /api/semesters/:semId/sections/:sectionId/papers/:paperId
export const deletePaperFromSection = async (req, res) => {
  try {
    const { semId, sectionId, paperId } = req.params;
    const sem = await Semester.findById(semId);
    if (!sem) return res.status(404).json({ message: "Semester not found" });
    const section = sem.sections.id(sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    const paper = section.papers.id(paperId);
    if (!paper) return res.status(404).json({ message: "Paper not found" });

    paper.remove();
    await sem.save();
    res.json({ message: "Paper deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
