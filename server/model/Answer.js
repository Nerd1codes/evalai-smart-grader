// server/model/Answer.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const AnswerSchema = new Schema(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    questionId: {
      type: Schema.Types.ObjectId, // _id of Exam.questions subdocument
      required: true,
    },
    questionNumber: {
      type: Number, // e.g., 31, 32, 33
      required: true,
    },
    answerText: {
      type: String,
      required: true,
    },

    // Marks & feedback (for AI grading)
    maxMarks: {
      type: Number,
      default: 0,
    },
    aiScore: {
      type: Number,
      default: null,
    },
    aiMaxScore: {
      type: Number,
      default: null,
    },
    aiFeedback: {
      type: String,
      default: "",
    },
    teacherScore: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: ["ungraded", "saved", "ai_evaluated", "teacher_reviewed"],
      default: "ungraded",
    },
  },
  {
    timestamps: true,
  }
);

// IMPORTANT: export the actual model, and reuse if already compiled
module.exports =
  mongoose.models.Answer || mongoose.model("Answer", AnswerSchema);
