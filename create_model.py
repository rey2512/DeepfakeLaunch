import os
import numpy as np

# Check if TensorFlow is available
try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Dense, Conv2D, Flatten, MaxPooling2D, Dropout
    tf_available = True
except ImportError:
    tf_available = False
    print("TensorFlow not available. Will create a dummy model file instead.")

def create_simple_model():
    """Create a simple CNN model for deepfake detection"""
    if not tf_available:
        create_dummy_model()
        return
    
    print("Creating a simple CNN model for deepfake detection...")
    
    # Create a simple CNN model
    model = Sequential([
        # Input layer - expects 224x224 RGB images
        Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
        MaxPooling2D((2, 2)),
        
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D((2, 2)),
        
        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D((2, 2)),
        
        Flatten(),
        Dense(128, activation='relu'),
        Dropout(0.5),
        Dense(1, activation='sigmoid')  # Binary classification (real/fake)
    ])
    
    # Compile the model
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    # Save the model
    os.makedirs('models', exist_ok=True)
    model.save('models/deepfake_model.h5')
    
    print("✅ Model created and saved to models/deepfake_model.h5")
    print("Note: This is a placeholder model and has not been trained on deepfake data.")

def create_dummy_model():
    """Create a dummy model file when TensorFlow is not available"""
    try:
        os.makedirs('models', exist_ok=True)
        
        # Create a simple binary file with some random data
        with open('models/deepfake_model.h5', 'wb') as f:
            # Write a simple header to make it look like an HDF5 file
            f.write(b'\x89HDF\r\n\x1a\n')
            # Add some random data
            f.write(os.urandom(1024))
        
        print("✅ Dummy model file created at models/deepfake_model.h5")
        print("Note: This is just a placeholder file, not a real model.")
    except Exception as e:
        print(f"❌ Error creating dummy model: {e}")

if __name__ == "__main__":
    create_simple_model() 