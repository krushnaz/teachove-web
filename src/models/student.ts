// Student-related models and interfaces

export interface Student {
  studentId: string;
  studentName: string;
  rollNo: string;
  email: string;
  classId: string;
  classValue: string;
  divisionValue: string;
  password: string;
  schoolId: string;
  teacherId: string;
  isActive: boolean;
}

export interface StudentsResponse {
  success: boolean;
  count: number;
  students: Student[];
  timestamp: string;
} 