// This file is your API endpoint's client-side handler
import { deepfakeDetector } from '@/lib/deepfake-detector';

// Helper function to process a file using the detector
export async function analyzeFile(file: File) {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/quicktime'].includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, or MP4 file');
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size exceeds the 50MB limit');
    }

    // Convert file to buffer for processing
    const buffer = await file.arrayBuffer();
    
    // Process the file using our deepfake detector
    const result = await deepfakeDetector.analyze(buffer, file.type);

    return result;
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
} 