import { API_CONFIG } from '../config/api';
import { ExamTimetable, CreateExamTimetableRequest, ExamTimetableResponse, CreateSubjectRequest, Subject } from '../models/examTimetable';
import { apiClient } from '../config/axios';

export const examTimetableService = {
  /**
   * Fetch exam timetables for a specific school
   */
  async getExamTimetables(schoolId: string): Promise<ExamTimetable[]> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EXAMS.EXAM_TIMETABLES.replace(':schoolId', schoolId);
      const response = await apiClient.get(endpoint);
      
      // Handle both array response and wrapped response
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching exam timetables:', error);
      throw new Error('Failed to fetch exam timetables');
    }
  },

  /**
   * Create a new exam timetable
   */
  async createExamTimetable(data: CreateExamTimetableRequest): Promise<ExamTimetable> {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.EXAMS.CREATE_EXAM_TIMETABLE, {
        schoolId: data.schoolId,
        classId: data.classId || `CLASS${data.className.replace(/\D/g, '')}A`,
        className: data.className,
        examName: data.examName,
        examStartDate: data.startDate,
        examEndDate: data.endDate
      });
      
      // Handle the response structure
      if (response.data.timetable) {
        // Transform the response to match our ExamTimetable interface
        const newTimetable: ExamTimetable = {
          examEndDate: response.data.timetable.examEndDate,
          classId: response.data.timetable.classId,
          examStartDate: response.data.timetable.examStartDate,
          timetableId: response.data.timetable.timetableId,
          schoolId: response.data.timetable.schoolId,
          examName: response.data.timetable.examName,
          className: response.data.timetable.className,
          subjects: [] // New timetables start with no subjects
        };
        return newTimetable;
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
  async updateExamTimetable(id: string, data: Partial<CreateExamTimetableRequest>): Promise<ExamTimetable> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EXAMS.UPDATE.replace(':id', id);
      const response = await apiClient.put(endpoint, data);
      return response.data;
    } catch (error) {
      console.error('Error updating exam timetable:', error);
      throw new Error('Failed to update exam timetable');
    }
  },

  /**
   * Delete an exam timetable
   */
  async deleteExamTimetable(schoolId: string, timetableId: string): Promise<void> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EXAMS.DELETE_EXAM_TIMETABLE
        .replace(':schoolId', schoolId)
        .replace(':timetableId', timetableId);
      
      const response = await apiClient.delete(endpoint);
      
      // Handle the response structure
      if (response.data.message && response.data.timetableId) {
        // Successfully deleted
        return;
      }
      
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error deleting exam timetable:', error);
      throw new Error('Failed to delete exam timetable');
    }
  },

  /**
   * Add a subject to an exam timetable
   */
  async addSubject(schoolId: string, subjectData: CreateSubjectRequest): Promise<Subject> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EXAMS.ADD_SUBJECT.replace(':schoolId', schoolId);
      
      const response = await apiClient.post(endpoint, {
        examTimeTableId: subjectData.examTimeTableId,
        subjectId: subjectData.subjectId || Date.now().toString(), // Generate if not provided
        subjectName: subjectData.subjectName,
        examDate: subjectData.examDate,
        startTime: subjectData.startTime,
        endTime: subjectData.endTime,
        supervisorId: subjectData.supervisorId || Date.now().toString(), // Generate if not provided
        supervisorName: subjectData.supervisorName,
        totalMarks: subjectData.totalMarks
      });
      
      // Handle the response structure
      if (response.data.subject) {
        return response.data.subject;
      }
      
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error adding subject:', error);
      throw new Error('Failed to add subject');
    }
  }
}; 