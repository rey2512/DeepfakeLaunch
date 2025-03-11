// Vercel Serverless Function to proxy requests to the main backend
const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const cors = require('cors');

// Create Express server
const app = express();

// Enable CORS for all routes
app.use(cors());

// Define the target backend URL
const TARGET_URL = process.env.BACKEND_URL || 'https://api.verifiai.tech';
const USE_FALLBACK = process.env.USE_FALLBACK === 'true';

// Check if we should use the fallback
if (USE_FALLBACK) {
  console.log('Using fallback mode - will not attempt to proxy to backend');
  
  // Return a simple response for health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', proxy: true, fallback: true });
  });
  
  // For all other routes, return an error suggesting to use the fallback
  app.all('*', (req, res) => {
    res.status(503).json({
      error: 'Backend Unavailable',
      message: 'The backend server is currently unavailable. Please use the fallback API.',
      fallback_endpoint: '/api/simple-fallback'
    });
  });
} else {
  // Create proxy middleware
  const proxy = createProxyMiddleware({
    target: TARGET_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api': '', // Remove /api prefix when forwarding
    },
    onProxyRes: function(proxyRes, req, res) {
      // Add CORS headers to the response
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    },
    onError: (err, req, res) => {
      console.error('Proxy Error:', err);
      // Return a 500 error with "Unknown error"
      res.status(500).json({
        detail: 'Unknown error'
      });
    }
  });

  // Use the proxy for all routes
  app.use('/api', proxy);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', proxy: true });
  });
}

// Export the Express app as a Vercel serverless function
module.exports = app; 