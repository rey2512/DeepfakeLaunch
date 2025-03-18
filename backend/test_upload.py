import os
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import HTMLResponse
import uvicorn

app = FastAPI()

@app.get("/", response_class=HTMLResponse)
async def index():
    """
    Serve a simple HTML form for testing file uploads
    """
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>File Upload Test</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            h1 {
                color: #333;
            }
            form {
                margin: 20px 0;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            .result {
                margin-top: 20px;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background-color: #f9f9f9;
                white-space: pre-wrap;
            }
            .success { border-color: green; }
            .error { border-color: red; }
        </style>
    </head>
    <body>
        <h1>File Upload Test</h1>
        
        <form id="uploadForm">
            <h3>Test Simple Upload</h3>
            <p>This tests the basic upload functionality</p>
            <input type="file" name="file" id="fileInput">
            <button type="button" onclick="uploadFile('/api/predict/test-upload')">Upload to Test Endpoint</button>
        </form>
        
        <form id="realUploadForm">
            <h3>Test Full Analysis</h3>
            <p>This tests the complete deepfake analysis endpoint</p>
            <input type="file" name="file" id="realFileInput">
            <button type="button" onclick="uploadFile('/api/predict/', true)">Analyze with Full Pipeline</button>
        </form>
        
        <div id="result" class="result" style="display: none;">
            <h3>Result:</h3>
            <pre id="resultContent"></pre>
        </div>
        
        <script>
            async function uploadFile(endpoint, isAnalysis = false) {
                const fileInput = isAnalysis ? document.getElementById('realFileInput') : document.getElementById('fileInput');
                const resultDiv = document.getElementById('result');
                const resultContent = document.getElementById('resultContent');
                
                if (!fileInput.files.length) {
                    alert('Please select a file first');
                    return;
                }
                
                const file = fileInput.files[0];
                const formData = new FormData();
                formData.append('file', file);
                
                resultDiv.style.display = 'block';
                resultDiv.className = 'result';
                resultContent.textContent = 'Uploading...';
                
                try {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        body: formData,
                    });
                    
                    const responseText = await response.text();
                    
                    if (response.ok) {
                        resultDiv.classList.add('success');
                        resultDiv.classList.remove('error');
                    } else {
                        resultDiv.classList.add('error');
                        resultDiv.classList.remove('success');
                    }
                    
                    resultContent.textContent = responseText;
                } catch (error) {
                    resultDiv.classList.add('error');
                    resultDiv.classList.remove('success');
                    resultContent.textContent = 'Error: ' + error.message;
                }
            }
        </script>
    </body>
    </html>
    """
    return html_content

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001) 