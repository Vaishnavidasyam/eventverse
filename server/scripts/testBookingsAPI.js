require('dotenv').config();
const axios = require('axios');

const testBookingsAPI = async () => {
  try {
    const API_URL = 'http://localhost:5000';
    
    // Login as organizer
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'rahul@gmail.com',
      password: 'test123'
    });
    
    const token = loginResponse.data.token;
    console.log('Logged in as organizer successfully');
    
    // Try to get bookings
    const bookingsResponse = await axios.get(
      `${API_URL}/api/bookings`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('SUCCESS! Bookings API accessible');
    console.log('Bookings count:', bookingsResponse.data.bookings.length);
    
    process.exit(0);
  } catch (error) {
    console.error('ERROR accessing bookings API:');
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

testBookingsAPI();
