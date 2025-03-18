from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging
import sys
import uvicorn
from app.routers import prediction

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("app.log")  # Add file logging to keep logs persisted
    ]
)

logger = logging.getLogger(__name__)

# Create uploads directories if they don't exist
try:
    logger.info("Creating uploads directories")
    uploads_dir = os.path.join(os.getcwd(), "uploads")
    images_dir = os.path.join(uploads_dir, "images")
    videos_dir = os.path.join(uploads_dir, "videos")
    thumbnails_dir = os.path.join(uploads_dir, "thumbnails")
    
    os.makedirs(uploads_dir, exist_ok=True)
    os.makedirs(images_dir, exist_ok=True)
    os.makedirs(videos_dir, exist_ok=True)
    os.makedirs(thumbnails_dir, exist_ok=True)
    
    logger.info(f"Uploads directory: {uploads_dir}")
    logger.info(f"Images directory: {images_dir}")
    logger.info(f"Videos directory: {videos_dir}")
    logger.info(f"Thumbnails directory: {thumbnails_dir}")
except Exception as e:
    logger.error(f"Error creating uploads directories: {str(e)}")
    raise

app = FastAPI(
    title="Deepfake Detection API",
    description="API for detecting deepfakes in images and videos",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080", 
        "http://127.0.0.1:8080", 
        "http://localhost:5173",  # Vite dev server
        "https://deepverify.vercel.app",  # Vercel frontend
        "https://verifiai.tech",  # Production domain
        "https://www.verifiai.tech",  # Production domain with www
        "*"  # Allow all origins in development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add middleware to log all requests and responses
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        logger.info(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        raise

# Mount static files directory for serving uploaded files
try:
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
    logger.info("Mounted uploads directory")
except Exception as e:
    logger.error(f"Error mounting uploads directory: {str(e)}")
    raise

# Include routers
app.include_router(prediction.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to the Deepfake Detection API"}

# Run the app if this file is executed directly
if __name__ == "__main__":
    # Get port from environment variable or use default
    port = int(os.environ.get("PORT", 8000))
    
    # Run the app with uvicorn
    uvicorn.run(
        "app.main:app", 
        host="0.0.0.0", 
        port=port,
        reload=True
    )
    logger.info(f"Application running on http://0.0.0.0:{port}") 