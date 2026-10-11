import requests
import json
import os

url = 'http://127.0.0.1:8000/predict/predict-disease'
sample_dir = r'scratch\sample_images'

samples = [
    ('images (5).jpeg', 'Tomato'),
    ('images (4).jpeg', 'Tomato'),
    ('images (3).jpeg', 'Rice'),
    ('false-smut-in-rice.jpg', 'Rice'),
    ('images (2).jpeg', 'Corn'),
    ('images (1).jpeg', 'Corn'),
    ('images.jpeg', 'Soybean'),
    ('Crop-Diseases_-Types-Causes-and-Symptoms-2-min.webp', 'Wheat'),
    ('Rust_leaves_MAIN.jpg', 'Wheat')
]

print("=== LIVE API RESPONSE ON ALL 9 SAMPLE IMAGES ===")
for fname, actual_crop in samples:
    p = os.path.join(sample_dir, fname)
    with open(p, 'rb') as f:
        file_bytes = f.read()

    r_auto = requests.post(url, files={'file': (fname, file_bytes, 'image/jpeg')}, data={'crop_type': 'Auto-Detect', 'lang': 'en'})
    res_auto = r_auto.json()

    r_cond = requests.post(url, files={'file': (fname, file_bytes, 'image/jpeg')}, data={'crop_type': actual_crop, 'lang': 'en'})
    res_cond = r_cond.json()

    print(f"File: {fname} (Target Crop: {actual_crop})")
    print(f"  [Auto-Detect]: success={res_auto.get('success')}, crop={res_auto.get('crop')}, disease={res_auto.get('disease')}, conf={res_auto.get('confidence')}, err={res_auto.get('error_code')}, msg={res_auto.get('message', '')[:60]}")
    print(f"  [Conditioned]: success={res_cond.get('success')}, crop={res_cond.get('crop')}, disease={res_cond.get('disease')}, conf={res_cond.get('confidence')}, err={res_cond.get('error_code')}, msg={res_cond.get('message', '')[:60]}")
    print("-" * 80)
