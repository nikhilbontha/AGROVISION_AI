# AgroVision AI – Model Training Guide

This guide explains how to train the Machine Learning models yourself using the scripts provided in the `ml_models` folder.

## 1. Yield Prediction Model

We have included a synthetic dataset generator that creates a highly realistic dataset based on agronomic logic.

### Steps to Train:
1. Open your terminal and navigate to the project workspace:
   ```bash
   cd ml_models/yield_prediction
   ```
2. Run the dataset generator. This creates a 1,500-row `crop_yield.csv` in the `datasets` folder:
   ```bash
   python generate_data.py
   ```
3. Run the training script:
   ```bash
   python train.py
   ```
   *This trains a Random Forest Regressor using scikit-learn and saves the trained model as `yield_model.pkl`.*
4. **Integration**: The FastAPI backend automatically detects `yield_model.pkl`. The next time you make a yield prediction from the UI, it will use the real model instead of the mock fallback!

---

## 2. Crop Disease Detection Model

Training an image classification model takes significant time and computational power. We use **TensorFlow/Keras** with **MobileNetV2** transfer learning.

### Steps to Train:
1. Navigate to the disease detection folder:
   ```bash
   cd ml_models/disease_detection
   ```
2. Run the training script:
   ```bash
   python train.py
   ```
   *Note: This script uses `tensorflow_datasets` (TFDS) to automatically download the massive PlantVillage dataset (~800MB) directly into your `~/tensorflow_datasets` directory on your first run.*
3. The script will train for 5 epochs (configurable in `train.py`). If you are not using a GPU, this may take several hours.
4. Once training finishes, it saves the model as `disease_model.h5`.
5. **Integration**: The FastAPI backend will detect `disease_model.h5` and start using the real CNN model to predict the uploaded leaf images!

---

## 3. How the Backend Uses the Models

Open `backend/app/routes/predict.py`. You will see logic like:
```python
if os.path.exists(YIELD_MODEL_PATH):
    yield_model = joblib.load(YIELD_MODEL_PATH)
```
The backend lazily loads the models upon startup. If it doesn't find them, it uses a mock response so that the application is always functional for UI/UX testing. 
Once you complete the training steps above, restart your FastAPI backend (`uvicorn app.main:app --reload`), and your real models will be live!
