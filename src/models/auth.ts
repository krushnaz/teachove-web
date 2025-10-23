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
    studentId?: string;
    teacherId?: string;
    role: string;
    schoolId: string;
    schoolName: string;
    phoneNo: string;
    email: string;
    name?: string;
    profilePic?: string;
    admissionYear?: string;
    rollNo?: string;
    classId?: string;
    className?: string;
    currentAcademicYear: string;
    createdAt?: any;
    updatedAt?: any;
  };
  schoolDetails?: {
    schoolName: string;
    logo: string;
    type: string;
    address: {
      line1: string;
      city: string;
      state: string;
      pincode: string;
    };
    city: string;
    state: string;
    pincode: string;
    phoneNo: string;
    currentAcademicYear: string;
  };
  classDetails?: {
    className: string;
    section: string;
  };
  classTeacher?: string;
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
