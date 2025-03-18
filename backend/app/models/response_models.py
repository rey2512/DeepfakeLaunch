from pydantic import BaseModel
from typing import Optional, List, Dict

class FeatureContributions(BaseModel):
    """Model for feature contributions to the deepfake score"""
    cnn_score: float
    fft_score: float
    noise_score: float
    edge_score: float
    texture_score: float

class AnalysisResult(BaseModel):
    """Model for the deepfake analysis result"""
    score: float
    category: str
    is_deepfake: bool
    file_path: str
    file_type: str
    thumbnail_path: Optional[str] = None
    frame_scores: Optional[List[float]] = None
    frames_analyzed: Optional[int] = None
    feature_contributions: Optional[FeatureContributions] = None 