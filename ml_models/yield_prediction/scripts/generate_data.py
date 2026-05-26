import pandas as pd
import numpy as np
import os

def generate_dataset():
    # Set random seed for reproducibility
    np.random.seed(42)
    
    num_samples = 1500
    
    # Generate random features
    temperature = np.random.uniform(15.0, 40.0, num_samples) # Celsius
    humidity = np.random.uniform(30.0, 90.0, num_samples) # Percentage
    rainfall = np.random.uniform(50.0, 300.0, num_samples) # mm
    area = np.random.uniform(1.0, 50.0, num_samples) # Hectares
    
    soil_types = ['Loamy', 'Clay', 'Sandy', 'Black', 'Red']
    crop_types = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane']
    
    soil = np.random.choice(soil_types, num_samples)
    crop = np.random.choice(crop_types, num_samples)
    
    # Base yield logic to make the dataset "learnable"
    # Base yield in Tons/Hectare
    base_yields = {'Wheat': 3.0, 'Rice': 4.0, 'Maize': 5.0, 'Cotton': 2.0, 'Sugarcane': 70.0}
    soil_multipliers = {'Loamy': 1.2, 'Clay': 1.0, 'Sandy': 0.8, 'Black': 1.3, 'Red': 0.9}
    
    yield_values = []
    for i in range(num_samples):
        # Base factor
        c_yield = base_yields[crop[i]] * soil_multipliers[soil[i]]
        
        # Weather factor (Optimal: Temp 25, Hum 60, Rain 150)
        temp_penalty = abs(temperature[i] - 25) * 0.05
        hum_penalty = abs(humidity[i] - 60) * 0.02
        rain_penalty = abs(rainfall[i] - 150) * 0.01
        
        final_yield = c_yield - temp_penalty - hum_penalty - rain_penalty
        final_yield = max(0.5, final_yield + np.random.normal(0, 0.5)) # Add some noise
        yield_values.append(final_yield)
    
    df = pd.DataFrame({
        'Temperature': temperature,
        'Humidity': humidity,
        'Rainfall': rainfall,
        'Soil_Type': soil,
        'Crop_Type': crop,
        'Area': area,
        'Yield': yield_values
    })
    
    # Ensure datasets directory exists
    os.makedirs('../../datasets', exist_ok=True)
    df.to_csv('../../datasets/crop_yield.csv', index=False)
    print(f"Generated synthetic dataset with {num_samples} rows at ../../datasets/crop_yield.csv")

if __name__ == '__main__':
    generate_dataset()
