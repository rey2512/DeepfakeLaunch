import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FileCog, Upload, AlertTriangle, FileVideo, FileImage, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AnalysisResult, UploadZoneProps } from "@/types";
import API, { API_ENDPOINTS } from "@/lib/api";
import { cn } from "@/lib/utils";

export const UploadZone = ({
  onFileSelected,
  loading,
  setLoading,
}: UploadZoneProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [retrying, setRetrying] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [animationFrame, setAnimationFrame] = useState<number>(0);

  // Create and clean up preview URL when file changes
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);
  
  // Animation for analysis
  useEffect(() => {
    if (!loading) return;
    
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 8);
    }, 250);
    
    return () => clearInterval(interval);
  }, [loading]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const selectedFile = acceptedFiles[0];
    
    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/quicktime'].includes(selectedFile.type)) {
      setErrorMessage("Please upload a JPEG, PNG, or MP4 file");
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or MP4 file",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (50MB limit)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setErrorMessage("File size exceeds the 50MB limit");
      toast({
        title: "File too large",
        description: "File size exceeds the 50MB limit",
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
    setErrorMessage("");
  }, [toast]);

  const handleAnalysis = async () => {
    if (!file) return;
    
    setLoading(true);
    setIsUploading(true);
    setUploadProgress(0);
    setRetrying(false);
    
    const formData = new FormData();
    formData.append('file', file);

    // Progress simulation
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        // Don't go to 100% until we have a response
        const next = prev + (Math.random() * 5);
        return Math.min(next, 95);
      });
    }, 300);
    
    try {
      const response = await API_ENDPOINTS.predict(formData);
      clearInterval(progressInterval);
      
      setUploadProgress(100);
      
      // Safety check - make sure we have a score
      if (typeof response.data.score !== 'number') {
        throw new Error("Invalid response format: missing score");
      }
      
      // Map the backend response to match our frontend types
      const analysisResult: AnalysisResult = {
        score: response.data.score,
        category: response.data.category || (response.data.score > 80 ? "Likely Manipulated" : 
                  response.data.score > 50 ? "Potentially Manipulated" : "Likely Authentic"),
        is_deepfake: response.data.is_deepfake || response.data.score > 50,
        file_type: response.data.file_type || (file.type.startsWith('image') ? 'image' : 'video'),
        frames_analyzed: response.data.frames_analyzed || 0,
        frame_scores: response.data.frame_scores || [],
        thumbnail_path: response.data.thumbnail_path || "",
        upload_path: response.data.upload_path || "",
        timestamp: response.data.timestamp || new Date().toISOString(),
        feature_contributions: {
          noise_analysis: response.data.feature_contributions?.noise_analysis || response.data.feature_contributions?.noise_score || 0,
          facial_features: response.data.feature_contributions?.facial_features || response.data.feature_contributions?.cnn_score || 0,
          compression_artifacts: response.data.feature_contributions?.compression_artifacts || response.data.feature_contributions?.fft_score || 0,
          temporal_consistency: response.data.feature_contributions?.temporal_consistency || response.data.feature_contributions?.texture_score || 0,
          metadata_analysis: response.data.feature_contributions?.metadata_analysis || response.data.feature_contributions?.edge_score || 0,
        }
      };
      
      onFileSelected(file, analysisResult);
      setFile(null);
      setLoading(false);
      setIsUploading(false);
      
      toast({
        title: "Analysis Complete",
        description: `Result: ${analysisResult.category} (${analysisResult.score.toFixed(1)}%)`,
      });
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Analysis error:', error);
      setLoading(false);
      setIsUploading(false);
      setUploadProgress(0);
      
      let errorMsg = "Failed to analyze file. Please try again.";
      
      if (error instanceof Error) {
        errorMsg = `Error: ${error.message}`;
      }
      
      setErrorMessage(errorMsg);
      toast({
        title: "Analysis Failed",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/jpg': [],
      'video/mp4': [],
      'video/quicktime': [],
    },
    disabled: loading,
    maxFiles: 1,
  });
  
  // Analysis animation frames
  const animationDots = [
    "Analyzing.",
    "Analyzing..",
    "Analyzing...",
    "Analyzing....",
    "Analyzing.....",
    "Analyzing......",
    "Analyzing.......",
    "Analyzing........",
  ];
  
  return (
    <div className="w-full max-w-md mx-auto">
      {!file && (
        <div 
          {...getRootProps()} 
          className={cn(
            "border-2 border-dashed border-gray-300 dark:border-gray-600", 
            "rounded-xl p-6 transition-all duration-300 cursor-pointer",
            "dark:bg-gray-800/30 dark:backdrop-blur-lg",
            "flex flex-col items-center justify-center gap-4",
            isDragActive && "border-gray-400 bg-gray-50/50 dark:border-gray-500 dark:bg-gray-700/30",
            "animate-in"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium mb-2 dark:text-gray-100">
                Drag & drop your file here
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                or click to select a file for analysis
              </p>
              
              <div className="flex justify-center gap-4 text-sm text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <FileImage className="w-4 h-4" /> Images
                </span>
                <span className="flex items-center gap-1">
                  <FileVideo className="w-4 h-4" /> Videos
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Max file size: 50MB</p>
            </div>
          </div>
        </div>
      )}

      {file && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg animate-in fade-in-50 duration-300">
          <div className="flex items-center gap-3 mb-3">
            {file.type.startsWith('image/') ? (
              <FileImage className="w-5 h-5 text-blue-500" />
            ) : (
              <FileVideo className="w-5 h-5 text-blue-500" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate dark:text-gray-200">{file.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setFile(null)}
              disabled={loading}
              className="shrink-0"
            >
              Remove
            </Button>
          </div>
          
          {/* File preview */}
          <div className="my-4 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700/50 relative aspect-video flex items-center justify-center">
            {previewUrl && file.type.startsWith('image/') && (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className={cn(
                  "w-full h-full object-contain",
                  loading && "opacity-50 blur-sm transition-all duration-300"
                )}
              />
            )}
            {previewUrl && file.type.startsWith('video/') && (
              <video 
                src={previewUrl} 
                controls={!loading}
                muted
                className={cn(
                  "w-full h-full object-contain",
                  loading && "opacity-50 blur-sm transition-all duration-300"
                )}
              />
            )}
            
            {/* Analysis animation overlay */}
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-10">
                <div className="relative w-20 h-20 mb-2">
                  <div className="w-full h-full rounded-full border-4 border-blue-200/30 border-t-blue-500 animate-spin"></div>
                  <FileCog className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-400" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium">{animationDots[animationFrame]}</p>
                  <p className="text-xs text-blue-200 mt-1">AI processing your {file.type.startsWith('image/') ? 'image' : 'video'}</p>
                </div>
              </div>
            )}
          </div>
          
          {isUploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
          
          <div className="mt-4 flex justify-end gap-2">
            {retrying && (
              <Button 
                onClick={handleAnalysis}
                disabled={loading}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
            
            <Button 
              onClick={handleAnalysis}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <FileCog className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileCog className="w-4 h-4" />
                  Analyze File
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      
      {errorMessage && (
        <p className="text-center mt-4 text-red-500 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 inline-block mr-1" />
          {errorMessage}
        </p>
      )}
    </div>
  );
};
