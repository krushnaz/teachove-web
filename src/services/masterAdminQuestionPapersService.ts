import { API_CONFIG } from '../config/api';
import { apiHelper } from '../utils/apiHelper';

export type QuestionPaperType = 'Unit Test 1' | 'Unit Test 2' | 'First Term' | 'Second Term';

export const QUESTION_PAPER_TYPES: QuestionPaperType[] = ['Unit Test 1', 'Unit Test 2', 'First Term', 'Second Term'];

export interface QPClass {
  classId: string;
  className: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface QuestionPaper {
  paperId: string;
  classId: string;
  type: string;
  name: string;
  fileUrl: string;
  uploadedAt?: any;
  updatedAt?: any;
}

type ApiResponse<T> = {
  success: boolean;
  message?: string;
} & T;

async function requestMultipart<T>(endpoint: string, options: { method: 'POST' | 'PUT'; formData: FormData }): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const res = await fetch(url, { method: options.method, body: options.formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `HTTP error! status: ${res.status}`);
  }
  return data as T;
}

class MasterAdminQuestionPapersService {
  async getClasses(): Promise<QPClass[]> {
    const res = (await apiHelper.get('/master-admin/question-papers/classes')) as ApiResponse<{ classes: QPClass[] }>;
    if (!res.success) throw new Error(res.message || 'Failed to fetch classes');
    return res.classes || [];
  }

  async getPapers(classId: string, type: string): Promise<QuestionPaper[]> {
    const encodedType = encodeURIComponent(type);
    const res = (await apiHelper.get(
      `/master-admin/question-papers/classes/${classId}/types/${encodedType}/papers`
    )) as ApiResponse<{ papers: QuestionPaper[] }>;
    if (!res.success) throw new Error(res.message || 'Failed to fetch papers');
    return res.papers || [];
  }

  async uploadPaper(input: { classId: string; type: string; name: string; pdf: File }): Promise<QuestionPaper> {
    const encodedType = encodeURIComponent(input.type);
    const fd = new FormData();
    fd.append('name', input.name);
    fd.append('pdf', input.pdf);

    const res = await requestMultipart<ApiResponse<{ paper: QuestionPaper }>>(
      `/master-admin/question-papers/classes/${input.classId}/types/${encodedType}/papers`,
      { method: 'POST', formData: fd }
    );
    if (!res.success) throw new Error(res.message || 'Failed to upload paper');
    return res.paper;
  }

  async updatePaper(input: {
    classId: string;
    type: string;
    paperId: string;
    name?: string;
    pdf?: File | null;
  }): Promise<QuestionPaper> {
    const encodedType = encodeURIComponent(input.type);
    const fd = new FormData();
    if (input.name) fd.append('name', input.name);
    if (input.pdf) fd.append('pdf', input.pdf);

    const res = await requestMultipart<ApiResponse<{ paper: QuestionPaper }>>(
      `/master-admin/question-papers/classes/${input.classId}/types/${encodedType}/papers/${input.paperId}`,
      { method: 'PUT', formData: fd }
    );
    if (!res.success) throw new Error(res.message || 'Failed to update paper');
    return res.paper;
  }

  async deletePaper(classId: string, type: string, paperId: string): Promise<void> {
    const encodedType = encodeURIComponent(type);
    const res = (await apiHelper.delete(
      `/master-admin/question-papers/classes/${classId}/types/${encodedType}/papers/${paperId}`
    )) as ApiResponse<{}>;
    if (!res.success) throw new Error(res.message || 'Failed to delete paper');
  }
}

export const masterAdminQuestionPapersService = new MasterAdminQuestionPapersService();
export default MasterAdminQuestionPapersService;

