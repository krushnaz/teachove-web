import { apiHelper } from '../utils/apiHelper';
import { API_CONFIG } from '../config/api';

interface AttendanceRecord {
  studentId: string;
  classId: string;
  markedDate: string;
  isPresent: boolean;
  leaveId?: string;
  schoolId: string;
}

interface MarkAttendanceRequest {
  records: AttendanceRecord[];
}

interface AttendanceResult {
  studentId: string;
  status: string;
  attendanceId: string;
}

interface MarkAttendanceResponse {
  message: string;
  results: AttendanceResult[];
}

interface AttendanceData {
  attendanceId: string;
  schoolId: string;
  studentId: string;
  classId: string;
  markedDate: string;
  isPresent: boolean;
  leaveId?: string;
  createdAt: string;
  updatedAt: string;
}

interface MarkedDatesResponse {
  markedDates: string[];
}

interface DownloadReportRequest {
  schoolId: string;
  classId: string;
  fromDate: string;
  toDate: string;
  teacherId: string;
}

class StudentAttendanceService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Mark student attendance
  async markAttendance(schoolId: string, attendanceData: MarkAttendanceRequest): Promise<MarkAttendanceResponse> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENT_ATTENDANCE.MARK.replace(':schoolId', schoolId);
      const response = await apiHelper.post(endpoint, attendanceData);
      return response as MarkAttendanceResponse;
    } catch (error) {
      console.error('Error marking student attendance:', error);
      throw error;
    }
  }

  // Get attendance by date
  async getAttendanceByDate(schoolId: string, date: string): Promise<AttendanceData[]> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENT_ATTENDANCE.GET_BY_DATE
        .replace(':schoolId', schoolId)
        .replace(':date', date);
      const response = await apiHelper.get(endpoint);
      return response as AttendanceData[];
    } catch (error) {
      console.error('Error fetching attendance by date:', error);
      throw error;
    }
  }

  // Get marked dates
  async getMarkedDates(schoolId: string): Promise<MarkedDatesResponse> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENT_ATTENDANCE.GET_MARKED_DATES.replace(':schoolId', schoolId);
      const response = await apiHelper.get(endpoint);
      return response as MarkedDatesResponse;
    } catch (error) {
      console.error('Error fetching marked dates:', error);
      throw error;
    }
  }

  // Download attendance report
  async downloadAttendanceReport(reportData: DownloadReportRequest): Promise<Blob> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENT_ATTENDANCE.DOWNLOAD_REPORT;
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error downloading attendance report:', error);
      throw error;
    }
  }
}

export const studentAttendanceService = new StudentAttendanceService();
export type { AttendanceRecord, MarkAttendanceRequest, MarkAttendanceResponse, AttendanceData, MarkedDatesResponse, DownloadReportRequest }; 