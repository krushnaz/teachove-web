import { feeEngineService, FeeStudentSummary } from './feeEngineService';
import { feeTypeService, FeeType, getLegacyMiscTabName } from './feeTypeService';
import { studentFeesService, StudentSummaryRow } from './studentFeesService';
import { apiClient } from '../config/axios';

export interface StudentFeeBreakdown {
  feeTypeId: string;
  feeTypeName: string;
  category: string;
  legacyTabName?: string | null;
  due: number;
  paid: number;
  balance: number;
  paymentStatus: string;
  assignmentId?: string;
  baseAmount?: number;
  discountAmount?: number;
  discountReason?: string;
  assignmentStatus?: 'required' | 'not_required' | 'waived';
  notRequiredReason?: string;
  payments?: unknown[];
  transactions?: unknown[];
}

export interface UnifiedStudent {
  studentId: string;
  studentName: string;
  rollNo: string;
  classId: string;
  className: string;
  section: string;
  totalDue: number;
  totalPaid: number;
  totalBalance: number;
  totalDiscount?: number;
  grossDue?: number;
  overallStatus: 'paid' | 'partial' | 'unpaid';
  fees: StudentFeeBreakdown[];
}

export interface UnifiedFeesData {
  feeTypes: FeeType[];
  students: UnifiedStudent[];
  totals: { totalDue: number; totalPaid: number; totalBalance: number };
}

function overallStatus(due: number, paid: number): UnifiedStudent['overallStatus'] {
  if (due <= 0 && paid > 0) return 'paid';
  if (paid <= 0) return 'unpaid';
  if (paid >= due) return 'paid';
  return 'partial';
}

function upsertStudent(
  map: Map<string, UnifiedStudent>,
  base: {
    studentId: string;
    studentName?: string;
    rollNo?: string;
    classId?: string;
    className?: string;
    section?: string;
  }
): UnifiedStudent {
  const existing = map.get(base.studentId);
  if (existing) {
    if (base.studentName) existing.studentName = base.studentName;
    if (base.rollNo) existing.rollNo = base.rollNo;
    if (base.classId) existing.classId = base.classId;
    if (base.className) existing.className = base.className;
    if (base.section) existing.section = base.section;
    return existing;
  }
  const row: UnifiedStudent = {
    studentId: base.studentId,
    studentName: base.studentName || 'Unknown',
    rollNo: base.rollNo || '',
    classId: base.classId || '',
    className: base.className || '-',
    section: base.section || '',
    totalDue: 0,
    totalPaid: 0,
    totalBalance: 0,
    overallStatus: 'unpaid',
    fees: [],
  };
  map.set(base.studentId, row);
  return row;
}

function addBreakdown(map: Map<string, UnifiedStudent>, breakdown: StudentFeeBreakdown, studentBase: Parameters<typeof upsertStudent>[1]) {
  const row = upsertStudent(map, studentBase);
  const idx = row.fees.findIndex((f) => f.feeTypeId === breakdown.feeTypeId);
  if (idx >= 0) row.fees[idx] = breakdown;
  else row.fees.push(breakdown);
}

function recalcTotals(map: Map<string, UnifiedStudent>) {
  map.forEach((row) => {
    row.totalDue = row.fees.reduce((s, f) => s + f.due, 0);
    row.totalPaid = row.fees.reduce((s, f) => s + f.paid, 0);
    row.totalBalance = row.fees.reduce((s, f) => s + f.balance, 0);
    row.overallStatus = overallStatus(row.totalDue, row.totalPaid);
  });
}

export async function loadStudentFeesList(
  schoolId: string,
  yearId: string,
  opts?: {
    page?: number;
    limit?: number;
    search?: string;
    classId?: string;
    status?: string;
  }
): Promise<{
  feeTypes: FeeType[];
  students: UnifiedStudent[];
  totals: { totalDue: number; totalPaid: number; totalBalance: number };
  pagination: { page: number; limit: number; total: number; totalPages: number; hasMore: boolean };
}> {
  const feeTypes = await feeTypeService.getSchoolFeeTypes(schoolId);
  const schoolType = feeTypes.find((ft) => ft.category === 'school_fee');
  const schoolFeeTypeId = schoolType?.feeTypeId || schoolType?.id || 'school_fee';

  const summary = await studentFeesService.getSummaryBySchool(schoolId, {
    yearId,
    lite: true,
    page: opts?.page ?? 1,
    limit: opts?.limit ?? 30,
    search: opts?.search,
    classId: opts?.classId,
    status: opts?.status,
  });

  const students: UnifiedStudent[] = (summary.students || []).map((s) => {
    const due = s.totalFees || 0;
    const paid = s.paidAmount || 0;
    const balance = Math.max(0, due - paid);
    return {
      studentId: s.studentId,
      studentName: s.studentName,
      rollNo: s.rollNo,
      classId: s.classId,
      className: s.className,
      section: s.section || s.division || '',
      totalDue: due,
      totalPaid: paid,
      totalBalance: balance,
      overallStatus: overallStatus(due, paid),
      fees: [
        {
          feeTypeId: schoolFeeTypeId,
          feeTypeName: schoolType?.name || 'School Fee',
          category: 'school_fee',
          due,
          paid,
          balance,
          paymentStatus: paid <= 0 ? 'not_paid' : paid >= due ? 'paid' : 'partial',
          payments: [],
        },
      ],
    };
  });

  const pagination = summary.pagination ?? {
    page: 1,
    limit: students.length,
    total: students.length,
    totalPages: 1,
    hasMore: false,
  };

  return {
    feeTypes,
    students,
    totals: {
      totalDue: summary.totalFees ?? 0,
      totalPaid: summary.totalPaid ?? 0,
      totalBalance: summary.remainingAmount ?? 0,
    },
    pagination,
  };
}

export async function loadUnifiedFees(schoolId: string, yearId: string): Promise<UnifiedFeesData> {
  const page = await loadStudentFeesList(schoolId, yearId, { page: 1, limit: 100 });
  return {
    feeTypes: page.feeTypes,
    students: page.students,
    totals: page.totals,
  };
}

function mapStudentFeesResponse(data: Record<string, unknown>): UnifiedStudent {
  const feesRaw = (data.fees as unknown[]) || [];
  const fees: StudentFeeBreakdown[] = feesRaw.map((item) => {
    const f = item as Record<string, unknown>;
    return {
      feeTypeId: String(f.feeTypeId || ''),
      feeTypeName: String(f.feeTypeName || 'Fee'),
      category: String(f.category || 'custom'),
      legacyTabName: f.legacyTabName as string | null | undefined,
      due: Number(f.due) || 0,
      paid: Number(f.paid) || 0,
      balance: Number(f.balance) || 0,
      paymentStatus: String(f.paymentStatus || 'not_paid'),
      assignmentId: f.assignmentId as string | undefined,
      baseAmount: f.baseAmount != null ? Number(f.baseAmount) : undefined,
      discountAmount: f.discountAmount != null ? Number(f.discountAmount) : undefined,
      discountReason: f.discountReason as string | undefined,
      assignmentStatus: f.assignmentStatus as StudentFeeBreakdown['assignmentStatus'],
      notRequiredReason: f.notRequiredReason as string | undefined,
      payments: (f.payments as unknown[]) || [],
    };
  });

  const totalDue = Number(data.totalDue) || 0;
  const totalPaid = Number(data.totalPaid) || 0;
  const totalBalance = Number(data.totalBalance) || 0;
  const totalDiscount = Number(data.totalDiscount) || 0;
  const grossDue = Number(data.grossDue) || totalDue + totalDiscount;

  return {
    studentId: String(data.studentId || ''),
    studentName: String(data.studentName || 'Unknown'),
    rollNo: String(data.rollNo || ''),
    classId: String(data.classId || ''),
    className: String(data.className || '-'),
    section: String(data.section || ''),
    totalDue,
    totalPaid,
    totalBalance,
    totalDiscount,
    grossDue,
    overallStatus: overallStatus(totalDue, totalPaid),
    fees,
  };
}

/** Full fee breakdown for one student (assignments, discounts, all fee types). */
export async function loadStudentFees(
  schoolId: string,
  yearId: string,
  studentId: string
): Promise<UnifiedStudent> {
  const res = await apiClient.get(`/fees/${schoolId}/years/${yearId}/students/${studentId}/fees`);
  return mapStudentFeesResponse(res.data as Record<string, unknown>);
}
