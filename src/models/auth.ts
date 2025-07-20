// Auth-related models and interfaces

export interface LoginRequest {
  email: string;
  password: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    email: string;
    role: string;
    schoolId: string;
  };
  timestamp: string;
}

export interface User {
  email: string;
  role: string;
  schoolId: string;
} 