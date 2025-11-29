// server/services/evalClient.js
const axios = require("axios");

// URL of your FastAPI grading service
// Configure in .env if you want: EVAL_API_URL=http://localhost:8001/evaluate
const EVAL_API_URL = process.env.EVAL_API_URL || "http://localhost:8001/evaluate";

/**
 * Call the Python grading service.
 * Python side:
 *  - uses .pkl index to get context from the question
 *  - calls the Mistral server
 *  - returns { score, max_score, feedback, raw }
 */
async function gradeWithModel(questionText, studentAnswer, maxMarks = 3) {
  const payload = {
    question: questionText,
    student_answer: studentAnswer,
    max_marks: maxMarks,
  };

  const response = await axios.post(EVAL_API_URL, payload, {
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

  return response.data;
}

module.exports = {
  gradeWithModel,
};
