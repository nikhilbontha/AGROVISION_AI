import os
import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# --- Configuration & Paths ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = r"C:\Users\nikhi\tensorflow_datasets\downloads\extracted\ZIP.data.mend.com_publ-file_data_tywb_file_d565-c1rDQyRTmE0CqGGXmH53WlQp0NWefMfDW89aj1A0m5D_A\Plant_leave_diseases_dataset_without_augmentation"
OUTPUT_PLOTS_DIR = os.path.join(BASE_DIR, "plots")
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "disease_model.h5")

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
STAGE1_EPOCHS = 10
STAGE2_EPOCHS = 20

os.makedirs(OUTPUT_PLOTS_DIR, exist_ok=True)

def perform_eda():
    """Exploratory Data Analysis (EDA) for Image Data."""
    print("\n--- 1. Exploratory Data Analysis (EDA) ---")
    if not os.path.exists(DATASET_PATH):
        print(f"Dataset directory not found at {DATASET_PATH}!")
        return False
        
    classes = [c for c in os.listdir(DATASET_PATH) if os.path.isdir(os.path.join(DATASET_PATH, c))]
    class_counts = {}
    for cls in classes:
        cls_path = os.path.join(DATASET_PATH, cls)
        class_counts[cls] = len(os.listdir(cls_path))
            
    print(f"Found {len(classes)} disease image classes.")
    
    plt.figure(figsize=(15, 8))
    sns.barplot(x=list(class_counts.values()), y=list(class_counts.keys()), orient='h')
    plt.title('Disease Image Class Distribution')
    plt.xlabel('Number of Images')
    plt.ylabel('Disease Class')
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_PLOTS_DIR, 'class_distribution.png'))
    plt.close()
    
    print(f"Saved class distribution plot to {OUTPUT_PLOTS_DIR}/class_distribution.png")
    return True

def setup_preprocessing_and_augmentation():
    """Phase 2: Enhanced Real-World Field Data Augmentation Pipeline."""
    print("\n--- Phase 2: Setting up Advanced Real-World Data Augmentation ---")
    
    # Real-World Augmentation (Handles sunlight, cloud shadows, phone camera angles, blur)
    train_datagen = ImageDataGenerator(
        rotation_range=35,
        zoom_range=0.25,
        width_shift_range=0.25,
        height_shift_range=0.25,
        shear_range=0.15,
        horizontal_flip=True,
        vertical_flip=True,
        brightness_range=[0.6, 1.4], # Sunlight vs cloud shadow range
        channel_shift_range=25.0,    # Mobile phone camera sensor color shifts
        fill_mode='nearest',
        validation_split=0.2
    )

    val_datagen = ImageDataGenerator(
        validation_split=0.2
    )
    
    print("Real-world augmentation configured successfully.")
    return train_datagen, val_datagen

def build_fine_tuned_model(num_classes):
    """Phase 1: Build Two-Stage Deep Fine-Tuned EfficientNet Architecture."""
    print("\n--- Phase 1: Building EfficientNetB0 Backbone with Multi-Layer Fine-Tuning ---")
    
    base_model = EfficientNetB0(
        weights='imagenet', 
        include_top=False, 
        input_shape=(224, 224, 3)
    )
    
    # Initially freeze base model layers for Stage 1 warmup
    for layer in base_model.layers:
        layer.trainable = False
        
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dense(512, activation='swish')(x)
    x = Dropout(0.4)(x)
    x = Dense(256, activation='swish')(x)
    x = Dropout(0.3)(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    
    # Loss with Label Smoothing to prevent overconfident false predictions
    loss_fn = tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1)
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3), 
        loss=loss_fn, 
        metrics=['accuracy']
    )
    print("Compiled Stage 1 Warmup Model successfully.")
    return model, base_model

def plot_training_history(history):
    """Generates and saves Loss & Accuracy curves to OUTPUT_PLOTS_DIR."""
    if not history or not hasattr(history, 'history'):
        return
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    
    acc = history.history.get('accuracy', [])
    val_acc = history.history.get('val_accuracy', [])
    loss = history.history.get('loss', [])
    val_loss = history.history.get('val_loss', [])
    epochs = range(1, len(acc) + 1)
    
    ax1.plot(epochs, acc, 'b-o', label='Training Accuracy')
    ax1.plot(epochs, val_acc, 'g-o', label='Validation Accuracy')
    ax1.set_title('Stage 2 Training & Validation Accuracy')
    ax1.set_xlabel('Epochs')
    ax1.set_ylabel('Accuracy')
    ax1.legend()
    ax1.grid(True)
    
    ax2.plot(epochs, loss, 'b-o', label='Training Loss')
    ax2.plot(epochs, val_loss, 'g-o', label='Validation Loss')
    ax2.set_title('Stage 2 Training & Validation Loss')
    ax2.set_xlabel('Epochs')
    ax2.set_ylabel('Loss')
    ax2.legend()
    ax2.grid(True)
    
    plt.tight_layout()
    plot_path = os.path.join(OUTPUT_PLOTS_DIR, 'accuracy_loss_curves.png')
    plt.savefig(plot_path)
    plt.close()
    print(f"Saved accuracy & loss evaluation plot to {plot_path}")

def generate_evaluation_artifacts(model, val_generator, class_indices):
    """Generates Confusion Matrix heatmap artifact."""
    try:
        from sklearn.metrics import confusion_matrix
        val_generator.reset()
        predictions = model.predict(val_generator, steps=len(val_generator))
        y_pred = np.argmax(predictions, axis=1)
        y_true = val_generator.classes[:len(y_pred)]
        
        cm = confusion_matrix(y_true, y_pred)
        class_names = list(class_indices.keys())
        
        plt.figure(figsize=(16, 12))
        sns.heatmap(cm, annot=False, fmt='d', cmap='Blues', xticklabels=class_names, yticklabels=class_names)
        plt.title('Disease Model Confusion Matrix')
        plt.xlabel('Predicted Label')
        plt.ylabel('True Label')
        plt.xticks(rotation=90)
        plt.tight_layout()
        
        cm_path = os.path.join(OUTPUT_PLOTS_DIR, 'confusion_matrix.png')
        plt.savefig(cm_path)
        plt.close()
        print(f"Saved confusion matrix plot to {cm_path}")
    except Exception as e:
        print(f"Evaluation matrix plot generation skipped: {e}")

def train_model():
    """Main Two-Stage Training Pipeline."""
    if not perform_eda():
        return

    train_datagen, val_datagen = setup_preprocessing_and_augmentation()

    print("\n--- Loading Dataset Generators ---")
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
    
    json_path = os.path.join(BASE_DIR, "class_indices.json")
    with open(json_path, "w") as f:
        json.dump(class_indices, f, indent=4)
    print(f"Saved class mapping to {json_path}")
    
    model, base_model = build_fine_tuned_model(num_classes)
    
    # Stage 1: Train classification head
    print("\n--- Stage 1: Training Classification Head (Warmup) ---")
    callbacks_stage1 = [
        EarlyStopping(patience=3, restore_best_weights=True, monitor='val_accuracy'),
        ReduceLROnPlateau(factor=0.2, patience=2, min_lr=1e-5, monitor='val_accuracy')
    ]

    model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=STAGE1_EPOCHS,
        callbacks=callbacks_stage1
    )
    
    # Stage 2: Deep Fine-Tuning (Unfreeze top 50 convolutional layers)
    print("\n--- Stage 2: Unfreezing Top 50 Layers for Deep End-to-End Fine-Tuning ---")
    for layer in base_model.layers[-50:]:
        if not isinstance(layer, BatchNormalization):
            layer.trainable = True
            
    loss_fn = tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5), # Low learning rate for fine-tuning
        loss=loss_fn,
        metrics=['accuracy']
    )
    
    callbacks_stage2 = [
        EarlyStopping(patience=5, restore_best_weights=True, monitor='val_accuracy'),
        ReduceLROnPlateau(factor=0.2, patience=2, min_lr=1e-7, monitor='val_accuracy'),
        ModelCheckpoint(MODEL_SAVE_PATH, save_best_only=True, monitor='val_accuracy')
    ]

    print("Starting Stage 2 Fine-Tuning Epochs...")
    history = model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=STAGE2_EPOCHS,
        callbacks=callbacks_stage2
    )
    
    # Generate Evaluation Artifacts
    plot_training_history(history)
    generate_evaluation_artifacts(model, val_generator, class_indices)
    
    print(f"\n--- SUCCESS: Upgraded Model Saved to {MODEL_SAVE_PATH} ---")

if __name__ == "__main__":
    train_model()

