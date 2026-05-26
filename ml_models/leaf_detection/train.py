import os
import tensorflow as tf
from tensorflow.keras import layers, models
import matplotlib.pyplot as plt
import seaborn as sns

# --- Configuration & Paths ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "dataset")
OUTPUT_PLOTS_DIR = os.path.join(BASE_DIR, "plots")
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "leaf_model.h5")

os.makedirs(OUTPUT_PLOTS_DIR, exist_ok=True)

BATCH_SIZE = 16
IMG_HEIGHT = 128
IMG_WIDTH = 128
EPOCHS = 5

def perform_eda():
    """Exploratory Data Analysis (EDA) for Leaf Detection Data."""
    print("\n--- 1. Exploratory Data Analysis (EDA) ---")
    if not os.path.exists(DATASET_PATH):
        print(f"Dataset not found at {DATASET_PATH}!")
        print("Please ensure the 'dataset' folder exists with subfolders for classes.")
        return False
        
    classes = os.listdir(DATASET_PATH)
    class_counts = {}
    for cls in classes:
        cls_path = os.path.join(DATASET_PATH, cls)
        if os.path.isdir(cls_path):
            class_counts[cls] = len(os.listdir(cls_path))
            
    print(f"Found {len(classes)} classes: {list(class_counts.keys())}")
    
    # Plot class distribution if there are classes
    if class_counts:
        plt.figure(figsize=(8, 5))
        sns.barplot(x=list(class_counts.values()), y=list(class_counts.keys()), orient='h')
        plt.title('Leaf Presence Class Distribution')
        plt.xlabel('Number of Images')
        plt.ylabel('Class')
        plt.tight_layout()
        plt.savefig(os.path.join(OUTPUT_PLOTS_DIR, 'class_distribution.png'))
        plt.close()
        print(f"EDA: Saved class distribution plot to {OUTPUT_PLOTS_DIR}/class_distribution.png")
    
    return True

def setup_preprocessing():
    """Data Preprocessing using tf.data APIs."""
    print("\n--- 2. Data Preprocessing & Loading ---")
    # Instead of ImageDataGenerator, this pipeline uses the newer tf.keras.utils.image_dataset_from_directory
    # which efficiently loads data in batches.
    print(f"Resizing images to {IMG_HEIGHT}x{IMG_WIDTH} and batching...")
    
    train_ds = tf.keras.utils.image_dataset_from_directory(
      DATASET_PATH,
      validation_split=0.2,
      subset="training",
      seed=123,
      image_size=(IMG_HEIGHT, IMG_WIDTH),
      batch_size=BATCH_SIZE
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
      DATASET_PATH,
      validation_split=0.2,
      subset="validation",
      seed=123,
      image_size=(IMG_HEIGHT, IMG_WIDTH),
      batch_size=BATCH_SIZE
    )
    
    class_names = train_ds.class_names
    print(f"Class names detected by dataset loader: {class_names}")
    
    # Performance optimization
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)
    
    return train_ds, val_ds

def build_model():
    """Build the binary classification model."""
    print("\n--- 3. Model Building ---")
    
    # Notice the first layer is Rescaling: this is our normalization step
    # It converts pixel values from [0, 255] to [0, 1].
    model = models.Sequential([
      layers.Rescaling(1./255, input_shape=(IMG_HEIGHT, IMG_WIDTH, 3)),
      layers.Conv2D(16, 3, padding='same', activation='relu'),
      layers.MaxPooling2D(),
      layers.Conv2D(32, 3, padding='same', activation='relu'),
      layers.MaxPooling2D(),
      layers.Flatten(),
      layers.Dense(64, activation='relu'),
      layers.Dense(1, activation='sigmoid') # Binary classification (0 or 1)
    ])

    model.compile(optimizer='adam',
                  loss=tf.keras.losses.BinaryCrossentropy(),
                  metrics=['accuracy'])
    print("Compiled custom CNN model successfully.")
    return model

def train_model():
    """Main training pipeline execution."""
    if not perform_eda():
        return
        
    train_ds, val_ds = setup_preprocessing()
    
    model = build_model()
    
    print("\n--- 4. Training Model ---")
    print(f"Starting training for {EPOCHS} epochs...")
    history = model.fit(
      train_ds,
      validation_data=val_ds,
      epochs=EPOCHS
    )
    
    print("\n--- 5. Saving the Model (.h5 file) ---")
    # For deep learning models, we save as H5 instead of Pickle.
    # It stores the architecture, weights, and compilation state.
    model.save(MODEL_SAVE_PATH)
    print(f"SUCCESS: Model saved as an H5 file (.h5)")
    print(f"Location: {MODEL_SAVE_PATH}")
    print("You can load this file in FastAPI backend using tf.keras.models.load_model()")

if __name__ == "__main__":
    train_model()
