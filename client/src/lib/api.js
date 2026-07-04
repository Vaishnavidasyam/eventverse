import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3018';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  changePassword: (data) => api.put('/api/auth/password', data),
};

// Events API
export const eventsAPI = {
  getAll: (params) => api.get('/api/events', { params }),
  getCategories: () => api.get('/api/events/categories'),
  getFeatured: () => api.get('/api/events/featured'),
  getById: (id) => api.get(`/api/events/${id}`),
  create: (data) => api.post('/api/events', data),
  update: (id, data) => api.put(`/api/events/${id}`, data),
  delete: (id) => api.delete(`/api/events/${id}`),
  getMyEvents: () => api.get('/api/events/organizer/my-events'),
  getRevenue: () => api.get('/api/events/organizer/revenue'),
};

// Bookings API
export const bookingsAPI = {
  create: (data) => api.post('/api/bookings', data),
  getAll: () => api.get('/api/bookings'),
  getById: (id) => api.get(`/api/bookings/${id}`),
  checkIn: (id) => api.put(`/api/bookings/${id}/check-in`),
  cancel: (id) => api.delete(`/api/bookings/${id}`),
  getByEvent: (eventId) => api.get(`/api/bookings/event/${eventId}`),
};

// Vendors API
export const vendorsAPI = {
  getAll: (params) => api.get('/api/vendors', { params }),
  getCategories: () => api.get('/api/vendors/categories'),
  getById: (id) => api.get(`/api/vendors/${id}`),
  create: (data) => api.post('/api/vendors', data),
  update: (id, data) => api.put(`/api/vendors/${id}`, data),
  delete: (id) => api.delete(`/api/vendors/${id}`),
  addReview: (id, data) => api.post(`/api/vendors/${id}/reviews`, data),
};

// Users API
export const usersAPI = {
  getDashboard: () => api.get('/api/users/dashboard'),
  saveEvent: (eventId) => api.post(`/api/users/save-event/${eventId}`),
  unsaveEvent: (eventId) => api.delete(`/api/users/save-event/${eventId}`),
  getAnalytics: () => api.get('/api/users/analytics'),
  getOrganizers: () => api.get('/api/users/organizers'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getUsers: () => api.get('/api/admin/users'),
  blockUser: (id) => api.put(`/api/admin/users/${id}/block`),
  verifyUser: (id) => api.put(`/api/admin/users/${id}/verify`),
  getOrganizers: () => api.get('/api/admin/organizers'),
  approveOrganizer: (id) => api.put(`/api/admin/organizers/${id}/approve`),
  getEvents: () => api.get('/api/admin/events'),
  approveEvent: (id) => api.put(`/api/admin/events/${id}/approve`),
  deleteEvent: (id) => api.delete(`/api/admin/events/${id}`),
  getVendors: () => api.get('/api/admin/vendors'),
  verifyVendor: (id) => api.put(`/api/admin/vendors/${id}/verify`),
  getReports: (params) => api.get('/api/admin/reports', { params }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/api/categories'),
  getOrganizerCategories: () => api.get('/api/categories/organizer'),
  getById: (id) => api.get(`/api/categories/${id}`),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/api/messages/conversations'),
  getMessages: (conversationId) => api.get(`/api/messages/${conversationId}`),
  send: (data) => api.post('/api/messages', data),
  getContacts: () => api.get('/api/messages/contacts'),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/api/notifications'),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/read-all'),
  delete: (id) => api.delete(`/api/notifications/${id}`),
};

// AI API
export const aiAPI = {
  planEvent: (data) => api.post('/api/ai/planner', data),
  getRecommendations: (data) => api.post('/api/ai/recommendations', data),
  chat: (message) => api.post('/api/ai/chat', { message }),
  optimizeBudget: (data) => api.post('/api/ai/budget-optimizer', data),
  predictCrowd: (data) => api.post('/api/ai/crowd-prediction', data),
};

export default api;
