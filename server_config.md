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

### Option 1: Traditional Web Server

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

### Option 2: Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Configure Environment Variables**:
   - Create a `.env.production` file with:
   ```
   VITE_API_URL=https://api.verifiai.tech
   ```
   
   - Create a `vercel.json` file with:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ],
     "env": {
       "VITE_API_URL": "https://api.verifiai.tech"
     },
     "build": {
       "env": {
         "VITE_API_URL": "https://api.verifiai.tech"
       }
     }
   }
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   Or connect your GitHub repository to Vercel for automatic deployments.

4. **Configure Custom Domain**:
   - In the Vercel dashboard, go to your project settings
   - Add your custom domain (e.g., verifiai.tech)
   - Follow Vercel's instructions to configure DNS records

## Troubleshooting

1. **Check Server Logs**:
   ```bash
   tail -f /var/log/nginx/error.log
   ```

2. **Test API Endpoints**:
   ```bash
   curl https://api.verifiai.tech/health
   ```
   
   Or use the provided check_backend.js script:
   ```bash
   node check_backend.js https://api.verifiai.tech/health
   ```

3. **CORS Issues**:
   - Ensure the backend CORS configuration includes your frontend domain
   - Check browser console for CORS-related errors
   - Common error: "No 'Access-Control-Allow-Origin' header is present"

4. **File Permissions**:
   - Ensure the server has write permissions to the `uploads` directory:
   ```bash
   chmod -R 755 uploads
   chown -R www-data:www-data uploads
   ```

5. **Vercel-specific Issues**:
   - Check that environment variables are correctly set in Vercel dashboard
   - Verify that the API URL is correctly being used in your code
   - Use browser developer tools to check network requests and console errors 