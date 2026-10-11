import os
import requests
import time
from dotenv import load_dotenv

load_dotenv("e:/tekworks_projects/crop/backend/.env")

api_key = os.getenv("GEMINI_API_KEY")

for model in ["gemini-flash-lite-latest", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.6-flash"]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [{
            "parts": [{"text": "You are AgroVision AI farming expert assistant. Give a concise, clear, and highly accurate answer (2-3 sentences max) to this question: What is the best fertilizer for cotton crop in black soil? Answer in English."}]
        }]
    }

    start = time.time()
    try:
        resp = requests.post(url, json=payload, timeout=10)
        duration = time.time() - start
        print(f"Model {model} - Status: {resp.status_code}, Time: {duration:.2f}s")
        if resp.status_code == 200:
            data = resp.json()
            reply = data['candidates'][0]['content']['parts'][0]['text']
            print("Reply:", reply[:150])
        else:
            print("Error:", resp.text[:200])
    except Exception as e:
        print("Exception:", e)
