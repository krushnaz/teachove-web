import { API_CONFIG } from '../config/api';
import { apiClient } from '../config/axios';

export interface Payment {
  installment: string;
  studentId: string;
  classId: string;
  paymentMode: string;
  paymentId: string;
  schoolId: string;
  transactionId: string;
  remarks: string;
  date: string;
  amount: number;
  feeType?: string; // e.g. "School Fee", "Admission Fee"
}

export interface AddPaymentRequest {
  installment: string;
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
  section: string; // Change from division to section to match backend
  division?: string; // Keep division as optional fallback
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
  async getSummaryBySchool(schoolId: string, yearId: string): Promise<StudentPaymentsSummaryResponse> {
    const endpoint = API_CONFIG.ENDPOINTS.STUDENT_PAYMENTS.SUMMARY_BY_SCHOOL
      .replace(':schoolId', schoolId)
      .replace(':yearId', yearId);
    const response = await apiClient.get(endpoint);
    return response.data as StudentPaymentsSummaryResponse;
  },

  async downloadClassPaymentReport(schoolId: string, yearId: string, classId: string): Promise<Blob> {
    const endpoint = API_CONFIG.ENDPOINTS.STUDENT_PAYMENTS.DOWNLOAD_CLASS_REPORT;
    const response = await apiClient.post(endpoint, {
      schoolId,
      yearId,
      classId
    }, {
      responseType: 'blob'
    });
    return response.data;
  },

  async downloadStudentPaymentReport(schoolId: string, yearId: string, studentId: string): Promise<Blob> {
    const endpoint = API_CONFIG.ENDPOINTS.STUDENT_PAYMENTS.DOWNLOAD_STUDENT_REPORT;
    const response = await apiClient.post(endpoint, {
      schoolId,
      yearId,
      studentId
    }, {
      responseType: 'blob'
    });
    return response.data;
  },

  async addPayment(yearId: string, paymentData: AddPaymentRequest): Promise<AddPaymentResponse> {
    const endpoint = API_CONFIG.ENDPOINTS.STUDENT_PAYMENTS.ADD_PAYMENT
      .replace(':schoolId', paymentData.schoolId)
      .replace(':yearId', yearId);
    const response = await apiClient.post(endpoint, paymentData);
    return response.data as AddPaymentResponse;
  },

  async getStudentPayments(schoolId: string, yearId: string, studentId: string): Promise<Payment[]> {
    const endpoint = API_CONFIG.ENDPOINTS.STUDENT_PAYMENTS.GET_STUDENT_PAYMENTS
      .replace(':schoolId', schoolId)
      .replace(':yearId', yearId)
      .replace(':studentId', studentId);
    const response = await apiClient.get(endpoint);
    return response.data.payments || [];
  },

  async deletePayments(schoolId: string, yearId: string, studentId: string, paymentIds: string[]): Promise<{ message: string; deletedIds: string[] }> {
    const endpoint = API_CONFIG.ENDPOINTS.STUDENT_PAYMENTS.DELETE_PAYMENTS
      .replace(':schoolId', schoolId)
      .replace(':yearId', yearId)
      .replace(':studentId', studentId);
    const response = await apiClient.delete(endpoint, { data: { paymentIds } });
    return response.data;
  },

  async updatePayment(schoolId: string, yearId: string, studentId: string, paymentId: string, paymentData: Omit<AddPaymentRequest, 'schoolId'>): Promise<{ message: string }> {
    const endpoint = API_CONFIG.ENDPOINTS.STUDENT_PAYMENTS.UPDATE_PAYMENT
      .replace(':schoolId', schoolId)
      .replace(':yearId', yearId)
      .replace(':studentId', studentId)
      .replace(':paymentId', paymentId);
    const response = await apiClient.put(endpoint, { ...paymentData, schoolId });
    return response.data;
  },

  async getAllStudentFees(schoolId: string, yearId: string, studentId: string): Promise<Payment[]> {
    try {
      // 1. School Fees
      const schoolFeesResponse = await apiClient.get(
        API_CONFIG.ENDPOINTS.STUDENT_PAYMENTS.GET_STUDENT_PAYMENTS
          .replace(':schoolId', schoolId)
          .replace(':yearId', yearId)
          .replace(':studentId', studentId)
      ).catch(() => ({ data: { payments: [] } }));
      
      const schoolFees = (schoolFeesResponse.data.payments || []).map((p: any) => ({
        ...p,
        amount: Number(p.amount) || 0,
        feeType: 'School Fee'
      }));

      // 2. Admission Fees
      const admissionResponse = await apiClient.get(
        API_CONFIG.ENDPOINTS.MISC_FEES.ADMISSION
          .replace(':schoolId', schoolId)
          .replace(':studentId', studentId)
      ).catch(() => ({ data: { admissionFees: [] } }));
      
      const admissionFees = (admissionResponse.data.admissionFees || []).map((p: any) => ({
        paymentId: p.admissionFormFeeId,
        amount: Number(p.formFeeAmount) || 0,
        paymentMode: p.paymentMode,
        transactionId: p.transactionId,
        remarks: p.remarks,
        date: p.createdAt,
        feeType: 'Admission Fee'
      }));

      // 3. Uniform Fees
      const uniformResponse = await apiClient.get(API_CONFIG.ENDPOINTS.MISC_FEES.UNIFORM, {
        params: { schoolId, studentId }
      }).catch(() => ({ data: { data: [] } }));
      
      const uniformFees = (uniformResponse.data.data || []).map((p: any) => ({
        paymentId: p.uniformFeeId,
        amount: Number(p.amount) || 0,
        paymentMode: p.paymentMode,
        transactionId: p.transactionId,
        remarks: p.remarks,
        date: p.createdAt,
        feeType: 'Uniform Fee'
      }));

      // 4. Bag Fees
      const bagResponse = await apiClient.get(API_CONFIG.ENDPOINTS.MISC_FEES.BAG, {
        params: { schoolId, studentId }
      }).catch(() => ({ data: { data: [] } }));
      
      const bagFees = (bagResponse.data.data || []).map((p: any) => ({
        paymentId: p.bagFeeId,
        amount: Number(p.bagAmount) || 0,
        paymentMode: p.paymentMode,
        transactionId: p.transactionId,
        remarks: p.remarks,
        date: p.createdAt,
        feeType: 'Bag Fee'
      }));

      // 5. Book Fees (get all for school, then filter)
      const bookResponse = await apiClient.get(
        API_CONFIG.ENDPOINTS.MISC_FEES.BOOK.replace(':schoolId', schoolId)
      ).catch(() => ({ data: { students: [] } }));
      
      const studentBookData = (bookResponse.data.students || []).find((s: any) => s.studentId === studentId);
      const rawBookFees = studentBookData ? studentBookData.transactions || [] : [];
      const bookFees = rawBookFees.map((p: any) => ({
        paymentId: p.feeId,
        amount: Number(p.bookSetAmount) || 0,
        paymentMode: p.paymentMode,
        transactionId: p.transactionId,
        remarks: p.remark,
        date: p.createdAt,
        feeType: 'Book Fee'
      }));

      // Combine and sort by date descending
      const allFees = [...schoolFees, ...admissionFees, ...uniformFees, ...bagFees, ...bookFees];
      return allFees.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error('Error fetching all fees:', e);
      return [];
    }
  },

  async getMiscFeeSummary(schoolId: string, feeType: 'Admission' | 'Uniform' | 'Bag' | 'Book') {
    // 1. Fetch all students
    const studentsRes = await apiClient.get(API_CONFIG.ENDPOINTS.STUDENTS.BY_SCHOOL.replace(':schoolId', schoolId));
    let students = studentsRes.data?.data || studentsRes.data || [];
    if (!Array.isArray(students)) students = [];

    let totalCollected = 0;
    
    // 2. Fetch all specific fees for school
    let feesMap: Record<string, any[]> = {};

    if (feeType === 'Admission') {
      const summaryRes = await apiClient.get(API_CONFIG.ENDPOINTS.MISC_FEES.ADMISSION.replace(':schoolId', schoolId).replace('/:studentId', '/summary'));
      return summaryRes.data; // Already correctly formatted by backend!
    } else if (feeType === 'Book') {
      const summaryRes = await apiClient.get(API_CONFIG.ENDPOINTS.MISC_FEES.BOOK.replace(':schoolId', schoolId));
      let mappedStudents = summaryRes.data?.students || [];
      totalCollected = mappedStudents.reduce((acc: number, s: any) => acc + (s.totalPaid || 0), 0);
      return { totalCollected, students: mappedStudents };
    } else if (feeType === 'Uniform') {
      const req = await apiClient.get(API_CONFIG.ENDPOINTS.MISC_FEES.UNIFORM, { params: { schoolId } });
      const records = req.data?.data || [];
      records.forEach((r: any) => {
        if (!feesMap[r.studentId]) feesMap[r.studentId] = [];
        feesMap[r.studentId].push(r);
      });
    } else if (feeType === 'Bag') {
      const req = await apiClient.get(API_CONFIG.ENDPOINTS.MISC_FEES.BAG, { params: { schoolId } });
      const records = req.data?.data || [];
      records.forEach((r: any) => {
        if (!feesMap[r.studentId]) feesMap[r.studentId] = [];
        feesMap[r.studentId].push(r);
      });
    }

    // Combine students and fees Map for Uniform and Bag
    if (feeType === 'Uniform' || feeType === 'Bag') {
      const finalStudents = students.map((s: any) => {
        const studentFees = feesMap[s.studentId] || [];
        const totalPaid = studentFees.reduce((acc: number, f: any) => acc + (feeType === 'Uniform' ? (f.amount || 0) : (f.bagAmount || 0)), 0);
        totalCollected += totalPaid;
        return {
          studentId: s.studentId,
          studentName: s.name,
          rollNo: s.rollNo,
          classId: s.classId,
          className: s.className || '-',
          section: s.section || '-',
          totalPaid,
          transactions: studentFees
        };
      });
      return { totalCollected, students: finalStudents };
    }
  },

  async addMiscFee(feeType: 'Admission' | 'Uniform' | 'Bag' | 'Book', data: any) {
    if (feeType === 'Admission') {
      return await apiClient.post(API_CONFIG.ENDPOINTS.MISC_FEES.ADMISSION.replace(':schoolId', data.schoolId).replace('/:studentId', ''), data);
    } else if (feeType === 'Book') {
      return await apiClient.post('/book-fees/add', data);
    } else if (feeType === 'Uniform') {
      return await apiClient.post('/student-uniform-fees/add', data);
    } else if (feeType === 'Bag') {
      return await apiClient.post('/student-bag-fees/add', data);
    }
  },

  async updateMiscFee(feeType: 'Admission' | 'Uniform' | 'Bag' | 'Book', feeId: string, data: any) {
    if (feeType === 'Admission') {
      return await apiClient.put(`/student-admissions/${data.schoolId}/${data.studentId}/${feeId}`, data);
    } else if (feeType === 'Book') {
      return await apiClient.put(`/book-fees/update/${feeId}`, data);
    } else if (feeType === 'Uniform') {
      return await apiClient.put(`/student-uniform-fees/edit/${feeId}`, data);
    } else if (feeType === 'Bag') {
      return await apiClient.put(`/student-bag-fees/edit/${feeId}`, data);
    }
  },

  async deleteMiscFee(feeType: 'Admission' | 'Uniform' | 'Bag' | 'Book', feeId: string, schoolId: string, studentId: string) {
    if (feeType === 'Admission') {
      return await apiClient.delete(`/student-admissions/${schoolId}/${studentId}`, { data: { admissionFormFeeIds: [feeId] } });
    } else if (feeType === 'Book') {
      return await apiClient.delete(`/book-fees/delete/${feeId}?schoolId=${schoolId}`);
    } else if (feeType === 'Uniform') {
      return await apiClient.delete(`/student-uniform-fees/delete/${feeId}?schoolId=${schoolId}`);
    } else if (feeType === 'Bag') {
      return await apiClient.delete(`/student-bag-fees/delete/${feeId}?schoolId=${schoolId}`);
    }
  }
}; 