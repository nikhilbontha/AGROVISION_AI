import requests

url = "http://localhost:8000/assistant/chat"

test_prompts = [
    {"message": "I have a five acres of land and I am planning to", "language": "te"}, # Even if te sent, prompt is in English
    {"message": "I have a five acres of land and I am planning to", "language": "en"},
    {"message": "వరి పంట సాగు విధానం ఏమిటి?", "language": "en"} # Prompt is in Telugu
]

for p in test_prompts:
    resp = requests.post(url, json=p, timeout=10)
    data = resp.json()
    print("=" * 60)
    print("Prompt:", p["message"])
    print("Requested Lang:", p["language"])
    print("Reply:\n", data.get("reply").encode("ascii", "replace").decode("ascii"))
