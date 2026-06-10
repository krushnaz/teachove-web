import { API_CONFIG } from '../config/api';
import { apiHelper } from '../utils/apiHelper';
import { Student, StudentsResponse } from '../models/student';

export interface BulkUploadStudentError {
  row: number;
  rollNo?: string | null;
  phoneNo?: string | null;
  message: string;
}

export interface BulkUploadStudentsResponse {
  message: string;
  totalRows?: number;
  successCount: number;
  failedCount: number;
  classId?: string;
  className?: string | null;
  section?: string | null;
  added?: Array<{
    row: number;
    studentId: string;
    name: string;
    rollNo: string;
  }>;
  errors?: BulkUploadStudentError[];
}

export class BulkUploadError extends Error {
  errors?: BulkUploadStudentError[];

  constructor(message: string, errors?: BulkUploadStudentError[]) {
    super(message);
    this.name = 'BulkUploadError';
    this.errors = errors;
  }
}

export interface Subject {
  subjectName: string;
  teacherId: string;
}

export interface ClassDetails {
  classId: string;
  className: string;
  section: string;
  classFees: number;
  classTeacherId: string;
  subjects: Subject[];
}

export interface StudentProfile {
  studentId: string;
  schoolId: string;
  classId: string;
  name: string;
  email: string;
  phoneNo: string;
  password?: string;
  admissionYear: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  rollNo: string;
  profilePic?: string;
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  classDetails: ClassDetails;
}

export interface StudentProfileResponse {
  success: boolean;
  message: string;
  student: StudentProfile;
}

class StudentService {
  /**
   * Get all students by school ID
   */
  async getStudentsBySchool(schoolId: string): Promise<StudentsResponse> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENTS.BY_SCHOOL.replace(':schoolId', schoolId);
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const students = await response.json();
      
      // API returns a direct array, wrap it in StudentsResponse format
      return {
        success: true,
        count: students.length,
        students: students,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Error fetching students:', error);
      throw new Error(error.message || 'Failed to fetch students');
    }
  }

  /**
   * Get students by class
   */
  async getStudentsByClass(schoolId: string, classId: string): Promise<StudentsResponse> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENTS.BY_CLASS
        .replace(':schoolId', schoolId)
        .replace(':classId', classId);
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const students = await response.json();
      
      // API returns a direct array, wrap it in StudentsResponse format
      return {
        success: true,
        count: students.length,
        students: students,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Error fetching students by class:', error);
      throw new Error(error.message || 'Failed to fetch students');
    }
  }

  /**
   * Promote students to the next class
   */
  async promoteStudents(data: {
    schoolId: string;
    currentClass: string;
    nextClass: string | null;
    academicYear: string;
  }): Promise<{ message: string; totalPromoted: number }> {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STUDENTS.PROMOTE_CLASS}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error promoting students:', error);
      throw new Error(error.message || 'Failed to promote students');
    }
  }

  /**
   * Download bulk upload Excel template
   */
  async downloadBulkUploadTemplate(): Promise<void> {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STUDENTS.BULK_UPLOAD_TEMPLATE}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'student_bulk_upload_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      console.error('Error downloading template:', error);
      throw new Error(error.message || 'Failed to download template');
    }
  }

  /**
   * Bulk upload students from Excel for a class
   */
  async bulkUploadStudents(data: {
    schoolId: string;
    classId: string;
    admissionYear: string;
    defaultPassword: string;
    file: File;
  }): Promise<BulkUploadStudentsResponse> {
    try {
      const formData = new FormData();
      formData.append('schoolId', data.schoolId);
      formData.append('classId', data.classId);
      formData.append('admissionYear', data.admissionYear);
      formData.append('defaultPassword', data.defaultPassword);
      formData.append('file', data.file);

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STUDENTS.BULK_UPLOAD}`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new BulkUploadError(
          result.message || `Upload failed (status ${response.status})`,
          result.errors
        );
      }

      return result;
    } catch (error: any) {
      console.error('Error bulk uploading students:', error);
      if (error instanceof BulkUploadError) {
        throw error;
      }
      throw new BulkUploadError(error.message || 'Failed to upload students');
    }
  }

  /**
   * Create a new student
   */
  async createStudent(studentData: Partial<Student>, profilePicFile?: File): Promise<Student> {
    try {
      // If there's a profile picture file, use FormData
      if (profilePicFile) {
        const formData = new FormData();
        
        // Append all student data
        Object.entries(studentData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });
        
        // Append the profile picture
        formData.append('profilePic', profilePicFile);
        
        // Make request with FormData (no Content-Type header, browser will set it with boundary)
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STUDENTS.CREATE}`;
        const response = await fetch(url, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Return the student data from result, or construct from response
        return result.student || result || {
          ...studentData,
          studentId: result.studentId || result.id,
          profilePic: result.profilePic || studentData.profilePic,
        } as Student;
      } else {
        // No file, use regular JSON
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STUDENTS.CREATE}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(studentData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Return the student data from result, or construct from response
        return result.student || result || {
          ...studentData,
          studentId: result.studentId || result.id,
        } as Student;
      }
    } catch (error: any) {
      console.error('Error creating student:', error);
      throw new Error(error.message || 'Failed to create student');
    }
  }

  /**
   * Add a new student (alias for createStudent)
   */
  async addStudent(studentData: Partial<Student>, profilePicFile?: File): Promise<Student> {
    return this.createStudent(studentData, profilePicFile);
  }

  /**
   * Update a student
   */
  async updateStudent(studentId: string, studentData: Partial<Student>, profilePicFile?: File): Promise<Student> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENTS.UPDATE.replace(':studentId', studentId);
      
      // If there's a profile picture file, use FormData
      if (profilePicFile) {
        const formData = new FormData();
        
        // Append all student data
        Object.entries(studentData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });
        
        // Append the profile picture
        formData.append('profilePic', profilePicFile);
        
        // Make request with FormData
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const response = await fetch(url, {
          method: 'PUT',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Return the student data from result, or construct from response
        return result.student || result || {
          studentId,
          ...studentData,
          profilePic: result.profilePic || studentData.profilePic,
        } as Student;
      } else {
        // No file, use regular JSON
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(studentData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Return the student data from result, or construct from response
        return result.student || result || {
          studentId,
          ...studentData,
        } as Student;
      }
    } catch (error: any) {
      console.error('Error updating student:', error);
      throw new Error(error.message || 'Failed to update student');
    }
  }

  /**
   * Edit a student (alias for updateStudent)
   */
  async editStudent(studentId: string, studentData: Partial<Student>, profilePicFile?: File): Promise<Student> {
    return this.updateStudent(studentId, studentData, profilePicFile);
  }

  /**
   * Delete a student
   */
  async deleteStudent(studentId: string): Promise<void> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENTS.DELETE.replace(':studentId', studentId);
      await apiHelper.delete(endpoint);
    } catch (error: any) {
      console.error('Error deleting student:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete student');
    }
  }

  /**
   * Get student profile with class details
   */
  async getStudentWithClass(studentId: string): Promise<StudentProfile> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENTS.GET_WITH_CLASS.replace(
        ':studentId',
        studentId
      );
      const response = await apiHelper.get(endpoint);
      return response.student;
    } catch (error: any) {
      console.error('Error fetching student profile:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch student profile');
    }
  }

  /**
   * Update student password
   */
  async updatePassword(
    studentId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENTS.UPDATE.replace(':studentId', studentId);
      await apiHelper.put(endpoint, {
        currentPassword,
        newPassword,
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      throw new Error(error.response?.data?.message || 'Failed to update password');
    }
  }

  /**
   * Update student profile
   */
  async updateProfile(studentId: string, data: Partial<StudentProfile>): Promise<StudentProfile> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENTS.UPDATE.replace(':studentId', studentId);
      const response = await apiHelper.put(endpoint, data);
      return response.student;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }
}

export const studentService = new StudentService();
