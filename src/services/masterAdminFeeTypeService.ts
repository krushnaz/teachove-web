import { apiHelper } from '../utils/apiHelper';

export interface FeeType {
  id?: string;
  feeTypeId?: string;
  name: string;
  code: string;
  description?: string;
  category: 'school_fee' | 'misc' | 'custom';
  pricingModel: 'class_based' | 'manual';
  legacyTabName?: string | null;
  legacyStorageKey?: string | null;
  isSystemPreset?: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface FeeTypeResponse {
  success: boolean;
  message?: string;
  feeType?: FeeType;
  feeTypes?: FeeType[];
  count?: number;
  isActive?: boolean;
  created?: { id: string; code: string }[];
  skipped?: string[];
  dryRun?: boolean;
  results?: unknown[];
}

class MasterAdminFeeTypeService {
  async getFeeTypes(): Promise<FeeType[]> {
    const response = (await apiHelper.get('/master-admin/fee-types')) as FeeTypeResponse;
    return response.success && response.feeTypes ? response.feeTypes : [];
  }

  async getActiveFeeTypes(): Promise<FeeType[]> {
    const response = (await apiHelper.get('/master-admin/fee-types/active')) as FeeTypeResponse;
    return response.success && response.feeTypes ? response.feeTypes : [];
  }

  async addFeeType(payload: Partial<FeeType>): Promise<FeeType> {
    const response = (await apiHelper.post('/master-admin/fee-types', payload)) as FeeTypeResponse;
    if (response.success && response.feeType) return response.feeType;
    throw new Error(response.message || 'Failed to add fee type');
  }

  async updateFeeType(feeTypeId: string, payload: Partial<FeeType>): Promise<FeeType> {
    const response = (await apiHelper.put(
      `/master-admin/fee-types/${feeTypeId}`,
      payload
    )) as FeeTypeResponse;
    if (response.success && response.feeType) return response.feeType;
    throw new Error(response.message || 'Failed to update fee type');
  }

  async deleteFeeType(feeTypeId: string): Promise<void> {
    const response = (await apiHelper.delete(
      `/master-admin/fee-types/${feeTypeId}`
    )) as FeeTypeResponse;
    if (!response.success) throw new Error(response.message || 'Failed to delete fee type');
  }

  async toggleActiveStatus(feeTypeId: string, isActive: boolean): Promise<void> {
    const response = (await apiHelper.put(
      `/master-admin/fee-types/${feeTypeId}/toggle-active`,
      { isActive }
    )) as FeeTypeResponse;
    if (!response.success) throw new Error(response.message || 'Failed to toggle fee type');
  }

  async seedDefaults(): Promise<FeeTypeResponse> {
    return (await apiHelper.post('/master-admin/fee-types/seed-defaults', {})) as FeeTypeResponse;
  }

  async syncSchoolLegacy(schoolId: string, dryRun = false, yearId?: string): Promise<FeeTypeResponse> {
    return (await apiHelper.post(`/master-admin/fee-types/schools/${schoolId}/sync-legacy`, {
      dryRun,
      yearId,
    })) as FeeTypeResponse;
  }

  async syncAllSchools(dryRun = false): Promise<FeeTypeResponse> {
    return (await apiHelper.post('/master-admin/fee-types/sync-all-schools', { dryRun })) as FeeTypeResponse;
  }
}

export const masterAdminFeeTypeService = new MasterAdminFeeTypeService();
export default MasterAdminFeeTypeService;
