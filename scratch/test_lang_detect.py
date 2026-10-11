import re

def resolve_language(message: str, requested_lang: str) -> str:
    has_telugu = bool(re.search(r'[\u0C00-\u0C7F]', message))
    has_english = bool(re.search(r'[a-zA-Z]{3,}', message))
    
    if has_telugu:
        return 'te'
    if has_english:
        return 'en'
    return requested_lang if requested_lang in ['en', 'te'] else 'en'

test_cases = [
    ("I have a five acres of land and I am planning to", "te"), # User selected te in UI, but asked in English
    ("I have a five acres of land and I am planning to", "en"), # Asked in English with en selected
    ("మీరు మీ 5 ఎకరాల భూమిలో ఏ పంట వేయాలనుకుంటున్నారు?", "en"), # Asked in Telugu with en selected
    ("వరి పంట ధర ఎంత?", "te"), # Asked in Telugu with te selected
    ("Weather Today", "en"),
    ("ఈరోజు వాతావరణం", "te")
]

for msg, req in test_cases:
    resolved = resolve_language(msg, req)
    print(f"Msg: '{msg[:35]}...' | Selected: {req} => Effective Lang: {resolved}")
