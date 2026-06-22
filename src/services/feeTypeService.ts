import { apiClient } from '../config/axios';
import type { FeeType } from './masterAdminFeeTypeService';

export type { FeeType };

/** Legacy tab names used by existing misc-fee APIs */
export type LegacyMiscTabName = 'Admission' | 'Book' | 'Uniform' | 'Bag';

export function getLegacyMiscTabName(feeType: FeeType): LegacyMiscTabName | null {
  const tab = feeType.legacyTabName;
  if (tab === 'Admission' || tab === 'Book' || tab === 'Uniform' || tab === 'Bag') {
    return tab;
  }
  return null;
}

export const feeTypeService = {
  async getActiveFeeTypes(): Promise<FeeType[]> {
    const response = await apiClient.get('/fee-types/active');
    return response.data?.feeTypes || [];
  },

  async getSchoolFeeTypes(schoolId: string): Promise<FeeType[]> {
    const response = await apiClient.get(`/fee-types/school/${schoolId}`);
    return response.data?.feeTypes || [];
  },
};
