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
  async getResultsByStudent(schoolId: string, studentId: string): Promise<ResultsResponse> {
    try {
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
      const endpoint = `/results/school/${schoolId}`;
      const response = await apiHelper.post(endpoint, {
        ...resultData,
        schoolId
      });
      return response;
    } catch (error) {
      logError(error, 'Failed to create result');
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
