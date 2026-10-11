import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv("e:/tekworks_projects/crop/backend/.env")

api_key = os.getenv("GEMINI_API_KEY")

async def test_weather_prompt():
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key={api_key}"
    
    live_weather_info = "Current temperature is 33.6°C. Maximum will be 29.8°C today. The weather will be dry tomorrow (0% rain chance)."
    
    system_prompt = (
        "You are AgroVision AI, an expert agricultural AI assistant. "
        f"You ALREADY HAVE real-time live weather data for the farmer's location: '{live_weather_info}'. "
        "Answer the farmer's weather question using this live data directly! "
        "Give actionable irrigation and farming advice based on these numbers (max 2-3 sentences). "
        "Respond in English."
    )
    
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": f"{system_prompt}\n\nFarmer Question: Weather Today"}]
            }
        ]
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload)
        print("Status:", resp.status_code)
        if resp.status_code == 200:
            print("Reply:", resp.json()['candidates'][0]['content']['parts'][0]['text'])

if __name__ == "__main__":
    asyncio.run(test_weather_prompt())
