import { CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { AnalysisResult as AnalysisData } from "@/types";

interface AnalysisResultProps {
  is_deepfake: boolean;
  message: string;
  loading?: boolean;
  fileType?: string;
}

export const AnalysisResult = ({ 
  is_deepfake, 
  message,
  loading, 
  fileType = "image"
}: AnalysisResultProps) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so we can safely check for theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  return (
    <div className={cn(
      "glass-card p-8 rounded-xl w-full max-w-md mx-auto",
      "animate-in"
    )}>
      <div className="flex flex-col items-center gap-6">
        <div className="w-24 h-24 flex items-center justify-center">
          {is_deepfake ? (
            <AlertTriangle className="w-20 h-20 text-red-600 dark:text-red-400" />
          ) : (
            <CheckCircle className="w-20 h-20 text-green-600 dark:text-green-400" />
          )}
        </div>
        
        <div className="text-center">
          <h3 className="text-2xl font-semibold dark:text-gray-100 mb-4">
            {is_deepfake ? "Deepfake Detected" : "Content is Authentic"}
          </h3>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {message}
          </p>
          
          <div className="mt-6 text-sm px-4 py-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
            <p className="font-medium dark:text-gray-200 mb-2">Result:</p>
            <p className="text-gray-600 dark:text-gray-300">
              This {fileType} {is_deepfake ? "appears to be artificially generated or manipulated." : "appears to be authentic."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};