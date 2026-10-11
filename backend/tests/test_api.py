import io
import cv2
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
import traceback

client = TestClient(app)
try:
    leaf = np.zeros((300, 300, 3), dtype=np.uint8)
    leaf[:, :] = (25, 130, 35) # Green foliage
    _, img_encoded = cv2.imencode('.png', leaf)
    img_bytes = io.BytesIO(img_encoded.tobytes())

    res = client.post('/predict/predict-disease', headers={'Authorization': 'Bearer mock-token'}, files={'file': ('test_leaf.png', img_bytes, 'image/png')}, data={'crop_type': 'Auto-Detect', 'lang': 'en'})
    print("STATUS", res.status_code)
    print("BODY", res.text[:500])
except Exception as e:
    traceback.print_exc()

