// models/Exam.js (UPDATED)

const mongoose = require('mongoose');

// 🎯 New Sub-Schema for Questions
const QuestionSchema = new mongoose.Schema({
    // MongoDB generates an _id for this sub-document, which will serve as the questionId
    questionNumber: {
        type: Number, // e.g., 1, 2, 2.1 (Note: the original comment said "Q1", "Q2a", which is inconsistent with 'type: Number'. I've kept 'type: Number' as specified in your schema.)
        required: true,
        trim: true
    },
    text: {
        type: String,
        required: true
    },
    maxMarks: {
        type: Number,
        default: 0
    }
}, { _id: true }); // Ensure _id is generated for sub-documents

const ExamSchema = new mongoose.Schema({
    // MongoDB's default _id will serve as the examId

    // References to your academic structure
    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    
    // Core Exam data
    subject: {
        type: String,
        required: true,
        trim: true
    },

    // The entire OCR result is stored here
    rawQuestionPaperText: {
        type: String,
        required: true
    },

    // 🎯 Use the QuestionSchema array
    questions: {
        type: [QuestionSchema], 
        default: []
    }
}, {
    timestamps: true 
});

// Export the model
module.exports = mongoose.model('Exam', ExamSchema);