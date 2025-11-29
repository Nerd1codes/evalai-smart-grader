const express = require('express');
const router = express.Router();
const fetch = require('node-fetch'); // ⬅️ ADD THIS: Required for API call to external grader service
const Exam = require('../model/Exam'); 
const Answer = require('../model/Answer');
const Student = require('../model/Student'); // ⬅️ ADD THIS: Required to update student's total marks

// 👇 REMOVE THIS LINE: We are using direct fetch to the external service instead.
// const { gradeWithModel } = require('../controller/evalClient'); 

// Base URL for the external AI evaluation service (FastAPI)
const EVAL_API_BASE = "http://127.0.0.1:5002"; // ⬅️ Define the API base URL

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

// GET /api/exams/:examId -> return exam with questions
router.get('/:examId', async (req, res) => {
  const { examId } = req.params;

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: `Exam with ID ${examId} not found.` });
    }

    return res.status(200).json({
      message: 'Exam fetched successfully.',
      exam,
    });
  } catch (error) {
    console.error('Error fetching exam:', error);
    return res.status(500).json({
      message: 'Failed to fetch exam.',
      error: error.message,
    });
  }
});

// ---
// ANSWERS API
// ---
// POST /api/exams/:examId/students/:studentId/answers
// Body: { answers: [{ questionId, answerText }] }
// This will create or update answers for that student for this exam.
// ---

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

// ---
// GET /api/exams/:examId/students/:studentId/answers
// Returns answers + question text (joined from Exam.questions)
// ---

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
// PUT /api/exams/:examId/questions
// Save structured questions into Exam.questions[]
// ---

router.put('/:examId/questions', async (req, res) => {
  const { examId } = req.params;
  const { questions } = req.body; 

  if (!questions || !Array.isArray(questions)) {
    return res.status(400).json({ message: 'Missing or invalid questions array.' });
  }

  try {
    // 🔧 Normalize incoming questions into the shape your Exam schema expects
    const normalizedQuestions = questions.map((q, index) => {
      const extractedNumber = 
        typeof q.number === 'number' ? q.number :
        typeof q.questionNumber === 'number' ? q.questionNumber :
        index + 1;

      return {
        questionNumber: extractedNumber,
        text: q.text || '',
        maxMarks: typeof q.maxMarks === 'number' ? q.maxMarks : 0
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

// ---
// AI EVALUATION API
// POST /api/exams/:examId/students/:studentId/evaluate
// ---

router.post('/:examId/students/:studentId/evaluate', async (req, res) => {
  const { examId, studentId } = req.params;

  try {
    // 1. Load exam to access question texts + maxMarks
    const exam = await Exam.findById(examId).lean(); // Use .lean() for faster read
    if (!exam || !Array.isArray(exam.questions) || !exam.questions.length) {
      return res.status(400).json({ error: "Exam or questions not found" });
    }
    
    // Build a quick lookup for questions by _id string
    const questionMap = new Map(
      exam.questions.map((q) => [String(q._id), q])
    );

    // 2. Load all answers for this exam + student
    const answers = await Answer.find({ examId, studentId }).lean().sort({ questionNumber: 1 });
    
    if (!answers || answers.length === 0) {
      return res.status(404).json({
        message: 'No answers found for this student in this exam.',
      });
    }

    const evaluationResults = [];
    let totalScore = 0; // ⬅️ Initialize total score
    let totalMax = 0;   // ⬅️ Initialize total max score

    // 3. For each answer, call the Python grading service
    for (const ans of answers) {
      const q = questionMap.get(String(ans.questionId));

      if (!q) {
        console.warn(
          `Question with ID ${ans.questionId} not found in exam ${examId}. Skipping.`
        );
        evaluationResults.push({
          answerId: ans._id,
          questionId: ans.questionId,
          status: 'skipped',
          reason: 'Question not found in exam.questions',
        });
        continue;
      }

      const questionText = q.text || "";
      const maxMarks = q.maxMarks || ans.maxMarks || 3;
      const studentAnswer = ans.answerText || "";

      try {
        // 3a. Prepare payload for Python service
        const payload = {
            question: questionText,
            student_answer: studentAnswer,
            max_marks: maxMarks,
        };

        // 3b. Call Python grading service via fetch
        const evalRes = await fetch(`${EVAL_API_BASE}/evaluate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!evalRes.ok) {
            const text = await evalRes.text();
            throw new Error(`Eval API failed with status ${evalRes.status}: ${text}`);
        }

        const evalData = await evalRes.json(); // { score, max_score, feedback, raw }
        const score = typeof evalData.score === "number" ? evalData.score : 0;
        const maxScore = typeof evalData.max_score === "number" ? evalData.max_score : maxMarks;
        const feedback = evalData.feedback || "";

        // 3c. Update this Answer doc with AI result
        await Answer.updateOne( // Use updateOne for efficiency since we used .lean() earlier
          { _id: ans._id },
          {
            $set: {
              aiScore: score,
              aiMaxScore: maxScore,
              aiFeedback: feedback,
              status: 'ai_evaluated', 
            },
          }
        );
        
        totalScore += score;
        totalMax += maxScore;

        evaluationResults.push({
          answerId: ans._id,
          questionId: ans.questionId,
          questionNumber: ans.questionNumber,
          score: score,
          max_score: maxScore,
          feedback: feedback,
        });
      } catch (err) {
        console.error(
          `Error evaluating answer ${ans._id} (questionId=${ans.questionId}):`,
          err.message
        );
        evaluationResults.push({
          answerId: ans._id,
          questionId: ans.questionId,
          questionNumber: ans.questionNumber,
          status: 'error',
          error: err.message,
        });
      }
    }

    // 4. Update student's total marks in Student collection
    await Student.updateOne(
        { _id: studentId },
        {
            $set: {
                marks: totalScore, // Store the AI calculated total score
            },
        }
    );
    // 5. Respond to frontend

    return res.status(200).json({
      message: 'AI evaluation completed.',
      examId,
      studentId,
      evaluatedCount: evaluationResults.length,
      totalScore: totalScore, // ⬅️ Added total score to response
      maxScore: totalMax,    // ⬅️ Added max score to response
      results: evaluationResults,
    });
  } catch (error) {
    console.error('Error during AI evaluation:', error);
    return res.status(500).json({
      message: 'AI evaluation failed.',
      error: error.message,
    });
  }
});

module.exports = router;