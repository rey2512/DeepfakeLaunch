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
    res.status(500).json({
      error: 'Proxy Error',
      message: 'Could not connect to the backend server',
      details: err.message
    });
  }
});

// Use the proxy for all routes
app.use('/api', proxy);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', proxy: true });
});

// Export the Express app as a Vercel serverless function
module.exports = app; 