import os
import requests
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model

def create_model():
    """
    Create a simple deepfake detection model based on EfficientNetB0
    """
    # Create models directory if it doesn't exist
    os.makedirs("models", exist_ok=True)
    
    print("Creating a simple deepfake detection model...")
    
    # Base model
    base_model = EfficientNetB0(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    
    # Add custom layers
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(1024, activation='relu')(x)
    predictions = Dense(1, activation='sigmoid')(x)
    
    # Create model
    model = Model(inputs=base_model.input, outputs=predictions)
    
    # Compile model
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    # Save model
    model.save("models/deepfake_model.h5")
    print("Model created and saved to models/deepfake_model.h5")
    print("Note: This is a placeholder model and has not been trained on deepfake data.")
    print("For actual detection, replace with a properly trained model.")

if __name__ == "__main__":
    create_model() 