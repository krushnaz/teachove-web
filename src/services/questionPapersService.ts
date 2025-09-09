import { API_CONFIG } from '../config/api';
import { apiClient } from '../config/axios';

export interface Class {
  classId: string;
  className: string;
  createdAt: any;
}

export interface QuestionPaper {
  paperId: string;
  classId: string;
  type: string;
  name: string;
  uploadedAt: any;
  fileUrl: string;
}

export interface ClassesResponse {
  classes: Class[];
}

export interface QuestionPapersResponse {
  papers: QuestionPaper[];
}

class QuestionPapersService {
  // Get all classes
  async getClasses(): Promise<ClassesResponse> {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.QUESTION_PAPERS.GET_CLASSES);
    return response.data;
  }

  // Get question papers for a specific class and test type
  async getQuestionPapers(classId: string, testType: string): Promise<QuestionPapersResponse> {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.QUESTION_PAPERS.GET_PAPERS
        .replace(':classId', classId)
        .replace(':testType', testType)
    );
    return response.data;
  }
}

export const questionPapersService = new QuestionPapersService();
