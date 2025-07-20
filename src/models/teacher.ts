// Teacher-related models and interfaces

export interface Teacher {
  teacherId: string;
  name: string;
  email: string;
  password: string;
  schoolName: string;
  role: string;
  schoolId: string;
}

export interface TeachersResponse {
  teachers: Teacher[];
} 