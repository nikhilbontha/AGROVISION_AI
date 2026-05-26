import os
import tensorflow as tf
from tensorflow.keras import layers, models

# Setup paths
base_dir = "dataset"

# Load dataset
batch_size = 16
img_height = 128
img_width = 128

train_ds = tf.keras.utils.image_dataset_from_directory(
  base_dir,
  validation_split=0.2,
  subset="training",
  seed=123,
  image_size=(img_height, img_width),
  batch_size=batch_size)

val_ds = tf.keras.utils.image_dataset_from_directory(
  base_dir,
  validation_split=0.2,
  subset="validation",
  seed=123,
  image_size=(img_height, img_width),
  batch_size=batch_size)

# The dataset will have classes alphabetically: 0: leaf_present, 1: no_leaf.
# We need to print class names to be sure.
class_names = train_ds.class_names
print(f"Class names: {class_names}")

# Build a simple model
model = models.Sequential([
  layers.Rescaling(1./255, input_shape=(img_height, img_width, 3)),
  layers.Conv2D(16, 3, padding='same', activation='relu'),
  layers.MaxPooling2D(),
  layers.Conv2D(32, 3, padding='same', activation='relu'),
  layers.MaxPooling2D(),
  layers.Flatten(),
  layers.Dense(64, activation='relu'),
  layers.Dense(1, activation='sigmoid') # Binary classification
])

model.compile(optimizer='adam',
              loss=tf.keras.losses.BinaryCrossentropy(),
              metrics=['accuracy'])

# Train for just 5 epochs for our placeholder
epochs=5
history = model.fit(
  train_ds,
  validation_data=val_ds,
  epochs=epochs
)

# Save the model
model.save("leaf_model.h5")
print("Saved placeholder leaf_model.h5")
