import requests

url = "http://localhost:8000/predict/predict-yield?lang=en"
payload = {
    "district": "Warangal",
    "area": 5.0,
    "area_unit": "acres",
    "cultivated_area": 5.0,
    "soil_type": "Black Cotton Soil",
    "soil_test_available": True,
    "soil_ph": 6.8,
    "organic_carbon": 0.75,
    "crop_type": "Cotton",
    "crop_stage": "Square Formation",
    "expected_farmgate_price": 8200.0,
    "itemized_costs": {
        "seed": 4500,
        "fertilizer": 8500,
        "pesticide": 6000,
        "labour": 12000,
        "harvesting": 8000
    }
}

try:
    resp = requests.post(url, json=payload, timeout=10)
    print("Status:", resp.status_code)
    if resp.status_code == 200:
        data = resp.json()
        print("Success:", data.get("success"))
        print("Yield / Acre (Tons):", data.get("estimated_yield_per_acre"))
        print("Total Harvest (Tons):", data.get("total_expected_harvest"))
        print("Gross Revenue (Rs):", data.get("estimated_revenue"))
        print("Operating Cost (Rs):", data.get("estimated_cost"))
        print("Expected Profit (Rs):", data.get("expected_profit"))
        print("Smart Engine Keys:", list(data.get("smart_engine", {}).keys()))
    else:
        print("Error:", resp.text[:300])
except Exception as e:
    print("Exception:", e)
