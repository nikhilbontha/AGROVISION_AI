import httpx

DISTRICT_COORDS = {
    "Hyderabad": {"lat": 17.3850, "lon": 78.4867},
    "Warangal": {"lat": 17.9689, "lon": 79.5941},
    "Khammam": {"lat": 17.2473, "lon": 80.1514},
    "Nizamabad": {"lat": 18.6704, "lon": 78.0937},
    "Karimnagar": {"lat": 18.4386, "lon": 79.1288},
    "Mahabubnagar": {"lat": 16.7432, "lon": 77.9942}
}

def get_weather_condition_string(weather_code: int) -> str:
    """Map WMO weather code to a readable string."""
    if weather_code == 0:
        return "Clear sky"
    elif weather_code in [1, 2, 3]:
        return "Mainly clear, partly cloudy"
    elif weather_code in [45, 48]:
        return "Fog"
    elif weather_code in [51, 53, 55]:
        return "Drizzle"
    elif weather_code in [61, 63, 65]:
        return "Rain"
    elif weather_code in [71, 73, 75]:
        return "Snow fall"
    elif weather_code in [80, 81, 82]:
        return "Rain showers"
    elif weather_code in [95, 96, 99]:
        return "Thunderstorm"
    else:
        return "Moderate conditions"

async def fetch_real_weather(district: str = "Hyderabad") -> dict:
    coords = DISTRICT_COORDS.get(district, DISTRICT_COORDS["Hyderabad"])
    
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": coords["lat"],
        "longitude": coords["lon"],
        "current": "temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,weather_code",
        "timezone": "Asia/Kolkata"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            current = data.get("current", {})
            
            temp = current.get("temperature_2m", 30.0)
            humidity = current.get("relative_humidity_2m", 50.0)
            rainfall_prob = current.get("precipitation_probability", 0)  # sometimes missing in open-meteo current, let's use default if missing
            wind_speed = current.get("wind_speed_10m", 10.0)
            weather_code = current.get("weather_code", 0)
            
            # Since precipitation_probability is actually an hourly metric in Open-Meteo, 
            # let's fallback to standard "Rainfall probability" logic or fetch hourly if needed.
            # I will use a simple deterministic fallback if it's missing from `current`.
            if rainfall_prob is None:
                # Approximate based on humidity and weather code
                if weather_code >= 50:
                    rainfall_prob = 80
                else:
                    rainfall_prob = int(humidity * 0.4)
            
            outlook = get_weather_condition_string(weather_code)
            
            return {
                "temperature": round(temp, 1),
                "humidity": round(humidity, 1),
                "rainfall_probability": int(rainfall_prob),
                "wind_speed": round(wind_speed, 1),
                "outlook": outlook,
                "success": True
            }
            
    except Exception as e:
        print(f"Error fetching real weather: {e}")
        return {
            "temperature": 32.0,
            "humidity": 55.0,
            "rainfall_probability": 15,
            "wind_speed": 12.0,
            "outlook": "Clear sky",
            "success": False
        }
