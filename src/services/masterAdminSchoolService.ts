import { API_CONFIG } from '../config/api';
import { apiHelper } from '../utils/apiHelper';

export interface School {
  id?: string;
  schoolId?: string;
  schoolName: string;
  type?: string;
  email: string;
  phoneNo: string;
  password?: string;
  address?: any;
  logo?: string | null;
  currentAcademicYear?: string;
  city?: string;
  state?: string;
  pincode?: string;
  line1?: string;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface SchoolResponse {
  success: boolean;
  message?: string;
  school?: School;
  schools?: School[];
  count?: number;
  isActive?: boolean;
}

class MasterAdminSchoolService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Get all schools
  async getSchools(): Promise<School[]> {
    try {
      const response = await apiHelper.get('/master-admin/schools') as SchoolResponse;
      
      if (response.success && response.schools) {
        return response.schools;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching schools:', error);
      throw error;
    }
  }

  // Get school by ID
  async getSchoolById(schoolId: string): Promise<School> {
    try {
      const response = await apiHelper.get(`/master-admin/schools/${schoolId}`) as SchoolResponse;
      
      if (response.success && response.school) {
        return response.school;
      }
      
      throw new Error('School not found');
    } catch (error) {
      console.error('Error fetching school:', error);
      throw error;
    }
  }

  // Add new school
  async addSchool(school: Partial<School>): Promise<{ success: boolean; schoolId: string; message: string }> {
    try {
      const response = await apiHelper.post('/master-admin/schools', school) as SchoolResponse;
      
      if (response.success) {
        return {
          success: true,
          schoolId: response.school?.schoolId || response.school?.id || '',
          message: response.message || 'School added successfully'
        };
      }
      
      throw new Error(response.message || 'Failed to add school');
    } catch (error: any) {
      console.error('Error adding school:', error);
      throw new Error(error.message || 'Failed to add school');
    }
  }

  // Update school
  async updateSchool(schoolId: string, school: Partial<School>): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiHelper.put(`/master-admin/schools/${schoolId}`, school) as SchoolResponse;
      
      if (response.success) {
        return {
          success: true,
          message: response.message || 'School updated successfully'
        };
      }
      
      throw new Error(response.message || 'Failed to update school');
    } catch (error: any) {
      console.error('Error updating school:', error);
      throw new Error(error.message || 'Failed to update school');
    }
  }

  // Delete school
  async deleteSchool(schoolId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiHelper.delete(`/master-admin/schools/${schoolId}`) as SchoolResponse;
      
      if (response.success) {
        return {
          success: true,
          message: response.message || 'School deleted successfully'
        };
      }
      
      throw new Error(response.message || 'Failed to delete school');
    } catch (error: any) {
      console.error('Error deleting school:', error);
      throw new Error(error.message || 'Failed to delete school');
    }
  }

  // Toggle school activation (activate/deactivate)
  async toggleSchoolActivation(schoolId: string, isActive: boolean): Promise<{ success: boolean; message: string; isActive: boolean }> {
    try {
      const response = await apiHelper.put(`/master-admin/schools/${schoolId}/toggle-activation`, { isActive }) as SchoolResponse;
      
      if (response.success) {
        return {
          success: true,
          message: response.message || `School ${isActive ? 'activated' : 'deactivated'} successfully`,
          isActive: response.isActive ?? isActive
        };
      }
      
      throw new Error(response.message || 'Failed to toggle school activation');
    } catch (error: any) {
      console.error('Error toggling school activation:', error);
      throw new Error(error.message || 'Failed to toggle school activation');
    }
  }

  // Check if school is active
  async isSchoolActive(schoolId: string): Promise<boolean> {
    try {
      const response = await apiHelper.get(`/master-admin/schools/${schoolId}/is-active`) as SchoolResponse;
      
      if (response.success) {
        return response.isActive ?? false;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking school activation status:', error);
      return false;
    }
  }

  // Get school profile with stats
  async getSchoolProfileWithStats(schoolId: string): Promise<{ success: boolean; school: School; stats: { teacherCount: number; studentCount: number } }> {
    try {
      const response = await apiHelper.get(`/master-admin/schools/${schoolId}/profile`) as any;
      
      if (response.success) {
        return {
          success: true,
          school: response.school,
          stats: response.stats
        };
      }
      
      throw new Error(response.message || 'Failed to fetch school profile');
    } catch (error: any) {
      console.error('Error fetching school profile:', error);
      throw new Error(error.message || 'Failed to fetch school profile');
    }
  }

  // Get teachers by school
  async getSchoolTeachers(schoolId: string): Promise<{ success: boolean; count: number; teachers: any[] }> {
    try {
      const response = await apiHelper.get(`/master-admin/schools/${schoolId}/teachers`) as any;
      
      if (response.success) {
        return {
          success: true,
          count: response.count || 0,
          teachers: response.teachers || []
        };
      }
      
      throw new Error(response.message || 'Failed to fetch teachers');
    } catch (error: any) {
      console.error('Error fetching school teachers:', error);
      throw new Error(error.message || 'Failed to fetch teachers');
    }
  }

  // Get students by school
  async getSchoolStudents(schoolId: string): Promise<{ success: boolean; count: number; students: any[] }> {
    try {
      const response = await apiHelper.get(`/master-admin/schools/${schoolId}/students`) as any;
      
      if (response.success) {
        return {
          success: true,
          count: response.count || 0,
          students: response.students || []
        };
      }
      
      throw new Error(response.message || 'Failed to fetch students');
    } catch (error: any) {
      console.error('Error fetching school students:', error);
      throw new Error(error.message || 'Failed to fetch students');
    }
  }

  // Download teachers Excel
  async downloadTeachersExcel(schoolId: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/master-admin/schools/${schoolId}/teachers/download`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to download teachers Excel');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'Teachers.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error downloading teachers Excel:', error);
      throw new Error(error.message || 'Failed to download teachers Excel');
    }
  }

  // Download students Excel
  async downloadStudentsExcel(schoolId: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/master-admin/schools/${schoolId}/students/download`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to download students Excel');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'Students.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error downloading students Excel:', error);
      throw new Error(error.message || 'Failed to download students Excel');
    }
  }
}

// Create and export a singleton instance
export const masterAdminSchoolService = new MasterAdminSchoolService();

// Export the class for testing purposes
export default MasterAdminSchoolService;
