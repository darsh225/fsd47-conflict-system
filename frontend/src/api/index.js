import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Records
export const getRecords = () => API.get('/records');
export const getRecord = (id) => API.get(`/records/${id}`);
export const createRecord = (data) => API.post('/records', data);
export const updateRecord = (id, data) => API.put(`/records/${id}`, data);
export const deleteRecord = (id) => API.delete(`/records/${id}`);

// Conflicts (admin only)
export const getConflicts = () => API.get('/conflicts');

export default API;
