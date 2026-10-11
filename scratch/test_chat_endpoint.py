import requests
import time

url = "http://localhost:8000/assistant/chat"

questions = [
    {"message": "corn price", "language": "en"},
    {"message": "wheat price", "language": "en"},
    {"message": "how to control fall armyworm in maize?", "language": "en"},
    {"message": "మొక్కజొన్న ధర ఎంత?", "language": "te"}
]

for q in questions:
    start = time.time()
    try:
        resp = requests.post(url, json=q, timeout=10)
        elapsed = time.time() - start
        print(f"Status: {resp.status_code}, Time: {elapsed:.2f}s")
        if resp.status_code == 200:
            data = resp.json()
            print("Message:", q["message"])
            print("Reply:", data.get("reply"))
            print("Card:", data.get("card"))
            print("=" * 60)
        else:
            print("Error:", resp.text)
    except Exception as e:
        print("Exception:", e)
