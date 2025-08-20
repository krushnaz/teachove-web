import axios from '../config/axios';
import { API_CONFIG } from '../config/api';

export const schoolService = {
  async getSchoolDetails(schoolId: string) {
    const url = API_CONFIG.ENDPOINTS.SCHOOL.DETAILS.replace(':schoolId', schoolId);
    const response = await axios.get(url);
    return response.data;
  },
}; 