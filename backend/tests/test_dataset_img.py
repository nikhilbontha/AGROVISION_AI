import tensorflow as tf
from PIL import Image
import numpy as np
import json
import glob
import random

disease_model = tf.keras.models.load_model("../ml_models/disease_detection/disease_model.h5")
with open("../ml_models/disease_detection/classes.json", "r") as f:
    disease_classes = json.load(f)

# Pick a random Corn Northern Leaf Blight image
img_path = glob.glob(r"C:\Users\nikhi\tensorflow_datasets\downloads\extracted\*\Plant_leave_diseases_dataset_without_augmentation\Corn___Northern_Leaf_Blight\*.JPG")[0]
print("Testing on:", img_path)

image = Image.open(img_path).convert('RGB')
image = image.resize((224, 224))
img_array = tf.keras.preprocessing.image.img_to_array(image)
img_array = tf.expand_dims(img_array, 0) / 255.0

predictions = disease_model.predict(img_array)
raw_score = predictions[0]
class_idx = np.argmax(raw_score)
confidence = 100 * np.max(raw_score)

print(f"Predicted class: {disease_classes[class_idx]} with confidence {confidence:.2f}%")
