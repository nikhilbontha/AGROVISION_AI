import os
import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# --- Configuration & Paths ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Note: Using the provided path for the dataset
DATASET_PATH = r"C:\Users\nikhi\tensorflow_datasets\downloads\extracted\ZIP.data.mend.com_publ-file_data_tywb_file_d565-c1rDQyRTmE0CqGGXmH53WlQp0NWefMfDW89aj1A0m5D_A\Plant_leave_diseases_dataset_without_augmentation"
OUTPUT_PLOTS_DIR = os.path.join(BASE_DIR, "plots")
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "disease_model.h5")

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 30

os.makedirs(OUTPUT_PLOTS_DIR, exist_ok=True)

def perform_eda():
    """Exploratory Data Analysis (EDA) for Image Data."""
    print("\n--- 1. Exploratory Data Analysis (EDA) ---")
    if not os.path.exists(DATASET_PATH):
        print(f"Dataset not found at {DATASET_PATH}!")
        return False
        
    # Count images per class
    classes = os.listdir(DATASET_PATH)
    class_counts = {}
    for cls in classes:
        cls_path = os.path.join(DATASET_PATH, cls)
        if os.path.isdir(cls_path):
            class_counts[cls] = len(os.listdir(cls_path))
            
    print(f"Found {len(classes)} classes.")
    
    # Plot class distribution
    plt.figure(figsize=(15, 8))
    sns.barplot(x=list(class_counts.values()), y=list(class_counts.keys()), orient='h')
    plt.title('Disease Image Class Distribution')
    plt.xlabel('Number of Images')
    plt.ylabel('Disease Class')
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_PLOTS_DIR, 'class_distribution.png'))
    plt.close()
    
    print(f"EDA: Saved class distribution plot to {OUTPUT_PLOTS_DIR}/class_distribution.png")
    return True

def setup_preprocessing_and_augmentation():
    """Data Preprocessing, Augmentation, and Handling 'Missing/Corrupt' Data via cleaning."""
    print("\n--- 2. Data Preprocessing & Augmentation ---")
    # For image data, 'preprocessing' involves resizing and normalization (scaling pixels 0-255).
    # 'Augmentation' acts as our feature engineering by creating variations of images to prevent overfitting.
    
    # Training Data Generator with Augmentation
    train_datagen = ImageDataGenerator(
        rotation_range=25,
        zoom_range=0.2,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2],
        fill_mode='nearest',
        validation_split=0.2 # 20% validation split
    )

    # Validation Data Generator (Only Preprocessing, NO Augmentation)
    val_datagen = ImageDataGenerator(
        validation_split=0.2
    )
    
    print("Preprocessing: Resizing all images to 224x224 and applying data augmentation...")
    return train_datagen, val_datagen

def build_model(num_classes):
    """Build the Convolutional Neural Network architecture."""
    print("\n--- 3. Model Building ---")
    # EfficientNetB0 includes built-in preprocessing layers
    base_model = EfficientNetB0(
        weights='imagenet', 
        include_top=False, 
        input_shape=(224, 224, 3)
    )
    
    # Freeze the base model to retain pre-trained features
    for layer in base_model.layers:
        layer.trainable = False
        
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.5)(x) # Dropout acts as regularization to prevent overfitting
    predictions = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    print("Compiled EfficientNetB0 model successfully.")
    return model

def train_model():
    """Main training pipeline execution."""
    if not perform_eda():
        return

    train_datagen, val_datagen = setup_preprocessing_and_augmentation()

    print("\n--- 4. Loading Data ---")
    train_generator = train_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        seed=123
    )

    val_generator = val_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        seed=123
    )

    class_indices = train_generator.class_indices
    num_classes = len(class_indices)
    
    # Save exact class map to JSON
    json_path = os.path.join(BASE_DIR, "class_indices.json")
    with open(json_path, "w") as f:
        json.dump(class_indices, f, indent=4)
    print(f"Saved class mapping to {json_path}")
    
    model = build_model(num_classes)
    
    print("\n--- 5. Training Model ---")
    callbacks = [
        EarlyStopping(patience=5, restore_best_weights=True, monitor='val_accuracy'),
        ReduceLROnPlateau(factor=0.2, patience=3, min_lr=1e-6, monitor='val_accuracy'),
        ModelCheckpoint(MODEL_SAVE_PATH, save_best_only=True, monitor='val_accuracy')
    ]

    print("Starting training epochs...")
    history = model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=EPOCHS,
        callbacks=callbacks
    )
    
    print("\n--- 6. Saving the Model (.h5 file) ---")
    # The ModelCheckpoint callback already saves the best model as an .h5 file.
    # .h5 (Hierarchical Data Format) is the Deep Learning equivalent of a .pkl file.
    # It contains the model architecture, weights, and optimizer state.
    print(f"SUCCESS: Model saved as an H5 file (.h5)")
    print(f"Location: {MODEL_SAVE_PATH}")
    print("You can now load this file using tf.keras.models.load_model()")

if __name__ == "__main__":
    train_model()
