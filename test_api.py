import requests
import sys
import os
from PIL import Image
import io

def test_health():
    """Test the health endpoint"""
    try:
        response = requests.get("http://localhost:8000/health")
        print(f"Health check: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print("❌ Failed to connect to the API. Is the server running?")
        return False

def test_predict(image_path):
    """Test the predict endpoint with an image"""
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return False
    
    try:
        # Open and validate the image
        img = Image.open(image_path)
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format=img.format)
        img_byte_arr = img_byte_arr.getvalue()
        
        # Send the request
        files = {'file': (os.path.basename(image_path), img_byte_arr, f'image/{img.format.lower()}')}
        response = requests.post("http://localhost:8000/predict/", files=files)
        
        print(f"Predict: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Score: {result.get('score')}%")
            print(f"Category: {result.get('category')}")
            print(f"Is Deepfake: {result.get('is_deepfake')}")
            print(f"File Path: {result.get('file_path')}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main function"""
    print("🧪 Testing Deepfake Detection API")
    
    # Test health endpoint
    if not test_health():
        print("❌ Health check failed")
        return
    
    # Test predict endpoint
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        if not test_predict(image_path):
            print("❌ Prediction test failed")
    else:
        print("ℹ️ To test prediction, provide an image path:")
        print(f"    python {sys.argv[0]} path/to/image.jpg")

if __name__ == "__main__":
    main() 