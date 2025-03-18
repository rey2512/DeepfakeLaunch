import axios from 'axios';

// Get the API URL from environment variables
const baseURL = import.meta.env.VITE_API_URL || "https://deepfakelaunch.onrender.com";
const siteURL = import.meta.env.VITE_SITE_URL || "https://verifiai.tech";

console.log(`API configured for: ${baseURL}`);
console.log(`Site configured for: ${siteURL}`);

// Create axios instance with configuration
const API = axios.create({ 
  baseURL,
  timeout: 30000, // 30 seconds timeout for longer operations like video processing
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': siteURL
  }
});

// Request interceptor for logging
API.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
API.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.statusText}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response || error);
    return Promise.reject(error);
  }
);

// API endpoint functions
const predictEndpoint = '/api/predict';

export const API_ENDPOINTS = {
  // File upload for analysis
  predict: (formData: FormData) => API.post(predictEndpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Origin': siteURL
    },
  }),
  
  // Health check
  health: () => API.get('/'),
};

export default API; 