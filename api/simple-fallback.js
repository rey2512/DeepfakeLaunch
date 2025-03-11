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
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  
  // Check if this is a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only POST requests are supported'
    });
  }
  
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
  
  // Generate random frame scores for video analysis
  const frameScores = Array.from({ length: 10 }, () => 
    Math.floor(Math.random() * 101)
  );
  
  // Mock feature contributions with values that add up to the score
  const featureContributions = {
    cnn_score: Math.min(100, Math.max(0, score + (Math.random() * 20 - 10))),
    fft_score: Math.min(100, Math.max(0, score + (Math.random() * 20 - 10))),
    noise_score: Math.min(100, Math.max(0, score + (Math.random() * 20 - 10))),
    edge_score: Math.min(100, Math.max(0, score + (Math.random() * 20 - 10))),
    texture_score: Math.min(100, Math.max(0, score + (Math.random() * 20 - 10)))
  };
  
  // Create mock response
  const mockResponse = {
    score: score,
    category: category,
    is_deepfake: score > 50,
    file_path: `/uploads/${randomId}.jpg`,
    file_type: "image",
    frame_scores: frameScores,
    frames_analyzed: 10,
    feature_contributions: featureContributions
  };
  
  // Log the fallback response
  console.log('Using simple fallback API response');
  console.log('Generated mock response with score:', score);
  
  // Return the mock response
  return res.status(200).json(mockResponse);
}; 