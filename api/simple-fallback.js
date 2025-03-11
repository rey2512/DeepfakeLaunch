// Simple fallback API that doesn't rely on parsing multipart form data
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  console.log('Received request to /api/predict (simple fallback)');
  
  // Generate a random ID to use as filename
  const randomId = Math.random().toString(36).substring(2, 15);
  
  // Create a mock response with a random score
  const score = Math.floor(Math.random() * 101);
  
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
    file_path: `/uploads/${randomId}.jpg`,
    file_type: "image",
    feature_contributions: featureContributions
  };
  
  // Log the fallback response
  console.log('Using simple fallback API response');
  
  // Return the mock response
  return res.status(200).json(mockResponse);
}; 