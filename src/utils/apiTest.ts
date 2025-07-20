import { apiClient } from '../config/axios';

export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    console.log('Base URL:', apiClient.defaults.baseURL);
    
    const testData = {
      email: "krushnazarekar10@gmail.com",
      password: "12345678",
      role: "schools"
    };
    
    console.log('Sending test request with data:', testData);
    
    const response = await apiClient.post('/auth/login', testData);
    
    console.log('Full request URL:', apiClient.defaults.baseURL + '/auth/login');
    console.log('Request config:', response.config);
    
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Test failed:', error);
    throw error;
  }
}; 