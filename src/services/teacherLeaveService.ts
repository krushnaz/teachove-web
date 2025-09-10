import { API_CONFIG } from '../config/api';
import { apiClient } from '../config/axios';

export interface TeacherLeave {
  leaveId?: string;
  schoolId: string;
  teacherId: string;
  teacherName?: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  filePath?: string;
}

export interface CreateTeacherLeaveRequest {
  schoolId: string;
  teacherId: string;
  startDate: string;
  endDate: string;
  reason: string;
  file?: File;
}

export interface UpdateTeacherLeaveRequest {
  startDate?: string;
  endDate?: string;
  reason?: string;
  file?: File;
}

export interface UpdateLeaveStatusRequest {
  status: 'pending' | 'approved' | 'rejected';
}

export interface TeacherLeavesResponse {
  leaves: TeacherLeave[];
  total: number;
  success: boolean;
  message?: string;
}

export const teacherLeaveService = {
  // Get all teacher leaves for a school
  getAllTeacherLeaves: async (schoolId: string): Promise<TeacherLeavesResponse> => {
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.TEACHER_LEAVES.GET_ALL.replace(':schoolId', schoolId)}`);
    return response.data;
  },

  // Get teacher leaves by teacher ID
  getTeacherLeavesByTeacher: async (schoolId: string, teacherId: string): Promise<TeacherLeavesResponse> => {
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.TEACHER_LEAVES.GET_BY_TEACHER
        .replace(':schoolId', schoolId)
        .replace(':teacherId', teacherId)}`
    );
    return response.data;
  },

  // Get teacher leave by ID
  getTeacherLeaveById: async (schoolId: string, leaveId: string): Promise<TeacherLeave> => {
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.TEACHER_LEAVES.GET_BY_ID
        .replace(':schoolId', schoolId)
        .replace(':leaveId', leaveId)}`
    );
    return response.data;
  },

  // Create teacher leave request
  createTeacherLeave: async (leaveData: CreateTeacherLeaveRequest): Promise<TeacherLeave> => {
    const formData = new FormData();
    formData.append('teacherId', leaveData.teacherId);
    formData.append('startDate', leaveData.startDate);
    formData.append('endDate', leaveData.endDate);
    formData.append('reason', leaveData.reason);
    
    if (leaveData.file) {
      formData.append('file', leaveData.file);
    }

    const response = await apiClient.post(
      `${API_CONFIG.ENDPOINTS.TEACHER_LEAVES.CREATE.replace(':schoolId', leaveData.schoolId)}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Update teacher leave request
  updateTeacherLeave: async (
    schoolId: string, 
    leaveId: string, 
    leaveData: UpdateTeacherLeaveRequest
  ): Promise<TeacherLeave> => {
    const formData = new FormData();
    
    if (leaveData.startDate) formData.append('startDate', leaveData.startDate);
    if (leaveData.endDate) formData.append('endDate', leaveData.endDate);
    if (leaveData.reason) formData.append('reason', leaveData.reason);
    if (leaveData.file) formData.append('file', leaveData.file);

    const response = await apiClient.put(
      `${API_CONFIG.ENDPOINTS.TEACHER_LEAVES.UPDATE
        .replace(':schoolId', schoolId)
        .replace(':leaveId', leaveId)}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Update leave status (approve/reject)
  updateLeaveStatus: async (
    schoolId: string, 
    leaveId: string, 
    statusData: UpdateLeaveStatusRequest
  ): Promise<TeacherLeave> => {
    const response = await apiClient.patch(
      `${API_CONFIG.ENDPOINTS.TEACHER_LEAVES.UPDATE_STATUS
        .replace(':schoolId', schoolId)
        .replace(':leaveId', leaveId)}`,
      statusData
    );
    return response.data;
  },

  // Delete teacher leave request
  deleteTeacherLeave: async (schoolId: string, leaveId: string): Promise<void> => {
    await apiClient.delete(
      `${API_CONFIG.ENDPOINTS.TEACHER_LEAVES.DELETE
        .replace(':schoolId', schoolId)
        .replace(':leaveId', leaveId)}`
    );
  },

  // Approve leave (convenience method)
  approveLeave: async (schoolId: string, leaveId: string): Promise<TeacherLeave> => {
    return teacherLeaveService.updateLeaveStatus(schoolId, leaveId, { status: 'approved' });
  },

  // Reject leave (convenience method)
  rejectLeave: async (schoolId: string, leaveId: string): Promise<TeacherLeave> => {
    return teacherLeaveService.updateLeaveStatus(schoolId, leaveId, { status: 'rejected' });
  },
};
