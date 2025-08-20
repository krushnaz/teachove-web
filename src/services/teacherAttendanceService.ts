import { API_CONFIG } from '../config/api';

export const teacherAttendanceService = {
  async markAttendance(attendanceData: any): Promise<any> {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TEACHER_ATTENDANCE.MARK}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(attendanceData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  async markBulkAttendance(bulkAttendanceData: {
    schoolId: string;
    date: string;
    attendanceList: Array<{
      name: string;
      day: string;
      date: string;
      schoolId: string;
      teacherId: string;
      attendanceId: string;
      leaveId: string | null;
      isPresent: string;
      dayType: string;
    }>;
  }): Promise<any> {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TEACHER_ATTENDANCE.MARK}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(bulkAttendanceData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  async getTeacherAttendanceByDate(schoolId: string, date: string): Promise<any[]> {
    const url = `${API_CONFIG.BASE_URL}/teacher-attendance/date/${schoolId}/${date}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  async downloadTeacherAttendanceReport(schoolId: string, fromDate: string, toDate: string): Promise<Blob> {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TEACHER_ATTENDANCE.DOWNLOAD_REPORT}?schoolId=${schoolId}&fromDate=${fromDate}&toDate=${toDate}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.blob();
  },
}; 