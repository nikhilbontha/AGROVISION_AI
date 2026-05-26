import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

# --- Configuration & Paths ---
# Define absolute or relative paths. Using relative to the script for portability.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "../../datasets/crop_yield.csv")
OUTPUT_PLOTS_DIR = os.path.join(BASE_DIR, "plots")
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "yield_model.pkl")

# Ensure plots directory exists
os.makedirs(OUTPUT_PLOTS_DIR, exist_ok=True)

def load_data():
    """Loads the raw dataset."""
    print("--- 1. Data Loading ---")
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}. Please check the path.")
    df = pd.read_csv(DATASET_PATH)
    print(f"Dataset loaded successfully with shape: {df.shape}")
    return df

def perform_eda(df):
    """Exploratory Data Analysis (EDA) - Visualizing data patterns."""
    print("\n--- 2. Exploratory Data Analysis (EDA) ---")
    
    # 1. Distribution of Target Variable (Yield)
    plt.figure(figsize=(8, 5))
    sns.histplot(df['Yield'], kde=True, bins=30, color='blue')
    plt.title('Distribution of Crop Yield')
    plt.xlabel('Yield (tons/hectare)')
    plt.ylabel('Frequency')
    plt.savefig(os.path.join(OUTPUT_PLOTS_DIR, 'yield_distribution.png'))
    plt.close()
    
    # 2. Correlation Heatmap for numerical features
    plt.figure(figsize=(8, 6))
    corr_matrix = df.select_dtypes(include=[np.number]).corr()
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', fmt=".2f")
    plt.title('Correlation Matrix of Numerical Features')
    plt.savefig(os.path.join(OUTPUT_PLOTS_DIR, 'correlation_matrix.png'))
    plt.close()
    
    print(f"EDA plots (yield_distribution.png, correlation_matrix.png) saved to: {OUTPUT_PLOTS_DIR}")

def feature_engineering(df):
    """Creates new features to help the model learn better."""
    print("\n--- 3. Feature Engineering ---")
    # Feature Engineering: Creating 'THI' (Temperature Humidity Index)
    # This is a domain-specific feature representing heat stress.
    df['THI'] = df['Temperature'] - (0.55 - 0.0055 * df['Humidity']) * (df['Temperature'] - 14.5)
    print("Engineered new feature: 'THI' (Temperature Humidity Index)")
    return df

def build_preprocessing_pipeline():
    """Creates a pipeline to handle missing values and scale/encode data."""
    # Define which columns are numerical vs categorical
    numeric_features = ['Temperature', 'Humidity', 'Rainfall', 'Area', 'THI']
    categorical_features = ['Soil_Type', 'Crop_Type']

    # Preprocessing for numerical data: Impute missing values with median, then scale
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    # Preprocessing for categorical data: Impute missing values, then One-Hot Encode
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', drop='first'))
    ])

    # Combine both transformers into a ColumnTransformer
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])
    return preprocessor

def train_model():
    """Main function to run the ML Pipeline."""
    # 1. Load Data
    df = load_data()
    
    # 2. EDA
    perform_eda(df)
    
    # 3. Feature Engineering
    df = feature_engineering(df)
    
    # 4. Data Splitting
    X = df.drop('Yield', axis=1)
    y = df['Yield']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 5. Build full model pipeline (Preprocessing + Random Forest Regressor)
    print("\n--- 4. Model Training ---")
    preprocessor = build_preprocessing_pipeline()
    
    # We combine the preprocessor and the machine learning algorithm into a single pipeline
    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    # Train the model
    print("Training Random Forest Regressor...")
    model_pipeline.fit(X_train, y_train)
    
    # 6. Evaluation
    print("\n--- 5. Model Evaluation ---")
    predictions = model_pipeline.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    print(f"Mean Squared Error (MSE): {mse:.2f}")
    print(f"R-squared (R2) Score: {r2:.2f}")
    
    # 7. Saving the Model as a .pkl file
    print("\n--- 6. Saving the Model ---")
    # joblib.dump serializes the Python object (our trained model pipeline) into a file.
    # This includes both the preprocessing steps and the Random Forest weights.
    joblib.dump(model_pipeline, MODEL_SAVE_PATH)
    print(f"SUCCESS: Model saved as a Pickle file (.pkl)")
    print(f"Location: {MODEL_SAVE_PATH}")
    print("You can now load this file in the FastAPI backend using joblib.load()")

if __name__ == "__main__":
    train_model()
