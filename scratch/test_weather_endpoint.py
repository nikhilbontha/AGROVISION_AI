import requests
import time

url = "http://localhost:8000/assistant/chat"

q_en = {"message": "Weather Today", "language": "en"}
q_te = {"message": "ఈరోజు వాతావరణం", "language": "te"}

for q in [q_en, q_te]:
    start = time.time()
    try:
        resp = requests.post(url, json=q, timeout=10)
        elapsed = time.time() - start
        print(f"Status: {resp.status_code}, Time: {elapsed:.2f}s")
        if resp.status_code == 200:
            data = resp.json()
            print("Reply:", repr(data.get("reply")))
            print("Card:", data.get("card"))
            print("=" * 50)
    except Exception as e:
        print("Exception:", e)
