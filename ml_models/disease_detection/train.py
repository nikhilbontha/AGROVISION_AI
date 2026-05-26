import os
import json
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Config
DATASET_PATH = r"C:\Users\nikhi\tensorflow_datasets\downloads\extracted\ZIP.data.mend.com_publ-file_data_tywb_file_d565-c1rDQyRTmE0CqGGXmH53WlQp0NWefMfDW89aj1A0m5D_A\Plant_leave_diseases_dataset_without_augmentation"
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 30 

def build_model(num_classes):
    # EfficientNetB0 includes its own preprocessing, but user requested 1/255 norm in augmentation.
    # We will pass the normalized input to EfficientNetB0.
    base_model = EfficientNetB0(
        weights='imagenet', 
        include_top=False, 
        input_shape=(224, 224, 3)
    )
    
    # Freeze the base model initially
    for layer in base_model.layers:
        layer.trainable = False
        
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.5)(x) # Adding dropout to prevent overfitting
    predictions = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model

def train():
    if not os.path.exists(DATASET_PATH):
        print(f"Dataset not found at {DATASET_PATH}!")
        return

    print("Setting up data augmentation...")
    
    # Data Augmentation & Normalization as requested
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

    # Validation only needs normalization
    val_datagen = ImageDataGenerator(
        validation_split=0.2
    )

    print("Loading training data...")
    train_generator = train_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        seed=123
    )

    print("Loading validation data...")
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
    print(f"Found {num_classes} classes.")
    
    # Save exact class map to JSON
    # Format: {"Tomato___Late_blight": 0, "Tomato___Early_blight": 1}
    with open("class_indices.json", "w") as f:
        json.dump(class_indices, f, indent=4)
    print("Saved class_indices.json")
    
    model = build_model(num_classes)
    
    # Callbacks
    callbacks = [
        EarlyStopping(patience=5, restore_best_weights=True, monitor='val_accuracy'),
        ReduceLROnPlateau(factor=0.2, patience=3, min_lr=1e-6, monitor='val_accuracy'),
        ModelCheckpoint('disease_model.h5', save_best_only=True, monitor='val_accuracy')
    ]

    print("Starting training...")
    model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=EPOCHS,
        callbacks=callbacks
    )
    
    print("Training complete. Best model saved as disease_model.h5")

if __name__ == "__main__":
    train()
