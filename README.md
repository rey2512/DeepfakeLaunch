MAJOR # VerifiAI - Deepfake Detection System
A web application for detecting manipulated media content with a modern, responsive UI.

## Features

- Upload images/video for analysis
- Visual results with confidence scores
- Modern, responsive UI

## Project Structure

- `src/` - Frontend React application
- `public/` - Static assets

## Setup Instructions

### Prerequisites

- Node.js 16+
- npm or yarn

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

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: React Query
- **Backend**: Tensorflow, openCV, Flask API

## License

MIT

## Deployment Guide

### Vercel Deployment (Frontend)

1. **Fork or Clone the Repository**

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect the project settings

3. **Custom Domain (Optional)**
   - In the Vercel dashboard, go to your project settings
   - Add your custom domain (e.g., verifiai.tech)
   - Follow Vercel's instructions to configure DNS records

## Troubleshooting

### Browser Compatibility

- The application is designed to work with modern browsers
- For best experience, use the latest version of Chrome, Firefox, Safari, or Edge

### Other Issues

If you encounter any issues with the frontend:

1. **Check browser console**
   - Open browser developer tools (F12)
   - Check the Console tab for any errors
   - Check the Network tab to see if requests are being made correctly

2. **Clear browser cache**
   - Sometimes clearing your browser cache can resolve issues with the application

3. **Check dependencies**
   - Make sure all dependencies are installed correctly with `npm install`
