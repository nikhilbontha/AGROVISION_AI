import re

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
    "ఉల్లి": "Onion"
}

def extract_crop(text: str) -> str:
    text_lower = text.lower()
    for kw, crop in CROP_ALIASES.items():
        if re.search(r'(?i)\b' + re.escape(kw) + r'\b', text_lower):
            return crop
    return None

test_queries = [
    "corn price",
    "cotton price today",
    "what is the price of tomato?",
    "how to control fall armyworm in maize?",
    "rice price today",
    "onion price"
]

for q in test_queries:
    c = extract_crop(q)
    print(f"Query: '{q}' => Extracted Crop: {c}")
