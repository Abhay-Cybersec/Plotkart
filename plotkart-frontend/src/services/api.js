import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (name, email, password, phone) => 
    api.post('/auth/register', { name, email, password, phone }),
  
  setRole: (role) => 
    api.post('/auth/role', { role }),
  
  getMe: () => 
    api.get('/auth/me'),
};

// Admin API
export const adminAPI = {
  getAnalytics: () => 
    api.get('/admin/analytics'),
  
  verifyProperty: (propertyId, approved, verificationNotes) => 
    api.post('/admin/verify-property', { propertyId, approved, verificationNotes }),
  
  verifyKYC: (ekycId, approved, notes) => 
    api.post(`/ekyc/${ekycId}/verify`, { approved, notes }),
};

// Property API
export const propertyAPI = {
  getAll: (params) => 
    api.get('/properties', { params }),
  
  getById: (id) => 
    api.get(`/properties/${id}`),
  
  upload: (formData) => 
    api.post('/properties/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  getPending: () => 
    api.get('/properties/admin/pending'),
  
  // NEW: Verify property endpoint
  verify: (propertyId, data) => 
    api.put(`/properties/${propertyId}/verify`, data),
};

// eKYC API
export const ekycAPI = {
  upload: (formData) => 
    api.post('/ekyc/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  getStatus: (id) => 
    api.get(`/ekyc/${id}`),
  
  getPending: () => 
    api.get('/ekyc/pending/list'),
};

// Transaction API
export const transactionAPI = {
  checkout: (propertyId) => 
    api.post(`/transactions/properties/${propertyId}/checkout`),
  
  getById: (id) => 
    api.get(`/transactions/${id}`),
};

export default api;
