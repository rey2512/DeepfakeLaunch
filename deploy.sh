#!/bin/bash

# Deployment script for VerifiAI

echo "Starting deployment process for VerifiAI..."

# 1. Build the frontend
echo "Building frontend..."
npm run build

# 2. Copy frontend files to web server directory
echo "Copying frontend files to web server directory..."
# Replace with your actual web server directory
cp -r dist/* /var/www/verifiai.tech/

# 3. Restart the backend server
echo "Restarting backend server..."
# Kill any existing Python processes
pkill -f "python main.py" || true
pkill -f "uvicorn main:app" || true

# Start the backend server in production mode
cd /path/to/backend
# Create uploads and models directories if they don't exist
mkdir -p uploads
mkdir -p models

# Ensure proper permissions
chmod -R 755 uploads
chmod -R 755 models

# Start the server with nohup to keep it running after the script exits
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > server.log 2>&1 &

echo "Deployment completed successfully!"
echo "Frontend: https://verifiai.tech"
echo "Backend API: https://api.verifiai.tech"
echo "Check server.log for backend logs" 