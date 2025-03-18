# Deepfake Detection Backend

This is the backend API for the Deepfake Detection system. It provides endpoints for uploading and analyzing images and videos for deepfake detection.

## Features

- Upload and analyze images and videos
- Detect deepfakes using a hybrid approach combining:
  - CNN-based detection
  - Frequency domain analysis (FFT)
  - Noise analysis
  - Edge inconsistency detection
  - Texture analysis
- Generate detailed analysis results with feature-level breakdown
- Frame-by-frame analysis for videos

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows:
     ```
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```
     source venv/bin/activate
     ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Running the Server

Start the server with:

```
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000

## API Endpoints

### GET /

Returns a welcome message.

### POST /predict/

Analyzes an uploaded image or video for deepfake detection.

**Request:**
- Form data with a file field named "file"

**Response:**
```json
{
  "score": 75.5,
  "category": "Likely Deepfake",
  "is_deepfake": true,
  "file_path": "/uploads/images/12345.jpg",
  "file_type": "image",
  "thumbnail_path": null,
  "frame_scores": null,
  "frames_analyzed": null,
  "feature_contributions": {
    "cnn_score": 0.8,
    "fft_score": 0.7,
    "noise_score": 0.6,
    "edge_score": 0.75,
    "texture_score": 0.85
  }
}
```

## Development

### Project Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI application
│   ├── models/           # ML models and Pydantic models
│   │   ├── deepfake_detector.py
│   │   └── response_models.py
│   ├── routers/          # API routes
│   │   └── prediction.py
│   └── utils/            # Utility functions
│       └── file_utils.py
├── uploads/              # Uploaded files
│   ├── images/
│   ├── videos/
│   └── thumbnails/
└── requirements.txt      # Dependencies
```

### Adding a Real ML Model

To replace the simulated detection with a real ML model:

1. Install the required ML libraries (e.g., TensorFlow, PyTorch)
2. Update the `DeepfakeDetector` class in `app/models/deepfake_detector.py`
3. Implement the detection methods with your trained models

## License

MIT 