# test_request.py
import requests, json
from config import MISTRAL_SERVER_URL, MISTRAL_API_TOKEN

payload = {
    "question": "What is photosynthesis?",
    "context": "Plants convert sunlight into energy.",
    "student_answer": "Plants make food using sunlight."
}

headers = {
    "Content-Type": "application/json",
    "x-api-token": MISTRAL_API_TOKEN
}

response = requests.post(MISTRAL_SERVER_URL, headers=headers, data=json.dumps(payload))

print("Status:", response.status_code)
print("Response:", response.text)
