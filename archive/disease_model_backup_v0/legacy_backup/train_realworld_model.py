"""
Real-World Crop Disease Model Fine-Tuning & Training Pipeline.
Uses Transfer Learning with EfficientNetB0 / ResNet-50 for high accuracy on real-world field images.
"""

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.preprocessing.image import ImageDataGenerator

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "disease_model.h5")
CLASSES_SAVE_PATH = os.path.join(BASE_DIR, "class_indices.json")

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 25

def train_real_world_model(dataset_dir):
    """
    Trains / Fine-tunes deep neural network model on real-world crop disease images.
    """
    if not os.path.exists(dataset_dir):
        print(f"Error: Dataset directory '{dataset_dir}' not found.")
        return False

    print(f"Loading dataset from: {dataset_dir}")

    # Data Augmentation for Real-World Field Conditions
    train_datagen = ImageDataGenerator(
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.15,
        zoom_range=0.2,
        horizontal_flip=True,
        vertical_flip=False,
        brightness_range=[0.7, 1.3],
        fill_mode='nearest',
        validation_split=0.2
    )

    val_datagen = ImageDataGenerator(validation_split=0.2)

    train_gen = train_datagen.flow_from_directory(
        dataset_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )

    val_gen = val_datagen.flow_from_directory(
        dataset_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )

    class_indices = train_gen.class_indices
    num_classes = len(class_indices)

    with open(CLASSES_SAVE_PATH, "w") as f:
        json.dump(class_indices, f, indent=4)
    print(f"Saved class index map to {CLASSES_SAVE_PATH}")

    # Transfer Learning with Pretrained EfficientNetB0
    base_model = EfficientNetB0(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    
    # Unfreeze top layers for fine-tuning real-world features
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dense(512, activation='relu')(x)
    x = Dropout(0.4)(x)
    predictions = Dense(num_classes, activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    callbacks = [
        EarlyStopping(monitor='val_accuracy', patience=5, restore_best_weights=True),
        ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=3, min_lr=1e-6),
        ModelCheckpoint(MODEL_SAVE_PATH, monitor='val_accuracy', save_best_only=True)
    ]

    print("Starting Deep Learning Model Training...")
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS,
        callbacks=callbacks
    )

    print(f"Model successfully saved to {MODEL_SAVE_PATH}")
    return True

if __name__ == "__main__":
    import sys
    dataset_folder = sys.argv[1] if len(sys.argv) > 1 else "../datasets/real_world_crops"
    train_real_world_model(dataset_folder)
