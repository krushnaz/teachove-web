import axios, { AxiosError } from 'axios';
import { API_CONFIG } from './api';

const TOKEN_KEY = 'auth_token';

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 60000,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: false,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let the browser set multipart boundary for file uploads
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      console.error(
        'Request timeout — is teachove-backend running? (npm run dev in teachove-backend)'
      );
    } else if (error.code === 'ERR_NETWORK' || (!error.response && error.request)) {
      console.error(
        'Cannot reach API server — check REACT_APP_API_BASE_URL and that backend is running on port 5000'
      );
    } else if (error.response) {
      console.error('Server error:', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
