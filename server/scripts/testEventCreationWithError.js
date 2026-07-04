require('dotenv').config();
const axios = require('axios');

const testEventCreation = async () => {
  try {
    const API_URL = 'http://localhost:5000';
    
    // Login as organizer
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'rahul@gmail.com',
      password: 'test123'
    });
    
    const token = loginResponse.data.token;
    console.log('Logged in successfully');
    
    // Try to create an event with custom category
    const eventData = {
      title: 'Test Comedy Show',
      description: 'Testing custom category',
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
    };
    
    console.log('Sending event data:', JSON.stringify(eventData, null, 2));
    
    const eventResponse = await axios.post(
      `${API_URL}/api/events`,
      eventData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('SUCCESS! Event created');
    console.log('Event ID:', eventResponse.data.event._id);
    console.log('Event category:', eventResponse.data.event.category);
    
    process.exit(0);
  } catch (error) {
    console.error('ERROR creating event:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received. Server might not be running.');
      console.error('Error:', error.message);
    } else {
      console.error('Message:', error.message);
    }
    process.exit(1);
  }
};

testEventCreation();
