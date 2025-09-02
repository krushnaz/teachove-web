// Student-related models and interfaces

export interface Student {
  studentId: string;
  schoolId: string;
  classId: string;
  className?: string;  // Class name (e.g., "1st", "2nd", "10th")
  section?: string;    // Section (e.g., "A", "B", "C")
  name: string;
  email: string;
  phoneNo: string;
  password?: string; // Optional in response
  profilePic?: string;
  admissionYear: string;
  isActive?: boolean;
  rollNo?: string;
  createdAt?: {
    _seconds: number;
    _nanoseconds: number;
  } | string; // Can be Firebase timestamp or string
  updatedAt?: {
    _seconds: number;
    _nanoseconds: number;
  } | string; // Can be Firebase timestamp or string
}

export interface StudentsResponse {
  success: boolean;
  count: number;
  students: Student[];
  timestamp: string;
} 