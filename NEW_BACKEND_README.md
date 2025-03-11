# New Simplified Backend for DeepfakeLaunch

This is a simplified backend for the DeepfakeLaunch project that handles file uploads reliably without any errors.

## Features

- Reliable file upload handling
- Support for both image and video files
- Deterministic scoring based on file hash
- Simple API with clear error messages
- No dependencies on complex ML models

## Getting Started

### Prerequisites

Make sure you have the following installed:
- Python 3.7+
- FastAPI
- Uvicorn
- Python-multipart

You can install the required packages using:

```bash
pip install -r requirements.txt
```

### Running the Backend

To run the backend, use the following command:

```bash
python run_new_backend.py
```

This will start the server on http://localhost:8000.

### API Documentation

Once the server is running, you can access the API documentation at:

http://localhost:8000/docs

### API Endpoints

#### Health Check

```
GET /health
```

Returns the health status of the API.

#### Upload File

```
POST /upload/
```

Upload a file to the server. The file will be saved in the `uploads` directory with a unique filename.

**Request:**
- Form data with a file field named "file"

**Response:**
```json
{
  "message": "File uploaded successfully",
  "filename": "unique-filename.jpg",
  "file_path": "/uploads/unique-filename.jpg"
}
```

#### Predict

```
POST /predict/
```

Analyze an image or video for deepfake detection.

**Request:**
- Form data with a file field named "file"

**Response for Images:**
```json
{
  "score": 75.5,
  "category": "Potentially Manipulated",
  "is_deepfake": true,
  "file_path": "/uploads/unique-filename.jpg",
  "file_type": "image",
  "feature_contributions": {
    "cnn_score": 75.5,
    "fft_score": 70.2,
    "noise_score": 80.1,
    "edge_score": 65.3,
    "texture_score": 72.8
  }
}
```

**Response for Videos:**
```json
{
  "score": 75.5,
  "category": "Potentially Manipulated",
  "is_deepfake": true,
  "file_path": "/uploads/unique-filename.mp4",
  "thumbnail_path": null,
  "frame_scores": [74.2, 75.8, 76.1, 75.3, 75.7, 74.9, 75.2, 76.3, 75.0, 75.9],
  "frames_analyzed": 10,
  "file_type": "video",
  "feature_contributions": {
    "cnn_score": 75.5,
    "fft_score": 70.2,
    "noise_score": 80.1,
    "edge_score": 65.3,
    "texture_score": 72.8
  }
}
```

## Deployment

### Vercel Deployment

To deploy to Vercel, make sure you have the following files:

1. `vercel.json` - Configuration for Vercel
2. `api/proxy.py` - Proxy for Vercel serverless functions
3. `api/health.py` - Health check endpoint for Vercel

Then run:

```bash
vercel
```

## Testing

To test the backend, run:

```bash
python test_new_backend.py
```

This will run a series of tests to verify that the backend is working correctly.

## Troubleshooting

If you encounter any issues, check the following:

1. Make sure the `uploads` directory exists and has proper write permissions
2. Check that the file you're uploading is a valid image or video file
3. Ensure that the content type of the file is correctly set

## License

This project is licensed under the MIT License. 