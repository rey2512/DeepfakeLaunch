import os
import cv2
import asyncio
import traceback
import logging
import platform
import sys
from typing import List, Dict, Any, Tuple

# Configure logger
logger = logging.getLogger(__name__)

# Valid file extensions
VALID_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png']
VALID_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi']

# Maximum file sizes (in bytes)
MAX_IMAGE_SIZE = 20 * 1024 * 1024  # 20MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100MB

def get_opencv_info() -> Dict[str, Any]:
    """Get OpenCV version and build information"""
    info = {
        "version": cv2.__version__,
        "platform": platform.platform(),
        "python": sys.version,
        "has_cuda": cv2.cuda.getCudaEnabledDeviceCount() > 0 if hasattr(cv2, 'cuda') else False,
    }
    
    # Log OpenCV build info
    logger.info(f"OpenCV version: {info['version']}")
    logger.info(f"Platform: {info['platform']}")
    logger.info(f"Python: {info['python']}")
    logger.info(f"CUDA support: {info['has_cuda']}")
    
    return info

def is_valid_image(extension: str) -> bool:
    """Check if the file extension is a valid image format"""
    return extension.lower() in VALID_IMAGE_EXTENSIONS

def is_valid_video(extension: str) -> bool:
    """Check if the file extension is a valid video format"""
    return extension.lower() in VALID_VIDEO_EXTENSIONS

def validate_file_size(file_path: str, file_type: str) -> bool:
    """
    Validate that the file size is within acceptable limits
    
    Args:
        file_path: Path to the file
        file_type: Type of file ('image' or 'video')
        
    Returns:
        True if file size is valid, False otherwise
    
    Raises:
        ValueError: If file size exceeds maximum allowed
    """
    try:
        file_size = os.path.getsize(file_path)
        
        if file_type == "image" and file_size > MAX_IMAGE_SIZE:
            raise ValueError(f"Image size ({file_size} bytes) exceeds maximum allowed ({MAX_IMAGE_SIZE} bytes)")
        elif file_type == "video" and file_size > MAX_VIDEO_SIZE:
            raise ValueError(f"Video size ({file_size} bytes) exceeds maximum allowed ({MAX_VIDEO_SIZE} bytes)")
            
        return True
    except Exception as e:
        logger.error(f"Error validating file size: {str(e)}")
        raise

def diagnose_image(image_path: str) -> Dict[str, Any]:
    """
    Perform diagnostics on an image file to check for issues
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Dictionary with diagnostic information
    """
    result = {
        "file_exists": False,
        "file_readable": False,
        "file_size": 0,
        "opencv_read": False,
        "image_dimensions": None,
        "image_channels": None,
        "errors": []
    }
    
    try:
        # Check file existence and properties
        result["file_exists"] = os.path.exists(image_path)
        if not result["file_exists"]:
            result["errors"].append(f"File does not exist: {image_path}")
            return result
            
        result["file_readable"] = os.access(image_path, os.R_OK)
        if not result["file_readable"]:
            result["errors"].append(f"File is not readable: {image_path}")
            return result
            
        result["file_size"] = os.path.getsize(image_path)
        if result["file_size"] == 0:
            result["errors"].append(f"File is empty: {image_path}")
            return result
            
        # Try to read with OpenCV
        try:
            start_time = asyncio.get_event_loop().time()
            img = cv2.imread(image_path)
            end_time = asyncio.get_event_loop().time()
            
            result["opencv_read_time"] = end_time - start_time
            
            if img is None:
                result["errors"].append(f"OpenCV could not read the image: {image_path}")
                return result
                
            result["opencv_read"] = True
            result["image_dimensions"] = (img.shape[1], img.shape[0])  # width, height
            result["image_channels"] = img.shape[2] if len(img.shape) > 2 else 1
            
            # Try to resize the image as a further test
            try:
                start_time = asyncio.get_event_loop().time()
                resized = cv2.resize(img, (300, 300))
                end_time = asyncio.get_event_loop().time()
                
                result["opencv_resize_time"] = end_time - start_time
                result["opencv_resize"] = True
            except Exception as e:
                result["opencv_resize"] = False
                result["errors"].append(f"Failed to resize image: {str(e)}")
                
        except Exception as e:
            result["errors"].append(f"OpenCV error: {str(e)}")
            
    except Exception as e:
        result["errors"].append(f"Diagnostic error: {str(e)}")
        
    return result

async def create_thumbnail(video_path: str, thumbnail_path: str) -> None:
    """
    Create a thumbnail from a video file
    
    Args:
        video_path: Path to the video file
        thumbnail_path: Path where the thumbnail should be saved
    """
    try:
        # Log diagnostic information
        logger.info(f"Creating thumbnail from {video_path} to {thumbnail_path}")
        
        # Check if video file exists
        if not os.path.exists(video_path):
            logger.error(f"Video file not found: {video_path}")
            raise FileNotFoundError(f"Video file not found: {video_path}")
            
        # Check if video file is readable
        if not os.access(video_path, os.R_OK):
            logger.error(f"Cannot read video file: {video_path}")
            raise PermissionError(f"Cannot read video file: {video_path}")
            
        # Log file size
        file_size = os.path.getsize(video_path)
        logger.info(f"Video file size: {file_size} bytes")
        
        # Ensure the thumbnail directory exists
        os.makedirs(os.path.dirname(thumbnail_path), exist_ok=True)
        
        # Run the CPU-intensive task in a thread pool
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _create_thumbnail_sync, video_path, thumbnail_path)
        
        # Verify thumbnail was created
        if not os.path.exists(thumbnail_path):
            logger.error(f"Thumbnail was not created at: {thumbnail_path}")
            raise Exception(f"Thumbnail was not created at: {thumbnail_path}")
        else:
            thumbnail_size = os.path.getsize(thumbnail_path)
            logger.info(f"Thumbnail created successfully: {thumbnail_path} ({thumbnail_size} bytes)")
            
    except FileNotFoundError as e:
        logger.error(f"File not found error: {str(e)}")
        raise
    except PermissionError as e:
        logger.error(f"Permission error: {str(e)}")
        raise
    except Exception as e:
        # Log the full error with traceback
        error_details = traceback.format_exc()
        logger.error(f"Error creating thumbnail: {error_details}")
        raise Exception(f"Failed to create thumbnail: {str(e)}")

def _create_thumbnail_sync(video_path: str, thumbnail_path: str) -> None:
    """Synchronous function to create a thumbnail from a video file"""
    # Open the video file
    cap = None
    try:
        logger.debug(f"Opening video file: {video_path}")
        cap = cv2.VideoCapture(video_path)
        
        # Check if video opened successfully
        if not cap.isOpened():
            logger.error(f"Could not open video file: {video_path}")
            raise Exception(f"Could not open video file: {video_path}")
        
        # Get video properties and log them
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        logger.debug(f"Video properties: {width}x{height}, {fps} fps, {total_frames} frames")
        
        if total_frames <= 0:
            logger.error(f"Video has no frames: {video_path}")
            raise Exception(f"Video has no frames: {video_path}")
        
        # Extract frame from the middle of the video
        middle_frame = max(0, total_frames // 2)
        logger.debug(f"Extracting middle frame: {middle_frame} of {total_frames}")
        cap.set(cv2.CAP_PROP_POS_FRAMES, middle_frame)
        ret, frame = cap.read()
        
        if not ret:
            # If middle frame fails, try the first frame
            logger.warning(f"Failed to extract middle frame, trying first frame")
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            ret, frame = cap.read()
            
            if not ret:
                logger.error("Failed to extract any frame from video")
                raise Exception("Failed to extract frame from video")
                
        logger.debug(f"Frame extracted, dimensions: {frame.shape}")
        
        # Save the frame as a thumbnail
        logger.debug(f"Writing thumbnail to: {thumbnail_path}")
        success = cv2.imwrite(thumbnail_path, frame)
        if not success:
            logger.error(f"Failed to write thumbnail to: {thumbnail_path}")
            raise Exception(f"Failed to write thumbnail to: {thumbnail_path}")
            
        logger.debug(f"Thumbnail created successfully")
            
    except Exception as e:
        # Log the error
        logger.error(f"Error in _create_thumbnail_sync: {str(e)}")
        raise
    finally:
        # Release the video capture object
        if cap is not None:
            logger.debug("Releasing video capture")
            cap.release()

async def extract_frames(video_path: str, max_frames: int = 10) -> List[str]:
    """
    Extract frames from a video for analysis
    
    Args:
        video_path: Path to the video file
        max_frames: Maximum number of frames to extract
        
    Returns:
        List of paths to the extracted frames
    """
    # Implementation would extract frames at regular intervals
    # and save them to temporary files
    pass 

# Initialize OpenCV info on module load
try:
    opencv_info = get_opencv_info()
except Exception as e:
    logger.error(f"Failed to get OpenCV info: {str(e)}") 