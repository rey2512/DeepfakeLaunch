import os
import random
import struct

# Print debug information
print(f"Current working directory: {os.getcwd()}")
print(f"Python version: {os.sys.version}")

# Create models directory if it doesn't exist
os.makedirs("models", exist_ok=True)
print(f"✅ Models directory created/verified at: {os.path.abspath('models')}")

try:
    # Create a dummy model file
    model_path = os.path.join("models", "deepfake_model.h5")
    
    # Create a simple binary file with random data
    with open(model_path, 'wb') as f:
        # Write a header to make it look like a file but not a valid HDF5 file
        f.write(b'DUMMY_MODEL_FILE')
        
        # Write some random data
        data = bytearray(random.getrandbits(8) for _ in range(1024))
        f.write(data)
    
    # Verify the file was created
    file_size = os.path.getsize(model_path)
    print(f"✅ Model file created at: {os.path.abspath(model_path)}")
    print(f"✅ File size: {file_size} bytes")
    
    print("\nNOTE: This is a placeholder file, not a real model.")
    print("The system will use deterministic scoring based on file content.")
    
except Exception as e:
    print(f"❌ Error creating model file: {str(e)}")
    import traceback
    print(traceback.format_exc()) 