// model/Semester.js
import mongoose from "mongoose";

const PaperSchema = new mongoose.Schema({
  name: String,
  subject: String,
  ocrStatus: { type: String, default: "processing" },
  ocrText: String,
  pages: Number,
  createdAt: { type: Date, default: Date.now },
});

const StudentRefSchema = new mongoose.Schema({
  name: String,
  usn: String,
  email: String,
  // optional: reference to Student collection
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: false },
});

const SectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  students: [StudentRefSchema],
  papers: [PaperSchema],
});

const SemesterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  sections: [SectionSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Semester", SemesterSchema);
