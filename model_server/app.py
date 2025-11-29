# app.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
import anyio

from model import grade_answer  # import from model.py


# ---------- 1. FastAPI app ----------

app = FastAPI(title="EvalAI Client App")

# ---------- 2. CORS (optional but usually needed) ----------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # TODO: tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- 3. Pydantic models ----------

class EvaluateRequest(BaseModel):
    question: str
    student_answer: str
    max_marks: float = Field(3.0, description="Maximum marks for this question")


class EvaluateResponse(BaseModel):
    score: float
    max_score: float
    feedback: str
    raw: Dict[str, Any]


# ---------- 4. Routes ----------

@app.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_answer(payload: EvaluateRequest):
    """
    Frontend / Node backend will POST JSON here:

    {
      "question": "...",
      "student_answer": "...",
      "max_marks": 3
    }

    We:
      1. Retrieve context from .pkl (inside grade_answer)
      2. Call Mistral grading server
      3. Return standardized JSON
    """
    try:
        # grade_answer is sync + blocking (requests, embeddings)
        result = await anyio.to_thread.run_sync(
            grade_answer,
            payload.question,
            payload.student_answer,
            payload.max_marks,
        )

        score = result.get("score")
        max_score = result.get("max_score", payload.max_marks)
        feedback = result.get("feedback", "")

        if score is None:
            raise HTTPException(
                status_code=500,
                detail=f"Grader did not return 'score'. Raw response: {result}",
            )

        return EvaluateResponse(
            score=score,
            max_score=max_score,
            feedback=feedback,
            raw=result,
        )

    except HTTPException:
        # re-raise if we threw it above
        raise
    except Exception as e:
        # Generic error handling
        raise HTTPException(
            status_code=500,
            detail=f"Grading failed: {str(e)}",
        ) from e


@app.get("/health")
def health_check():
    return {"status": "client ok"}
