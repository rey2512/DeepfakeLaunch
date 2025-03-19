#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Ensure upload directories exist
mkdir -p uploads/images uploads/videos uploads/thumbnails

# Set the number of workers based on CPU cores (2 x number of cores + 1)
# But we'll use a more conservative approach for resource constrained environments
WORKERS=${WORKERS:-4}

# Get the PORT environment variable or use default
PORT=${PORT:-8000}

# Run with Gunicorn for production
echo "Starting server on port $PORT with $WORKERS workers"
gunicorn app.main:app \
    --bind 0.0.0.0:$PORT \
    --workers $WORKERS \
    --worker-class uvicorn.workers.UvicornWorker \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - 