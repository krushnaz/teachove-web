import axios from 'axios';
import { API_CONFIG } from './api';

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // CORS settings - disable credentials for cross-origin requests
  withCredentials: false,
  // Add CORS headers
  validateStatus: function (status) {
    return status >= 200 && status < 300; // default
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any request logging here
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('Full URL:', (config.baseURL || '') + (config.url || ''));
    console.log('Request config:', config);
    
    // Add CORS headers
    if (config.headers) {
      config.headers['Access-Control-Allow-Origin'] = '*';
      config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Add any response logging here
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.response) {
      // Server responded with error status
      console.error('Server error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Network error (CORS, no internet, etc.)
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 