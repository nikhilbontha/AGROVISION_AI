import requests
import io
import json
from PIL import Image, ImageDraw

BASE_URL = "http://localhost:8000/predict/predict-disease"

def create_synthetic_leaf_bytes(color, spots=False):
    img = Image.new('RGB', (224, 224), color=color)
    draw = ImageDraw.Draw(img)
    if spots:
        draw.ellipse([60, 60, 90, 90], fill=(120, 40, 10))
        draw.ellipse([120, 100, 145, 125], fill=(100, 30, 5))
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    return buf.getvalue()

def test_pipeline():
    print("==========================================================")
    print("       CROP-AWARE ML DISEASE DETECTION PIPELINE AUDIT     ")
    print("==========================================================")

    # Test 1: Explicit Unsupported Crop (Wheat)
    print("\n[TEST 1] User selects UNSUPPORTED crop 'Wheat'...")
    leaf_bytes = create_synthetic_leaf_bytes((30, 150, 40), spots=True)
    files = {'file': ('wheat_sample.jpg', leaf_bytes, 'image/jpeg')}
    data = {'crop_type': 'Wheat'}
    r = requests.post(BASE_URL, files=files, data=data)
    print(f"HTTP Status: {r.status_code}")
    print(f"Response Body: {r.text}")
    res = r.json()
    print(f"Success: {res.get('success')}")
    print(f"Reason: {res.get('reason')}")
    print(f"Message: {res.get('message')}")
    assert res.get('success') == False, "Expected success to be False for unsupported crop"
    assert res.get('reason') == 'UNSUPPORTED_CROP', "Expected UNSUPPORTED_CROP reason"
    print("-> PASS: Explicit Wheat correctly rejected as UNSUPPORTED_CROP.")

    # Test 2: Auto-Detect on Synthetic Ambiguous Image
    print("\n[TEST 2] Auto-Detect on ambiguous image...")
    leaf_bytes = create_synthetic_leaf_bytes((100, 100, 100), spots=False)
    files = {'file': ('ambiguous.jpg', leaf_bytes, 'image/jpeg')}
    data = {'crop_type': 'Auto-Detect'}
    r = requests.post(BASE_URL, files=files, data=data)
    print(f"HTTP Status: {r.status_code}")
    print(f"Response Body: {r.text}")
    res = r.json()
    print(f"Success: {res.get('success')}")
    if not res.get('success'):
        print(f"Reason: {res.get('reason')}")
        print(f"Message: {res.get('message')}")
    else:
        print(f"Crop: {res.get('crop')}")
        print(f"Disease: {res.get('disease')}")

    # Test 3: Auto-Detect on Supported Crop (Green Leaf)
    print("\n[TEST 3] Auto-Detect on vibrant foliage leaf...")
    leaf_bytes = create_synthetic_leaf_bytes((20, 160, 45), spots=True)
    files = {'file': ('green_foliage.jpg', leaf_bytes, 'image/jpeg')}
    data = {'crop_type': 'Auto-Detect'}
    r = requests.post(BASE_URL, files=files, data=data)
    print(f"HTTP Status: {r.status_code}")
    res = r.json()
    print(f"Success: {res.get('success')}")
    if res.get('success'):
        print(f"Detected Crop: {res.get('crop')}")
        print(f"Crop Confidence: {res.get('crop_confidence')}%")
        print(f"Predicted Disease: {res.get('disease')}")
        print(f"Disease Confidence: {res.get('confidence')}%")
        crop_name = res.get('crop', {}).get('name')
        disease_name = res.get('disease')
        assert crop_name in disease_name, f"Cross-crop violation! Crop {crop_name} vs Disease {disease_name}"
        print("-> PASS: Disease strictly scoped within detected crop family.")

    # Test 4: Supported Crop 'Corn'
    print("\n[TEST 4] Explicit supported crop 'Corn'...")
    leaf_bytes = create_synthetic_leaf_bytes((25, 140, 35), spots=False)
    files = {'file': ('corn_test.jpg', leaf_bytes, 'image/jpeg')}
    data = {'crop_type': 'Corn'}
    r = requests.post(BASE_URL, files=files, data=data)
    print(f"HTTP Status: {r.status_code}")
    res = r.json()
    print(f"Success: {res.get('success')}")
    if res.get('success'):
        print(f"Crop: {res.get('crop')}")
        print(f"Disease: {res.get('disease')}")
        assert "Corn" in res.get('disease'), "Cross-crop violation!"
        print("-> PASS: User selected Corn produces Corn prediction.")
    else:
        print(f"Reason: {res.get('reason')}")

    print("\n==========================================================")
    print("          ALL PIPELINE AUDIT TESTS COMPLETED              ")
    print("==========================================================")

if __name__ == '__main__':
    test_pipeline()
