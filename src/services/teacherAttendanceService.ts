import { API_CONFIG } from '../config/api';

export const teacherAttendanceService = {
  async markBulkAttendance(schoolId: string, attendanceRecords: {
    records: Array<{
      teacherId: string;
      date: string;
      isPresent: boolean;
      leaveId: string | null;
    }>;
  }): Promise<any> {
    // Try the exact URL format the user mentioned
    const url = `http://localhost:5000/api/teacher-attendance/${schoolId}`;

    console.log('Making request to:', url);
    console.log('Request body:', JSON.stringify(attendanceRecords, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(attendanceRecords),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const responseData = await response.json();
    console.log('Response data:', responseData);
    return responseData;
  },

  async getTeacherAttendanceByDate(schoolId: string, date: string): Promise<any[]> {
    const endpoint = API_CONFIG.ENDPOINTS.TEACHER_ATTENDANCE.GET_BY_DATE
      .replace(':schoolId', schoolId)
      .replace(':date', date);
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    console.log('GET attendance by date request to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('GET response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GET response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const responseData = await response.json();
    console.log('GET attendance response data:', responseData);
    return responseData;
  },

  async getTeacherAttendanceStatus(schoolId: string, date: string, teacherId: string): Promise<any> {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TEACHER_ATTENDANCE.GET_STATUS
      .replace(':schoolId', schoolId)
      .replace(':date', date)
      .replace(':teacherId', teacherId)}`;
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

  async getMarkedDates(schoolId: string): Promise<string[]> {
    const endpoint = API_CONFIG.ENDPOINTS.TEACHER_ATTENDANCE.GET_MARKED_DATES
      .replace(':schoolId', schoolId);
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    console.log('GET marked dates request to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('GET marked dates response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GET marked dates response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const responseData = await response.json();
    console.log('GET marked dates response data:', responseData);

    // Return the markedDates array, or empty array if not found
    return responseData.markedDates || [];
  },

  async getTeacherAttendanceSummary(schoolId: string, fromDate?: string, toDate?: string): Promise<any> {
    const endpoint = API_CONFIG.ENDPOINTS.TEACHER_ATTENDANCE.SUMMARY
      .replace(':schoolId', schoolId);
    let url = `${API_CONFIG.BASE_URL}${endpoint}?schoolId=${schoolId}`;
    
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;

    console.log('GET attendance summary request to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('GET attendance summary response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GET attendance summary response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const responseData = await response.json();
    console.log('GET attendance summary response data:', responseData);
    return responseData;
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