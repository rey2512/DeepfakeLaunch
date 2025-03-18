import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileCog, Upload, AlertTriangle, FileVideo, FileImage, RefreshCw, Coffee } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AnalysisResult, UploadZoneProps } from "@/types";
import API, { API_ENDPOINTS } from "@/lib/api";
import { cn } from "@/lib/utils";
import axios from "axios";

// Interface for API error responses
interface ApiErrorResponse {
  detail?: string;
  [key: string]: unknown;
}

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
  const [isServerSleeping, setIsServerSleeping] = useState<boolean>(false);
  
  // Log the API URL for debugging
  console.log(`Using API URL: ${API.defaults.baseURL}`);

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
    setIsServerSleeping(false);
  }, [toast]);
  
  // Function to check if server is awake
  const pingServer = async () => {
    try {
      setErrorMessage("Waking up the server. This can take up to 60 seconds...");
      setIsServerSleeping(true);
      
      await axios.get(`${API.defaults.baseURL}`, { 
        timeout: 5000,
        headers: { 'Cache-Control': 'no-cache' } 
      });
      
      setIsServerSleeping(false);
      setErrorMessage("");
      toast({
        title: "Server is awake",
        description: "The server is now responding. You can analyze files.",
        variant: "default",
      });
      
      return true;
    } catch (error) {
      console.log("Server ping failed, still trying to wake it up");
      return false;
    }
  };
  
  const handleAnalysis = async () => {
    if (!file) return;
    
    setLoading(true);
    setIsUploading(true);
    setUploadProgress(0);
    setRetrying(false);
    
    // Try to ping server first
    const isAwake = await pingServer();
    if (!isAwake) {
      // Set a timeout to retry the ping every 5 seconds for up to 60 seconds
      let attempts = 0;
      const maxAttempts = 12; // 12 * 5 seconds = 60 seconds
      
      const pingInterval = setInterval(async () => {
        attempts++;
        const success = await pingServer();
        
        if (success || attempts >= maxAttempts) {
          clearInterval(pingInterval);
          
          if (success) {
            // Server is now awake, proceed with analysis
            setIsServerSleeping(false);
            setErrorMessage("");
            proceedWithAnalysis();
          } else {
            // Server still not responding after 60 seconds
            setLoading(false);
            setIsUploading(false);
            setIsServerSleeping(true);
            setErrorMessage("Server is taking too long to wake up. This is expected for the free plan - please try again.");
            toast({
              title: "Server Sleep Mode",
              description: "The free server is still waking up. Please try again in a minute.",
              variant: "destructive",
            });
          }
        }
      }, 5000);
      
      return;
    }
    
    proceedWithAnalysis();
  };
  
  const proceedWithAnalysis = async () => {
    if (!file) return;
    
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
      console.log(`Sending file for analysis: ${file.name}`);
      console.log(`API Base URL: ${API.defaults.baseURL}`);
      
      // Try the upload with a specific timeout to catch network issues faster
      const response = await API_ENDPOINTS.predict(formData);
      clearInterval(progressInterval);
      
      console.log('Analysis response:', response.data);
      setUploadProgress(100);
      
      // Safety check - make sure we have a score
      if (typeof response.data.score !== 'number') {
        throw new Error("Invalid response format: missing score");
      }
      
      // Map the backend response to match our frontend types if needed
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
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMsg = `Server error: ${error.response.status} - ${error.response.statusText || 'Unknown error'}`;
          console.error("Response error details:", error.response.data);
        } else if (error.request) {
          // The request was made but no response was received
          errorMsg = "Network error: No response from server. The server might still be waking up.";
          setRetrying(true);
          setIsServerSleeping(true);
        } else {
          // Something happened in setting up the request
          errorMsg = `Request error: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMsg = `Error: ${error.message}`;
        console.error("Error details:", error);
      }
      
      setErrorMessage(errorMsg);
      toast({
        title: "Analysis Failed",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const tryDirectUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setRetrying(true);
    setErrorMessage("Trying direct upload to backend...");
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Try a direct fetch to the backend to bypass any axios config issues
      const response = await fetch(`${API.defaults.baseURL}/predict`, {
        method: 'POST',
        body: formData,
        headers: {
          'Origin': import.meta.env.VITE_SITE_URL || "https://verifiai.tech"
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Direct fetch response:', data);
      
      if (typeof data.score !== 'number') {
        throw new Error("Invalid response format: missing score");
      }
      
      // Map the response the same way as before
      const analysisResult: AnalysisResult = {
        score: data.score,
        category: data.category || (data.score > 80 ? "Likely Manipulated" : 
                  data.score > 50 ? "Potentially Manipulated" : "Likely Authentic"),
        is_deepfake: data.is_deepfake || data.score > 50,
        file_type: data.file_type || (file.type.startsWith('image') ? 'image' : 'video'),
        frames_analyzed: data.frames_analyzed || 0,
        frame_scores: data.frame_scores || [],
        thumbnail_path: data.thumbnail_path || "",
        upload_path: data.upload_path || "",
        timestamp: data.timestamp || new Date().toISOString(),
        feature_contributions: {
          noise_analysis: data.feature_contributions?.noise_analysis || data.feature_contributions?.noise_score || 0,
          facial_features: data.feature_contributions?.facial_features || data.feature_contributions?.cnn_score || 0,
          compression_artifacts: data.feature_contributions?.compression_artifacts || data.feature_contributions?.fft_score || 0,
          temporal_consistency: data.feature_contributions?.temporal_consistency || data.feature_contributions?.texture_score || 0,
          metadata_analysis: data.feature_contributions?.metadata_analysis || data.feature_contributions?.edge_score || 0,
        }
      };
      
      onFileSelected(file, analysisResult);
      setFile(null);
      setLoading(false);
      setRetrying(false);
      
      toast({
        title: "Analysis Complete",
        description: `Result: ${analysisResult.category} (${analysisResult.score.toFixed(1)}%)`,
      });
    } catch (error) {
      console.error('Direct fetch error:', error);
      setLoading(false);
      setRetrying(false);
      
      let errorMsg = "Direct upload failed. The backend service may be unavailable.";
      
      if (error instanceof Error) {
        errorMsg = `Direct upload error: ${error.message}`;
      }
      
      setErrorMessage(errorMsg);
      toast({
        title: "Analysis Failed",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };
  
  const wakeupServer = async () => {
    setLoading(true);
    setErrorMessage("Attempting to wake up the server...");
    
    try {
      await axios.get(`${API.defaults.baseURL}`, { 
        timeout: 60000, // Allow up to 60 seconds for wakeup
        headers: { 'Cache-Control': 'no-cache' } 
      });
      
      setIsServerSleeping(false);
      setErrorMessage("");
      setLoading(false);
      
      toast({
        title: "Server Awakened",
        description: "The server is now responding. You can analyze files.",
        variant: "default",
      });
    } catch (error) {
      console.error('Server wakeup error:', error);
      setLoading(false);
      
      setErrorMessage("Server is still in sleep mode. Please try again in a minute.");
      toast({
        title: "Server Still Sleeping",
        description: "The server may take up to a minute to fully wake up. Please try again soon.",
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
  
  return (
    <div className="w-full max-w-md mx-auto">
      {isServerSleeping && (
        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-3">
          <Coffee className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Server is waking up</p>
            <p className="text-xs text-amber-600 dark:text-amber-300">
              This is normal for free hosting. It may take up to 60 seconds to resume from sleep mode.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={wakeupServer}
            disabled={loading}
            className="flex-shrink-0"
          >
            Wake Up
          </Button>
        </div>
      )}
    
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

      {file && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
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
            >
              Remove
            </Button>
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
                onClick={tryDirectUpload}
                disabled={loading}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Alternative Upload
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
                  {isServerSleeping ? "Waking Server..." : "Analyzing..."}
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
      
      {errorMessage && !isServerSleeping && (
        <p className="text-center mt-4 text-red-500 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 inline-block mr-1" />
          {errorMessage}
        </p>
      )}
    </div>
  );
};
