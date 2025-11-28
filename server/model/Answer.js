// models/Answer.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const AnswerSchema = new Schema(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
      // you can add ref: 'Student' if you have a Student model
    },
    questionId: {
      type: Schema.Types.ObjectId, // _id of Exam.questions subdocument
      required: true,
    },
    questionNumber: {
      type: Number, // e.g., 4.1, 4.2
      required: true,
    },
    answerText: {
      type: String,
      required: true,
    },

    // Marks & feedback (for AI grading later)
    maxMarks: {
      type: Number,
      default: 0,
    },
    aiScore: {
      type: Number,
      default: null,
    },
    aiFeedback: {
      type: String,
      default: '',
    },
    teacherScore: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: ['ungraded', 'graded', 'reviewed'],
      default: 'ungraded',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Answer', AnswerSchema);
