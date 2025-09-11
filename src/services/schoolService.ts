import axios from '../config/axios';
import { API_CONFIG } from '../config/api';

export interface SchoolStats {
  schoolId: string;
  schoolName: string;
  studentCount: number;
  teacherCount: number;
}

export const schoolService = {
  async getSchoolDetails(schoolId: string) {
    const url = API_CONFIG.ENDPOINTS.SCHOOL.DETAILS.replace(':schoolId', schoolId);
    const response = await axios.get(url);
    return response.data;
  },

  async getSchoolStats(schoolId: string): Promise<SchoolStats> {
    const url = API_CONFIG.ENDPOINTS.SCHOOL.STATS.replace(':schoolId', schoolId);
    const response = await axios.get(url);
    return response.data;
  },
};
