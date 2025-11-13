import Semester from "../model/Semester.js";
import mongoose from "mongoose";

// --- Semester/Section Handlers ---

export const getSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find();
    res.status(200).json(semesters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addSemester = async (req, res) => {
  try {
    const { name } = req.body;
    const newSemester = await Semester.create({
      name,
      sections: [],
    });
    res.status(201).json(newSemester);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addSection = async (req, res) => {
  try {
    const { semId } = req.params;
    const { name } = req.body;

    const newSection = {
      _id: new mongoose.Types.ObjectId(),
      name,
      students: [],
      papers: [],
    };

    // Use atomic $push to add a section
    const updatedSemester = await Semester.findByIdAndUpdate(
      semId,
      { $push: { sections: newSection } },
      { new: true }
    );

    if (!updatedSemester)
      return res.status(404).json({ message: "Semester not found" });

    res.status(201).json(updatedSemester);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Student Handlers ---

// ✅ FIX: Use atomic $push. This won't validate other students.
export const addStudent = async (req, res) => {
  try {
    const { semId, secId } = req.params;
    const { name, rollNumber, marks } = req.body;

    const newStudent = {
      _id: new mongoose.Types.ObjectId(),
      name,
      rollNumber,
      marks,
    };

    // Use atomic $push to add a student to the correct section
    const updatedSemester = await Semester.findOneAndUpdate(
      { "_id": semId, "sections._id": new mongoose.Types.ObjectId(secId) },
      { $push: { "sections.$.students": newStudent } },
      { new: true }
    );

    if (!updatedSemester)
      return res.status(404).json({ message: "Semester/Section not found" });

    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ FIX: Use atomic $set. This won't validate other students.
export const updateStudentMarks = async (req, res) => {
  try {
    const { semId, secId, studentId } = req.params;
    const { marks } = req.body;

    const updatedSemester = await Semester.findOneAndUpdate(
      { "_id": semId, "sections.students._id": studentId },
      {
        $set: { "sections.$[sec].students.$[stu].marks": marks },
      },
      {
        arrayFilters: [
          { "sec._id": new mongoose.Types.ObjectId(secId) },
          { "stu._id": new mongoose.Types.ObjectId(studentId) },
        ],
        new: true,
      }
    );

    if (!updatedSemester) {
      return res.status(404).json({ message: "Student or Semester not found" });
    }

    const section = updatedSemester.sections.id(secId);
    const student = section.students.id(studentId);

    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ FIX: Use atomic $pull. This won't validate other students.
export const deleteStudent = async (req, res) => {
  try {
    const { semId, secId, studentId } = req.params;

    const updatedSemester = await Semester.findOneAndUpdate(
      { "_id": semId, "sections._id": new mongoose.Types.ObjectId(secId) },
      {
        $pull: { "sections.$.students": { _id: new mongoose.Types.ObjectId(studentId) } },
      },
      { new: true }
    );

    if (!updatedSemester)
      return res.status(404).json({ message: "Semester/Section not found" });

    res.status(200).json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Paper Handlers (Also made atomic) ---

export const addPaper = async (req, res) => {
  try {
    const { semId, secId } = req.params;
    const paperData = req.body;

    const newPaper = {
      ...paperData,
      _id: new mongoose.Types.ObjectId(),
    };

    const updatedSemester = await Semester.findOneAndUpdate(
      { "_id": semId, "sections._id": new mongoose.Types.ObjectId(secId) },
      { $push: { "sections.$.papers": newPaper } },
      { new: true }
    );

    if (!updatedSemester)
      return res.status(404).json({ message: "Semester/Section not found" });

    res.status(201).json(newPaper);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deletePaper = async (req, res) => {
  try {
    const { semId, secId, paperId } = req.params;

    const updatedSemester = await Semester.findOneAndUpdate(
      { "_id": semId, "sections._id": new mongoose.Types.ObjectId(secId) },
      {
        $pull: { "sections.$.papers": { _id: new mongoose.Types.ObjectId(paperId) } },
      },
      { new: true }
    );

    if (!updatedSemester)
      return res.status(404).json({ message: "Semester/Section not found" });

    res.status(200).json({ message: "Paper deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};