import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { FileCog, Upload, AlertTriangle, FileVideo, FileImage, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AnalysisResult, UploadZoneProps } from "@/types";
import API, { API_ENDPOINTS } from "@/lib/api";
import { cn } from "@/lib/utils";
import { deepfakeDetector } from "@/lib/deepfake-detector";

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
  const [analysisStage, setAnalysisStage] = useState<string>("Preparing");
  const abortControllerRef = useRef<AbortController | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

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
    
    const stageSequence = [
      "Analyzing noise patterns",
      "Checking facial features",
      "Examining compression artifacts",
      "Verifying temporal consistency",
      "Analyzing metadata",
      "Calculating final score"
    ];
    
    const stageInterval = setInterval(() => {
      setAnalysisStage(prev => {
        const currentIndex = stageSequence.indexOf(prev);
        const nextIndex = (currentIndex + 1) % stageSequence.length;
        return stageSequence[nextIndex];
      });
    }, 2000);
    
    const dotInterval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 8);
    }, 250);
    
    return () => {
      clearInterval(stageInterval);
      clearInterval(dotInterval);
      setAnalysisStage("Preparing");
    };
  }, [loading]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Cancel any ongoing speech
      if (speechSynthesisRef.current && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Make the voices available on load (needed for some browsers)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices
      window.speechSynthesis.getVoices();
      
      // Some browsers need this event to properly load voices
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Speech synthesis function
  const speakMessage = (message: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any previous speech
      window.speechSynthesis.cancel();
      
      // Create a new utterance with robotic settings
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.0; // Normal speech rate
      utterance.pitch = 0.3; // Very low pitch for robotic effect
      utterance.volume = 1.0;
      
      // Try to find the most robotic-sounding voice
      const voices = window.speechSynthesis.getVoices();
      const roboticVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('microsoft') || 
        voice.name.toLowerCase().includes('google') ||
        voice.name.toLowerCase().includes('daniel')
      );
      
      if (roboticVoice) {
        utterance.voice = roboticVoice;
      }
      
      // Store reference for potential cancellation
      speechSynthesisRef.current = utterance;
      
      // Speak the message
      window.speechSynthesis.speak(utterance);
    }
  };

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
    setAnalysisStage("Preparing");
    
    // Speak the analysis message - only this message and more robotic
    speakMessage("Our System is detecting your file");
    
    // Create a new AbortController
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    try {
      // Progress simulation with more realistic pace
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 20) return prev + (Math.random() * 3);
          if (prev < 50) return prev + (Math.random() * 2);
          if (prev < 80) return prev + (Math.random() * 1);
          return Math.min(prev + 0.5, 95); // Slow down as we approach 95%
        });
      }, 300);
      
      // Read the file as ArrayBuffer
      const arrayBuffer = await readFileAsArrayBuffer(file);
      
      if (signal.aborted) {
        clearInterval(progressInterval);
        return;
      }
    
      setUploadProgress(60);
      setAnalysisStage("Analyzing noise patterns");
      
      // Analyze the file using our detector
      const analysisResult = await deepfakeDetector.analyze(arrayBuffer, file.type);
      
      if (signal.aborted) {
        clearInterval(progressInterval);
        return;
      }
      
      setUploadProgress(90);
      setAnalysisStage("Finalizing results");
      
      // Allow time for the user to see the analysis animations
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      onFileSelected(file, analysisResult);
      setFile(null);
      setLoading(false);
      setIsUploading(false);
      
      toast({
        title: "Analysis Complete",
        description: `Result: ${analysisResult.category} (${analysisResult.score.toFixed(1)}%)`,
      });
    } catch (error) {
      // Only process error if not aborted
      if (!signal.aborted) {
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
    }
  };
  
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result instanceof ArrayBuffer) {
          resolve(event.target.result);
        } else {
          reject(new Error("Failed to read file as ArrayBuffer"));
        }
      };
      
      reader.onerror = () => {
        reject(new Error("FileReader error"));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  const cancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Cancel any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    setLoading(false);
    setIsUploading(false);
    setUploadProgress(0);
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
            >
              Change
            </Button>
          </div>
          
          {/* File Preview */}
          <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 aspect-video">
            {previewUrl && file.type.startsWith('image/') && (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="object-contain w-full h-full"
              />
            )}
            
            {previewUrl && file.type.startsWith('video/') && (
              <video 
                ref={videoRef}
                src={previewUrl} 
                controls={!loading}
                className="object-contain w-full h-full"
                muted
                controlsList="nodownload"
              />
            )}
            
            {/* Analysis overlay */}
            {loading && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="relative w-20 h-20 mb-2">
                  <div className="absolute inset-0 animate-spin-slow">
                    <div className="w-4 h-4 bg-blue-500 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileCog className="w-10 h-10 text-white" />
                  </div>
                </div>
                <p className="text-white font-medium">{animationDots[animationFrame]}</p>
                <p className="text-blue-300 text-sm mt-2">{analysisStage}</p>
              </div>
            )}
          </div>
          
          {errorMessage && (
            <div className="rounded-lg p-3 bg-red-100 dark:bg-red-900/30 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-300">{errorMessage}</p>
            </div>
          )}
          
          {isUploading && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Uploading & analyzing</span>
                <span>{uploadProgress.toFixed(0)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          
          <div className="flex justify-center gap-3">
            {!loading ? (
              <Button 
                onClick={handleAnalysis}
                className="w-full flex items-center gap-2"
                disabled={errorMessage !== ""}
              >
                <FileCog className="w-4 h-4" />
                Analyze File
              </Button>
            ) : (
              <Button 
                variant="outline"
                onClick={cancelAnalysis}
                className="w-full flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:text-red-400 dark:hover:text-red-300 dark:border-red-900 dark:hover:border-red-800"
              >
                Cancel Analysis
              </Button>
            )}
          </div>
            
          {errorMessage && (
            <div className="mt-4 flex justify-center">
            <Button 
                variant="outline"
                size="sm"
                onClick={() => {
                  setErrorMessage("");
                  setRetrying(true);
                  handleAnalysis();
                }}
                disabled={loading || retrying}
                className="flex items-center gap-1 text-xs"
              >
                <RefreshCw className="w-3 h-3" />
                Try Again
            </Button>
          </div>
          )}
        </div>
      )}
    </div>
  );
};
