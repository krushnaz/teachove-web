import { apiHelper } from '../utils/apiHelper';
import { API_CONFIG } from '../config/api';
import { TeachersResponse } from '../models';

class TeacherService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Get teachers by school ID
  async getTeachersBySchool(schoolId: string): Promise<TeachersResponse> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.TEACHERS.BY_SCHOOL.replace(':schoolId', schoolId);
      const response = await apiHelper.get(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      throw error;
    }
  }

  // Get all teachers
  async getAllTeachers(): Promise<TeachersResponse> {
    try {
      const response = await apiHelper.get(API_CONFIG.ENDPOINTS.TEACHERS.LIST);
      return response;
    } catch (error) {
      console.error('Failed to fetch all teachers:', error);
      throw error;
    }
  }

  // Create a new teacher
  async createTeacher(teacherData: any): Promise<any> {
    try {
      const response = await apiHelper.post(API_CONFIG.ENDPOINTS.TEACHERS.CREATE, teacherData);
      return response;
    } catch (error) {
      console.error('Failed to create teacher:', error);
      throw error;
    }
  }

  // Update a teacher
  async updateTeacher(teacherId: string, teacherData: any): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.TEACHERS.UPDATE.replace(':id', teacherId);
      const response = await apiHelper.post(endpoint, teacherData);
      return response;
    } catch (error) {
      console.error('Failed to update teacher:', error);
      throw error;
    }
  }

  // Delete a teacher
  async deleteTeacher(teacherId: string): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.TEACHERS.DELETE.replace(':id', teacherId);
      const response = await apiHelper.post(endpoint, {});
      return response;
    } catch (error) {
      console.error('Failed to delete teacher:', error);
      throw error;
    }
  }

  // Get teacher details
  async getTeacherDetails(teacherId: string): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.TEACHERS.DETAILS.replace(':id', teacherId);
      const response = await apiHelper.get(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to fetch teacher details:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const teacherService = new TeacherService();

// Export the class for testing purposes
export default TeacherService; 