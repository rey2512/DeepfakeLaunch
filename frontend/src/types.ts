export interface AnalysisResult {
  is_deepfake: boolean;
  message: string;
  file_type: string;
  thumbnail_path?: string;
  upload_path?: string;
  timestamp?: string;
}

export interface UploadZoneProps {
  onFileSelected: (file: File, analysisResult: AnalysisResult) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
} 