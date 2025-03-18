#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Run the server using uvicorn
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 4 