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

export interface AddPaymentRequest {
  schoolId: string;
  studentId: string;
  classId: string;
  amount: number;
  paymentMode: string;
  transactionId: string;
  remarks: string;
  date: string;
}

export interface AddPaymentResponse {
  message: string;
  payment: Payment;
}

export interface StudentSummaryRow {
  studentId: string;
  studentName: string;
  rollNo: string;
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
  },

  async downloadStudentPaymentReport(schoolId: string, studentId: string): Promise<Blob> {
    const endpoint = API_CONFIG.ENDPOINTS.STUDENT_PAYMENTS.DOWNLOAD_STUDENT_REPORT;
    const response = await apiClient.post(endpoint, {
      schoolId,
      studentId
    }, {
      responseType: 'blob'
    });
    return response.data;
  },

  async addPayment(paymentData: AddPaymentRequest): Promise<AddPaymentResponse> {
    const endpoint = API_CONFIG.ENDPOINTS.STUDENT_PAYMENTS.ADD_PAYMENT.replace(':schoolId', paymentData.schoolId);
    const response = await apiClient.post(endpoint, paymentData);
    return response.data as AddPaymentResponse;
  },

  async getStudentPayments(schoolId: string, studentId: string, classId: string): Promise<Payment[]> {
    const endpoint = API_CONFIG.ENDPOINTS.STUDENT_PAYMENTS.GET_STUDENT_PAYMENTS
      .replace(':schoolId', schoolId)
      .replace(':studentId', studentId)
      .replace(':classId', classId);
    const response = await apiClient.get(endpoint);
    return response.data.payments || [];
  },

  async deletePayments(schoolId: string, paymentIds: string[]): Promise<{ message: string; deletedIds: string[] }> {
    const endpoint = API_CONFIG.ENDPOINTS.STUDENT_PAYMENTS.DELETE_PAYMENTS.replace(':schoolId', schoolId);
    const response = await apiClient.delete(endpoint, { data: { paymentIds } });
    return response.data;
  },

  async updatePayment(schoolId: string, paymentId: string, paymentData: Omit<AddPaymentRequest, 'schoolId'>): Promise<{ message: string }> {
    const endpoint = API_CONFIG.ENDPOINTS.STUDENT_PAYMENTS.UPDATE_PAYMENT
      .replace(':schoolId', schoolId)
      .replace(':paymentId', paymentId);
    const response = await apiClient.put(endpoint, { ...paymentData, schoolId });
    return response.data;
  }
}; 