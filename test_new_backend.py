import requests
import os
import time
import sys
import mimetypes

# Initialize mimetypes
mimetypes.init()

# Wait for the server to start
print("Waiting for server to start...")
time.sleep(2)

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed with status code {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Health check failed with error: {e}")
        return False

def test_upload_file(file_path):
    """Test uploading a file"""
    try:
        if not os.path.exists(file_path):
            print(f"❌ Test file not found: {file_path}")
            return False
        
        # Determine content type based on file extension
        content_type, _ = mimetypes.guess_type(file_path)
        if not content_type:
            # Default content types based on extension
            ext = os.path.splitext(file_path)[1].lower()
            if ext in ['.jpg', '.jpeg']:
                content_type = 'image/jpeg'
            elif ext == '.png':
                content_type = 'image/png'
            elif ext == '.mp4':
                content_type = 'video/mp4'
            else:
                content_type = 'application/octet-stream'
                
        print(f"   Using content type: {content_type}")
            
        with open(file_path, "rb") as f:
            files = {"file": (os.path.basename(file_path), f, content_type)}
            response = requests.post(f"{BASE_URL}/upload/", files=files)
            
        if response.status_code == 200:
            print("✅ File upload passed")
            result = response.json()
            print(f"   File path: {result.get('file_path')}")
            return True
        else:
            print(f"❌ File upload failed with status code {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ File upload failed with error: {e}")
        return False

def test_predict(file_path):
    """Test the predict endpoint"""
    try:
        if not os.path.exists(file_path):
            print(f"❌ Test file not found: {file_path}")
            return False
        
        # Determine content type based on file extension
        content_type, _ = mimetypes.guess_type(file_path)
        if not content_type:
            # Default content types based on extension
            ext = os.path.splitext(file_path)[1].lower()
            if ext in ['.jpg', '.jpeg']:
                content_type = 'image/jpeg'
            elif ext == '.png':
                content_type = 'image/png'
            elif ext == '.mp4':
                content_type = 'video/mp4'
            else:
                content_type = 'application/octet-stream'
                
        print(f"   Using content type: {content_type}")
            
        with open(file_path, "rb") as f:
            files = {"file": (os.path.basename(file_path), f, content_type)}
            response = requests.post(f"{BASE_URL}/predict/", files=files)
            
        if response.status_code == 200:
            print("✅ Predict passed")
            result = response.json()
            print(f"   Score: {result.get('score')}")
            print(f"   Category: {result.get('category')}")
            print(f"   File path: {result.get('file_path')}")
            return True
        else:
            print(f"❌ Predict failed with status code {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Predict failed with error: {e}")
        return False

def main():
    """Run all tests"""
    print("Testing new backend...")
    
    # Test health check
    if not test_health_check():
        print("Health check failed, exiting tests")
        return False
    
    # Find a test file
    test_files = []
    for root, dirs, files in os.walk("uploads"):
        for file in files:
            if file.endswith((".jpg", ".jpeg", ".png", ".mp4")):
                test_files.append(os.path.join(root, file))
                if len(test_files) >= 2:  # Limit to 2 test files
                    break
        if len(test_files) >= 2:
            break
    
    if not test_files:
        print("No test files found in uploads directory")
        # Create a test file
        with open("test_image.jpg", "wb") as f:
            f.write(b"Test image content")
        test_files = ["test_image.jpg"]
    
    # Test upload and predict with each test file
    all_passed = True
    for file_path in test_files:
        print(f"\nTesting with file: {file_path}")
        if not test_upload_file(file_path):
            all_passed = False
        if not test_predict(file_path):
            all_passed = False
    
    if all_passed:
        print("\n✅ All tests passed!")
        return True
    else:
        print("\n❌ Some tests failed")
        return False

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1) 