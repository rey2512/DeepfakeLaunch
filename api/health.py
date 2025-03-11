from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import os

app = FastAPI()

@app.get("/api/health")
async def health_check(request: Request):
    """
    Health check endpoint for Vercel
    """
    return JSONResponse({
        "status": "healthy",
        "environment": "vercel",
        "uploads_directory": os.path.exists("uploads") and os.access("uploads", os.W_OK)
    })

async def handler(request: Request):
    """
    Handle incoming requests and forward them to the FastAPI app
    """
    return await app(request.scope, request.receive, request.send) 