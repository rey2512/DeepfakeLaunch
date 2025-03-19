import axios from 'axios';
import { analyzeFile } from '@/api/predict';

// Use Vite's environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const API_ENDPOINTS = {
  predict: async (formData: FormData) => {
    // Get the file from the FormData
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Process the file locally using our detector
    const result = await analyzeFile(file);
    
    // Return in a format compatible with the existing code
    return { data: result };
  },
};

export default API; 