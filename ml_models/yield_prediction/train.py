import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

DATASET_PATH = "../../datasets/crop_yield.csv"

def train():
    if not os.path.exists(DATASET_PATH):
        print(f"Dataset not found at {DATASET_PATH}. Please download it.")
        return

    df = pd.read_csv(DATASET_PATH)
    
    # Simple preprocessing example
    # Assuming columns: Temperature, Humidity, Rainfall, Soil_Type, Crop_Type, Area, Yield
    
    # Drop NAs
    df = df.dropna()
    
    # Categorical encoding
    df = pd.get_dummies(df, columns=['Soil_Type', 'Crop_Type'], drop_first=True)
    
    X = df.drop('Yield', axis=1)
    y = df['Yield']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    
    print(f"Model trained. MSE: {mse:.2f}, R2 Score: {r2:.2f}")
    
    # Save the model
    joblib.dump(model, "yield_model.pkl")
    print("Model saved as yield_model.pkl")

if __name__ == "__main__":
    train()
