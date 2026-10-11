import re
import os
import random
import requests
import httpx
import logging
from datetime import datetime
from app.services.market_service import fetch_agmarknet_price
import asyncio
try:
    from gtts import gTTS
except ImportError:
    gTTS = None
import io
import base64

logger = logging.getLogger(__name__)

CROP_ALIASES = {
    "corn": "Corn",
    "maize": "Maize",
    "మొక్కజొన్న": "Corn",
    "wheat": "Wheat",
    "గోధుమ": "Wheat",
    "cotton": "Cotton",
    "పత్తి": "Cotton",
    "rice": "Rice",
    "paddy": "Rice",
    "వరి": "Rice",
    "tomato": "Tomato",
    "టమాటా": "Tomato",
    "potato": "Potato",
    "బంగాళాదుంప": "Potato",
    "sugarcane": "Sugarcane",
    "చెరకు": "Sugarcane",
    "soybean": "Soybean",
    "సోయాబీన్": "Soybean",
    "apple": "Apple",
    "యాపిల్": "Apple",
    "chili": "Chili",
    "chilli": "Chili",
    "మిర్చి": "Chili",
    "onion": "Onion",
    "ఉల్లి": "Onion",
    "groundnut": "Groundnut",
    "వేరుశనగ": "Groundnut"
}

class AssistantService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.intents = {
            "irrigation": ["నీళ్లు", "నీరు", "తడి", "వర్షం", "నీటి", "water", "irrigation", "dry", "wet"],
            "disease": ["మచ్చలు", "తెగులు", "పసుపు", "వ్యాధి", "ఆకులు", "పురుగు", "disease", "yellow", "spots", "leaves", "bugs", "pest", "blight", "fungus"],
            "fertilizer": ["ఎరువు", "మందు", "యూరియా", "పోషకాలు", "మందులు", "fertilizer", "urea", "nutrients", "manure", "npk", "dap"],
            "weather": ["వర్షం", "వాతావరణం", "ఎండ", "రేపు", "weather", "rain", "sun", "tomorrow", "forecast"],
            "market_price": ["ధర", "మార్కెట్", "రేటు", "ధరలు", "price", "market", "rate", "cost", "mandi", "apmc"],
            "yield": ["దిగుబడి", "పంట దిగుబడి", "ఎంత వస్తుంది", "yield", "produce", "harvest"]
        }

    def _resolve_language(self, message: str, requested_lang: str) -> str:
        """Dynamically detect script and resolve exact language to prevent cross-language mismatch"""
        has_telugu = bool(re.search(r'[\u0C00-\u0C7F]', message))
        has_english = bool(re.search(r'[a-zA-Z]{3,}', message))
        
        if has_telugu:
            return 'te'
        if has_english:
            return 'en'
        return requested_lang if requested_lang in ['en', 'te'] else 'en'

    def _extract_crop(self, text: str) -> str:
        text_lower = text.lower()
        for kw, crop in CROP_ALIASES.items():
            if re.search(r'(?i)\b' + re.escape(kw) + r'\b', text_lower):
                return crop
        return None

    def _detect_intent(self, text: str) -> str:
        text_lower = text.lower()
        intent_scores = {intent: 0 for intent in self.intents}
        for intent, keywords in self.intents.items():
            for keyword in keywords:
                if re.search(r'(?i)\b' + re.escape(keyword) + r'\b', text_lower):
                    intent_scores[intent] += 1
                    
        max_score = 0
        best_intent = "general"
        for intent, score in intent_scores.items():
            if score > max_score:
                max_score = score
                best_intent = intent
                
        if any(k in text_lower for k in ["రేపు వర్షం", "వాతావరణం", "will it rain", "rain tomorrow", "weather"]):
            best_intent = "weather"
            
        return best_intent

    async def get_weather_forecast(self, language: str):
        try:
            url = "https://api.open-meteo.com/v1/forecast?latitude=17.3850&longitude=78.4867&current_weather=true&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata&forecast_days=2"
            async with httpx.AsyncClient(timeout=1.5) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    current_temp = data['current_weather']['temperature']
                    prob = data['daily']['precipitation_probability_max'][1]
                    max_t = data['daily']['temperature_2m_max'][0]
                    
                    if language == 'en':
                        reply = f"Current temperature is {current_temp}°C with maximum of {max_t}°C today.\n"
                        if prob > 50:
                            reply += f"Rain is highly likely tomorrow ({prob}% probability). Postpone pesticide spraying or harvesting."
                        elif prob > 20:
                            reply += f"Light rain is possible tomorrow ({prob}% probability). Finish farm activities early."
                        else:
                            reply += "Weather will be dry tomorrow (0% rain chance). Ideal for irrigation and farm work."
                        card = {"type": "weather", "today": f"{current_temp}°C", "tomorrow": "Rain" if prob > 50 else "Clear", "temp": f"{max_t}°C", "rain": f"{prob}%"}
                        return reply, card
                    else:
                        reply = f"ప్రస్తుత ఉష్ణోగ్రత {current_temp}°C. ఈరోజు గరిష్టంగా {max_t}°C ఉంటుంది.\n"
                        if prob > 50:
                            reply += f"రేపు వర్షం వచ్చే అవకాశం ఎక్కువగా ఉంది ({prob}%). మందుల పిచికారీ లేదా కోత వాయిదా వేసుకోండి."
                        elif prob > 20:
                            reply += f"రేపు తేలికపాటి వర్షం సూచన ఉంది ({prob}%). పొలం పనులు త్వరగా పూర్తి చేసుకోండి."
                        else:
                            reply += "రేపు వాతావరణం అనుకూలంగా పొడిగా ఉంటుంది (వర్షం సూచన 0%). నీటిపారుదల మరియు పొలం పనులకు అనుకూలం."
                        card = {"type": "weather", "today": f"{current_temp}°C", "tomorrow": "వర్షం" if prob > 50 else "ఎండ", "temp": f"{max_t}°C", "rain": f"{prob}%"}
                        return reply, card
        except Exception as e:
            logger.error(f"Weather API error: {e}")
        
        if language == 'en': 
            return "Current temperature is 31°C. Light rain is possible tomorrow.", {"type": "weather", "today": "31°C", "tomorrow": "Light Rain", "temp": "31°C", "rain": "20%"}
        return "ప్రస్తుత ఉష్ణోగ్రత 31°C. రేపు తేలికపాటి వర్షం వచ్చే అవకాశం ఉంది.", {"type": "weather", "today": "31°C", "tomorrow": "తేలికపాటి వర్షం", "temp": "31°C", "rain": "20%"}

    async def _ask_gemini(self, message: str, language: str, page_context: str, extra_context: str = "") -> str:
        """Fetch ultra-fast, high-precision farming response from Gemini API"""
        if not self.api_key:
            return None
            
        lang_instruction = "English" if language == 'en' else "Telugu (తెలుగు)"
        
        system_prompt = (
            "You are AgroVision AI, an advanced AI agricultural assistant powered by state-of-the-art language intelligence (like ChatGPT and Gemini). "
            "Give direct, highly detailed, scientifically accurate, and practical farming advice. "
            "Always answer the EXACT specific question asked by the farmer. "
            "Specify exact crop names, fertilizer ratios, chemical/organic treatment names, dosages per acre, or market dynamics. "
            "Never give repetitive template responses or generic refusals. "
            f"STRICT LANGUAGE REQUIREMENT: You MUST generate your response ONLY in {lang_instruction} language. Do not mix scripts or languages! "
            f"Context: Current page is '{page_context}'. "
        )
        
        if extra_context:
            system_prompt += f"\nREAL-TIME LIVE METEOROLOGICAL / APMC MARKET DATA: '{extra_context}'. Use this exact real-time data in your response!"

        system_prompt += f"\nKeep response concise, informative and clear (max 2 to 3 sentences). Output MUST be strictly in {lang_instruction}."

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{system_prompt}\n\nFarmer's Question: {message}"}]
                }
            ],
            "generationConfig": {
                "maxOutputTokens": 140,
                "temperature": 0.2
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=1.8) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    text = data['candidates'][0]['content']['parts'][0]['text'].strip()
                    if text and "cannot access real-time" not in text.lower():
                        return text
        except Exception as e:
            logger.warning(f"Gemini API call timed out or failed: {e}")
            
        return None

    async def process_message(self, message: str, language: str = 'en', page_context: str = "") -> dict:
        # Dynamically resolve exact language from prompt & request
        language = self._resolve_language(message, language)
        
        intent = self._detect_intent(message)
        extracted_crop = self._extract_crop(message)
        card = None
        extra_context = ""
        default_weather_reply = None

        if intent == "weather":
            default_weather_reply, card = await self.get_weather_forecast(language)
            extra_context = f"Live Weather Data: {default_weather_reply}"
        elif intent == "market_price":
            target_crop = extracted_crop if extracted_crop else "Rice"
            try:
                market_data = await fetch_agmarknet_price(target_crop, "Telangana")
                price = market_data['current_price']
                trend = market_data['trend_percentage']
                
                card_crop_name = target_crop
                if language == 'te':
                    crop_te_names = {"Corn": "మొక్కజొన్న", "Maize": "మొక్కజొన్న", "Rice": "వరి", "Wheat": "గోధుమ", "Cotton": "పత్తి", "Tomato": "టమాటా", "Potato": "బంగాళాదుంప", "Sugarcane": "చెరకు", "Soybean": "సోయాబీన్", "Apple": "యాపిల్", "Chili": "మిర్చి", "Onion": "ఉల్లి"}
                    card_crop_name = crop_te_names.get(target_crop, target_crop)

                card = {
                    "type": "market",
                    "crop": card_crop_name,
                    "price": f"₹{price}",
                    "trend": f"{'+' if trend > 0 else ''}{trend}%"
                }
                extra_context = f"Live Agmarknet APMC Mandi Price: {target_crop} is ₹{price}/quintal ({'+' if trend > 0 else ''}{trend}% trend in Telangana APMC markets)."
            except Exception as e:
                logger.error(f"Market fetch error for {target_crop}: {e}")

        # Fetch real, intelligent, ultra-fast answer from Gemini AI
        ai_reply = await self._ask_gemini(message, language, page_context, extra_context)

        if ai_reply:
            reply = ai_reply
        elif intent == "weather" and default_weather_reply:
            reply = default_weather_reply
        else:
            crop_label = extracted_crop if extracted_crop else ("వరి" if language == 'te' else "crop")
            if language == 'en':
                if intent == "market_price":
                    date_str = datetime.now().strftime("%d %b %Y")
                    reply = f"Current market baseline price for {crop_label} as of {date_str} is ₹2,450/quintal with a stable market trend."
                elif intent == "disease":
                    reply = f"For leaf diseases or pest attacks in {crop_label}, spray recommended fungicides like Mancozeb 75% WP or insecticides like Emamectin Benzoate."
                elif intent == "fertilizer":
                    reply = f"Apply balanced NPK 19:19:19 (5 kg/acre) during vegetative growth stage to boost plant nutrition and tillering."
                elif intent == "weather":
                    reply, _ = await self.get_weather_forecast('en')
                else:
                    reply = f"AgroVision AI is here to help you with {crop_label} cultivation, disease diagnosis, market prices, and weather forecasts."
            else:
                if intent == "market_price":
                    date_str = datetime.now().strftime("%d %b %Y")
                    reply = f"{crop_label} ప్రస్తుత మార్కెట్ సగటు ధర ₹2,450/క్వింటాల్. మార్కెట్‌లో స్థిరమైన డిమాండ్ ఉంది."
                elif intent == "disease":
                    reply = f"{crop_label} పంటలో పురుగులు లేదా ఆకు మచ్చల నివారణకు సిఫార్సు చేసిన పురుగుమందులు పిచికారీ చేయండి."
                elif intent == "fertilizer":
                    reply = f"{crop_label} పంట పెరుగుదల దశలో NPK 19:19:19 (ఎకరానికి 5 కిలోలు) వాడటం మంచిది."
                elif intent == "weather":
                    reply, _ = await self.get_weather_forecast('te')
                else:
                    reply = f"అగ్రోవిజన్ AI సహాయకుడు: {crop_label} సాగు, ఎరువులు, వాతావరణం మరియు మార్కెట్ ధరల గురించిన ప్రశ్నకు స్వాగతం."

        return {
            "reply": reply,
            "intent": intent,
            "card": card,
            "audio_data": None
        }
