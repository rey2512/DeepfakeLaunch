// Health check API endpoint
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Return health status
  res.status(200).json({
    status: "healthy",
    model_loaded: false,
    model_file_exists: true,
    uploads_directory: true,
    fallback_mode: true
  });
}; 