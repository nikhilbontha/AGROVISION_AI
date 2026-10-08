# AgroVision AI - Project Documentation

## 1. Project Overview
- **Project Title:** AgroVision AI
- **Domain:** Agriculture Technology (AgriTech) & Artificial Intelligence
- **ML Type (Supervised / Unsupervised):** Supervised Learning (Classification & Regression)
- **Algorithm(s) Used:** 
  - **EfficientNetB0** (Convolutional Neural Network) for Image Classification (Disease Detection).
  - **Random Forest Regressor** (Ensemble Method) for Yield Prediction.

## 2. Problem Statement
- **What problem is being solved?:** Unpredictable crop yields due to environmental factors, and severe crop loss caused by undetected or late-diagnosed plant diseases.
- **Why this problem is important?:** Farmers suffer huge economic losses globally due to crop diseases and unpredictable environmental changes. Early detection and accurate forecasting are critical for global food security and sustainable farming.
- **How ML helps solve it?:** Machine Learning enables real-time, automated analysis of crop leaf images to instantly identify diseases. Furthermore, it leverages historical and environmental data to predict crop yield, assisting farmers in making timely, data-driven decisions.

## 3. Objectives
- **Analyze the given data:** Perform Exploratory Data Analysis (EDA) on historical crop yield data (climate, soil, crop type) and agricultural image datasets.
- **Apply ML technique:** Train deep learning CNN models (EfficientNetB0) for image-based disease detection and ensemble ML models (Random Forest) for yield forecasting.
- **Extract insights / predictions:** Provide a unified SaaS dashboard where farmers can receive instant disease diagnoses with confidence scores and future yield estimates based on live environmental data.

## 4. Dataset Description
- **Data source (Kaggle / Synthetic / Govt):** 
  - PlantVillage Dataset (from Kaggle) for disease images.
  - Government-sourced/Synthetic agricultural data for Crop Yield (CSV).
- **No. of records & features:** 
  - **Crop Yield Dataset:** ~1,500 records. Features include Temperature, Humidity, Rainfall, Soil Type, Crop Type, Area, and Yield.
  - **Plant Disease Dataset:** Thousands of augmented leaf images categorized into distinct disease classes.
- **Brief feature description:**
  - **Images:** RGB images of healthy and diseased plant leaves (resized to 224x224).
  - **Yield Features:** Continuous weather metrics (Temperature, Humidity, Rainfall), categorical attributes (Soil Type, Crop Type), numerical scale (Area), and the continuous target label (Yield).

## 5. Data Analysis & Preprocessing
- **Key observations from data:** Non-linear relationships between weather conditions and yield. Certain diseases appear visually similar, requiring robust deep feature extraction.
- **Missing value handling:** Dropped null values (`dropna()`) in tabular yield data to ensure model stability.
- **Feature scaling / encoding:** 
  - Used One-Hot Encoding (`get_dummies(drop_first=True)`) for categorical variables like 'Soil_Type' and 'Crop_Type'.
  - Applied image normalization (1/255 scaling) and extensive data augmentation (rotation, zoom, shifts, flips, brightness adjustments) for image robustness.

## 6. ML Methodology
- **ML type selection reason:** Supervised Learning is optimal because the system relies on historical labeled data—both specific disease classifications (image-label pairs) and historical yield outcomes.
- **Algorithm selection reason:** 
  - **EfficientNetB0:** Chosen for its superior balance of high accuracy and computational efficiency, making it ideal for web and mobile APIs.
  - **Random Forest Regressor:** Chosen because it handles non-linear agricultural data well, prevents overfitting through ensemble bagging, and requires minimal hyperparameter tuning.
- **Model training approach:** 
  - **Disease Model:** Utilized Transfer Learning (freezing base layers, adding a GlobalAveragePooling2D, Dense, and Dropout layers) with `EarlyStopping` and `ReduceLROnPlateau` callbacks.
  - **Yield Model:** Used an 80-20 train-test split to train the regressor.

## 7. Results & Evaluation
- **Output (clusters / predictions):** 
  - **Disease Detection:** Predicts the specific plant disease name along with a confidence percentage (Softmax output).
  - **Yield Prediction:** Provides a continuous numerical prediction for crop yield based on input conditions.
- **Evaluation method used:** 
  - **Disease Detection:** Categorical Crossentropy (Loss) and Accuracy.
  - **Yield Prediction:** Mean Squared Error (MSE) and R² Score.
- **Key insights:** Extensive data augmentation significantly reduced overfitting for the disease model. The yield model demonstrated strong predictive capability, highlighting that rainfall and crop type combinations heavily dictate agricultural output.

## 8. Use Case
- **Real-world / college / business use:** Designed as a professional, production-ready SaaS platform for farmers, agricultural extension workers, and agritech businesses to aid in precision agriculture.
- **How results help decision-making:** Farmers can apply targeted pesticides immediately upon disease identification instead of broad-spectrum spraying, saving costs and reducing environmental harm. Yield predictions assist in supply chain logistics and market planning.

## 9. Tools Used
- **Python:** Core programming language.
- **ML libraries:** TensorFlow/Keras (EfficientNetB0, Image Augmentation), Scikit-Learn (Random Forest, Metrics), Pandas, NumPy.
- **Deployment tools (if any):** FastAPI (Backend API), React/Vite (Frontend Dashboard), Uvicorn, and integrations with third-party services like the Open-Meteo API.

## 10. Conclusion & Future Scope
- **Summary of results:** Successfully built an integrated, real-time AI agricultural assistant capable of diagnosing plant health and forecasting yield with high accuracy and a modern web interface.
- **Limitations:** Heavily dependent on the quality/lighting of user-uploaded images and the accuracy of third-party weather API data.
- **Future improvements:** Expanding the dataset to include more regional crops and rare diseases, integrating live IoT soil sensor data directly into the prediction pipeline, and adding multi-lingual voice/audio support for better accessibility among rural farmers.
