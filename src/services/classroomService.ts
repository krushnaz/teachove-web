import { API_CONFIG } from '../config/api';
import { apiClient } from '../config/axios';

export interface Subject {
  subjectName: string;
  teacherId: string;
}

export interface Classroom {
  classId: string;
  className: string;
  section: string;
  classTeacherId: string;
  classTeacherName: string;
  classFees: number;
  subjects: Subject[];
  schoolId?: string;
  academicYear?: string;
  createdAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface CreateClassRequest {
  className: string;
  section: string;
  classTeacherId: string;
  classFees: number;
  subjects: Subject[];
}

export interface UpdateClassRequest {
  className?: string;
  section?: string;
  classTeacherId?: string;
  classFees?: number;
  subjects?: Subject[];
}

export interface ClassroomResponse {
  classes: Classroom[];
}

export const classroomService = {
  /**
   * Fetch all classes for a specific school and academic year
   */
  async getClassesBySchoolId(schoolId: string, academicYear: string = '2025-2026'): Promise<Classroom[]> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CLASSROOM.GET_CLASSES
        .replace(':schoolId', schoolId)
        .replace(':yearId', academicYear);
      const response = await apiClient.get(endpoint);
      
      // Handle the response structure
      if (response.data.classes && Array.isArray(response.data.classes)) {
        return response.data.classes;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      throw new Error('Failed to fetch classrooms');
    }
  },

  /**
   * Create a new class
   */
  async createClass(schoolId: string, academicYear: string, classData: CreateClassRequest): Promise<{ message: string; classId: string }> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CLASSROOM.CREATE_CLASS
        .replace(':schoolId', schoolId)
        .replace(':yearId', academicYear);
      const response = await apiClient.post(endpoint, classData);
      return response.data;
    } catch (error) {
      console.error('Error creating class:', error);
      throw new Error('Failed to create class');
    }
  },

  /**
   * Update an existing class
   */
  async updateClass(schoolId: string, academicYear: string, classId: string, classData: UpdateClassRequest): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CLASSROOM.UPDATE_CLASS
        .replace(':schoolId', schoolId)
        .replace(':yearId', academicYear)
        .replace(':classId', classId);
      const response = await apiClient.put(endpoint, classData);
      return response.data;
    } catch (error) {
      console.error('Error updating class:', error);
      throw new Error('Failed to update class');
    }
  },

  /**
   * Delete a class
   */
  async deleteClass(schoolId: string, academicYear: string, classId: string): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CLASSROOM.DELETE_CLASS
        .replace(':schoolId', schoolId)
        .replace(':yearId', academicYear)
        .replace(':classId', classId);
      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error deleting class:', error);
      throw new Error('Failed to delete class');
    }
  }
}; 