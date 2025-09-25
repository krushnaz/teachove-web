import { apiHelper } from '../utils/apiHelper';
import { API_CONFIG } from '../config/api';
import { 
  StudentResult, 
  CreateResultRequest, 
  UpdateResultRequest, 
  ResultsResponse, 
  ResultResponse 
} from '../models/result';

// Helper function for safe error logging
const logError = (error: unknown, context: string) => {
  console.error(`❌ ${context}:`, error);
  if (error instanceof Error) {
    console.error('🔍 Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
};

class ResultService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Get all results for a school
  async getResultsBySchool(schoolId: string): Promise<ResultsResponse> {
    try {
      const endpoint = `/results/school/${schoolId}`;
      const response = await apiHelper.get(endpoint);

      // Handle direct array response from API
      if (Array.isArray(response)) {
        return {
          success: true,
          results: response,
          count: response.length,
          timestamp: new Date().toISOString()
        };
      }

      // Handle wrapped response format
      return response;
    } catch (error) {
      logError(error, 'Failed to fetch results by school');
      throw error;
    }
  }

  // Get results for a specific class
  async getResultsByClass(schoolId: string, classId: string): Promise<ResultsResponse> {
    try {
      const endpoint = `/results/school/${schoolId}/class/${classId}`;
      const response = await apiHelper.get(endpoint);

      // Handle direct array response from API
      if (Array.isArray(response)) {
        return {
          success: true,
          results: response,
          count: response.length,
          timestamp: new Date().toISOString()
        };
      }

      // Handle wrapped response format
      return response;
    } catch (error) {
      logError(error, 'Failed to fetch results by class');
      throw error;
    }
  }

  // Get results for a specific student
  async getResultsByStudent(schoolId: string, studentId: string, classId?: string): Promise<ResultsResponse | any[]> {
    try {
      // Prefer new student-results endpoint when classId is provided
      if (classId) {
        const endpoint = API_CONFIG.ENDPOINTS.STUDENT_RESULTS.GET_BY_STUDENT_CLASS
          .replace(':schoolId', schoolId)
          .replace(':studentId', studentId)
          .replace(':classId', classId);
        const resp = await apiHelper.get(endpoint);
        return Array.isArray(resp) ? resp : (resp?.data || resp?.results || []);
      }

      const endpoint = `/results/school/${schoolId}/student/${studentId}`;
      const response = await apiHelper.get(endpoint);

      // Handle direct array response from API
      if (Array.isArray(response)) {
        return {
          success: true,
          results: response,
          count: response.length,
          timestamp: new Date().toISOString()
        };
      }

      // Handle wrapped response format
      return response;
    } catch (error) {
      logError(error, 'Failed to fetch results by student');
      throw error;
    }
  }

  // Get a specific result by ID
  async getResultById(schoolId: string, resultId: string): Promise<ResultResponse> {
    try {
      const endpoint = `/results/school/${schoolId}/result/${resultId}`;
      const response = await apiHelper.get(endpoint);
      return response;
    } catch (error) {
      logError(error, 'Failed to fetch result details');
      throw error;
    }
  }

  // Create a new result
  async createResult(schoolId: string, resultData: CreateResultRequest): Promise<ResultResponse> {
    try {
      // Prefer new student-results endpoint if payload matches expected shape
      const srEndpoint = API_CONFIG.ENDPOINTS.STUDENT_RESULTS?.CREATE || '/student-results/';
      const payload = {
        schoolId,
        classId: (resultData as any).classId,
        studentId: resultData.studentId,
        examName: (resultData as any).examName || resultData.examType || '',
        examDate: (resultData as any).examDate,
        subjects: (resultData.subjects || []).map((s: any) => ({
          subjectName: s.subjectName,
          marksObtained: s.marksObtained,
          totalMarks: s.totalMarks,
          percentage: s.totalMarks ? (s.marksObtained / s.totalMarks) * 100 : 0,
          grade: s.grade || 'N/A'
        })),
        totalObtained: (resultData.subjects || []).reduce((sum: number, s: any) => sum + (s.marksObtained || 0), 0),
        totalMaximum: (resultData.subjects || []).reduce((sum: number, s: any) => sum + (s.totalMarks || 0), 0),
        percentage: (() => {
          const total = (resultData.subjects || []).reduce((sum: number, s: any) => sum + (s.totalMarks || 0), 0);
          const obt = (resultData.subjects || []).reduce((sum: number, s: any) => sum + (s.marksObtained || 0), 0);
          return total > 0 ? (obt / total) * 100 : 0;
        })(),
        overallGrade: (resultData as any).overallGrade,
        remarks: (resultData as any).remarks || ''
      };

      const response = await apiHelper.post(srEndpoint, payload);
      return response;
    } catch (error) {
      logError(error, 'Failed to create result');
      throw error;
    }
  }

  // Create student result with explicit payload (new endpoint)
  async createStudentResult(payload: {
    schoolId: string;
    classId: string;
    studentId: string;
    examType?: string;
    examName: string;
    examDate: string;
    subjects: Array<{ subjectName: string; marksObtained: number; totalMarks: number; percentage: number; grade: string }>;
    totalObtained: number;
    totalMaximum: number;
    percentage: number;
    overallGrade: string;
    remarks?: string;
  }): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENT_RESULTS.CREATE;
      const response = await apiHelper.post(endpoint, payload);
      return response;
    } catch (error) {
      logError(error, 'Failed to create student result');
      throw error;
    }
  }

  // Update a result
  async updateResult(schoolId: string, resultId: string, resultData: UpdateResultRequest): Promise<ResultResponse> {
    try {
      const endpoint = `/results/school/${schoolId}/result/${resultId}`;
      const response = await apiHelper.put(endpoint, resultData);
      return response;
    } catch (error) {
      logError(error, 'Failed to update result');
      throw error;
    }
  }

  // Update student result (new endpoint)
  async updateStudentResult(schoolId: string, resultId: string, payload: {
    examType?: string;
    examName: string;
    examDate: string;
    subjects: Array<{ subjectName: string; marksObtained: number; totalMarks: number; percentage: number; grade: string }>;
    totalObtained: number;
    totalMaximum: number;
    percentage: number;
    overallGrade: string;
    remarks?: string;
  }): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENT_RESULTS.UPDATE
        .replace(':schoolId', schoolId)
        .replace(':resultId', resultId);
      const response = await apiHelper.put(endpoint, payload);
      return response;
    } catch (error) {
      logError(error, 'Failed to update student result');
      throw error;
    }
  }

  // Delete a result
  async deleteResult(schoolId: string, resultId: string): Promise<any> {
    try {
      const endpoint = `/results/school/${schoolId}/result/${resultId}`;
      const response = await apiHelper.delete(endpoint);
      return response;
    } catch (error) {
      logError(error, 'Failed to delete result');
      throw error;
    }
  }

  // Delete student result (new endpoint)
  async deleteStudentResult(schoolId: string, resultId: string): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STUDENT_RESULTS.DELETE
        .replace(':schoolId', schoolId)
        .replace(':resultId', resultId);
      const response = await apiHelper.delete(endpoint);
      return response;
    } catch (error) {
      logError(error, 'Failed to delete student result');
      throw error;
    }
  }

  // Get result statistics for a class
  async getResultStatistics(schoolId: string, classId: string, examType?: string): Promise<any> {
    try {
      let endpoint = `/results/school/${schoolId}/class/${classId}/statistics`;
      if (examType) {
        endpoint += `?examType=${examType}`;
      }
      const response = await apiHelper.get(endpoint);
      return response;
    } catch (error) {
      logError(error, 'Failed to fetch result statistics');
      throw error;
    }
  }

  // Download result report
  async downloadResultReport(schoolId: string, classId: string, examType?: string): Promise<Blob> {
    try {
      let endpoint = `/results/school/${schoolId}/class/${classId}/report`;
      if (examType) {
        endpoint += `?examType=${examType}`;
      }
      
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      logError(error, 'Failed to download result report');
      throw error;
    }
  }
}

// Create and export a singleton instance
export const resultService = new ResultService();

// Export the class for testing purposes
export default ResultService;
