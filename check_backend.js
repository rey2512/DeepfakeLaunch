// Backend Health Check Script
// Run with: node check_backend.js

const https = require('https');
const http = require('http');

// The backend URL to check
const backendUrl = process.argv[2] || 'https://api.verifiai.tech/health';

console.log(`Checking backend health at: ${backendUrl}`);

// Determine if we should use http or https
const client = backendUrl.startsWith('https') ? https : http;

const request = client.get(backendUrl, (res) => {
  let data = '';
  
  // Log the status code
  console.log(`Status Code: ${res.statusCode}`);
  
  // A chunk of data has been received
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  // The whole response has been received
  res.on('end', () => {
    console.log('Response Data:');
    try {
      const parsedData = JSON.parse(data);
      console.log(JSON.stringify(parsedData, null, 2));
    } catch (e) {
      console.log('Could not parse response as JSON:');
      console.log(data);
    }
  });
});

// Handle errors
request.on('error', (error) => {
  console.error('Error connecting to backend:');
  console.error(error.message);
  
  if (error.code === 'ENOTFOUND') {
    console.log('\nThe domain could not be resolved. Possible causes:');
    console.log('1. The domain does not exist or is not configured correctly');
    console.log('2. DNS propagation is not complete');
  } else if (error.code === 'ECONNREFUSED') {
    console.log('\nConnection refused. Possible causes:');
    console.log('1. The server is not running');
    console.log('2. A firewall is blocking the connection');
    console.log('3. The port is not open or is being used by another process');
  }
});

// Set a timeout
request.setTimeout(10000, () => {
  console.error('Request timed out after 10 seconds');
  request.abort();
}); 