import { API_CONFIG } from '../config/api';
import { apiClient } from '../config/axios';

export interface Payment {
  studentId: string;
  classId: string;
  paymentMode: string;
  paymentId: string;
  schoolId: string;
  transactionId: string;
  remarks: string;
  date: string;
  amount: number;
}

export interface StudentSummaryRow {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  division: string;
  totalFees: number;
  paidAmount: number;
  remainingAmount: number;
  payments: Payment[];
}

export interface StudentPaymentsSummaryResponse {
  schoolId: string;
  totalFees: number;
  totalPaid: number;
  remainingAmount: number;
  students: StudentSummaryRow[];
}

export const studentFeesService = {
  async getSummaryBySchool(schoolId: string): Promise<StudentPaymentsSummaryResponse> {
    const endpoint = API_CONFIG.ENDPOINTS.STUDENT_PAYMENTS.SUMMARY_BY_SCHOOL.replace(':schoolId', schoolId);
    const response = await apiClient.get(endpoint);
    return response.data as StudentPaymentsSummaryResponse;
  },

  async downloadClassPaymentReport(schoolId: string, classId: string): Promise<Blob> {
    const endpoint = API_CONFIG.ENDPOINTS.STUDENT_PAYMENTS.DOWNLOAD_CLASS_REPORT;
    const response = await apiClient.post(endpoint, {
      schoolId,
      classId
    }, {
      responseType: 'blob'
    });
    return response.data;
  }
}; 