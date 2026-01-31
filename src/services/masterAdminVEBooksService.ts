import { API_CONFIG } from '../config/api';
import { apiHelper } from '../utils/apiHelper';

export interface VEBookClass {
  classId: string;
  className: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface VEBookSubject {
  subjectId: string;
  classId: string;
  subjectName: string;
  pdfUrl: string;
  coverPageUrl?: string | null;
  createdAt?: any;
  updatedAt?: any;
}

export interface VEBookMergeBook {
  mergeBookId: string;
  classId: string;
  mergeBookName: string;
  pdfUrl: string;
  createdAt?: any;
  updatedAt?: any;
}

type ApiResponse<T> = {
  success: boolean;
  message?: string;
} & T;

async function requestMultipart<T>(
  endpoint: string,
  options: {
    method: 'POST' | 'PUT' | 'DELETE';
    formData?: FormData;
  }
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    method: options.method,
    body: options.formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || `HTTP error! status: ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

class MasterAdminVEBooksService {
  // Totals
  async getTotals(): Promise<{ totalSubjects: number; totalMergedBooks: number }> {
    const res = (await apiHelper.get('/master-admin/ve-books/totals')) as ApiResponse<{
      totals: { totalSubjects: number; totalMergedBooks: number };
    }>;
    if (!res.success) throw new Error(res.message || 'Failed to fetch totals');
    return res.totals;
  }

  // Classes
  async getClasses(): Promise<VEBookClass[]> {
    const res = (await apiHelper.get('/master-admin/ve-books/classes')) as ApiResponse<{
      classes: VEBookClass[];
    }>;
    if (!res.success) throw new Error(res.message || 'Failed to fetch classes');
    return res.classes || [];
  }

  async createClass(payload: { className: string; classId?: string }): Promise<VEBookClass> {
    const res = (await apiHelper.post('/master-admin/ve-books/classes', payload)) as ApiResponse<{
      class: VEBookClass;
    }>;
    if (!res.success) throw new Error(res.message || 'Failed to create class');
    return res.class;
  }

  async updateClass(classId: string, payload: { className: string }): Promise<VEBookClass> {
    const res = (await apiHelper.put(`/master-admin/ve-books/classes/${classId}`, payload)) as ApiResponse<{
      class: VEBookClass;
    }>;
    if (!res.success) throw new Error(res.message || 'Failed to update class');
    return res.class;
  }

  async deleteClass(classId: string): Promise<void> {
    const res = (await apiHelper.delete(`/master-admin/ve-books/classes/${classId}`)) as ApiResponse<{}>;
    if (!res.success) throw new Error(res.message || 'Failed to delete class');
  }

  // Subjects
  async getSubjects(classId: string): Promise<VEBookSubject[]> {
    const res = (await apiHelper.get(`/master-admin/ve-books/classes/${classId}/subjects`)) as ApiResponse<{
      subjects: VEBookSubject[];
    }>;
    if (!res.success) throw new Error(res.message || 'Failed to fetch subjects');
    return res.subjects || [];
  }

  async createSubject(input: {
    classId: string;
    subjectName: string;
    pdf: File;
    cover?: File | null;
  }): Promise<VEBookSubject> {
    const fd = new FormData();
    fd.append('subjectName', input.subjectName);
    fd.append('pdf', input.pdf);
    if (input.cover) fd.append('cover', input.cover);

    const res = await requestMultipart<ApiResponse<{ subject: VEBookSubject }>>(
      `/master-admin/ve-books/classes/${input.classId}/subjects`,
      { method: 'POST', formData: fd }
    );
    if (!res.success) throw new Error(res.message || 'Failed to create subject');
    return res.subject;
  }

  async updateSubject(input: {
    classId: string;
    subjectId: string;
    subjectName?: string;
    pdf?: File | null;
    cover?: File | null;
  }): Promise<VEBookSubject> {
    const fd = new FormData();
    if (input.subjectName) fd.append('subjectName', input.subjectName);
    if (input.pdf) fd.append('pdf', input.pdf);
    if (input.cover) fd.append('cover', input.cover);

    const res = await requestMultipart<ApiResponse<{ subject: VEBookSubject }>>(
      `/master-admin/ve-books/classes/${input.classId}/subjects/${input.subjectId}`,
      { method: 'PUT', formData: fd }
    );
    if (!res.success) throw new Error(res.message || 'Failed to update subject');
    return res.subject;
  }

  async deleteSubject(classId: string, subjectId: string): Promise<void> {
    const res = (await apiHelper.delete(
      `/master-admin/ve-books/classes/${classId}/subjects/${subjectId}`
    )) as ApiResponse<{}>;
    if (!res.success) throw new Error(res.message || 'Failed to delete subject');
  }

  async deleteSubjectCover(classId: string, subjectId: string): Promise<void> {
    const res = (await apiHelper.delete(
      `/master-admin/ve-books/classes/${classId}/subjects/${subjectId}/cover`
    )) as ApiResponse<{}>;
    if (!res.success) throw new Error(res.message || 'Failed to delete cover page');
  }

  // Merge Books
  async getMergeBooks(classId: string): Promise<VEBookMergeBook[]> {
    const res = (await apiHelper.get(`/master-admin/ve-books/classes/${classId}/mergeBooks`)) as ApiResponse<{
      mergeBooks: VEBookMergeBook[];
    }>;
    if (!res.success) throw new Error(res.message || 'Failed to fetch merged books');
    return res.mergeBooks || [];
  }

  async createMergeBook(input: { classId: string; mergeBookName: string; pdf: File }): Promise<VEBookMergeBook> {
    const fd = new FormData();
    fd.append('mergeBookName', input.mergeBookName);
    fd.append('pdf', input.pdf);

    const res = await requestMultipart<ApiResponse<{ mergeBook: VEBookMergeBook }>>(
      `/master-admin/ve-books/classes/${input.classId}/mergeBooks`,
      { method: 'POST', formData: fd }
    );
    if (!res.success) throw new Error(res.message || 'Failed to create merge book');
    return res.mergeBook;
  }

  async updateMergeBook(input: {
    classId: string;
    mergeBookId: string;
    mergeBookName?: string;
    pdf?: File | null;
  }): Promise<VEBookMergeBook> {
    const fd = new FormData();
    if (input.mergeBookName) fd.append('mergeBookName', input.mergeBookName);
    if (input.pdf) fd.append('pdf', input.pdf);

    const res = await requestMultipart<ApiResponse<{ mergeBook: VEBookMergeBook }>>(
      `/master-admin/ve-books/classes/${input.classId}/mergeBooks/${input.mergeBookId}`,
      { method: 'PUT', formData: fd }
    );
    if (!res.success) throw new Error(res.message || 'Failed to update merge book');
    return res.mergeBook;
  }

  async deleteMergeBook(classId: string, mergeBookId: string): Promise<void> {
    const res = (await apiHelper.delete(
      `/master-admin/ve-books/classes/${classId}/mergeBooks/${mergeBookId}`
    )) as ApiResponse<{}>;
    if (!res.success) throw new Error(res.message || 'Failed to delete merge book');
  }
}

export const masterAdminVEBooksService = new MasterAdminVEBooksService();
export default MasterAdminVEBooksService;

