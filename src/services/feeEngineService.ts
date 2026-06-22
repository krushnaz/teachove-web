import { apiClient } from '../config/axios';
import type { FeeType } from './masterAdminFeeTypeService';

export interface FeePayment {
  paymentId: string;
  amount: number;
  paymentMode: string;
  transactionId: string;
  remarks: string;
  date: string;
  discountApplied?: number;
}

export interface FeeStudentSummary {
  studentId: string;
  studentName: string;
  rollNo: string;
  classId: string;
  className: string;
  section: string;
  assignmentId: string;
  baseAmount: number;
  discountAmount: number;
  discountReason: string;
  status: 'required' | 'not_required' | 'waived';
  notRequiredReason: string;
  dueAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  payments: FeePayment[];
}

export interface FeeStructure {
  feeTypeId: string;
  defaultAmount?: number;
  classAmounts?: Record<string, number>;
  discountPolicies?: Array<{
    id: string;
    name: string;
    type: 'one_time_full' | 'percentage' | 'flat';
    value: number;
    isActive: boolean;
  }>;
  isEnabled?: boolean;
}

export interface FeeSummaryResponse {
  success: boolean;
  totalDue: number;
  totalPaid: number;
  remainingAmount: number;
  students: FeeStudentSummary[];
  structure: FeeStructure;
  feeType: FeeType;
}

export interface FeeDashboardResponse {
  success: boolean;
  schoolId?: string;
  yearId?: string;
  /** Active students in newStudent for this school */
  studentCount?: number;
  totalDue: number;
  totalPaid: number;
  remainingAmount: number;
  collectionRate: number;
  byFeeType: Array<{
    feeTypeId: string;
    name: string;
    code: string;
    totalDue: number;
    totalPaid: number;
    remaining: number;
    notPaidCount: number;
    partialCount: number;
    paidCount: number;
  }>;
}

export const feeEngineService = {
  async getSummary(schoolId: string, yearId: string, feeTypeId: string): Promise<FeeSummaryResponse> {
    const res = await apiClient.get(`/fees/${schoolId}/years/${yearId}/summary/${feeTypeId}`);
    return res.data;
  },

  async getStructure(schoolId: string, yearId: string, feeTypeId: string) {
    const res = await apiClient.get(`/fees/${schoolId}/years/${yearId}/structure/${feeTypeId}`);
    return res.data;
  },

  async updateStructure(
    schoolId: string,
    yearId: string,
    feeTypeId: string,
    data: Partial<FeeStructure>
  ) {
    const res = await apiClient.put(`/fees/${schoolId}/years/${yearId}/structure/${feeTypeId}`, data);
    return res.data;
  },

  async updateAssignment(
    schoolId: string,
    yearId: string,
    assignmentId: string,
    data: {
      baseAmount?: number;
      discountAmount?: number;
      discountReason?: string;
      status?: 'required' | 'not_required' | 'waived';
      notRequiredReason?: string;
    }
  ) {
    const res = await apiClient.put(
      `/fees/${schoolId}/years/${yearId}/assignments/${assignmentId}`,
      data
    );
    return res.data;
  },

  async upsertStudentFeeAssignment(
    schoolId: string,
    yearId: string,
    studentId: string,
    feeTypeId: string,
    data: {
      baseAmount?: number;
      discountAmount?: number;
      discountReason?: string;
      status?: 'required' | 'not_required' | 'waived';
      notRequiredReason?: string;
      actorRole?: string;
    }
  ) {
    const res = await apiClient.put(
      `/fees/${schoolId}/years/${yearId}/students/${studentId}/fee-types/${feeTypeId}/assignment`,
      data
    );
    return res.data;
  },

  async addPayment(
    schoolId: string,
    yearId: string,
    data: {
      studentId: string;
      feeTypeId: string;
      amount: number;
      paymentMode: string;
      transactionId?: string;
      remarks?: string;
      date?: string;
    }
  ) {
    const res = await apiClient.post(`/fees/${schoolId}/years/${yearId}/payments`, data);
    return res.data;
  },

  async updatePayment(
    schoolId: string,
    yearId: string,
    paymentId: string,
    data: Partial<FeePayment>
  ) {
    const res = await apiClient.put(`/fees/${schoolId}/years/${yearId}/payments/${paymentId}`, data);
    return res.data;
  },

  async deletePayment(schoolId: string, yearId: string, paymentId: string) {
    const res = await apiClient.delete(`/fees/${schoolId}/years/${yearId}/payments/${paymentId}`);
    return res.data;
  },

  async getDashboard(schoolId: string, yearId: string): Promise<FeeDashboardResponse> {
    const res = await apiClient.get(`/fees/${schoolId}/years/${yearId}/dashboard`);
    return res.data;
  },

  async exportReport(
    schoolId: string,
    yearId: string,
    filters: {
      feeTypeId?: string;
      classId?: string;
      paymentStatus?: string[];
      format?: 'xlsx' | 'csv';
    }
  ): Promise<Blob> {
    const res = await apiClient.post(`/fees/${schoolId}/years/${yearId}/reports/export`, filters, {
      responseType: 'blob',
    });
    return res.data;
  },
};
