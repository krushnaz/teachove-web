import { API_CONFIG } from '../config/api';

export const apiHelper = {
  async post(endpoint: string, data: any) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Get the response body regardless of status code
      const responseData = await response.json();

      // If the response has a success field and it's false, return the response data
      // This allows us to handle API error messages properly
      if (responseData.hasOwnProperty('success') && !responseData.success) {
        return responseData;
      }

      // For other non-2xx status codes, throw an error
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  async get(endpoint: string) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}; 