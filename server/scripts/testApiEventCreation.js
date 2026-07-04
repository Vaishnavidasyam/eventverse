require('dotenv').config();
const axios = require('axios');

const testApiEventCreation = async () => {
  try {
    const API_URL = 'http://localhost:5000';
    
    // First, login to get a token
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'rahul@gmail.com',
      password: 'test123'
    });
    
    const token = loginResponse.data.token;
    console.log('Logged in successfully');
    
    // Try to create an event with custom category
    const eventResponse = await axios.post(
      `${API_URL}/api/events`,
      {
        title: 'Test Comedy Show via API',
        description: 'Testing custom category via API',
        category: 'comedy',
        venue: {
          name: 'Test Venue',
          address: '123 Test St',
          city: 'Test City',
          capacity: 100
        },
        date: '2026-08-01',
        time: '18:00',
        ticketTypes: [
          { name: 'General', price: 50, available: 100, description: 'Standard entry' }
        ],
        totalSeats: 100
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('SUCCESS! Event created via API');
    console.log('Event ID:', eventResponse.data.event._id);
    console.log('Event category:', eventResponse.data.event.category);
    
    // Clean up
    await axios.delete(
      `${API_URL}/api/events/${eventResponse.data.event._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log('Test event deleted');
    
    process.exit(0);
  } catch (error) {
    console.error('ERROR creating event via API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
    process.exit(1);
  }
};

testApiEventCreation();
