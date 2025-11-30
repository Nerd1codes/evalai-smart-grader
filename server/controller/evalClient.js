// server/services/evalClient.js
const axios = require("axios");

// Should match your FastAPI app.py port
const EVAL_API_URL = process.env.EVAL_API_URL || "http://127.0.0.1:5002/evaluate";

async function gradeWithModel(questionText, studentAnswer, maxMarks = 3) {
  const payload = {
    question: questionText,
    student_answer: studentAnswer,
    max_marks: maxMarks,
  };

  const response = await axios.post(EVAL_API_URL, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
  });

  return response.data;
}

module.exports = { gradeWithModel };
