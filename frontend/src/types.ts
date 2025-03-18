export interface AnalysisResult {
  score: number;
  category: string;
  is_deepfake: boolean;
  file_type: 'image' | 'video';
  frames_analyzed?: number;
  frame_scores?: number[];
  thumbnail_path?: string;
  upload_path?: string;
  timestamp: string;
  feature_contributions?: {
    noise_analysis?: number;
    facial_features?: number;
    compression_artifacts?: number;
    temporal_consistency?: number;
    metadata_analysis?: number;
    // Legacy fields for backward compatibility
    cnn_score?: number;
    fft_score?: number;
    noise_score?: number;
    edge_score?: number;
    texture_score?: number;
  };
}

export interface UploadZoneProps {
  onFileSelected: (file: File, result: AnalysisResult) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
} 