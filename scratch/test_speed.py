import os
import httpx
import asyncio
import time
from dotenv import load_dotenv

load_dotenv("e:/tekworks_projects/crop/backend/.env")

api_key = os.getenv("GEMINI_API_KEY")

async def test_models():
    models_to_test = [
        "gemini-3.8-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-flash-lite-latest"
    ]
    
    async with httpx.AsyncClient(timeout=4.5) as client:
        for model in models_to_test:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": "You are AgroVision AI. Give 1 sentence answer: What fertilizer for cotton?"}]
                    }
                ],
                "generationConfig": {
                    "maxOutputTokens": 80,
                    "temperature": 0.2
                }
            }
            start = time.time()
            try:
                resp = await client.post(url, json=payload)
                t = time.time() - start
                print(f"Model {model}: Status {resp.status_code}, Time: {t:.2f}s")
                if resp.status_code == 200:
                    text = resp.json()['candidates'][0]['content']['parts'][0]['text']
                    print("   Reply:", text[:80])
            except Exception as e:
                print(f"Model {model}: Failed ({e})")

if __name__ == "__main__":
    asyncio.run(test_models())
