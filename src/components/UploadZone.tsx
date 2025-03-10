import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, FileVideo } from "lucide-react";
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
    [key: string]: number;
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

  // Get API URL from environment variable or use default
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
    setUploadMessage(`Processing your ${fileType} with our hybrid detection system...`);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log(`Sending file to ${API_URL}/predict/`);
      
      // Send the file to the backend for prediction
      const response = await axios.post<AnalysisResult>(`${API_URL}/predict/`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
        },
        timeout: fileType === "video" ? 60000 : 30000, // Longer timeout for videos
      });

      console.log("Response received:", response.data);
      setUploadMessage("Analysis complete!");
      onFileSelected(file, response.data);
    } catch (error: unknown) {
      console.error("Error analyzing file:", error);
      
      // More detailed error message
      let errorMessage = "Failed to analyze the file. Please try again.";
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        if (axiosError.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const statusCode = axiosError.response.status;
          const errorDetail = axiosError.response.data?.detail || 'Unknown error';
          
          errorMessage = `Server error: ${statusCode} - ${errorDetail}`;
          console.error("Response data:", axiosError.response.data);
        } else if (axiosError.request) {
          // The request was made but no response was received
          errorMessage = "No response from server. Is the backend running?";
        } else {
          // Something happened in setting up the request
          errorMessage = `Error: ${axiosError.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
      setUploadMessage(null);
    } finally {
      setAnalyzing(false);
      setFileType(null);
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
          "flex flex-col items-center justify-center gap-4",
          isDragging && "border-gray-400 bg-gray-50/50",
          "animate-in"
        )}
      >
        <input {...getInputProps()} />
        <div className="p-4 rounded-full bg-gray-50 text-gray-500">
          <Upload className="w-8 h-8" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Drop your file here</h3>
          <p className="text-sm text-gray-500 mb-4">or click to select a file</p>
          <div className="flex justify-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-4 h-4" /> Images
            </span>
            <span className="flex items-center gap-1">
              <FileVideo className="w-4 h-4" /> Videos
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Max file size: 100MB</p>
        </div>
      </div>

      {uploadMessage && (
        <p className="text-center mt-4 text-gray-600">{uploadMessage}</p>
      )}
      
      {error && (
        <p className="text-center mt-4 text-red-500">{error}</p>
      )}
    </div>
  );
};
