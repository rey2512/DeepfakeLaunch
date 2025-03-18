import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, FileVideo, Loader2 } from "lucide-react";
import axios, { AxiosError } from "axios";
import { cn } from "@/lib/utils";

// Define a proper type for the analysis result
interface AnalysisResult {
  score: number;
  category: string;
  is_deepfake: boolean;
  file_path: string;
  file_type: "image" | "video";
  thumbnail_path?: string;
  frame_scores?: number[];
  frames_analyzed?: number;
  feature_contributions?: {
    cnn_score: number;
    fft_score: number;
    noise_score: number;
    edge_score: number;
    texture_score: number;
  };
}

// Define a type for API error response
interface ApiErrorResponse {
  detail?: string;
  [key: string]: unknown;
}

interface UploadZoneProps {
  onFileSelected: (file: File, result: AnalysisResult) => void;
  setAnalyzing: (analyzing: boolean) => void;
}

export const UploadZone = ({ onFileSelected, setAnalyzing }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Determine if we're in development mode
  const isDevelopment = import.meta.env.MODE === 'development';
  
  // Use the environment variable for the API URL, with a fallback
  const API_URL = import.meta.env.VITE_API_URL || "https://deepfakelaunch.onrender.com";
  
  // Log the API URL for debugging
  console.log(`Using API URL: ${API_URL}`);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Determine file type
      if (file.type.startsWith("image/")) {
        setFileType("image");
      } else if (file.type.startsWith("video/")) {
        setFileType("video");
      } else {
        setError("Unsupported file type. Please upload an image or video file.");
        return;
      }
      
      processFile(file);
    }
  }, []);

  const processFile = async (file: File) => {
    setAnalyzing(true);
    setError(null);
    setUploadProgress(0);
    setUploadMessage(`Processing your ${fileType} with our hybrid detection system...`);
    
    const formData = new FormData();
    formData.append("file", file);

    // Maximum number of retry attempts
    const maxRetries = 3;
    let retryCount = 0;
    let success = false;

    while (retryCount < maxRetries && !success) {
      try {
        console.log(`Attempt ${retryCount + 1}: Sending file to ${API_URL}/api/predict/`);
        
        // Simulate upload progress - this is for UX only since we can't accurately track actual progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            // Don't go to 100% until we have a response
            const next = prev + (Math.random() * 5);
            return Math.min(next, 95);
          });
        }, 300);
        
        // Send the file to the backend for prediction
        const response = await axios.post<AnalysisResult>(`${API_URL}/api/predict/`, formData, {
          headers: { 
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000, // 60 second timeout
        });
        
        // Clear the progress interval
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        console.log("Response received:", response.data);
        
        // Make sure the response has all required fields
        if (!response.data || 
            typeof response.data.score !== 'number' || 
            !response.data.category || 
            typeof response.data.is_deepfake !== 'boolean') {
          throw new Error("Invalid response format from server");
        }
        
        // Process successful response
        onFileSelected(file, response.data);
        success = true;
      } catch (error) {
        retryCount++;
        console.error(`Attempt ${retryCount} failed:`, error);
        
        if (retryCount >= maxRetries) {
          // All retry attempts failed
          let errorMessage = "Failed to analyze file. Please try again.";
          
          if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<ApiErrorResponse>;
            if (axiosError.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              console.error("Response status:", axiosError.response.status);
              const statusCode = axiosError.response.status;
              
              // For 500 errors, always show "Unknown error"
              if (statusCode === 500) {
                errorMessage = `Error (${statusCode}): Unknown error`;
              } else {
                const errorDetail = axiosError.response.data?.detail || 'Unknown error';
                console.error("Response data:", axiosError.response.data);
                errorMessage = `Error (${statusCode}): ${errorDetail}`;
              }
            } else if (axiosError.request) {
              // The request was made but no response was received
              console.error("No response received:", axiosError.request);
              
              // Instead of showing "No response from server", show a 500 error
              errorMessage = "Error (500): Unknown error";
            } else {
              // Something happened in setting up the request that triggered an Error
              errorMessage = `Error (500): ${axiosError.message}`;
            }
          } else {
            // Handle non-Axios errors
            errorMessage = `Error (500): ${error instanceof Error ? error.message : String(error)}`;
          }
          
          setError(errorMessage);
          setAnalyzing(false);
        } else {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "video/*": [".mp4", ".mov", ".avi"],
    },
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    maxSize: 100 * 1024 * 1024, // 100MB max file size
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "glass-card p-12 rounded-xl cursor-pointer transition-all duration-300",
          "border-2 border-dashed border-gray-200 hover:border-gray-300",
          "dark:border-gray-700 dark:hover:border-gray-600",
          "dark:bg-gray-800/30 dark:backdrop-blur-lg",
          "flex flex-col items-center justify-center gap-4",
          isDragging && "border-gray-400 bg-gray-50/50 dark:border-gray-500 dark:bg-gray-700/30",
          "animate-in"
        )}
      >
        <input {...getInputProps()} />
        <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
          <Upload className="w-8 h-8" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">Drop your file here</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">or click to select a file</p>
          <div className="flex justify-center gap-4 text-sm text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-4 h-4" /> Images
            </span>
            <span className="flex items-center gap-1">
              <FileVideo className="w-4 h-4" /> Videos
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Max file size: 100MB</p>
        </div>
      </div>

      {uploadMessage && (
        <div className="mt-6 text-center">
          {uploadProgress > 0 && (
            <div className="mb-3">
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
            {uploadProgress < 100 && (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
            )}
            <p>{uploadMessage}</p>
          </div>
        </div>
      )}
      
      {error && (
        <p className="text-center mt-4 text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
