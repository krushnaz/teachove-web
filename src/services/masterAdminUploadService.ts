import { apiHelper } from '../utils/apiHelper';

export interface FileUploadRecord {
  uploadId: string;
  schoolId?: string | null;
  schoolName?: string | null;
  userId?: string | null;
  userRole?: string | null;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  sizeLabel: string;
  storagePath?: string | null;
  publicUrl?: string | null;
  category: string;
  module: string;
  fieldName?: string | null;
  route: string;
  method: string;
  platform?: string;
  ipAddress?: string;
  status: string;
  createdAt: string;
}

export interface UploadCategoryStats {
  count: number;
  sizeBytes: number;
}

export interface UploadSchoolStats {
  schoolId: string;
  schoolName: string;
  count: number;
  sizeBytes: number;
}

export interface UploadOverview {
  totalUploads: number;
  totalSizeBytes: number;
  totalSizeLabel: string;
  byCategory: Record<string, UploadCategoryStats>;
  byModule: Record<string, UploadCategoryStats>;
  byMimeType: Record<string, UploadCategoryStats>;
  topSchools: UploadSchoolStats[];
  recentUploads: FileUploadRecord[];
}

class MasterAdminUploadService {
  async getOverview(): Promise<UploadOverview> {
    const res = await apiHelper.get<{ success: boolean; data: UploadOverview }>(
      '/master-admin/uploads/overview'
    );
    return res.data;
  }

  async getAllUploads(params?: { category?: string; limit?: number }): Promise<FileUploadRecord[]> {
    const search = new URLSearchParams();
    if (params?.category) search.set('category', params.category);
    if (params?.limit) search.set('limit', String(params.limit));
    const q = search.toString();
    const res = await apiHelper.get<{ success: boolean; data: FileUploadRecord[] }>(
      `/master-admin/uploads${q ? `?${q}` : ''}`
    );
    return res.data;
  }

  async getSchoolStats(schoolId: string): Promise<UploadOverview & { schoolId: string; schoolName?: string }> {
    const res = await apiHelper.get<{
      success: boolean;
      data: UploadOverview & { schoolId: string; schoolName?: string };
    }>(`/master-admin/uploads/school/${schoolId}/stats`);
    return res.data;
  }

  async getSchoolUploads(
    schoolId: string,
    params?: { category?: string; limit?: number }
  ): Promise<FileUploadRecord[]> {
    const search = new URLSearchParams();
    if (params?.category) search.set('category', params.category);
    if (params?.limit) search.set('limit', String(params.limit));
    const q = search.toString();
    const res = await apiHelper.get<{ success: boolean; data: FileUploadRecord[] }>(
      `/master-admin/uploads/school/${schoolId}${q ? `?${q}` : ''}`
    );
    return res.data;
  }
}

export const masterAdminUploadService = new MasterAdminUploadService();

export const formatUploadBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

export const categoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    student_profile: 'Student Photo',
    teacher_profile: 'Teacher Photo',
    school_logo: 'School Logo',
    homework: 'Homework',
    announcement: 'Announcement',
    event: 'Event',
    leave_attachment: 'Leave Attachment',
    excel_bulk: 'Excel Bulk Upload',
    ve_book: 'VE Book PDF',
    question_paper: 'Question Paper',
    pdf: 'PDF Document',
    general: 'General',
  };
  return labels[category] || category.replace(/_/g, ' ');
};
