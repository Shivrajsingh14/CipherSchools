import axios from 'axios';

// Create an instance of axios with a default baseURL
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api' // Production - uses relative path
    : 'http://localhost:5000/api' // Development - uses full URL
});

// Add a request interceptor to set the authorization token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default api;