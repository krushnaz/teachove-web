// Auth-related models and interfaces

export interface LoginRequest {
  phoneNo: string;
  password: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    role: string;
    schoolId: string;
    schoolName: string;
    phoneNo: string;
    email: string;
    currentAcademicYear: string;
    teacherId?: string; // Optional for teacher role
  };
  timestamp: string;
}

export interface User {
  role: string;
  schoolId: string;
  schoolName: string;
  phoneNo: string;
  email: string;
  currentAcademicYear: string;
  teacherId?: string; // Optional for teacher role
}
