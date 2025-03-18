import os
import cv2
import numpy as np
import traceback
import logging
from typing import List, Tuple, Dict, Any
import random
import tempfile
from PIL import Image
from app.models.response_models import AnalysisResult, FeatureContributions

# Configure logger
logger = logging.getLogger(__name__)

class DeepfakeDetector:
    """
    Deepfake detection model that combines multiple techniques:
    1. CNN-based detection
    2. Frequency domain analysis (FFT)
    3. Noise analysis
    4. Edge inconsistency detection
    5. Texture analysis
    """
    
    def __init__(self):
        """Initialize the deepfake detector model"""
        # In a real implementation, you would load pre-trained models here
        # For this example, we'll simulate the detection process
        self.model_loaded = True
        logger.info("Deepfake detection model initialized")
    
    def analyze(self, file_path: str, file_type: str) -> AnalysisResult:
        """
        Analyze an image or video for deepfake detection
        
        Args:
            file_path: Path to the file to analyze
            file_type: Type of file ('image' or 'video')
            
        Returns:
            AnalysisResult object with the detection results
        """
        try:
            # Check if file exists
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
                
            # Check if file is readable
            if not os.access(file_path, os.R_OK):
                raise PermissionError(f"Cannot read file: {file_path}")
            
            # Check if file is empty
            if os.path.getsize(file_path) == 0:
                raise ValueError(f"File is empty: {file_path}")
                
            if file_type == "image":
                return self._analyze_image(file_path)
            elif file_type == "video":
                return self._analyze_video(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
        except FileNotFoundError as e:
            logger.error(f"File not found error: {str(e)}")
            raise Exception(f"File not found: {str(e)}")
        except PermissionError as e:
            logger.error(f"Permission error: {str(e)}")
            raise Exception(f"Cannot access file: {str(e)}")
        except ValueError as e:
            logger.error(f"Value error: {str(e)}")
            raise Exception(f"Invalid file: {str(e)}")
        except Exception as e:
            # Log the full error with traceback
            error_details = traceback.format_exc()
            logger.error(f"Error in analyze: {error_details}")
            raise Exception(f"Failed to analyze file: {str(e)}")
    
    def _analyze_image(self, image_path: str) -> AnalysisResult:
        """
        Analyze an image for deepfake detection
        
        Args:
            image_path: Path to the image file
            
        Returns:
            AnalysisResult object with the detection results
        """
        # Load the image - first try with PIL as a fallback
        try:
            logger.info(f"Analyzing image: {image_path}")
            
            # Try to load with PIL first to check if the image is valid
            try:
                pil_image = Image.open(image_path)
                pil_image.verify()  # Verify the image is valid
                logger.debug(f"PIL image verify successful: {pil_image.format}, {pil_image.size}")
                
                # If corrupted or problematic, try to resave it
                temp_path = None
                try:
                    # Create a temporary file to save the processed image
                    temp_fd, temp_path = tempfile.mkstemp(suffix='.jpg')
                    os.close(temp_fd)
                    
                    # Open again (verify closes the file)
                    pil_image = Image.open(image_path)
                    pil_image = pil_image.convert('RGB')  # Convert to RGB to ensure compatibility
                    pil_image.save(temp_path, format='JPEG')
                    logger.debug(f"Saved processed image to temporary file: {temp_path}")
                    
                    # Now try to load with OpenCV from the temp file
                    image = cv2.imread(temp_path)
                    if image is None:
                        raise ValueError(f"OpenCV could not read the processed image: {temp_path}")
                except Exception as e:
                    logger.warning(f"Error processing image with PIL: {str(e)}")
                    # Continue with original file
                    image = cv2.imread(image_path)
                finally:
                    # Clean up temporary file
                    if temp_path and os.path.exists(temp_path):
                        try:
                            os.remove(temp_path)
                        except:
                            pass
                
            except Exception as pil_error:
                logger.warning(f"PIL failed to verify image: {str(pil_error)}")
                # Fallback to directly using OpenCV
                image = cv2.imread(image_path)
            
            # Final check if image was loaded
            if image is None:
                raise ValueError(f"Failed to load image: {image_path}")
                
            # Check image dimensions
            if image.shape[0] <= 0 or image.shape[1] <= 0:
                logger.error(f"Invalid image dimensions: {image.shape}")
                raise ValueError(f"Invalid image dimensions: {image.shape}")
                
            # Log successful image loading
            logger.info(f"Successfully loaded image: {image_path}, dimensions: {image.shape}")
                
        except Exception as e:
            error_details = traceback.format_exc()
            logger.error(f"Error loading image: {error_details}")
            raise Exception(f"Error loading image: {str(e)}")
        
        try:
            # Get feature scores from different detection methods
            cnn_score = self._simulate_cnn_detection(image)
            fft_score = self._simulate_fft_analysis(image)
            noise_score = self._simulate_noise_analysis(image)
            edge_score = self._simulate_edge_detection(image)
            texture_score = self._simulate_texture_analysis(image)
            
            # Combine scores (in a real implementation, you would use a more sophisticated method)
            # Here we use a weighted average
            weights = {
                'cnn': 0.4,
                'fft': 0.2,
                'noise': 0.15,
                'edge': 0.15,
                'texture': 0.1
            }
            
            combined_score = (
                weights['cnn'] * cnn_score +
                weights['fft'] * fft_score +
                weights['noise'] * noise_score +
                weights['edge'] * edge_score +
                weights['texture'] * texture_score
            )
            
            # Scale to 0-100 range
            final_score = min(max(combined_score * 100, 0), 100)
            
            # Determine category based on score
            is_deepfake = final_score > 50
            if final_score < 30:
                category = "Likely Authentic"
            elif final_score < 70:
                category = "Possibly Manipulated"
            else:
                category = "Likely Deepfake"
            
            # Create feature contributions object
            feature_contributions = FeatureContributions(
                cnn_score=cnn_score,
                fft_score=fft_score,
                noise_score=noise_score,
                edge_score=edge_score,
                texture_score=texture_score
            )
            
            # Create and return the result
            return AnalysisResult(
                score=final_score,
                category=category,
                is_deepfake=is_deepfake,
                file_path="",  # Will be set by the router
                file_type="image",
                feature_contributions=feature_contributions
            )
        except Exception as e:
            error_details = traceback.format_exc()
            logger.error(f"Error analyzing image: {error_details}")
            raise Exception(f"Failed to analyze image: {str(e)}")
    
    def _analyze_video(self, video_path: str) -> AnalysisResult:
        """
        Analyze a video for deepfake detection
        
        Args:
            video_path: Path to the video file
            
        Returns:
            AnalysisResult object with the detection results
        """
        # Open the video file
        cap = None
        try:
            logger.info(f"Analyzing video: {video_path}")
            
            # Try to fix the video if it's corrupted
            temp_path = None
            try:
                # Create a temporary file
                temp_fd, temp_path = tempfile.mkstemp(suffix='.mp4')
                os.close(temp_fd)
                
                # Use OpenCV to read the original and write to temp file
                original_cap = cv2.VideoCapture(video_path)
                if not original_cap.isOpened():
                    logger.warning(f"Could not open original video file: {video_path}")
                    raise ValueError(f"Could not open original video file: {video_path}")
                
                # Get video properties
                fps = original_cap.get(cv2.CAP_PROP_FPS)
                width = int(original_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(original_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                
                if fps <= 0 or width <= 0 or height <= 0:
                    logger.warning(f"Invalid video properties: fps={fps}, width={width}, height={height}")
                    raise ValueError(f"Invalid video properties")
                
                # Create VideoWriter
                fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                writer = cv2.VideoWriter(temp_path, fourcc, fps, (width, height))
                
                # Read frames from original and write to new file
                frames_copied = 0
                while True:
                    ret, frame = original_cap.read()
                    if not ret:
                        break
                    writer.write(frame)
                    frames_copied += 1
                    if frames_copied >= 100:  # Limit to 100 frames max
                        break
                
                # Release resources
                original_cap.release()
                writer.release()
                
                if frames_copied == 0:
                    logger.warning(f"No frames copied to temp file")
                    raise ValueError("No frames could be copied from the original video")
                
                logger.info(f"Copied {frames_copied} frames to temporary file: {temp_path}")
                
                # Now use the temp file for analysis
                cap = cv2.VideoCapture(temp_path)
                if not cap.isOpened():
                    logger.warning(f"Could not open processed video: {temp_path}")
                    # Fallback to original
                    cap = cv2.VideoCapture(video_path)
                    
            except Exception as e:
                logger.warning(f"Error processing video: {str(e)}")
                # Fallback to original file
                cap = cv2.VideoCapture(video_path)
            
            # Final check
            if not cap.isOpened():
                logger.error(f"Failed to open video: {video_path}")
                raise ValueError(f"Failed to open video: {video_path}")
                
            # Get video properties
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = frame_count / fps if fps > 0 else 0
            
            # Log video properties for debugging
            logger.info(f"Video properties: path={video_path}, fps={fps}, frames={frame_count}, duration={duration:.2f}s")
            
            if frame_count <= 0:
                logger.error(f"Video has no frames: {video_path}")
                raise ValueError(f"Video has no frames: {video_path}")
                
            # For long videos, analyze frames at regular intervals
            max_frames_to_analyze = 10
            frames_to_analyze = min(frame_count, max_frames_to_analyze)
            
            # Calculate frame interval
            if frame_count <= max_frames_to_analyze:
                frame_interval = 1
            else:
                frame_interval = frame_count // max_frames_to_analyze
            
            # Analyze selected frames
            frame_scores = []
            feature_scores = {
                'cnn': [],
                'fft': [],
                'noise': [],
                'edge': [],
                'texture': []
            }
            
            frames_processed = 0
            for i in range(frames_to_analyze):
                # Set frame position
                frame_pos = i * frame_interval
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_pos)
                
                # Read the frame
                ret, frame = cap.read()
                if not ret:
                    logger.warning(f"Could not read frame at position {frame_pos}")
                    continue
                
                # Get feature scores for this frame
                try:
                    cnn_score = self._simulate_cnn_detection(frame)
                    fft_score = self._simulate_fft_analysis(frame)
                    noise_score = self._simulate_noise_analysis(frame)
                    edge_score = self._simulate_edge_detection(frame)
                    texture_score = self._simulate_texture_analysis(frame)
                    
                    # Store individual feature scores
                    feature_scores['cnn'].append(cnn_score)
                    feature_scores['fft'].append(fft_score)
                    feature_scores['noise'].append(noise_score)
                    feature_scores['edge'].append(edge_score)
                    feature_scores['texture'].append(texture_score)
                    
                    # Calculate combined score for this frame
                    weights = {
                        'cnn': 0.4,
                        'fft': 0.2,
                        'noise': 0.15,
                        'edge': 0.15,
                        'texture': 0.1
                    }
                    
                    frame_score = (
                        weights['cnn'] * cnn_score +
                        weights['fft'] * fft_score +
                        weights['noise'] * noise_score +
                        weights['edge'] * edge_score +
                        weights['texture'] * texture_score
                    )
                    
                    # Scale to 0-100 range
                    frame_score = min(max(frame_score * 100, 0), 100)
                    frame_scores.append(frame_score)
                    frames_processed += 1
                except Exception as e:
                    logger.error(f"Error processing frame {frame_pos}: {str(e)}")
                    # Continue with next frame instead of failing the whole analysis
                    continue
            
            # Check if we have any valid frames
            if not frame_scores:
                logger.error("Failed to analyze any frames in the video")
                raise ValueError("Failed to analyze any frames in the video")
            
            # Calculate average scores
            avg_score = sum(frame_scores) / len(frame_scores)
            avg_cnn = sum(feature_scores['cnn']) / len(feature_scores['cnn'])
            avg_fft = sum(feature_scores['fft']) / len(feature_scores['fft'])
            avg_noise = sum(feature_scores['noise']) / len(feature_scores['noise'])
            avg_edge = sum(feature_scores['edge']) / len(feature_scores['edge'])
            avg_texture = sum(feature_scores['texture']) / len(feature_scores['texture'])
            
            # Determine category based on score
            is_deepfake = avg_score > 50
            if avg_score < 30:
                category = "Likely Authentic"
            elif avg_score < 70:
                category = "Possibly Manipulated"
            else:
                category = "Likely Deepfake"
            
            # Create feature contributions object
            feature_contributions = FeatureContributions(
                cnn_score=avg_cnn,
                fft_score=avg_fft,
                noise_score=avg_noise,
                edge_score=avg_edge,
                texture_score=avg_texture
            )
            
            # Log successful analysis
            logger.info(f"Video analysis complete: score={avg_score:.2f}, frames_processed={frames_processed}/{frames_to_analyze}")
            
            # Create and return the result
            return AnalysisResult(
                score=avg_score,
                category=category,
                is_deepfake=is_deepfake,
                file_path="",  # Will be set by the router
                file_type="video",
                frame_scores=frame_scores,
                frames_analyzed=len(frame_scores),
                feature_contributions=feature_contributions
            )
        except Exception as e:
            error_details = traceback.format_exc()
            logger.error(f"Error analyzing video: {error_details}")
            raise Exception(f"Failed to analyze video: {str(e)}")
        finally:
            # Release the video capture object
            if cap is not None:
                logger.debug("Releasing video capture")
                cap.release()
            # Clean up temporary file
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except:
                    pass
    
    # Simulation methods for different detection techniques
    # In a real implementation, these would use actual ML models
    
    def _simulate_cnn_detection(self, image: np.ndarray) -> float:
        """Simulate CNN-based deepfake detection"""
        # Use hash of image data to generate consistent results
        # for the same input image/video frame
        h = hash(image.tobytes()) % 1000 / 1000  # Convert hash to 0-1 range
        return 0.3 + (h * 0.5)  # Scale to 0.3-0.8 range
    
    def _simulate_fft_analysis(self, image: np.ndarray) -> float:
        """Simulate frequency domain analysis"""
        # Use a different hash function by adding a salt
        h = hash(image.tobytes() + b'fft') % 1000 / 1000
        return 0.2 + (h * 0.7)  # Scale to 0.2-0.9 range
    
    def _simulate_noise_analysis(self, image: np.ndarray) -> float:
        """Simulate noise pattern analysis"""
        h = hash(image.tobytes() + b'noise') % 1000 / 1000
        return 0.1 + (h * 0.6)  # Scale to 0.1-0.7 range
    
    def _simulate_edge_detection(self, image: np.ndarray) -> float:
        """Simulate edge inconsistency detection"""
        h = hash(image.tobytes() + b'edge') % 1000 / 1000
        return 0.2 + (h * 0.6)  # Scale to 0.2-0.8 range
    
    def _simulate_texture_analysis(self, image: np.ndarray) -> float:
        """Simulate texture analysis"""
        h = hash(image.tobytes() + b'texture') % 1000 / 1000
        return 0.3 + (h * 0.6)  # Scale to 0.3-0.9 range 