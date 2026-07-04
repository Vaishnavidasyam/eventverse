require('dotenv').config();
const axios = require('axios');

const testLogin = async () => {
  try {
    const API_URL = 'http://localhost:5000';
    
    console.log('Testing login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'rahul@gmail.com',
      password: 'test123'
    });
    
    console.log('SUCCESS! Login worked');
    console.log('Token:', loginResponse.data.token);
    console.log('User:', loginResponse.data.user);
    
    process.exit(0);
  } catch (error) {
    console.error('ERROR:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Server might not be running.');
      console.error('Error:', error.message);
    } else {
      console.error('Message:', error.message);
    }
    process.exit(1);
  }
};

testLogin();
