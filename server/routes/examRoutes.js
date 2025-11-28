const express = require('express');
const router = express.Router();
const Exam = require('../model/Exam'); 
const Answer = require('../model/Answer');
// POST /api/exams/create
router.post('/create', async (req, res) => {
  const { 
    semesterId, 
    sectionId, 
    subject, 
    rawQuestionPaperText 
  } = req.body;

  if (!semesterId || !sectionId || !subject || !rawQuestionPaperText) {
    return res.status(400).json({ 
      message: 'Missing required fields: semesterId, sectionId, subject, or rawQuestionPaperText.' 
    });
  }

  try {
    const newExam = new Exam({
      semesterId,
      sectionId,
      subject,
      rawQuestionPaperText
    });

    const savedExam = await newExam.save();

    res.status(201).json({ 
      message: 'Exam record created successfully.',
      examId: savedExam._id, 
      rawQuestionPaperText: savedExam.rawQuestionPaperText
    });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ 
      message: 'Failed to create exam record.', 
      error: error.message 
    });
  }
});

// ============================================================================
// ANSWERS API
// ============================================================================
// POST /api/exams/:examId/students/:studentId/answers
// Body: { answers: [{ questionId, answerText }] }
// This will create or update answers for that student for this exam.
// ============================================================================

router.post('/:examId/students/:studentId/answers', async (req, res) => {
  const { examId, studentId } = req.params;
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({
      message: 'Missing or empty answers array.',
    });
  }

  try {
    // 1. Load the exam to validate questionIds and get questionNumber/maxMarks
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: `Exam with ID ${examId} not found.` });
    }

    const savedAnswers = [];

    for (const ans of answers) {
      const { questionId, answerText } = ans;

      if (!questionId || !answerText) {
        // Skip bad entries instead of failing whole request
        console.warn('Skipping invalid answer payload:', ans);
        continue;
      }

      // 2. Find the question subdocument in Exam
      const questionSubdoc = exam.questions.id(questionId);
      if (!questionSubdoc) {
        console.warn(`Question with ID ${questionId} not found in exam ${examId}. Skipping.`);
        continue;
      }

      const questionNumber = questionSubdoc.questionNumber;
      const maxMarks = questionSubdoc.maxMarks ?? 0;

      // 3. Upsert the Answer (one per exam+student+question)
      const saved = await Answer.findOneAndUpdate(
        {
          examId,
          studentId,
          questionId,
        },
        {
          examId,
          studentId,
          questionId,
          questionNumber,
          answerText,
          maxMarks,
          // When teacher re-uploads, we keep previous scores unless you want to reset
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      savedAnswers.push(saved);
    }

    return res.status(200).json({
      message: 'Answers saved successfully.',
      answers: savedAnswers,
    });
  } catch (error) {
    console.error('Error saving student answers:', error);
    return res.status(500).json({
      message: 'Failed to save student answers.',
      error: error.message,
    });
  }
});


// ============================================================================
// GET /api/exams/:examId/students/:studentId/answers
// Returns answers + question text (joined from Exam.questions)
// ============================================================================

router.get('/:examId/students/:studentId/answers', async (req, res) => {
  const { examId, studentId } = req.params;

  try {
    // 1. Load exam (for question text)
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: `Exam with ID ${examId} not found.` });
    }

    // 2. Load answers for this exam+student
    const answers = await Answer.find({ examId, studentId }).sort({ questionNumber: 1 });

    // 3. Join question text from Exam.questions
    const questionsById = {};
    exam.questions.forEach((q) => {
      questionsById[q._id.toString()] = q;
    });

    const hydrated = answers.map((ans) => {
      const q = questionsById[ans.questionId.toString()];
      return {
        _id: ans._id,
        examId: ans.examId,
        studentId: ans.studentId,
        questionId: ans.questionId,
        questionNumber: ans.questionNumber,
        questionText: q ? q.text : null,
        answerText: ans.answerText,
        maxMarks: ans.maxMarks,
        aiScore: ans.aiScore,
        aiFeedback: ans.aiFeedback,
        teacherScore: ans.teacherScore,
        status: ans.status,
        createdAt: ans.createdAt,
        updatedAt: ans.updatedAt,
      };
    });

    return res.status(200).json({
      message: 'Answers fetched successfully.',
      answers: hydrated,
    });
  } catch (error) {
    console.error('Error fetching student answers:', error);
    return res.status(500).json({
      message: 'Failed to fetch student answers.',
      error: error.message,
    });
  }
});


// ---

// 🎯 FIX APPLIED HERE: PUT /api/exams/:examId/questions
router.put('/:examId/questions', async (req, res) => {
  const { examId } = req.params;
  const { questions } = req.body; 

  if (!questions || !Array.isArray(questions)) {
    return res.status(400).json({ message: 'Missing or invalid questions array.' });
  }

  try {
    // 🔧 Normalize incoming questions into the shape your Exam schema expects
    const normalizedQuestions = questions.map((q, index) => {
      // Use the 'number' property if it exists and is a number.
      // Otherwise, use the 'questionNumber' property if it exists and is a number.
      // Otherwise, fall back to the array index + 1 (e.g., 1, 2, 3...)
      const extractedNumber = 
        typeof q.number === 'number' ? q.number :
        typeof q.questionNumber === 'number' ? q.questionNumber :
        index + 1; // Final fallback to index + 1, guaranteed to be a number

      return {
        questionNumber: extractedNumber, // now a valid property
        text: q.text || '',
        maxMarks: typeof q.maxMarks === 'number' ? q.maxMarks : 0 // Default marks
      };
    });

    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      { $set: { questions: normalizedQuestions } },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedExam) {
      return res.status(404).json({ message: `Exam with ID ${examId} not found.` });
    }

    res.status(200).json({ 
      message: 'Structured questions saved successfully.', 
      questions: updatedExam.questions 
    });

  } catch (error) {
    console.error('Error updating exam questions:', error);
    // Check if the error is a Mongoose validation error for better client feedback
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed. Check question data formats.',
        errors: error.errors
      });
    }
    res.status(500).json({ 
      message: 'Failed to save structured questions.', 
      error: error.message 
    });
  }
});

module.exports = router;