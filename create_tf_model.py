import os
import tensorflow as tf
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Flatten, Conv2D, MaxPooling2D

# Print debug information
print(f"Current working directory: {os.getcwd()}")
print(f"Python version: {os.sys.version}")
print(f"TensorFlow version: {tf.__version__}")

# Create models directory if it doesn't exist
os.makedirs("models", exist_ok=True)
print(f"✅ Models directory created/verified at: {os.path.abspath('models')}")

try:
    # Create a simple CNN model for image classification
    model = Sequential([
        # Input layer for 128x128 RGB images
        Conv2D(16, (3, 3), activation='relu', input_shape=(128, 128, 3)),
        MaxPooling2D(2, 2),
        Conv2D(32, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        Flatten(),
        Dense(64, activation='relu'),
        Dense(1, activation='sigmoid')  # Binary classification (real/fake)
    ])
    
    # Compile the model
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    # Print model summary
    model.summary()
    
    # Save the model
    model_path = os.path.join("models", "deepfake_model.h5")
    model.save(model_path)
    
    # Verify the file was created
    file_size = os.path.getsize(model_path)
    print(f"✅ Model saved successfully at: {os.path.abspath(model_path)}")
    print(f"✅ Model file size: {file_size} bytes")
    
    print("\nNOTE: This is a placeholder model for demonstration purposes.")
    print("It has not been trained on any data and will not make accurate predictions.")
    print("The system will still use deterministic scoring based on file content.")
    
except Exception as e:
    print(f"❌ Error creating model: {str(e)}")
    import traceback
    print(traceback.format_exc()) 