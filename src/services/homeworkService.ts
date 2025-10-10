import { API_CONFIG } from '../config/api';
import { apiClient } from '../config/axios';

export interface HomeworkPayload {
  title: string;
  subjectName: string;
  description: string;
  deadline: string; // YYYY-MM-DD
  classId: string;
  className?: string;
  teacherId: string;
  file?: File; // For file upload
}

export interface UpdateHomeworkRequest {
  title?: string;
  subjectName?: string;
  description?: string;
  deadline?: string;
  classId?: string;
  className?: string;
  teacherId?: string;
  isActive?: boolean;
  file?: File; // For file upload
}

export interface HomeworkItem {
  homeworkId: string;
  title: string;
  subjectName: string;
  description: string;
  deadline: string;
  file?: string | null;
  isActive?: boolean;
  createdAt?: string;
  classId?: string;
  className?: string;
}

export const homeworkService = {
  async createHomework(schoolId: string, payload: HomeworkPayload): Promise<HomeworkItem> {
    const endpoint = API_CONFIG.ENDPOINTS.HOMEWORKS.CREATE.replace(':schoolId', schoolId);
    
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('subjectName', payload.subjectName);
    formData.append('description', payload.description);
    formData.append('deadline', payload.deadline);
    formData.append('classId', payload.classId);
    formData.append('teacherId', payload.teacherId);
    if (payload.className) {
      formData.append('className', payload.className);
    }
    if (payload.file) {
      formData.append('file', payload.file);
    }
    
    const response = await apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data?.data) {
      return response.data.data as HomeworkItem;
    }
    return response.data as HomeworkItem;
  },

  async updateHomework(schoolId: string, homeworkId: string, payload: UpdateHomeworkRequest): Promise<HomeworkItem> {
    const endpoint = API_CONFIG.ENDPOINTS.HOMEWORKS.UPDATE
      .replace(':schoolId', schoolId)
      .replace(':homeworkId', homeworkId);
    
    const formData = new FormData();
    if (payload.title) formData.append('title', payload.title);
    if (payload.subjectName) formData.append('subjectName', payload.subjectName);
    if (payload.description) formData.append('description', payload.description);
    if (payload.deadline) formData.append('deadline', payload.deadline);
    if (payload.classId) formData.append('classId', payload.classId);
    if (payload.className) formData.append('className', payload.className);
    if (payload.teacherId) formData.append('teacherId', payload.teacherId);
    if (payload.isActive !== undefined) formData.append('isActive', payload.isActive.toString());
    if (payload.file) formData.append('file', payload.file);
    
    const response = await apiClient.put(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data?.data) {
      return response.data.data as HomeworkItem;
    }
    return response.data as HomeworkItem;
  },

  async deleteHomework(schoolId: string, homeworkId: string): Promise<void> {
    const endpoint = API_CONFIG.ENDPOINTS.HOMEWORKS.DELETE
      .replace(':schoolId', schoolId)
      .replace(':homeworkId', homeworkId);
    await apiClient.delete(endpoint);
  },

  async getHomeworkDates(schoolId: string, teacherId?: string): Promise<string[]> {
    let endpoint = API_CONFIG.ENDPOINTS.HOMEWORKS.GET_DATES.replace(':schoolId', schoolId);
    if (teacherId) {
      endpoint += `?teacherId=${teacherId}`;
    }
    const response = await apiClient.get(endpoint);
    return response.data?.dates || response.data || [];
  },

  async getHomeworkByDate(schoolId: string, dateISO: string, teacherId?: string): Promise<HomeworkItem[]> {
    let endpoint = API_CONFIG.ENDPOINTS.HOMEWORKS.GET_BY_DATE
      .replace(':schoolId', schoolId)
      .replace(':date', dateISO);
    
    if (teacherId) {
      endpoint += `?teacherId=${teacherId}`;
    }
    
    const response = await apiClient.get(endpoint);
    const data = response.data;
    if (Array.isArray(data?.homeworks)) return data.homeworks as HomeworkItem[];
    if (Array.isArray(data)) return data as HomeworkItem[];
    return [];
  }
};


