import { API_CONFIG } from '../config/api';
import { apiClient } from '../config/axios';

// Types
export interface ClassSchedule {
  scheduleId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  isBreakPeriod: boolean;
  breakType?: 'Lunch' | 'Short Break' | 'Assembly' | 'Free Period' | null;
  teacherName?: string;
  subjectName?: string;
  createdAt: string;
}

export interface CreateScheduleRequest {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  isBreakPeriod: boolean;
  breakType?: 'Lunch' | 'Short Break' | 'Assembly' | 'Free Period';
  teacherName?: string;
  subjectName?: string;
}

export interface UpdateScheduleRequest {
  dayOfWeek?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime?: string;
  endTime?: string;
  isBreakPeriod?: boolean;
  breakType?: 'Lunch' | 'Short Break' | 'Assembly' | 'Free Period' | null;
  teacherName?: string;
  subjectName?: string;
}

export interface ClassScheduleResponse {
  message: string;
  data: ClassSchedule;
}

export interface ClassSchedulesResponse {
  message: string;
  data: ClassSchedule[];
}

// Service functions
export const classScheduleService = {
  // Create a new class schedule
  async createSchedule(schoolId: string, classId: string, payload: CreateScheduleRequest): Promise<ClassSchedule> {
    const endpoint = API_CONFIG.ENDPOINTS.CLASS_SCHEDULES.CREATE
      .replace(':schoolId', schoolId)
      .replace(':classId', classId);
    
    const response = await apiClient.post<ClassScheduleResponse>(endpoint, payload);
    
    if (response.data?.data) {
      return response.data.data;
    }
    throw new Error('Invalid response format');
  },

  // Get all schedules for a class
  async getClassSchedules(schoolId: string, classId: string): Promise<ClassSchedule[]> {
    const endpoint = API_CONFIG.ENDPOINTS.CLASS_SCHEDULES.GET_ALL
      .replace(':schoolId', schoolId)
      .replace(':classId', classId);
    
    const response = await apiClient.get<ClassSchedulesResponse>(endpoint);
    
    if (response.data?.data) {
      return response.data.data;
    }
    throw new Error('Invalid response format');
  },

  // Get a single schedule by ID
  async getScheduleById(schoolId: string, classId: string, scheduleId: string): Promise<ClassSchedule> {
    const endpoint = API_CONFIG.ENDPOINTS.CLASS_SCHEDULES.GET_BY_ID
      .replace(':schoolId', schoolId)
      .replace(':classId', classId)
      .replace(':scheduleId', scheduleId);
    
    const response = await apiClient.get<ClassScheduleResponse>(endpoint);
    
    if (response.data?.data) {
      return response.data.data;
    }
    throw new Error('Invalid response format');
  },

  // Update a schedule (backend returns only a message)
  async updateSchedule(schoolId: string, classId: string, scheduleId: string, payload: UpdateScheduleRequest): Promise<{ message: string }> {
    const endpoint = API_CONFIG.ENDPOINTS.CLASS_SCHEDULES.UPDATE
      .replace(':schoolId', schoolId)
      .replace(':classId', classId)
      .replace(':scheduleId', scheduleId);
    
    const response = await apiClient.put(endpoint, payload);
    // Many backends return only a message on update
    if (response.data && (response.data.message || response.status === 200)) {
      return { message: response.data.message || 'Schedule updated successfully' };
    }
    throw new Error('Invalid response format');
  },

  // Delete a schedule
  async deleteSchedule(schoolId: string, classId: string, scheduleId: string): Promise<void> {
    const endpoint = API_CONFIG.ENDPOINTS.CLASS_SCHEDULES.DELETE
      .replace(':schoolId', schoolId)
      .replace(':classId', classId)
      .replace(':scheduleId', scheduleId);
    
    await apiClient.delete(endpoint);
  },
};

export default classScheduleService;

