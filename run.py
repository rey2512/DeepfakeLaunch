import os
import subprocess
import sys
import time
import webbrowser

def check_dependencies():
    """Check if all required dependencies are installed"""
    try:
        import fastapi
        import uvicorn
        import numpy
        import cv2
        import tensorflow
        print("✅ Backend dependencies installed")
    except ImportError as e:
        print(f"❌ Missing backend dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False
    
    # Check if node is installed
    try:
        subprocess.run(["node", "--version"], check=True, stdout=subprocess.PIPE)
        print("✅ Node.js installed")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Node.js not found")
        print("Please install Node.js: https://nodejs.org/")
        return False
    
    return True

def check_model():
    """Check if the model exists, if not create a placeholder"""
    if not os.path.exists("models/deepfake_model.h5"):
        print("⚠️ Deepfake model not found")
        choice = input("Would you like to create a placeholder model? (y/n): ")
        if choice.lower() == 'y':
            try:
                import download_model
                download_model.create_model()
            except Exception as e:
                print(f"❌ Error creating model: {e}")
                return False
        else:
            print("⚠️ Running without a model. The API will return random predictions.")
    else:
        print("✅ Deepfake model found")
    
    return True

def start_backend():
    """Start the FastAPI backend server"""
    print("🚀 Starting backend server...")
    backend_process = subprocess.Popen([sys.executable, "main.py"])
    print("✅ Backend server running at http://localhost:8000")
    return backend_process

def start_frontend():
    """Start the React frontend development server"""
    print("🚀 Starting frontend development server...")
    
    # Check if npm or yarn is available
    try:
        subprocess.run(["npm", "--version"], check=True, stdout=subprocess.PIPE)
        frontend_process = subprocess.Popen(["npm", "run", "dev"])
    except (subprocess.CalledProcessError, FileNotFoundError):
        try:
            subprocess.run(["yarn", "--version"], check=True, stdout=subprocess.PIPE)
            frontend_process = subprocess.Popen(["yarn", "dev"])
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ Neither npm nor yarn found")
            return None
    
    print("✅ Frontend server starting...")
    return frontend_process

def main():
    """Main function to run the application"""
    print("🔍 Checking dependencies...")
    if not check_dependencies():
        return
    
    print("🔍 Checking model...")
    if not check_model():
        return
    
    # Create uploads directory if it doesn't exist
    os.makedirs("uploads", exist_ok=True)
    
    # Start backend
    backend_process = start_backend()
    
    # Wait for backend to start
    time.sleep(2)
    
    # Start frontend
    frontend_process = start_frontend()
    if frontend_process is None:
        backend_process.terminate()
        return
    
    # Wait for frontend to start
    time.sleep(5)
    
    # Open browser
    webbrowser.open("http://localhost:5173")
    
    print("\n🎉 Deepfake Detection System is running!")
    print("📊 Backend API: http://localhost:8000")
    print("🖥️ Frontend: http://localhost:5173")
    print("\nPress Ctrl+C to stop the servers")
    
    try:
        # Keep the script running
        backend_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("✅ Servers stopped")

if __name__ == "__main__":
    main() 