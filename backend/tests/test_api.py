from fastapi.testclient import TestClient
from app.main import app
import traceback
import sys

client = TestClient(app)
try:
    res = client.post('/predict/predict-disease', headers={'Authorization': 'Bearer mock-token'}, files={'file': open('app/test_leaf.png', 'rb')}, data={'crop_type': 'Auto-Detect', 'lang': 'en'})
    print("STATUS", res.status_code)
    print("BODY", res.text[:500])
except Exception as e:
    traceback.print_exc()
