import { API_CONFIG } from '../config/api';
import { apiClient } from '../config/axios';

export interface SchoolAddress {
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

export interface SchoolProfile {
  schoolId: string;
  role: string;
  schoolName: string;
  type: string;
  email: string;
  phoneNo: string;
  address: SchoolAddress;
  logo: string;
  currentAcademicYear: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface UpdateSchoolProfileRequest {
  schoolName?: string;
  type?: string;
  email?: string;
  phoneNo?: string;
  address?: Partial<SchoolAddress>;
  currentAcademicYear?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const schoolProfileService = {
  // Get school profile by ID
  getSchoolProfile: async (schoolId: string): Promise<SchoolProfile> => {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.SCHOOL.GET_PROFILE.replace(':schoolId', schoolId)
    );
    return response.data;
  },

  // Update school profile
  updateSchoolProfile: async (
    schoolId: string,
    profileData: UpdateSchoolProfileRequest
  ): Promise<SchoolProfile> => {
    const response = await apiClient.put(
      API_CONFIG.ENDPOINTS.SCHOOL.UPDATE_PROFILE_BY_ID.replace(':schoolId', schoolId),
      profileData
    );
    return response.data;
  },

  // Change password
  changePassword: async (passwordData: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/auth/change-password', passwordData);
  },

  // Reset password
  resetPassword: async (email: string): Promise<void> => {
    await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },
}; 