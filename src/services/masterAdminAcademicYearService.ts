import { API_CONFIG } from '../config/api';
import { apiHelper } from '../utils/apiHelper';

export interface AcademicYear {
  id?: string;
  academicYearId?: string;
  academicYear: string;
  startYear: number;
  endYear: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface AcademicYearResponse {
  success: boolean;
  message?: string;
  academicYear?: AcademicYear;
  academicYears?: AcademicYear[];
  count?: number;
  isActive?: boolean;
}

class MasterAdminAcademicYearService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Get all academic years
  async getAcademicYears(): Promise<AcademicYear[]> {
    try {
      const response = await apiHelper.get('/master-admin/academic-years') as AcademicYearResponse;
      
      if (response.success && response.academicYears) {
        return response.academicYears;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching academic years:', error);
      throw error;
    }
  }

  // Get academic year by ID
  async getAcademicYearById(academicYearId: string): Promise<AcademicYear> {
    try {
      const response = await apiHelper.get(`/master-admin/academic-years/${academicYearId}`) as AcademicYearResponse;
      
      if (response.success && response.academicYear) {
        return response.academicYear;
      }
      
      throw new Error('Academic year not found');
    } catch (error) {
      console.error('Error fetching academic year:', error);
      throw error;
    }
  }

  // Get active academic year
  async getActiveAcademicYear(): Promise<AcademicYear | null> {
    try {
      const response = await apiHelper.get('/master-admin/academic-years/active') as AcademicYearResponse;
      
      if (response.success && response.academicYear) {
        return response.academicYear;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching active academic year:', error);
      throw error;
    }
  }

  // Add new academic year
  async addAcademicYear(academicYear: Partial<AcademicYear>): Promise<{ success: boolean; academicYearId: string; message: string }> {
    try {
      const response = await apiHelper.post('/master-admin/academic-years', academicYear) as AcademicYearResponse;
      
      if (response.success) {
        return {
          success: true,
          academicYearId: response.academicYear?.academicYearId || response.academicYear?.id || '',
          message: response.message || 'Academic year added successfully'
        };
      }
      
      throw new Error(response.message || 'Failed to add academic year');
    } catch (error: any) {
      console.error('Error adding academic year:', error);
      throw new Error(error.message || 'Failed to add academic year');
    }
  }

  // Update academic year
  async updateAcademicYear(academicYearId: string, academicYear: Partial<AcademicYear>): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiHelper.put(`/master-admin/academic-years/${academicYearId}`, academicYear) as AcademicYearResponse;
      
      if (response.success) {
        return {
          success: true,
          message: response.message || 'Academic year updated successfully'
        };
      }
      
      throw new Error(response.message || 'Failed to update academic year');
    } catch (error: any) {
      console.error('Error updating academic year:', error);
      throw new Error(error.message || 'Failed to update academic year');
    }
  }

  // Delete academic year
  async deleteAcademicYear(academicYearId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiHelper.delete(`/master-admin/academic-years/${academicYearId}`) as AcademicYearResponse;
      
      if (response.success) {
        return {
          success: true,
          message: response.message || 'Academic year deleted successfully'
        };
      }
      
      throw new Error(response.message || 'Failed to delete academic year');
    } catch (error: any) {
      console.error('Error deleting academic year:', error);
      throw new Error(error.message || 'Failed to delete academic year');
    }
  }

  // Toggle active status
  async toggleActiveStatus(academicYearId: string, isActive: boolean): Promise<{ success: boolean; message: string; isActive: boolean }> {
    try {
      const response = await apiHelper.put(`/master-admin/academic-years/${academicYearId}/toggle-active`, { isActive }) as AcademicYearResponse;
      
      if (response.success) {
        return {
          success: true,
          message: response.message || `Academic year ${isActive ? 'activated' : 'deactivated'} successfully`,
          isActive: response.isActive ?? isActive
        };
      }
      
      throw new Error(response.message || 'Failed to toggle academic year activation');
    } catch (error: any) {
      console.error('Error toggling academic year activation:', error);
      throw new Error(error.message || 'Failed to toggle academic year activation');
    }
  }
}

// Create and export a singleton instance
export const masterAdminAcademicYearService = new MasterAdminAcademicYearService();

// Export the class for testing purposes
export default MasterAdminAcademicYearService;
