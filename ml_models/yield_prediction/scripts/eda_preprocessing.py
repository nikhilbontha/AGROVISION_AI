import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import os

# Set paths
DATASET_PATH = "../../../datasets/crop_yield.csv"
OUTPUT_DIR = "../plots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def load_and_corrupt_data():
    """Loads data and intentionally introduces null values for demonstration."""
    print("--- 1. Data Loading and Introduction of Null Values ---")
    df = pd.read_csv(DATASET_PATH)
    
    # Introduce random null values (simulate real-world messy data)
    np.random.seed(42)
    # Add nulls to Temperature (5%)
    df.loc[df.sample(frac=0.05).index, 'Temperature'] = np.nan
    # Add nulls to Soil_Type (3%)
    df.loc[df.sample(frac=0.03).index, 'Soil_Type'] = np.nan
    
    print(f"Data shape: {df.shape}")
    print("Null values introduced for demonstration:\n", df.isnull().sum())
    return df

def perform_eda(df):
    """Performs Exploratory Data Analysis."""
    print("\n--- 2. Exploratory Data Analysis (EDA) ---")
    
    # Basic statistics
    print("\nDescriptive Statistics:")
    print(df.describe())
    
    # Distribution of Target Variable (Yield)
    plt.figure(figsize=(8, 5))
    sns.histplot(df['Yield'], kde=True, bins=30)
    plt.title('Distribution of Crop Yield')
    plt.savefig(os.path.join(OUTPUT_DIR, 'yield_distribution.png'))
    plt.close()
    
    # Correlation Heatmap for numerical features
    plt.figure(figsize=(8, 6))
    corr_matrix = df.select_dtypes(include=[np.number]).corr()
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', fmt=".2f")
    plt.title('Correlation Matrix of Numerical Features')
    plt.savefig(os.path.join(OUTPUT_DIR, 'correlation_matrix.png'))
    plt.close()
    
    # Boxplot of Yield vs Crop_Type
    plt.figure(figsize=(10, 6))
    sns.boxplot(x='Crop_Type', y='Yield', data=df)
    plt.title('Crop Yield by Crop Type')
    plt.xticks(rotation=45)
    plt.savefig(os.path.join(OUTPUT_DIR, 'yield_by_crop.png'))
    plt.close()
    
    print(f"EDA plots saved to {OUTPUT_DIR}")

def preprocess_and_feature_engineer(df):
    """Builds a pipeline for imputing, encoding, and scaling features."""
    print("\n--- 3. Data Preprocessing and Feature Engineering ---")
    
    # Feature Engineering: Creating a new feature (e.g., Temperature Humidity Index)
    # THI is a basic heat stress index
    df['THI'] = df['Temperature'] - (0.55 - 0.0055 * df['Humidity']) * (df['Temperature'] - 14.5)
    print("Engineered new feature: 'THI' (Temperature Humidity Index)")

    # Separate features and target
    X = df.drop('Yield', axis=1)
    y = df['Yield']

    # Identify numerical and categorical columns
    numeric_features = ['Temperature', 'Humidity', 'Rainfall', 'Area', 'THI']
    categorical_features = ['Soil_Type', 'Crop_Type']

    # Preprocessing pipelines for both numeric and categorical data
    
    # For numeric: Impute missing values with median, then scale
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')), # Handles injected NaN in Temperature
        ('scaler', StandardScaler())                   # Standardizes features (mean=0, variance=1)
    ])

    # For categorical: Impute missing values with most frequent, then One-Hot Encode
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')), # Handles injected NaN in Soil_Type
        ('onehot', OneHotEncoder(handle_unknown='ignore', drop='first')) # Converts text categories to numbers
    ])

    # Combine transformers into a preprocessor using ColumnTransformer
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])

    # Split data into training and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("\nApplying Preprocessing Pipeline to Training Data...")
    # Fit the preprocessor on the training data and transform it
    X_train_processed = preprocessor.fit_transform(X_train)
    
    # Only transform the test data (prevents data leakage)
    X_test_processed = preprocessor.transform(X_test)
    
    print(f"Original X_train shape: {X_train.shape}")
    print(f"Processed X_train shape: {X_train_processed.shape} (Note the increased columns due to One-Hot Encoding)")
    
    return X_train_processed, X_test_processed, y_train, y_test, preprocessor

if __name__ == "__main__":
    # 1. Load Data
    df_raw = load_and_corrupt_data()
    
    # 2. EDA
    perform_eda(df_raw)
    
    # 3. Preprocess
    X_train_p, X_test_p, y_train, y_test, preprocessor_model = preprocess_and_feature_engineer(df_raw)
    
    print("\nPipeline execution complete! Data is now ready for modeling.")
