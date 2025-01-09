import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, FileVideo } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

export const UploadZone = ({ onFileSelected }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelected(acceptedFiles[0]);
    }
  }, [onFileSelected]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false)
  });

  return (
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
        <p className="text-sm text-gray-500 mb-4">
          or click to select a file
        </p>
        <div className="flex justify-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <ImageIcon className="w-4 h-4" /> Images
          </span>
          <span className="flex items-center gap-1">
            <FileVideo className="w-4 h-4" /> Videos
          </span>
        </div>
      </div>
    </div>
  );
};