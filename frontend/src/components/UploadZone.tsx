import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileCog, Upload, AlertTriangle, FileVideo, FileImage } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AnalysisResult, UploadZoneProps } from "@/types";
import API, { API_ENDPOINTS } from "@/lib/api";
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
  }, [toast]);
  
  const handleAnalysis = async () => {
    if (!file) return;
    
    setLoading(true);
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`Attempting to analyze file: ${file.name}`);
        
        const response = await API_ENDPOINTS.predict(formData);
        
        setLoading(false);
        setIsUploading(false);
        setUploadProgress(100);
        
        onFileSelected(file, response.data);
        setFile(null);
        
        toast({
          title: "Analysis Complete",
          description: "Your file has been analyzed successfully",
        });
        
        break;
      } catch (error) {
        console.error(`Error attempt ${retryCount + 1}:`, error);
        retryCount++;
        
        if (retryCount >= maxRetries) {
          setLoading(false);
          setIsUploading(false);
          setErrorMessage("Failed to analyze file after multiple attempts");
          toast({
            title: "Analysis Failed",
            description: "Failed to analyze file after multiple attempts. Please try again later.",
            variant: "destructive",
          });
        } else {
          // Wait before retrying (exponential backoff)
          await new Promise(r => setTimeout(r, 1000 * retryCount));
        }
      }
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
          
          <div className="mt-4 flex justify-end">
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
