import { API_CONFIG } from '../config/api';
import { HTTP_STATUS, LoginRequest, LoginResponse, ApiResponse } from '../models';
import { apiHelper } from '../utils/apiHelper';

// Local storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const TEACHER_ID_KEY = 'teacher_id';

// Auth Service Class
class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Get auth token from localStorage
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Set auth token to localStorage
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  // Remove auth token from localStorage
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  // Get user data from localStorage
  getUser(): any | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Set user data to localStorage
  setUser(user: any): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Remove user data from localStorage
  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  }

  // Get teacher ID from localStorage
  getTeacherId(): string | null {
    return localStorage.getItem(TEACHER_ID_KEY);
  }

  // Set teacher ID to localStorage
  setTeacherId(teacherId: string): void {
    localStorage.setItem(TEACHER_ID_KEY, teacherId);
  }

  // Remove teacher ID from localStorage
  removeTeacherId(): void {
    localStorage.removeItem(TEACHER_ID_KEY);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  // Generic API request method
  private async makeRequest<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      data?: any;
    } = {}
  ): Promise<T> {
    try {
      if (options.method === 'POST') {
        return await apiHelper.post(endpoint, options.data);
      } else {
        return await apiHelper.get(endpoint);
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Login method
  async login(phoneNo: string, password: string, role: string): Promise<LoginResponse> {
    try {
      const credentials = {
        phoneNo,
        password,
        role
      };

      const response = await this.makeRequest<LoginResponse>(
        '/auth/login',
        {
          method: 'POST',
          data: credentials,
        }
      );

      // Check if the response indicates failure
      if (!response.success) {
        // Create an error object with the API response message
        const error: any = new Error(response.message || 'Login failed');
        error.response = response;
        throw error;
      }

      // Store user data only on successful login
      this.setUser(response.user);
      
      // Store schoolId as a simple identifier for authentication
      // Since there's no JWT token, we'll use the schoolId as our auth identifier
      this.setToken(response.user.schoolId);
      
      // Store teacherId if it exists (for teacher role)
      if (response.user.teacherId) {
        this.setTeacherId(response.user.teacherId);
        console.log('Stored teacherId:', response.user.teacherId);
      }
      
      console.log('Login successful:', response.user);
      console.log('Stored schoolId:', response.user.schoolId);

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Logout method
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if available (commented out since it might not exist)
      // await this.makeRequest(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
      //   method: 'POST',
      // });
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage
      this.removeToken();
      this.removeUser();
      this.removeTeacherId();
    }
  }

  // Refresh token method (if needed)
  async refreshToken(): Promise<void> {
    try {
      const response = await this.makeRequest<{ token: string }>(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH,
        {
          method: 'POST',
        }
      );

      if (response.token) {
        this.setToken(response.token);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout the user
      this.logout();
      throw error;
    }
  }

  // Forgot password method
  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>(
      API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
      {
        method: 'POST',
        data: { email },
      }
    );
  }

  // Reset password method
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>(
      API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
      {
        method: 'POST',
        data: { token, newPassword },
      }
    );
  }

  // Get user profile
  async getUserProfile(): Promise<any> {
    return this.makeRequest(API_CONFIG.ENDPOINTS.SCHOOL.PROFILE);
  }

  // Update user profile
  async updateUserProfile(profileData: any): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>(
      API_CONFIG.ENDPOINTS.SCHOOL.UPDATE_PROFILE,
      {
        method: 'PUT',
        data: profileData,
      }
    );
  }
}

// Create and export a singleton instance
export const authService = new AuthService();

// Export the class for testing purposes
export default AuthService;
