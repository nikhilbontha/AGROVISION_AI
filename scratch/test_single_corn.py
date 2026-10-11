import requests

url = "http://localhost:8000/assistant/chat"

resp = requests.post(url, json={"message": "corn price", "language": "en"})
data = resp.json()
print("Reply:", data.get("reply").encode("ascii", "replace").decode("ascii"))
print("Card:", data.get("card"))
