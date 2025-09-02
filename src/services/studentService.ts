import { apiHelper } from '../utils/apiHelper';
import { API_CONFIG } from '../config/api';
import { StudentsResponse } from '../models';

// Helper function for safe error logging
const logError = (error: unknown, context: string) => {
  console.error(`❌ ${context}:`, error);
  if (error instanceof Error) {
    console.error('🔍 Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
};

class StudentService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Get students by school ID
  async getStudentsBySchool(schoolId: string): Promise<StudentsResponse> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENTS.BY_SCHOOL.replace(':schoolId', schoolId);
      console.log('🔍 Fetching students for schoolId:', schoolId);
      console.log('🔗 API Endpoint:', `${API_CONFIG.BASE_URL}${endpoint}`);

      const response = await apiHelper.get(endpoint);
      console.log('📦 Raw API Response:', response);
      console.log('📊 Response type:', Array.isArray(response) ? 'Array' : typeof response);

      // Handle direct array response from API
      if (Array.isArray(response)) {
        console.log('✅ Response is an array with', response.length, 'students');
        return {
          success: true,
          students: response,
          count: response.length,
          timestamp: new Date().toISOString()
        };
      }

      // Handle wrapped response format
      console.log('📋 Response is wrapped object');
      return response;
    } catch (error) {
      logError(error, 'Failed to fetch students');
      throw error;
    }
  }

  // Get all students
  async getAllStudents(): Promise<StudentsResponse> {
    try {
      const response = await apiHelper.get(API_CONFIG.ENDPOINTS.STUDENTS.LIST);

      // Handle direct array response from API
      if (Array.isArray(response)) {
        return {
          success: true,
          students: response,
          count: response.length,
          timestamp: new Date().toISOString()
        };
      }

      // Handle wrapped response format
      return response;
    } catch (error) {
      logError(error, 'Failed to fetch all students');
      throw error;
    }
  }

  // Get student by ID
  async getStudentById(studentId: string): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENTS.DETAILS.replace(':studentId', studentId);
      const response = await apiHelper.get(endpoint);
      return response;
    } catch (error) {
      logError(error, 'Failed to fetch student details');
      throw error;
    }
  }

  // Add a student with file upload support
  async addStudent(studentData: {
    schoolId: string;
    classId: string;
    name: string;
    email: string;
    phoneNo: string;
    password: string;
    admissionYear: string;
  }, profilePicFile?: File): Promise<any> {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STUDENTS.CREATE}`;
      
      const formData = new FormData();
      
      // Add required fields
      formData.append('schoolId', studentData.schoolId);
      formData.append('classId', studentData.classId);
      formData.append('name', studentData.name);
      formData.append('email', studentData.email);
      formData.append('phoneNo', studentData.phoneNo);
      formData.append('password', studentData.password);
      formData.append('admissionYear', studentData.admissionYear);
      
      // Add profile picture file if provided
      if (profilePicFile) {
        formData.append('profilePic', profilePicFile);
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      logError(error, 'Failed to add student');
      throw error;
    }
  }

  // Edit a student with file upload support
  async editStudent(studentId: string, studentData: {
    schoolId?: string;
    classId?: string;
    name?: string;
    email?: string;
    phoneNo?: string;
    admissionYear?: string;
  }, profilePicFile?: File): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENTS.UPDATE.replace(':studentId', studentId);
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      
      const formData = new FormData();
      
      // Add optional fields
      if (studentData.schoolId) formData.append('schoolId', studentData.schoolId);
      if (studentData.classId) formData.append('classId', studentData.classId);
      if (studentData.name) formData.append('name', studentData.name);
      if (studentData.email) formData.append('email', studentData.email);
      if (studentData.phoneNo) formData.append('phoneNo', studentData.phoneNo);
      if (studentData.admissionYear) formData.append('admissionYear', studentData.admissionYear);
      
      // Add profile picture file if provided
      if (profilePicFile) {
        formData.append('profilePic', profilePicFile);
      }

      const response = await fetch(url, {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      logError(error, 'Failed to update student');
      throw error;
    }
  }

  // Update a student (legacy method)
  async updateStudent(studentId: string, studentData: any): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENTS.UPDATE.replace(':studentId', studentId);
      const response = await apiHelper.post(endpoint, studentData);
      return response;
    } catch (error) {
      logError(error, 'Failed to update student');
      throw error;
    }
  }

  // Delete a student
  async deleteStudent(studentId: string): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENTS.DELETE.replace(':studentId', studentId);
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      logError(error, 'Failed to delete student');
      throw error;
    }
  }

  // Get student details
  async getStudentDetails(studentId: string): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENTS.DETAILS.replace(':studentId', studentId);
      const response = await apiHelper.get(endpoint);
      return response;
    } catch (error) {
      logError(error, 'Failed to fetch student details');
      throw error;
    }
  }
}

// Create and export a singleton instance
export const studentService = new StudentService();

// Export the class for testing purposes
export default StudentService;