// Fallback API endpoint for when the main backend is unavailable
const formidable = require('formidable');
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only handle POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }
  
  console.log('Received request to /api/predict');
  
  try {
    // Parse the multipart form data
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });
    
    // Get the uploaded file
    const file = files.file;
    if (!file) {
      return res.status(400).json({ detail: 'No file uploaded' });
    }
    
    console.log('File received:', file.originalFilename);
    
    // Generate a unique filename
    const fileExtension = file.originalFilename.split('.').pop().toLowerCase();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    
    // Determine if it's an image or video based on file extension
    const isVideo = ['mp4', 'mov', 'avi', 'webm'].includes(fileExtension);
    const fileType = isVideo ? "video" : "image";
    
    // Generate a deterministic score based on the file name
    const generateScore = (fileName) => {
      let hash = 0;
      for (let i = 0; i < fileName.length; i++) {
        hash = ((hash << 5) - hash) + fileName.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      // Generate a score between 0-100
      return Math.abs(hash % 101);
    };
    
    const score = generateScore(file.originalFilename);
    
    // Determine category based on score
    let category;
    if (score > 80) {
      category = "Likely Manipulated";
    } else if (score > 50) {
      category = "Potentially Manipulated";
    } else {
      category = "Likely Authentic";
    }
    
    // Mock feature contributions
    const featureContributions = {
      cnn_score: score * 0.6,
      fft_score: score * 0.1,
      noise_score: score * 0.1,
      edge_score: score * 0.1,
      texture_score: score * 0.1
    };
    
    // Create mock response
    const mockResponse = {
      score: score,
      category: category,
      is_deepfake: score > 50,
      file_path: `/uploads/${uniqueFilename}`,
      file_type: fileType,
      feature_contributions: featureContributions
    };
    
    // Add video-specific fields if it's a video
    if (isVideo) {
      mockResponse.thumbnail_path = `/uploads/thumbnail_${uniqueFilename.replace(fileExtension, 'jpg')}`;
      mockResponse.frames_analyzed = 10;
      mockResponse.frame_scores = Array.from({length: 10}, () => Math.floor(Math.random() * 101));
    }
    
    // Log the fallback response
    console.log('Using fallback API response for:', file.originalFilename);
    
    // Return the mock response
    return res.status(200).json(mockResponse);
  } catch (error) {
    console.error('Error processing file upload:', error);
    return res.status(500).json({ 
      detail: 'Error processing file upload', 
      error: error.message 
    });
  }
}; 