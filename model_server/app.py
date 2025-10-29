# app.py
from fastapi import FastAPI, UploadFile, Form
import requests, json
from config import MISTRAL_SERVER_URL, MISTRAL_API_TOKEN

app = FastAPI(title="EvalAI Client App")

@app.post("/evaluate")
async def evaluate_answer(question: str = Form(...), context: str = Form(...), student_answer: str = Form(...)):
    payload = {
        "question": question,
        "context": context,
        "student_answer": student_answer
    }

    headers = {
        "Content-Type": "application/json",
        "x-api-token": MISTRAL_API_TOKEN
    }

    try:
        response = requests.post(MISTRAL_SERVER_URL, headers=headers, data=json.dumps(payload))
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"Server responded with {response.status_code}", "detail": response.text}
    except Exception as e:
        return {"error": "Connection failed", "detail": str(e)}

@app.get("/health")
def health_check():
    return {"status": "client ok"}
