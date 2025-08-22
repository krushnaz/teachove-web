import { API_CONFIG } from '../config/api';
import { apiClient } from '../config/axios';

export interface Classroom {
  schoolId: string;
  classId: string;
  teacherId: string;
  className: string;
  division: string;
  classTeacher: string;
  feeAmount: number;
  isTemplate: boolean;
}

export interface ClassroomResponse {
  schoolId: string;
  classes: Classroom[];
}

export const classroomService = {
  /**
   * Fetch all classes for a specific school
   */
  async getClassesBySchoolId(schoolId: string): Promise<Classroom[]> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CLASSROOM.GET_CLASSES.replace(':schoolId', schoolId);
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
  }
}; 