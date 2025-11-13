// // model/Semester.js
// import mongoose from "mongoose";

// const PaperSchema = new mongoose.Schema({
//   name: String,
//   subject: String,
//   ocrStatus: { type: String, default: "processing" },
//   ocrText: String,
//   pages: Number,
//   createdAt: { type: Date, default: Date.now },
// });

// const StudentRefSchema = new mongoose.Schema({
//   name: String,
//   usn: String,
//   email: String,
//   // optional: reference to Student collection
//   studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: false },
// });

// const SectionSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   students: [StudentRefSchema],
//   papers: [PaperSchema],
// });

// const SemesterSchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true },
//   sections: [SectionSchema],
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.model("Semester", SemesterSchema);






import mongoose from "mongoose";

const PaperSchema = new mongoose.Schema({
  name: String,
  subject: String,
  ocrStatus: { type: String, default: "processing" },
  ocrText: String,
  pages: Number,
  createdAt: { type: Date, default: Date.now },
});

// ✅ UPDATED: This schema now includes the fields
// our controllers and frontend components need.
const StudentRefSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Use 'rollNumber' to match the frontend form and dashboard
  rollNumber: { type: String, required: true }, 
  // Add 'marks' and 'scriptUrl' to store student data
  marks: { type: Number, default: 0 },
  scriptUrl: { type: String, default: null },
  // 'email' is optional as per your schema
  email: String, 
  // 'studentId' is optional as per your schema
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: false },
});

const SectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  students: [StudentRefSchema], // This now uses the updated StudentRefSchema
  papers: [PaperSchema],
});

const SemesterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  sections: [SectionSchema],
  createdAt: { type: Date, default: Date.now },
  // Add a reference to the teacher who owns this semester
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    // required: true, // Uncomment once auth is fully integrated
  },
});

// Use "Semester" as the model name
const Semester = mongoose.model("Semester", SemesterSchema);
export default Semester;