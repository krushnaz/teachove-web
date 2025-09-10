import { apiClient } from '../config/axios';

export interface StudentLeave {
  leaveId?: string;
  schoolId: string;
  studentId: string;
  studentName?: string;
  teacherId: string;
  teacherName?: string;
  classId: string;
  className?: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  fileUrl?: string;
  createdAt?: Date;
}

export interface StudentLeavesResponse {
  leaves: StudentLeave[];
  total: number;
}

export const leaveManagementService = {
  // Get student leaves
  getStudentLeaves: async (schoolId: string, status?: string): Promise<StudentLeavesResponse> => {
    const params = status ? { status } : {};
    const response = await apiClient.get(`/leaves/students/${schoolId}`, { params });
    return response.data;
  },

  // Get leave statistics
  getLeaveStatistics: async (schoolId: string) => {
    const response = await apiClient.get(`/leaves/statistics/${schoolId}`);
    return response.data;
  }
};
