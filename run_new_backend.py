import uvicorn

if __name__ == "__main__":
    print("Starting VerifiAI API server...")
    print("Access the API documentation at: http://localhost:8000/docs")
    uvicorn.run("new_backend:app", host="0.0.0.0", port=8000, reload=True) 