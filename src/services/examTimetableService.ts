import { API_CONFIG } from '../config/api';
import { ExamTimetable, CreateExamTimetableRequest } from '../models/examTimetable';
import { apiClient } from '../config/axios';

const DEFAULT_ACADEMIC_YEAR = '2025-2026';

export const examTimetableService = {
  /**
   * Fetch exam timetables for a specific school and academic year
   */
  async getExamTimetables(schoolId: string, academicYear: string = DEFAULT_ACADEMIC_YEAR): Promise<ExamTimetable[]> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EXAMS.GET_TIMETABLES
        .replace(':schoolId', schoolId)
        .replace(':yearId', academicYear);
      const response = await apiClient.get(endpoint);

      const data = response.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.timetables)) return data.timetables;
      return [];
    } catch (error) {
      console.error('Error fetching exam timetables:', error);
      throw new Error('Failed to fetch exam timetables');
    }
  },

  /**
   * Create a new exam timetable (with embedded subjects)
   */
  async createExamTimetable(
    schoolId: string,
    academicYear: string,
    data: CreateExamTimetableRequest
  ): Promise<ExamTimetable> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EXAMS.CREATE_TIMETABLE
        .replace(':schoolId', schoolId)
        .replace(':yearId', academicYear);

      const response = await apiClient.post(endpoint, {
        classId: data.classId,
        className: data.className,
        examName: data.examName,
        examStartDate: data.examStartDate,
        examEndDate: data.examEndDate,
        subjects: data.subjects,
      });

      if (response.status === 201 && response.data?.data) {
        return response.data.data;
      }

      if (response.data?.timetable) {
        return response.data.timetable;
      }

      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error creating exam timetable:', error);
      throw new Error('Failed to create exam timetable');
    }
  },

  /**
   * Update an existing exam timetable
   */
  async updateExamTimetable(
    schoolId: string,
    academicYear: string,
    timetableId: string,
    data: Partial<CreateExamTimetableRequest>
  ): Promise<ExamTimetable> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EXAMS.UPDATE_TIMETABLE
        .replace(':schoolId', schoolId)
        .replace(':yearId', academicYear)
        .replace(':timetableId', timetableId);

      const response = await apiClient.put(endpoint, data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error updating exam timetable:', error);
      throw new Error('Failed to update exam timetable');
    }
  },

  /**
   * Delete an exam timetable
   */
  async deleteExamTimetable(schoolId: string, academicYear: string, timetableId: string): Promise<void> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EXAMS.DELETE_TIMETABLE
        .replace(':schoolId', schoolId)
        .replace(':yearId', academicYear)
        .replace(':timetableId', timetableId);

      const response = await apiClient.delete(endpoint);
      if (response.status === 200 || response.status === 204 || response.data?.message) {
        return;
      }

      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error deleting exam timetable:', error);
      throw new Error('Failed to delete exam timetable');
    }
  },

  /**
   * Delete a subject from an exam timetable
   */
  async deleteSubject(
    schoolId: string,
    academicYear: string,
    timetableId: string,
    subjectId: string
  ): Promise<void> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EXAMS.DELETE_SUBJECT
        .replace(':schoolId', schoolId)
        .replace(':yearId', academicYear)
        .replace(':timetableId', timetableId)
        .replace(':subjectId', subjectId);

      const response = await apiClient.delete(endpoint);
      if (response.status === 200 || response.status === 204 || response.data?.message) {
        return;
      }

      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw new Error('Failed to delete subject');
    }
  },

  /**
   * Fetch exam timetables for a specific class
   */
  async getExamTimetablesByClass(schoolId: string, classId: string): Promise<ExamTimetable[]> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EXAMS.GET_BY_CLASS
        .replace(':schoolId', schoolId)
        .replace(':classId', classId);
      
      const response = await apiClient.get(endpoint);
      const data = response.data;

      if (Array.isArray(data?.timetables)) {
        return data.timetables;
      }
      
      if (Array.isArray(data)) {
        return data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching exam timetables by class:', error);
      throw new Error('Failed to fetch exam timetables for class');
    }
  }
}; 