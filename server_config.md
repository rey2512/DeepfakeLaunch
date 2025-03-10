# Production Server Configuration Guide

## Backend Server Setup

1. **Domain Configuration**:
   - Set up a subdomain for your API (e.g., `api.verifiai.tech`)
   - Configure DNS records to point to your backend server

2. **Server Requirements**:
   - Python 3.8+ installed
   - Required packages installed via `pip install -r requirements.txt`
   - Proper file permissions for the `uploads` and `models` directories

3. **Running the Server**:
   - For production, use a production-grade ASGI server like Uvicorn behind Nginx:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
   
   - Or use Gunicorn with Uvicorn workers:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```

4. **Nginx Configuration**:
   ```nginx
   server {
       listen 80;
       server_name api.verifiai.tech;
       
       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

5. **SSL Configuration**:
   - Use Certbot to obtain and configure SSL certificates:
   ```bash
   certbot --nginx -d api.verifiai.tech
   ```

## Frontend Deployment

1. **Build the Frontend**:
   ```bash
   npm run build
   ```

2. **Nginx Configuration for Frontend**:
   ```nginx
   server {
       listen 80;
       server_name verifiai.tech www.verifiai.tech;
       
       root /path/to/frontend/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. **SSL Configuration**:
   ```bash
   certbot --nginx -d verifiai.tech -d www.verifiai.tech
   ```

## Troubleshooting

1. **Check Server Logs**:
   ```bash
   tail -f /var/log/nginx/error.log
   ```

2. **Test API Endpoints**:
   ```bash
   curl https://api.verifiai.tech/health
   ```

3. **CORS Issues**:
   - Ensure the backend CORS configuration includes your frontend domain
   - Check browser console for CORS-related errors

4. **File Permissions**:
   - Ensure the server has write permissions to the `uploads` directory:
   ```bash
   chmod -R 755 uploads
   chown -R www-data:www-data uploads
   ``` 