import { apiHelper } from '../utils/apiHelper';
import { API_CONFIG } from '../config/api';
import { StudentsResponse } from '../models';

class StudentService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Get students by school ID
  async getStudentsBySchool(schoolId: string): Promise<StudentsResponse> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENTS.BY_SCHOOL.replace(':schoolId', schoolId);
      const response = await apiHelper.get(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to fetch students:', error);
      throw error;
    }
  }

  // Get all students
  async getAllStudents(): Promise<StudentsResponse> {
    try {
      const response = await apiHelper.get(API_CONFIG.ENDPOINTS.STUDENTS.LIST);
      return response;
    } catch (error) {
      console.error('Failed to fetch all students:', error);
      throw error;
    }
  }

  // Create a new student
  async createStudent(studentData: any): Promise<any> {
    try {
      const response = await apiHelper.post(API_CONFIG.ENDPOINTS.STUDENTS.CREATE, studentData);
      return response;
    } catch (error) {
      console.error('Failed to create student:', error);
      throw error;
    }
  }

  // Update a student
  async updateStudent(studentId: string, studentData: any): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENTS.UPDATE.replace(':id', studentId);
      const response = await apiHelper.post(endpoint, studentData);
      return response;
    } catch (error) {
      console.error('Failed to update student:', error);
      throw error;
    }
  }

  // Delete a student
  async deleteStudent(studentId: string): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENTS.DELETE.replace(':id', studentId);
      const response = await apiHelper.post(endpoint, {});
      return response;
    } catch (error) {
      console.error('Failed to delete student:', error);
      throw error;
    }
  }

  // Get student details
  async getStudentDetails(studentId: string): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENTS.DETAILS.replace(':id', studentId);
      const response = await apiHelper.get(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to fetch student details:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const studentService = new StudentService();

// Export the class for testing purposes
export default StudentService; 