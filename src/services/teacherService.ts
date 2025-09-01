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

  // Update a teacher by teacherId (custom endpoint)
  async updateTeacherById(teacherId: string, teacherData: any): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.TEACHERS.UPDATE_BY_ID.replace(':id', teacherId);
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(teacherData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
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

  // Delete a teacher by teacherId (custom endpoint)
  async deleteTeacherById(teacherId: string): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.TEACHERS.DELETE_TEACHER.replace(':teacherId', teacherId);
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
      console.error('Failed to delete teacher:', error);
      throw error;
    }
  }

  // Edit a teacher
  async editTeacher(teacherId: string, teacherData: {
    teacherName?: string;
    email?: string;
    phoneNo?: string;
    profilePic?: string;
    subjects?: string[];
    classesAssigned?: string[];
  }): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.TEACHERS.EDIT.replace(':teacherId', teacherId);
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(teacherData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to update teacher:', error);
      throw error;
    }
  }

  // Add a teacher
  async addTeacher(teacherData: {
    schoolId: string;
    teacherName: string;
    email: string;
    phoneNo: string;
    password: string;
    profilePic?: string;
    subjects: string[];
    classesAssigned: string[];
  }): Promise<any> {
    try {
      const response = await apiHelper.post(API_CONFIG.ENDPOINTS.TEACHERS.ADD, teacherData);
      return response;
    } catch (error) {
      console.error('Failed to add teacher:', error);
      throw error;
    }
  }
}

export const teacherService = new TeacherService();
