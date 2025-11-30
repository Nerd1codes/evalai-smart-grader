// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const studentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   usn: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// // hash password before save
// studentSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// export default mongoose.model("Student", studentSchema);


// server/model/Student.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    usn: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // 🔥 Needed so examRoutes can do Student.updateOne({ _id }, { marks: totalScore })
    marks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Hash password before save
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Create / reuse model
const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);

// ✅ Support both require() and import default
module.exports = Student;
module.exports.default = Student;
