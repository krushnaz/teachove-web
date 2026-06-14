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

class MasterAdminQuestionPapersService {
  async getClasses(): Promise<QPClass[]> {
    const res = (await apiHelper.get('/master-admin/question-papers/classes')) as ApiResponse<{ classes: QPClass[] }>;
    if (!res.success) throw new Error(res.message || 'Failed to fetch classes');
    return res.classes || [];
  }

  async createClass(payload: { className: string }): Promise<QPClass> {
    const res = (await apiHelper.post('/master-admin/ve-books/classes', payload)) as ApiResponse<{ class: QPClass }>;
    if (!res.success) throw new Error(res.message || 'Failed to create class');
    return res.class;
  }

  async updateClass(classId: string, payload: { className: string }): Promise<QPClass> {
    const res = (await apiHelper.put(`/master-admin/ve-books/classes/${classId}`, payload)) as ApiResponse<{ class: QPClass }>;
    if (!res.success) throw new Error(res.message || 'Failed to update class');
    return res.class;
  }

  async deleteClass(classId: string): Promise<void> {
    const res = (await apiHelper.delete(`/master-admin/ve-books/classes/${classId}`)) as ApiResponse<{}>;
    if (!res.success) throw new Error(res.message || 'Failed to delete class');
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

    const res = await apiHelper.postFormData<ApiResponse<{ paper: QuestionPaper }>>(
      `/master-admin/question-papers/classes/${input.classId}/types/${encodedType}/papers`,
      fd
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

    const res = await apiHelper.putFormData<ApiResponse<{ paper: QuestionPaper }>>(
      `/master-admin/question-papers/classes/${input.classId}/types/${encodedType}/papers/${input.paperId}`,
      fd
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
