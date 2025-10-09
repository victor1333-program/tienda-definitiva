const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testUploadAPI() {
  try {
    console.log('Testing upload API...');
    
    // Create a simple test image buffer
    const testData = Buffer.from('test image data');
    
    const formData = new FormData();
    formData.append('file', testData, {
      filename: 'test.png',
      contentType: 'image/png'
    });
    formData.append('folder', 'personalization');
    
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Test without authentication first
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      console.error('Error body:', responseText);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testUploadAPI();