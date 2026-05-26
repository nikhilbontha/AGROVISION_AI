import tensorflow as tf
from PIL import Image
import io
import numpy as np
import json

disease_model = tf.keras.models.load_model("../ml_models/disease_detection/disease_model.h5")
with open("../ml_models/disease_detection/classes.json", "r") as f:
    disease_classes = json.load(f)

# Create a random noise image or load a specific one if available
img = Image.new('RGB', (224, 224), color = 'green')
img_array = tf.keras.preprocessing.image.img_to_array(img)
img_array = tf.expand_dims(img_array, 0) / 255.0

predictions = disease_model.predict(img_array)
print("Raw prediction sum:", np.sum(predictions[0]))
print("Raw prediction max:", np.max(predictions[0]))
print("Raw prediction max index:", np.argmax(predictions[0]))

score = tf.nn.softmax(predictions[0])
print("After double softmax sum:", np.sum(score))
print("After double softmax max:", np.max(score))
print("After double softmax max index:", np.argmax(score))

print("Predicted class:", disease_classes[np.argmax(predictions[0])])
