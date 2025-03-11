# VerifiAI - Deepfake Detection System

A web application for detecting manipulated media content using a hybrid approach combining deep learning and signal processing.

## Features

- Upload images for deepfake analysis
- Real-time processing and detection
- Visual results with confidence scores
- Modern, responsive UI

## Project Structure

- `src/` - Frontend React application
- `main.py` - FastAPI backend server
- `models/` - Directory for the deepfake detection model
- `uploads/` - Directory for uploaded files

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Place your deepfake detection model in the `models/` directory:
   - The model should be named `deepfake_model.h5`
   - If you don't have a model, the system will use random predictions for demonstration

3. Start the backend server:
   ```
   python main.py
   ```
   The server will run at http://localhost:8000

### Frontend Setup

1. Install Node.js dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn
   ```

2. Start the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```
   The frontend will run at http://localhost:5173

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check endpoint
- `POST /upload/` - Upload a file
- `POST /predict/` - Analyze an image for deepfake detection

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, TensorFlow, OpenCV
- **Data Processing**: NumPy, Python

## License

MIT

## Deployment Guide

### Vercel Deployment (Frontend)

1. **Fork or Clone the Repository**

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect the project settings

3. **Environment Variables**
   - The project is configured to use a local API proxy by default
   - If you want to use a remote backend, set the following environment variables in Vercel:
     - `BACKEND_URL`: Your backend API URL (e.g., https://api.verifiai.tech)
     - `USE_FALLBACK`: Set to "false" to use the real backend, or "true" to use the fallback API

4. **Custom Domain (Optional)**
   - In the Vercel dashboard, go to your project settings
   - Add your custom domain (e.g., verifiai.tech)
   - Follow Vercel's instructions to configure DNS records

### Backend Deployment

1. **Server Requirements**
   - Python 3.8+ installed
   - Required packages installed via `pip install -r requirements.txt`
   - Proper file permissions for the `uploads` and `models` directories

2. **Running the Server**
   - For development:
     ```bash
     python main.py
     ```
   - For production:
     ```bash
     uvicorn main:app --host 0.0.0.0 --port 8000
     ```

3. **Nginx Configuration (Recommended for Production)**
   - See `server_config.md` for detailed Nginx configuration

## Troubleshooting

### "No response from server" Error

If you're experiencing the "No response from server" error when uploading files, try the following:

1. **Use the Built-in Fallback API**
   - The application now includes a built-in fallback API that runs directly on Vercel
   - This allows the application to work even when the main backend is unavailable
   - The fallback API provides mock responses for demonstration purposes

2. **Check if the backend is running**
   - Run `curl http://your-backend-url/health` to check if the backend is responding
   - You can also check `/api/health` on your Vercel deployment

3. **Check CORS configuration**
   - Ensure the backend CORS configuration includes your frontend domain

4. **Check browser console**
   - Open browser developer tools (F12)
   - Check the Console tab for any errors
   - Check the Network tab to see if requests to your API are being made

### Setting Up Your Own Backend

Once you're ready to use your own backend:

1. **Deploy your backend server**
   - Follow the instructions in the "Backend Deployment" section

2. **Update the Vercel configuration**
   - In the Vercel dashboard, update the `BACKEND_URL` environment variable to point to your backend
   - Set `USE_FALLBACK` to "false" to use your real backend instead of the fallback API

3. **Test the connection**
   - Upload a file to test if your frontend can connect to your backend
   - Check the browser console for any errors

### Other Issues

For other issues, please refer to the `server_config.md` file for detailed troubleshooting steps.
