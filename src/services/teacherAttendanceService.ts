import { API_CONFIG } from '../config/api';
import { apiHelper } from '../utils/apiHelper';

export const teacherAttendanceService = {
  async markBulkAttendance(schoolId: string, attendanceRecords: {
    records: Array<{
      teacherId: string;
      date: string;
      isPresent: boolean;
      leaveId: string | null;
    }>;
  }): Promise<any> {
    const endpoint = API_CONFIG.ENDPOINTS.TEACHER_ATTENDANCE.BULK_MARK + schoolId;
    return await apiHelper.post(endpoint, attendanceRecords);
  },

  async getTeacherAttendanceByDate(schoolId: string, date: string): Promise<any[]> {
    const endpoint = API_CONFIG.ENDPOINTS.TEACHER_ATTENDANCE.GET_BY_DATE
      .replace(':schoolId', schoolId)
      .replace(':date', date);
    return await apiHelper.get(endpoint);
  },

  async getTeacherAttendanceStatus(schoolId: string, date: string, teacherId: string): Promise<any> {
    const endpoint = API_CONFIG.ENDPOINTS.TEACHER_ATTENDANCE.GET_STATUS
      .replace(':schoolId', schoolId)
      .replace(':date', date)
      .replace(':teacherId', teacherId);
    return await apiHelper.get(endpoint);
  },

  async getMarkedDates(schoolId: string): Promise<string[]> {
    const endpoint = API_CONFIG.ENDPOINTS.TEACHER_ATTENDANCE.GET_MARKED_DATES
      .replace(':schoolId', schoolId);
    const responseData = await apiHelper.get(endpoint);
    // Return the markedDates array, or empty array if not found
    return responseData.markedDates || [];
  },

  async getTeacherAttendanceSummary(schoolId: string, fromDate?: string, toDate?: string): Promise<any> {
    const endpoint = API_CONFIG.ENDPOINTS.TEACHER_ATTENDANCE.SUMMARY;
    let queryParams = `?schoolId=${schoolId}`;
    if (fromDate) queryParams += `&fromDate=${fromDate}`;
    if (toDate) queryParams += `&toDate=${toDate}`;
    return await apiHelper.get(`${endpoint}${queryParams}`);
  },

  async downloadTeacherAttendanceReport(schoolId: string, fromDate: string, toDate: string): Promise<Blob> {
    // Using raw fetch here since apiHelper doesn't support blob responses
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

  async getTeacherAttendanceForTeacher(schoolId: string, teacherId: string): Promise<{ teacherId: string; totalPresent: number; presentDates: string[]; totalAbsent: number; absentDates: string[] }> {
    const endpoint = API_CONFIG.ENDPOINTS.TEACHER_ATTENDANCE.BY_TEACHER
      .replace(':schoolId', schoolId)
      .replace(':teacherId', teacherId);
    const data = await apiHelper.get(endpoint);
    return {
      teacherId: data.teacherId,
      totalPresent: Number.isFinite(data.totalPresent) ? data.totalPresent : 0,
      presentDates: Array.isArray(data.presentDates) ? data.presentDates : [],
      totalAbsent: Number.isFinite(data.totalAbsent) ? data.totalAbsent : 0,
      absentDates: Array.isArray(data.absentDates) ? data.absentDates : [],
    };
  },
};