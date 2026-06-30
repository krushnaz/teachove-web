import apiClient from '../config/axios';
import {
  GeneratedQuestionPaper,
  PaperVersion,
  QuestionBankItem,
} from '../models/generatedQuestionPaper';

const BASE = '/generated-question-papers';

function yearPath(schoolId: string, yearId = 'current') {
  return `${BASE}/${schoolId}/${yearId}`;
}

export const generatedQuestionPaperService = {
  async list(
    schoolId: string,
    filters?: { status?: string; createdBy?: string; subjectId?: string }
  ): Promise<GeneratedQuestionPaper[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.createdBy) params.set('createdBy', filters.createdBy);
    if (filters?.subjectId) params.set('subjectId', filters.subjectId);
    const qs = params.toString();
    const res = await apiClient.get(`${yearPath(schoolId)}/papers${qs ? `?${qs}` : ''}`);
    return res.data?.data ?? [];
  },

  async get(schoolId: string, paperId: string): Promise<GeneratedQuestionPaper> {
    const res = await apiClient.get(`${yearPath(schoolId)}/papers/${paperId}`);
    return res.data?.data;
  },

  async create(schoolId: string, paper: GeneratedQuestionPaper): Promise<GeneratedQuestionPaper> {
    const res = await apiClient.post(`${yearPath(schoolId)}/papers`, paper);
    return res.data?.data;
  },

  async update(
    schoolId: string,
    paperId: string,
    paper: Partial<GeneratedQuestionPaper>
  ): Promise<GeneratedQuestionPaper> {
    const res = await apiClient.put(`${yearPath(schoolId)}/papers/${paperId}`, paper);
    return res.data?.data;
  },

  async delete(schoolId: string, paperId: string): Promise<void> {
    await apiClient.delete(`${yearPath(schoolId)}/papers/${paperId}`);
  },

  async duplicate(schoolId: string, paperId: string): Promise<GeneratedQuestionPaper> {
    const res = await apiClient.post(`${yearPath(schoolId)}/papers/${paperId}/duplicate`);
    return res.data?.data;
  },

  async archive(schoolId: string, paperId: string): Promise<void> {
    await apiClient.post(`${yearPath(schoolId)}/papers/${paperId}/archive`);
  },

  async saveVersion(schoolId: string, paperId: string, savedBy?: string): Promise<void> {
    await apiClient.post(`${yearPath(schoolId)}/papers/${paperId}/versions`, { savedBy });
  },

  async listVersions(schoolId: string, paperId: string): Promise<PaperVersion[]> {
    const res = await apiClient.get(`${yearPath(schoolId)}/papers/${paperId}/versions`);
    return res.data?.data ?? [];
  },

  async uploadImage(schoolId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await apiClient.post(`${BASE}/${schoolId}/upload-image`, formData);
    return res.data?.data?.url;
  },
};

export const questionBankService = {
  async list(
    schoolId: string,
    filters?: {
      keyword?: string;
      subjectId?: string;
      chapter?: string;
      difficulty?: string;
      questionType?: string;
      minMarks?: number;
      maxMarks?: number;
      createdBy?: string;
    }
  ): Promise<QuestionBankItem[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v != null && v !== '') params.set(k, String(v));
      });
    }
    const qs = params.toString();
    const res = await apiClient.get(`${BASE}/${schoolId}/question-bank${qs ? `?${qs}` : ''}`);
    return res.data?.data ?? [];
  },

  async create(schoolId: string, question: QuestionBankItem): Promise<QuestionBankItem> {
    const res = await apiClient.post(`${BASE}/${schoolId}/question-bank`, question);
    return res.data?.data;
  },

  async update(
    schoolId: string,
    questionId: string,
    question: Partial<QuestionBankItem>
  ): Promise<QuestionBankItem> {
    const res = await apiClient.put(`${BASE}/${schoolId}/question-bank/${questionId}`, question);
    return res.data?.data;
  },

  async delete(schoolId: string, questionId: string): Promise<void> {
    await apiClient.delete(`${BASE}/${schoolId}/question-bank/${questionId}`);
  },
};
