from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
import os
import uuid
import shutil
import logging
from typing import Optional, Dict, Any
import aiofiles
import traceback
import cv2
import numpy as np
from app.models.deepfake_detector import DeepfakeDetector
from app.utils.file_utils import is_valid_image, is_valid_video, create_thumbnail, validate_file_size, diagnose_image, get_opencv_info
from app.models.response_models import AnalysisResult
import sys

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/predict",
    tags=["prediction"],
    responses={404: {"description": "Not found"}},
)

# Initialize the deepfake detector model
detector = DeepfakeDetector()

@router.get("/diagnostics")
async def get_diagnostics():
    """
    Get system diagnostics about OpenCV and the processing environment
    """
    try:
        # Get OpenCV info
        opencv_info = get_opencv_info()
        
        # Create a test image
        test_img = np.zeros((100, 100, 3), dtype=np.uint8)
        test_img[:50, :50] = [255, 0, 0]  # Red square
        
        # Test directory permissions
        dirs_info = {}
        for dir_path in ['uploads', 'uploads/images', 'uploads/videos', 'uploads/thumbnails', 'uploads/test']:
            os.makedirs(dir_path, exist_ok=True)
            test_file = os.path.join(dir_path, 'test_write.txt')
            write_ok = False
            try:
                with open(test_file, 'w') as f:
                    f.write('test')
                write_ok = True
                os.remove(test_file)
            except Exception as e:
                pass
            
            dirs_info[dir_path] = {
                'exists': os.path.exists(dir_path),
                'writable': os.access(dir_path, os.W_OK),
                'write_test': write_ok
            }
        
        # Test image write/read
        test_path = "uploads/test/opencv_test.jpg"
        os.makedirs(os.path.dirname(test_path), exist_ok=True)
        
        cv2_write_ok = cv2.imwrite(test_path, test_img)
        if cv2_write_ok:
            read_img = cv2.imread(test_path)
            cv2_read_ok = read_img is not None
            if os.path.exists(test_path):
                os.remove(test_path)
        else:
            cv2_read_ok = False
        
        # Return combined diagnostic info
        return {
            "opencv": opencv_info,
            "directories": dirs_info,
            "opencv_tests": {
                "write_test": cv2_write_ok,
                "read_test": cv2_read_ok
            },
            "system": {
                "cwd": os.getcwd(),
                "python_executable": sys.executable,
                "env_vars": {
                    key: value for key, value in os.environ.items() 
                    if key.startswith(("PATH", "PYTHON", "OPENCV", "LD_LIBRARY"))
                }
            }
        }
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Error in diagnostics: {error_details}")
        return {
            "status": "error", 
            "message": str(e),
            "details": error_details
        }

@router.get("/test")
async def test_cv():
    """Simple test endpoint to check if OpenCV is working correctly"""
    try:
        # Create a simple test image
        test_img = np.zeros((100, 100, 3), dtype=np.uint8)
        test_img[:50, :50] = [255, 0, 0]  # Red square
        
        # Save test image to a temporary file
        test_path = "uploads/test_opencv.jpg"
        os.makedirs(os.path.dirname(test_path), exist_ok=True)
        
        # Try to save the image
        cv2.imwrite(test_path, test_img)
        
        # Try to read the image back
        read_img = cv2.imread(test_path)
        if read_img is None:
            return {"status": "error", "message": "Failed to read test image"}
        
        # Clean up
        if os.path.exists(test_path):
            os.remove(test_path)
        
        return {"status": "success", "message": "OpenCV is working correctly"}
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Error in OpenCV test: {error_details}")
        return {"status": "error", "message": str(e), "details": error_details}

@router.post("/", response_model=AnalysisResult)
async def predict_deepfake(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """
    Analyze an uploaded image or video for deepfake detection.
    
    - **file**: The image or video file to analyze
    
    Returns the analysis result with a deepfake score and other details.
    """
    # Generate a unique filename
    file_id = str(uuid.uuid4())
    
    # Check if filename exists
    if not file.filename:
        logger.error("No filename provided")
        raise HTTPException(
            status_code=400,
            detail="No filename provided"
        )
    
    # Log info about the uploaded file
    logger.info(f"Processing file: {file.filename} (Content-Type: {file.content_type})")
    
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    # Determine file type and validate
    if is_valid_image(file_extension):
        file_type = "image"
        save_path = f"uploads/images/{file_id}{file_extension}"
    elif is_valid_video(file_extension):
        file_type = "video"
        save_path = f"uploads/videos/{file_id}{file_extension}"
    else:
        logger.error(f"Unsupported file type: {file_extension}")
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {file_extension}. Please upload a valid image (.jpg, .jpeg, .png) or video (.mp4, .mov, .avi) file."
        )
    
    # Save the uploaded file
    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        logger.debug(f"Saving file to {save_path}")
        
        # Read the file content
        content = await file.read()
        if not content:
            logger.error("Empty file content")
            raise HTTPException(
                status_code=400,
                detail="Empty file content"
            )
        
        # Check if content size is reasonable (to prevent memory issues)
        content_size = len(content)
        logger.debug(f"File size: {content_size} bytes")
        
        if file_type == "image" and content_size > 20 * 1024 * 1024:  # 20MB limit for images
            logger.error(f"Image file too large: {content_size} bytes")
            raise HTTPException(
                status_code=400,
                detail="Image file too large. Maximum size is 20MB."
            )
        elif file_type == "video" and content_size > 100 * 1024 * 1024:  # 100MB limit for videos
            logger.error(f"Video file too large: {content_size} bytes")
            raise HTTPException(
                status_code=400,
                detail="Video file too large. Maximum size is 100MB."
            )
        
        # Write the file
        async with aiofiles.open(save_path, 'wb') as out_file:
            await out_file.write(content)
            
        # Check if file was saved correctly
        if not os.path.exists(save_path) or os.path.getsize(save_path) == 0:
            logger.error(f"Failed to save file properly to {save_path}")
            raise HTTPException(
                status_code=500,
                detail="Failed to save file properly"
            )
            
        # Validate the saved file's size
        try:
            validate_file_size(save_path, file_type)
        except ValueError as e:
            # Clean up the file
            if os.path.exists(save_path):
                os.remove(save_path)
            
            logger.error(f"File size validation failed: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=str(e)
            )
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the full error with traceback
        error_details = traceback.format_exc()
        logger.error(f"Error saving file: {error_details}")
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Create thumbnail for video files
    thumbnail_path = None
    if file_type == "video":
        try:
            thumbnail_path = f"/uploads/thumbnails/{file_id}.jpg"
            thumbnail_full_path = f"uploads/thumbnails/{file_id}.jpg"
            
            # Ensure the thumbnails directory exists
            os.makedirs(os.path.dirname(thumbnail_full_path), exist_ok=True)
            
            logger.debug(f"Creating thumbnail for video: {save_path} -> {thumbnail_full_path}")
            await create_thumbnail(save_path, thumbnail_full_path)
            
            # Verify thumbnail was created successfully
            if not os.path.exists(thumbnail_full_path) or os.path.getsize(thumbnail_full_path) == 0:
                logger.warning(f"Thumbnail creation failed silently: {thumbnail_full_path}")
                thumbnail_path = None  # Don't use the thumbnail if it wasn't created properly
                
        except Exception as e:
            # Log the error but continue processing
            error_details = traceback.format_exc()
            logger.error(f"Failed to create thumbnail: {error_details}")
            thumbnail_path = None  # Don't use the thumbnail if creation failed
    
    # Process the file with the deepfake detection model
    try:
        logger.info(f"Starting analysis for {file_type}: {save_path}")
        result = detector.analyze(save_path, file_type)
        
        # Add file metadata to the result
        result.file_path = f"/{save_path}"
        result.file_type = file_type
        if thumbnail_path:
            result.thumbnail_path = thumbnail_path
        
        # Add cleanup task to background tasks if provided
        if background_tasks:
            background_tasks.add_task(cleanup_old_files)
        
        logger.info(f"Analysis complete: score={result.score}, category={result.category}")
        return result
    except Exception as e:
        # Log the full error with traceback
        error_details = traceback.format_exc()
        logger.error(f"Error analyzing file: {error_details}")
        
        # Clean up the file if analysis fails
        if os.path.exists(save_path):
            try:
                os.remove(save_path)
                logger.debug(f"Cleaned up file after failed analysis: {save_path}")
            except Exception as cleanup_error:
                logger.error(f"Failed to clean up file: {cleanup_error}")
        
        # Clean up the thumbnail if it exists
        if file_type == "video" and thumbnail_path:
            thumbnail_full_path = f"uploads{thumbnail_path}"
            if os.path.exists(thumbnail_full_path):
                try:
                    os.remove(thumbnail_full_path)
                    logger.debug(f"Cleaned up thumbnail after failed analysis: {thumbnail_full_path}")
                except Exception as cleanup_error:
                    logger.error(f"Failed to clean up thumbnail: {cleanup_error}")
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze file: {str(e)}"
        )

@router.post("/test-upload")
async def test_upload(file: UploadFile = File(...)):
    """
    Test endpoint to isolate file upload issues
    """
    try:
        # Generate a unique test filename
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1].lower() if file.filename else ".bin"
        
        # Log the input
        logger.info(f"Test upload: {file.filename} ({file.content_type})")
        
        # Save to a test location
        test_path = f"uploads/test/{file_id}{file_extension}"
        os.makedirs(os.path.dirname(test_path), exist_ok=True)
        
        # Read file content 
        content = await file.read()
        content_size = len(content)
        
        # Write to file
        async with aiofiles.open(test_path, 'wb') as out_file:
            await out_file.write(content)
            
        # Check if the file was saved
        if os.path.exists(test_path):
            file_size = os.path.getsize(test_path)
            logger.info(f"Test file saved: {test_path} ({file_size} bytes)")
            
            # Try to read it with OpenCV
            try:
                if file_extension in ['.jpg', '.jpeg', '.png']:
                    img = cv2.imread(test_path)
                    if img is not None:
                        height, width = img.shape[:2]
                        return {
                            "status": "success", 
                            "message": "File uploaded and processed successfully",
                            "details": {
                                "filename": file.filename,
                                "content_type": file.content_type,
                                "size": content_size,
                                "saved_path": test_path,
                                "image_dimensions": f"{width}x{height}"
                            }
                        }
                    else:
                        return {
                            "status": "error",
                            "message": "File saved but OpenCV could not read it",
                            "details": {
                                "filename": file.filename,
                                "content_type": file.content_type,
                                "size": content_size,
                                "saved_path": test_path
                            }
                        }
                else:
                    return {
                        "status": "success", 
                        "message": "File uploaded successfully (not an image)",
                        "details": {
                            "filename": file.filename,
                            "content_type": file.content_type,
                            "size": content_size,
                            "saved_path": test_path
                        }
                    }
                    
            except Exception as e:
                logger.error(f"OpenCV error: {str(e)}")
                return {
                    "status": "error",
                    "message": f"File saved but processing failed: {str(e)}",
                    "details": {
                        "filename": file.filename,
                        "content_type": file.content_type,
                        "size": content_size,
                        "saved_path": test_path,
                        "error": str(e),
                        "traceback": traceback.format_exc()
                    }
                }
                
        else:
            return {"status": "error", "message": "Failed to save the file"}
            
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Error in test upload: {error_details}")
        return {
            "status": "error", 
            "message": str(e), 
            "details": error_details
        }

async def cleanup_old_files():
    """Background task to clean up old files to prevent disk space issues"""
    # Implementation would delete files older than a certain threshold
    pass 