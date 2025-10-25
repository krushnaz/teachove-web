import { API_CONFIG } from '../config/api';

export interface StudentLeave {
  leaveId: string;
  studentId: string;
  classId: string;
  yearId: string;
  reason: string;
  fromDate: string;
  toDate: string;
  leaveType: string;
  status: 'pending' | 'approved' | 'rejected';
  fileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  schoolId?: string;
  student?: {
    studentId: string;
    schoolId: string;
    name: string;
    email: string;
    phoneNo: string;
    profilePic?: string;
    admissionYear: string;
    rollNo?: string;
    classId: string;
    createdAt?: any;
    updatedAt?: any;
  };
}

export interface CreateLeaveRequest {
  studentId: string;
  classId: string;
  yearId: string;
  reason: string;
  fromDate: string;
  toDate: string;
  leaveType: string;
  status?: string;
}

export interface CreateLeaveResponse {
  success: boolean;
  message: string;
  leaveId: string;
  fileUrl?: string;
}

export interface GetLeavesResponse {
  success: boolean;
  leaves: StudentLeave[];
}

export interface LeaveResponse {
  success: boolean;
  message: string;
  leave?: StudentLeave;
}

class StudentLeavesService {
  /**
   * Create a new leave request
   */
  async createLeave(
    schoolId: string,
    leaveData: CreateLeaveRequest,
    file?: File
  ): Promise<CreateLeaveResponse> {
    try {
      const formData = new FormData();
      
      // Append all leave data
      formData.append('studentId', leaveData.studentId);
      formData.append('classId', leaveData.classId);
      formData.append('yearId', leaveData.yearId);
      formData.append('reason', leaveData.reason);
      formData.append('fromDate', leaveData.fromDate);
      formData.append('toDate', leaveData.toDate);
      formData.append('leaveType', leaveData.leaveType);
      formData.append('status', leaveData.status || 'pending');
      
      // Append file if provided
      if (file) {
        formData.append('file', file);
      }
      
      const endpoint = API_CONFIG.ENDPOINTS.STUDENT_LEAVES.CREATE.replace(':schoolId', schoolId);
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error creating leave:', error);
      throw new Error(error.message || 'Failed to create leave request');
    }
  }

  /**
   * Get all leaves for a student
   */
  async getLeavesByStudent(yearId: string, schoolId: string, studentId: string): Promise<StudentLeave[]> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENT_LEAVES.GET_BY_STUDENT
        .replace(':yearId', yearId)
        .replace(':schoolId', schoolId)
        .replace(':studentId', studentId);
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: GetLeavesResponse = await response.json();
      return data.leaves || [];
    } catch (error: any) {
      console.error('Error fetching leaves:', error);
      throw new Error(error.message || 'Failed to fetch leaves');
    }
  }

  /**
   * Get leave by ID
   */
  async getLeaveById(schoolId: string, leaveId: string): Promise<StudentLeave> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENT_LEAVES.GET_BY_ID
        .replace(':schoolId', schoolId)
        .replace(':leaveId', leaveId);
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: LeaveResponse = await response.json();
      if (!data.leave) {
        throw new Error('Leave not found');
      }
      return data.leave;
    } catch (error: any) {
      console.error('Error fetching leave:', error);
      throw new Error(error.message || 'Failed to fetch leave');
    }
  }

  /**
   * Update a leave request
   */
  async updateLeave(
    schoolId: string,
    leaveId: string,
    leaveData: Partial<CreateLeaveRequest>,
    file?: File
  ): Promise<LeaveResponse> {
    try {
      const formData = new FormData();
      
      // Append all leave data that's provided
      if (leaveData.studentId) formData.append('studentId', leaveData.studentId);
      if (leaveData.classId) formData.append('classId', leaveData.classId);
      if (leaveData.yearId) formData.append('yearId', leaveData.yearId);
      if (leaveData.reason) formData.append('reason', leaveData.reason);
      if (leaveData.fromDate) formData.append('fromDate', leaveData.fromDate);
      if (leaveData.toDate) formData.append('toDate', leaveData.toDate);
      if (leaveData.leaveType) formData.append('leaveType', leaveData.leaveType);
      if (leaveData.status) formData.append('status', leaveData.status);
      
      // Append file if provided
      if (file) {
        formData.append('file', file);
      }
      
      const endpoint = API_CONFIG.ENDPOINTS.STUDENT_LEAVES.UPDATE
        .replace(':schoolId', schoolId)
        .replace(':leaveId', leaveId);
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error updating leave:', error);
      throw new Error(error.message || 'Failed to update leave request');
    }
  }

  /**
   * Delete a leave request
   */
  async deleteLeave(schoolId: string, leaveId: string): Promise<void> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENT_LEAVES.DELETE
        .replace(':schoolId', schoolId)
        .replace(':leaveId', leaveId);
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error deleting leave:', error);
      throw new Error(error.message || 'Failed to delete leave request');
    }
  }

  /**
   * Get all leaves for a class (for teachers)
   */
  async getLeavesByClass(schoolId: string, classId: string): Promise<{ yearId: string; leaves: StudentLeave[] }> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENT_LEAVES.GET_BY_CLASS
        .replace(':schoolId', schoolId)
        .replace(':classId', classId);
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        yearId: data.yearId || '',
        leaves: data.leaves || []
      };
    } catch (error: any) {
      console.error('Error fetching class leaves:', error);
      throw new Error(error.message || 'Failed to fetch class leaves');
    }
  }

  /**
   * Update leave status (approve/reject)
   */
  async updateLeaveStatus(
    schoolId: string,
    leaveId: string,
    status: 'Approved' | 'Rejected' | 'Pending'
  ): Promise<{ success: boolean; message: string; leaveId: string; newStatus: string }> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENT_LEAVES.UPDATE_STATUS
        .replace(':schoolId', schoolId)
        .replace(':leaveId', leaveId);
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error updating leave status:', error);
      throw new Error(error.message || 'Failed to update leave status');
    }
  }

  /**
   * Approve a leave request (convenience method)
   */
  async approveLeave(schoolId: string, leaveId: string): Promise<{ success: boolean; message: string }> {
    return this.updateLeaveStatus(schoolId, leaveId, 'Approved');
  }

  /**
   * Reject a leave request (convenience method)
   */
  async rejectLeave(schoolId: string, leaveId: string): Promise<{ success: boolean; message: string }> {
    return this.updateLeaveStatus(schoolId, leaveId, 'Rejected');
  }
}

export const studentLeavesService = new StudentLeavesService();

