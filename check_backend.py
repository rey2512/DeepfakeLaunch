import requests
import os
import sys

def check_backend_health():
    """Check if the backend is running and accessible"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend is running and accessible")
            print(f"   - Status: {data.get('status', 'unknown')}")
            print(f"   - Model loaded: {data.get('model_loaded', False)}")
            print(f"   - Uploads directory: {data.get('uploads_directory', False)}")
            return True
        else:
            print(f"❌ Backend returned status code {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend at http://localhost:8000")
        print("   Is the backend server running?")
        return False
    except Exception as e:
        print(f"❌ Error checking backend health: {e}")
        return False

def check_uploads_directory():
    """Check if the uploads directory exists and has proper permissions"""
    uploads_dir = "uploads"
    
    if not os.path.exists(uploads_dir):
        print(f"❌ Uploads directory '{uploads_dir}' does not exist")
        try:
            os.makedirs(uploads_dir, exist_ok=True)
            print(f"✅ Created uploads directory '{uploads_dir}'")
        except Exception as e:
            print(f"❌ Failed to create uploads directory: {e}")
            return False
    
    # Check write permissions
    try:
        test_file = os.path.join(uploads_dir, "test_permissions.txt")
        with open(test_file, "w") as f:
            f.write("Testing write permissions")
        os.remove(test_file)
        print(f"✅ Uploads directory '{uploads_dir}' has proper write permissions")
        return True
    except Exception as e:
        print(f"❌ Uploads directory '{uploads_dir}' does not have proper write permissions: {e}")
        return False

def main():
    """Main function"""
    print("🔍 Checking deepfake detection backend...")
    
    # Check uploads directory
    uploads_ok = check_uploads_directory()
    
    # Check backend health
    backend_ok = check_backend_health()
    
    if uploads_ok and backend_ok:
        print("\n✅ All checks passed. The backend should be working properly.")
        return 0
    else:
        print("\n❌ Some checks failed. Please fix the issues before using the application.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 