// Teacher-related models and interfaces

export interface Teacher {
  teacherId: string;
  name: string;
  teacherName?: string; // API response field
  email: string;
  password: string;
  phoneNo: string;
  profilePic?: string;
  subjects: string[];
  classesAssigned: string[];
  schoolName: string;
  role: string;
  schoolId: string;
  createdAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface TeachersResponse {
  count: number;
  teachers: Teacher[];
} 