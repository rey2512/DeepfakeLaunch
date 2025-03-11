from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.responses import JSONResponse
import os
import sys
import importlib.util
import traceback

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the app from new_backend.py
try:
    spec = importlib.util.spec_from_file_location("new_backend", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "new_backend.py"))
    new_backend = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(new_backend)
    app = new_backend.app
    print("✅ Successfully imported app from new_backend.py")
except Exception as e:
    print(f"❌ Error importing app from new_backend.py: {e}")
    print(traceback.format_exc())
    app = FastAPI()
    
    @app.get("/")
    def fallback_root():
        return {"error": "Failed to load the main application", "message": str(e)}

# This is needed for Vercel serverless functions
async def handler(request: Request):
    """
    Handle incoming requests and forward them to the FastAPI app
    """
    try:
        # Get the path and method
        path = request.url.path
        method = request.method
        
        # Remove /api prefix if present
        if path.startswith("/api"):
            path = path[4:]
        
        # Ensure path starts with /
        if not path.startswith("/"):
            path = "/" + path
            
        # Create a new scope with the modified path
        scope = request.scope.copy()
        scope["path"] = path
        
        # Create a new request with the modified scope
        modified_request = Request(scope, request.receive)
        
        # Process the request with the FastAPI app
        response = await app(modified_request.scope, modified_request.receive, request.send)
        return response
    except Exception as e:
        print(f"❌ Error in handler: {e}")
        print(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": f"Internal server error: {str(e)}"}
        ) 