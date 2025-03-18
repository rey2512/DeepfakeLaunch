import axios from 'axios';

// Get the API URL from environment variables
const baseURL = import.meta.env.VITE_API_URL || "https://deepfakelaunch.onrender.com";
const siteURL = import.meta.env.VITE_SITE_URL || "https://verifiai.tech";

console.log(`API configured for: ${baseURL}`);
console.log(`Site configured for: ${siteURL}`);

// Create axios instance with configuration
const API = axios.create({ 
  baseURL,
  timeout: 60000, // 60 seconds timeout for longer operations like video processing
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
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Response Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response Error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API endpoint functions
const predictEndpoint = '/api/predict';

export const API_ENDPOINTS = {
  // File upload for analysis
  predict: (formData: FormData) => {
    return API.post(predictEndpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Origin': siteURL
      },
      // Increase timeout for larger files
      timeout: 120000, // 2 minutes
    });
  },
  
  // Health check
  health: () => API.get('/'),
};

export default API; 