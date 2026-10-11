import os
import httpx
import asyncio
import time
from dotenv import load_dotenv

load_dotenv("e:/tekworks_projects/crop/backend/.env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

async def test_ask_gemini(message: str, language: str = 'en'):
    models = ["gemini-flash-lite-latest", "gemini-3.8-flash"]
    lang_name = "Telugu (తెలుగు)" if language == 'te' else "English"
    
    system_instruction = (
        "You are AgroVision AI, an expert agricultural scientist and farming assistant for Indian farmers. "
        "Answer the farmer's question with 100% real, accurate, practical agricultural advice. "
        "Keep your response concise (2-4 sentences max), clear, and actionable. "
        f"Respond ONLY in language: {lang_name}."
    )
    
    start = time.time()
    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{system_instruction}\n\nFarmer Question: {message}"}]
                }
            ]
        }
        try:
            async with httpx.AsyncClient(timeout=3.5) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    reply = data['candidates'][0]['content']['parts'][0]['text'].strip()
                    print(f"Success with {model} in {time.time()-start:.2f}s:\n{reply}\n")
                    return reply
        except Exception as e:
            print(f"Model {model} failed: {e}")
    return None

async def main():
    print("Testing English query...")
    await test_ask_gemini("How to control fall armyworm in maize crop?")
    print("Testing Telugu query...")
    await test_ask_gemini("వరి పంటలో పసుపు ఆకుల సమస్య నివారణ ఎలా?", language='te')

if __name__ == "__main__":
    asyncio.run(main())
