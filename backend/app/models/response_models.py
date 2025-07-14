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
    is_deepfake: bool
    message: str
    file_path: str
    file_type: str
    thumbnail_path: Optional[str] = None
    
    # Hidden fields - still calculated but not shown in the frontend
    _score: Optional[float] = None
    _category: Optional[str] = None
    _frame_scores: Optional[List[float]] = None
    _frames_analyzed: Optional[int] = None
    _feature_contributions: Optional[FeatureContributions] = None 