import React, { useEffect, useMemo, useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAuth } from '../../contexts/AuthContext';
import { classroomService, Classroom } from '../../services/classroomService';
import { studentFeesService, StudentSummaryRow, Payment } from '../../services/studentFeesService';

interface StudentFeeRow {
  studentId: string;
  studentName: string;
  className: string;
  division: string;
  rollNo: string;
  status: 'paid' | 'unpaid' | 'partially paid';
  totalFees: number;
  paidFees: number;
}

const StudentFees: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  const [rows, setRows] = useState<StudentFeeRow[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'partially paid'>('all');
  const [classFilter, setClassFilter] = useState('');

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportClassId, setReportClassId] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // New UI states for actions
  const [actionMenuRowId, setActionMenuRowId] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<StudentFeeRow | null>(null);
  const [isPaymentSidebarOpen, setIsPaymentSidebarOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'add' | 'edit'>('add');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    installment: '',
    amount: 0,
    paymentMode: 'Cash',
    transactionId: '',
    remark: ''
  });

  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [studentPayments, setStudentPayments] = useState<Payment[]>([]);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [isDeletingPayments, setIsDeletingPayments] = useState(false);
  const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState<Payment | null>(null);

  // Get schoolId from authenticated user
  const schoolId = user?.schoolId;

  useEffect(() => {
    if (!schoolId) return;
    
    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const [classes, summary] = await Promise.all([
          classroomService.getClassesBySchoolId(schoolId),
          studentFeesService.getSummaryBySchool(schoolId)
        ]);
        setClassrooms(classes);
        // Cards
        const cardTotals = {
          totalFees: summary.totalFees || 0,
          totalPaid: summary.totalPaid || 0,
          remaining: summary.remainingAmount || 0
        };
        // Convert students to table rows
        const mapped: StudentFeeRow[] = (summary.students || []).map((s: StudentSummaryRow) => {
          const status: StudentFeeRow['status'] = s.paidAmount <= 0
            ? 'unpaid'
            : (s.paidAmount >= s.totalFees ? 'paid' : 'partially paid');
          return {
            studentId: s.studentId,
            studentName: s.studentName || 'Unknown',
            className: s.className || 'Unknown',
            division: s.division || '',
            rollNo: s.rollNo || '-',
            status,
            totalFees: s.totalFees || 0,
            paidFees: s.paidAmount || 0
          };
        });
        setRows(mapped);
        // Update cards using state setters below
        setTotals({ total: cardTotals.totalFees, received: cardTotals.totalPaid, remaining: cardTotals.remaining });
      } catch (err: any) {
        setLoadError('Failed to load student fees. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [schoolId]);

  const [totals, setTotals] = useState({ total: 0, received: 0, remaining: 0 });

  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      const matchesQuery = `${r.studentName} ${r.className} ${r.rollNo}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' ? true : r.status === statusFilter;
      const matchesClass = classFilter ? r.className === classFilter : true;
      return matchesQuery && matchesStatus && matchesClass;
    });
  }, [rows, query, statusFilter, classFilter]);

  const totalFees = totals.total;
  const receivedFees = totals.received;
  const remainingFees = totals.remaining;

  const Card = ({ label, value, color }: { label: string; value: number; color: 'primary' | 'green' | 'amber' }) => (
    <div className={`p-6 rounded-xl border shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
          <p className={`mt-1 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹ {value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-lg ${
          color === 'primary' ? (isDarkMode ? 'bg-primary-900 text-primary-300' : 'bg-primary-50 text-primary-600') :
          color === 'green' ? (isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-50 text-green-600') :
          (isDarkMode ? 'bg-amber-900 text-amber-300' : 'bg-amber-50 text-amber-600')
        }`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
          </svg>
        </div>
      </div>
    </div>
  );

  const ShimmerCard = () => (
    <div className={`p-6 rounded-xl border shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className="w-32 h-4 bg-gray-300 rounded animate-pulse"></div>
        <div className="w-10 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
      </div>
      <div className="mt-3 w-40 h-6 bg-gray-300 rounded animate-pulse"></div>
    </div>
  );

  const paymentModes = ['Cash', 'UPI', 'Card', 'Net Banking', 'Cheque'];

  const openAddPayment = (row: StudentFeeRow) => {
    setSelectedRow(row);
    setPaymentMode('add');
    setPaymentForm({ installment: '', amount: 0, paymentMode: 'Cash', transactionId: '', remark: '' });
    setIsPaymentSidebarOpen(true);
  };

  const openEditPayment = async (row: StudentFeeRow) => {
    if (!schoolId) return;
    
    setSelectedRow(row);
    setPaymentMode('edit');
    setSelectedPaymentForEdit(null);
    setPaymentForm({ installment: '', amount: 0, paymentMode: 'Cash', transactionId: '', remark: '' });
    setIsPaymentSidebarOpen(true);
    
    try {
      setIsLoadingPayments(true);
      // Find the class ID for the student
      const studentClass = classrooms.find(c => c.className === row.className && c.division === row.division);
      if (studentClass) {
        const payments = await studentFeesService.getStudentPayments(schoolId, row.studentId, studentClass.classId);
        setStudentPayments(payments);
      }
    } catch (error) {
      console.error('Error fetching student payments:', error);
      // Show error toast
      const errorToast = document.createElement('div');
      errorToast.className = `${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg border`;
      errorToast.textContent = 'Failed to load payment details. Please try again.';
      document.body.appendChild(errorToast);
      setTimeout(() => errorToast.remove(), 3000);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const openDeleteDialog = async (row: StudentFeeRow) => {
    if (!schoolId) return;
    
    setSelectedRow(row);
    setIsDeleteDialogOpen(true);
    setSelectedPaymentIds([]);
    
    try {
      setIsLoadingPayments(true);
      // Find the class ID for the student
      const studentClass = classrooms.find(c => c.className === row.className && c.division === row.division);
      if (studentClass) {
        const payments = await studentFeesService.getStudentPayments(schoolId, row.studentId, studentClass.classId);
        setStudentPayments(payments);
      }
    } catch (error) {
      console.error('Error fetching student payments:', error);
      // Show error toast
      const errorToast = document.createElement('div');
      errorToast.className = `${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
      errorToast.textContent = 'Failed to load payment details. Please try again.';
      document.body.appendChild(errorToast);
      setTimeout(() => errorToast.remove(), 3000);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const openViewDialog = async (row: StudentFeeRow) => {
    if (!schoolId) return;
    
    setSelectedRow(row);
    setIsViewDialogOpen(true);
    
    try {
      setIsLoadingPayments(true);
      // Find the class ID for the student
      const studentClass = classrooms.find(c => c.className === row.className && c.division === row.division);
      if (studentClass) {
        const payments = await studentFeesService.getStudentPayments(schoolId, row.studentId, studentClass.classId);
        setStudentPayments(payments);
      }
    } catch (error) {
      console.error('Error fetching student payments:', error);
      // Show error toast
      const errorToast = document.createElement('div');
      errorToast.className = `${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg border`;
      errorToast.textContent = 'Failed to load payment details. Please try again.';
      document.body.appendChild(errorToast);
      setTimeout(() => errorToast.remove(), 3000);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const handleSavePayment = async () => {
    if (!selectedRow || !schoolId) return;
    
    try {
      if (paymentMode === 'add') {
        // Get the class ID for the selected student
        const studentClass = classrooms.find(c => c.className === selectedRow.className && c.division === selectedRow.division);
        if (!studentClass) {
          throw new Error('Class not found for student');
        }

        // Prepare payment data
        const paymentData = {
          schoolId,
          studentId: selectedRow.studentId,
          classId: studentClass.classId,
          amount: paymentForm.amount,
          paymentMode: paymentForm.paymentMode,
          transactionId: paymentForm.transactionId,
          remarks: paymentForm.remark,
          date: new Date().toISOString()
        };

        // Call API to add payment
        const response = await studentFeesService.addPayment(paymentData);
        
        // Update local state to reflect the new payment
        const updated = rows.map(r => r.studentId === selectedRow.studentId ? { ...r, paidFees: r.paidFees + paymentForm.amount } : r);
        setRows(updated);
        
        // Update totals
        setTotals(prev => ({
          ...prev,
          received: prev.received + paymentForm.amount,
          remaining: prev.remaining - paymentForm.amount
        }));

        // Show success toast
        const successToast = document.createElement('div');
        successToast.className = `${isDarkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-50 text-green-700 border-green-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
        successToast.textContent = 'Payment added successfully';
        document.body.appendChild(successToast);
        setTimeout(() => successToast.remove(), 3000);

        // Close sidebar
        setIsPaymentSidebarOpen(false);
      } else {
        // For edit mode, update the selected payment
        if (!selectedPaymentForEdit) {
          throw new Error('No payment selected for editing');
        }

        // Get the class ID for the selected student
        const studentClass = classrooms.find(c => c.className === selectedRow.className && c.division === selectedRow.division);
        if (!studentClass) {
          throw new Error('Class not found for student');
        }

        // Prepare payment data for update
        const paymentData = {
          studentId: selectedRow.studentId,
          classId: studentClass.classId,
          amount: paymentForm.amount,
          paymentMode: paymentForm.paymentMode,
          transactionId: paymentForm.transactionId,
          remarks: paymentForm.remark,
          date: selectedPaymentForEdit.date
        };

        // Call API to update payment
        const response = await studentFeesService.updatePayment(schoolId, selectedPaymentForEdit.paymentId, paymentData);
        
        // Update local state to reflect the changes
        const amountDifference = paymentForm.amount - selectedPaymentForEdit.amount;
        const updated = rows.map(r => r.studentId === selectedRow.studentId ? { ...r, paidFees: r.paidFees + amountDifference } : r);
        setRows(updated);
        
        // Update totals
        setTotals(prev => ({
          ...prev,
          received: prev.received + amountDifference,
          remaining: prev.remaining - amountDifference
        }));

        // Show success toast
        const successToast = document.createElement('div');
        successToast.className = `${isDarkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-50 text-green-700 border-green-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg border`;
        successToast.textContent = 'Payment updated successfully';
        document.body.appendChild(successToast);
        setTimeout(() => successToast.remove(), 3000);

        // Close sidebar
        setIsPaymentSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      
      // Show error toast
      const errorToast = document.createElement('div');
      errorToast.className = `${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg border`;
      errorToast.textContent = error instanceof Error ? error.message : 'Failed to add payment. Please try again.';
      document.body.appendChild(errorToast);
      setTimeout(() => errorToast.remove(), 3000);
    }
  };

  const handleDeletePayment = async () => {
    if (!schoolId || selectedPaymentIds.length === 0) return;
    
    try {
      setIsDeletingPayments(true);
      
      // Call API to delete payments
      const response = await studentFeesService.deletePayments(schoolId, selectedPaymentIds);
      
      // Update local state to reflect the deleted payments
      const totalDeletedAmount = studentPayments
        .filter(p => selectedPaymentIds.includes(p.paymentId))
        .reduce((sum, p) => sum + p.amount, 0);
      
      if (selectedRow) {
        const updated = rows.map(r => r.studentId === selectedRow.studentId ? { ...r, paidFees: r.paidFees - totalDeletedAmount } : r);
        setRows(updated);
        
        // Update totals
        setTotals(prev => ({
          ...prev,
          received: prev.received - totalDeletedAmount,
          remaining: prev.remaining + totalDeletedAmount
        }));
      }
      
      // Show success toast
      const successToast = document.createElement('div');
      successToast.className = `${isDarkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-50 text-green-700 border-green-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg border`;
      successToast.textContent = response.message;
      document.body.appendChild(successToast);
      setTimeout(() => successToast.remove(), 3000);
      
      // Close dialog and reset state
      setIsDeleteDialogOpen(false);
      setSelectedPaymentIds([]);
      setStudentPayments([]);
      
    } catch (error) {
      console.error('Error deleting payments:', error);
      
      // Show error toast
      const errorToast = document.createElement('div');
      errorToast.className = `${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg border`;
      errorToast.textContent = 'Failed to delete payments. Please try again.';
      document.body.appendChild(errorToast);
      setTimeout(() => errorToast.remove(), 3000);
    } finally {
      setIsDeletingPayments(false);
    }
  };

  const handleSelectPayment = (paymentId: string, checked: boolean) => {
    if (checked) {
      setSelectedPaymentIds(prev => [...prev, paymentId]);
    } else {
      setSelectedPaymentIds(prev => prev.filter(id => id !== paymentId));
    }
  };

  const handleSelectAllPayments = (checked: boolean) => {
    if (checked) {
      setSelectedPaymentIds(studentPayments.map(p => p.paymentId));
    } else {
      setSelectedPaymentIds([]);
    }
  };

  const handleSelectPaymentForEdit = (payment: Payment) => {
    setSelectedPaymentForEdit(payment);
    setPaymentForm({
      installment: '',
      amount: payment.amount,
      paymentMode: payment.paymentMode,
      transactionId: payment.transactionId,
      remark: payment.remarks
    });
  };

  if (!schoolId) {
    return (
      <div className="text-center py-12">
        <div className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>Loading user information...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loadError && (
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-red-900/30 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <div className="flex items-center justify-between">
            <span>{loadError}</span>
            <button
              onClick={() => {
                if (!schoolId) return;
                setLoadError(null);
                // re-run effect by calling loader inline
                (async () => {
                  try {
                    setIsLoading(true);
                    const [classes, summary] = await Promise.all([
                      classroomService.getClassesBySchoolId(schoolId),
                      studentFeesService.getSummaryBySchool(schoolId)
                    ]);
                    setClassrooms(classes);
                    const mapped: StudentFeeRow[] = (summary.students || []).map((s: StudentSummaryRow) => {
                      const status: StudentFeeRow['status'] = s.paidAmount <= 0
                        ? 'unpaid'
                        : (s.paidAmount >= s.totalFees ? 'paid' : 'partially paid');
                      return {
                        studentId: s.studentId,
                        studentName: s.studentName || 'Unknown',
                        className: s.className || 'Unknown',
                        division: s.division || '',
                        rollNo: s.rollNo || '-',
                        status,
                        totalFees: s.totalFees || 0,
                        paidFees: s.paidAmount || 0
                      };
                    });
                    setRows(mapped);
                    setTotals({ total: summary.totalFees || 0, received: summary.totalPaid || 0, remaining: summary.remainingAmount || 0 });
                  } catch (e) {
                    setLoadError('Failed to load student fees. Please try again.');
                  } finally {
                    setIsLoading(false);
                  }
                })();
              }}
              className={`${isDarkMode ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-primary-500 hover:bg-primary-600 text-white'} px-3 py-1 rounded-lg`}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Student Fees</h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Manage student fee records</p>
        </div>
        <button
          onClick={() => setIsReportOpen(true)}
          className={`${isDarkMode ? 'bg-primary-600 hover:bg-primary-700' : 'bg-primary-500 hover:bg-primary-600'} text-white px-4 py-2 rounded-lg`}
        >
          Reports
        </button>
        {/* Toast */}
        {isDownloading && (
          <div className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            Preparing report...
          </div>
        )}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <Card label="Total Fees" value={totalFees} color="primary" />
          <Card label="Received Fees" value={receivedFees} color="green" />
          <Card label="Remaining Fees" value={remainingFees} color="amber" />
        </div>
      )}

      {/* Filters */}
      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, class, roll no..."
            className={`flex-1 px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="all" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>All Status</option>
            <option value="paid" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Paid</option>
            <option value="unpaid" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Unpaid</option>
            <option value="partially paid" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Partially Paid</option>
          </select>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>All Classes</option>
            {classrooms.map(c => (
              <option key={c.classId} value={c.className} className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>{c.className} {c.division}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`overflow-x-auto`}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Class • Div</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total Fees</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Remaining</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className={isDarkMode ? 'bg-gray-800 divide-y divide-gray-700 text-gray-200' : 'bg-white divide-y divide-gray-200 text-gray-800'}>
              {isLoading ? (
                [...Array(6)].map((_, idx) => (
                  <tr key={idx}>
                    {Array.from({ length: 8 }).map((__, i) => (
                      <td key={i} className="px-6 py-4">
                        <div className="h-4 bg-gray-300 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm" colSpan={8}>
                    {isDarkMode ? 'No records found' : 'No records found'}
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => {
                  const remaining = r.totalFees - r.paidFees;
                  const isMenuOpen = actionMenuRowId === r.studentId;
                  return (
                    <tr key={r.studentId}>
                      <td className="px-6 py-4 whitespace-nowrap">{r.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{r.className} • {r.division}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{r.rollNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          r.status === 'paid' ? (isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700') :
                          r.status === 'unpaid' ? (isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700') :
                          (isDarkMode ? 'bg-amber-900 text-amber-300' : 'bg-amber-100 text-amber-700')
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">₹ {r.totalFees.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">₹ {r.paidFees.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">₹ {remaining.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right relative">
                        <button
                          onClick={(e) => {
                            if (isMenuOpen) {
                              setActionMenuRowId(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setMenuPosition({
                                top: window.scrollY + rect.bottom + 8,
                                right: window.innerWidth - rect.right
                              });
                              setActionMenuRowId(r.studentId);
                            }
                          }}
                          className={`p-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6h.01M12 12h.01M12 18h.01" />
                          </svg>
                        </button>
                        {isMenuOpen && (
                          <div className={`fixed w-48 rounded-lg shadow-lg z-50 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} style={{
                            top: `${menuPosition.top}px`,
                            right: `${menuPosition.right}px`
                          }}>
                            <div className="flex flex-col">
                              <button onClick={() => { setActionMenuRowId(null); openAddPayment(r); }} className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-800'}`}>Add Payment</button>
                              <button onClick={() => { setActionMenuRowId(null); openEditPayment(r); }} className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-800'}`}>Edit Payment</button>
                              <button onClick={() => { setActionMenuRowId(null); openDeleteDialog(r); }} className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-800'}`}>Delete Payment</button>
                              <button onClick={() => { setActionMenuRowId(null); openViewDialog(r); }} className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-800'}`}>View Payment</button>
                              <button onClick={async () => { 
                                setActionMenuRowId(null); 
                                try {
                                  if (!schoolId) return;
                                  
                                  // Show loading toast with spinner
                                  const loadingToast = document.createElement('div');
                                  loadingToast.className = `${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg border`;
                                  loadingToast.innerHTML = `
                                    <div class="flex items-center space-x-2">
                                      <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      <span>Generating student report...</span>
                                    </div>
                                  `;
                                  document.body.appendChild(loadingToast);
                                  
                                  // Download the student-specific payment report
                                  const blob = await studentFeesService.downloadStudentPaymentReport(schoolId, r.studentId);
                                  
                                  // Create download link for PDF
                                  const url = window.URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = `payment-report-${r.studentName}-${r.studentId}.pdf`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  window.URL.revokeObjectURL(url);
                                  
                                  // Remove loading toast and show success
                                  loadingToast.remove();
                                  const successToast = document.createElement('div');
                                  successToast.className = `${isDarkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-50 text-green-700 border-green-200'} fixed bottom-6 right-4 py-2 rounded-lg shadow-lg border`;
                                  successToast.textContent = 'Student report downloaded successfully';
                                  document.body.appendChild(successToast);
                                  setTimeout(() => successToast.remove(), 3000);
                                } catch (error) {
                                  console.error('Error downloading student report:', error);
                                  
                                  // Show error toast
                                  const errorToast = document.createElement('div');
                                  errorToast.className = `${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
                                  errorToast.textContent = 'Failed to download student report. Please try again.';
                                  document.body.appendChild(errorToast);
                                  setTimeout(() => errorToast.remove(), 3000);
                                }
                              }} className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-800'}`}>Generate Report</button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reports Dialog */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsReportOpen(false)} />
          <div className={`relative w-96 max-w-full mx-4 rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Download Report</h3>
                <button onClick={() => setIsReportOpen(false)} className={`p-2 rounded ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Select Class</label>
                  <select
                    value={reportClassId}
                    onChange={(e) => setReportClassId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>All Classes</option>
                    {classrooms.map(c => (
                      <option key={c.classId} value={c.classId} className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>
                        {c.className} {c.division}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={async () => {
                    if (!schoolId || !reportClassId) {
                      // Show error toast for missing selection
                      const toast = document.createElement('div');
                      toast.className = `${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
                      toast.textContent = 'Please select a class first';
                      document.body.appendChild(toast);
                      setTimeout(() => toast.remove(), 3000);
                      return;
                    }

                    try {
                      setIsDownloading(true);
                      
                      // Call the API to download the report
                      const blob = await studentFeesService.downloadClassPaymentReport(schoolId, reportClassId);
                      
                      // Create download link
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `payment-report-${reportClassId}.xlsx`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                      
                      setIsReportOpen(false);
                      
                      // Show success toast
                      const toast = document.createElement('div');
                      toast.className = `${isDarkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-50 text-green-700 border-green-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
                      toast.textContent = 'Report downloaded successfully';
                      document.body.appendChild(toast);
                      setTimeout(() => toast.remove(), 3000);
                    } catch (error) {
                      console.error('Error downloading report:', error);
                      
                      // Show error toast
                      const toast = document.createElement('div');
                      toast.className = `${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
                      toast.textContent = 'Failed to download report. Please try again.';
                      document.body.appendChild(toast);
                      setTimeout(() => toast.remove(), 3000);
                    } finally {
                      setIsDownloading(false);
                    }
                  }}
                  disabled={isDownloading || !reportClassId}
                  className={`w-full py-3 rounded-lg font-medium ${isDownloading || !reportClassId ? 'bg-gray-400 cursor-not-allowed' : (isDarkMode ? 'bg-primary-600 hover:bg-primary-700' : 'bg-primary-500 hover:bg-primary-600')} text-white`}
                >
                  {isDownloading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Downloading...
                    </span>
                  ) : (
                    'Download Report'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Sidebar (Add/Edit) */}
      {isPaymentSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsPaymentSidebarOpen(false)} />
          <div className={`relative w-96 max-w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{paymentMode === 'add' ? 'Add Payment' : 'Edit Payment'}</h2>
                <button
                  onClick={() => setIsPaymentSidebarOpen(false)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {paymentMode === 'edit' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Select Payment Installment</label>
                    {isLoadingPayments ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, idx) => (
                          <div key={idx} className="p-3 border rounded-lg animate-pulse">
                            <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-24"></div>
                          </div>
                        ))}
                      </div>
                    ) : studentPayments.length === 0 ? (
                      <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No payment installments found for this student.
                      </div>
                    ) : (
                      <select
                        value={selectedPaymentForEdit?.paymentId || ''}
                        onChange={(e) => {
                          const selectedPayment = studentPayments.find(p => p.paymentId === e.target.value);
                          if (selectedPayment) {
                            handleSelectPaymentForEdit(selectedPayment);
                          }
                        }}
                        className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        <option value="" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>
                          Select an installment to edit
                        </option>
                        {studentPayments.map((payment, index) => (
                          <option 
                            key={payment.paymentId} 
                            value={payment.paymentId}
                            className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}
                          >
                            Installment {index + 1} - ₹ {payment.amount.toLocaleString()} ({payment.paymentMode}) - {new Date(payment.date).toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                    )}
                    {selectedPaymentForEdit && (
                      <div className={`mt-2 p-2 rounded border ${isDarkMode ? 'border-primary-500 bg-primary-900/20' : 'border-primary-500 bg-primary-50'}`}>
                        <div className={`text-xs ${isDarkMode ? 'text-primary-300' : 'text-primary-600'}`}>
                          Selected: Installment {studentPayments.findIndex(p => p.paymentId === selectedPaymentForEdit.paymentId) + 1} 
                          (₹ {selectedPaymentForEdit.amount.toLocaleString()})
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Amount</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Enter amount"
                    min={0}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Payment Mode</label>
                  <select
                    value={paymentForm.paymentMode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    {paymentModes.map(m => (
                      <option key={m} value={m} className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Transaction ID</label>
                  <input
                    type="text"
                    value={paymentForm.transactionId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Enter transaction id"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Remark (optional)</label>
                  <textarea
                    value={paymentForm.remark}
                    onChange={(e) => setPaymentForm({ ...paymentForm, remark: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Enter remark"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSavePayment}
                    disabled={isSavingPayment || (paymentMode === 'edit' && !selectedPaymentForEdit)}
                    className={`${isSavingPayment || (paymentMode === 'edit' && !selectedPaymentForEdit) ? 'bg-gray-400 cursor-not-allowed' : (isDarkMode ? 'bg-primary-600 hover:bg-primary-700' : 'bg-primary-500 hover:bg-primary-600')} text-white px-4 py-2 rounded-lg flex items-center justify-center min-w-[120px]`}
                  >
                    {isSavingPayment ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      paymentMode === 'add' ? 'Add Payment' : (selectedPaymentForEdit ? 'Update Payment' : 'Select Installment First')
                    )}
                  </button>
                  <button
                    onClick={() => setIsPaymentSidebarOpen(false)}
                    disabled={isSavingPayment}
                    className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} ${isSavingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {isDeleteDialogOpen && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsDeleteDialogOpen(false)} />
          <div className={`relative w-[600px] max-w-full mx-4 rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-600'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className={`ml-3 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delete Payment Installments</h3>
              </div>
              
              <div className="mb-4">
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-3`}>
                  Select the payment installments you want to delete for {selectedRow.studentName}. This action cannot be undone.
                </p>
                
                {/* Select All Checkbox */}
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={selectedPaymentIds.length === studentPayments.length && studentPayments.length > 0}
                    onChange={(e) => handleSelectAllPayments(e.target.checked)}
                    className={`w-4 h-4 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-primary-600' : 'bg-white border-gray-300 text-primary-600'}`}
                  />
                  <label htmlFor="selectAll" className={`ml-2 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Select All Installments
                  </label>
                </div>
              </div>

              {/* Payment Installments List */}
              {isLoadingPayments ? (
                <div className="space-y-3 mb-6">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-24"></div>
                      </div>
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : studentPayments.length === 0 ? (
                <div className={`text-center py-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No payment installments found for this student.
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto mb-6">
                  <div className="space-y-2">
                    {studentPayments.map((payment, index) => (
                      <div key={payment.paymentId} className={`flex items-center space-x-3 p-3 border rounded-lg ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                        <input
                          type="checkbox"
                          id={`payment-${payment.paymentId}`}
                          checked={selectedPaymentIds.includes(payment.paymentId)}
                          onChange={(e) => handleSelectPayment(payment.paymentId, e.target.checked)}
                          className={`w-4 h-4 rounded ${isDarkMode ? 'bg-gray-600 border-gray-500 text-primary-600' : 'bg-white border-gray-300 text-primary-600'}`}
                        />
                        <div className="flex-1">
                          <label htmlFor={`payment-${payment.paymentId}`} className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} cursor-pointer`}>
                            Installment {index + 1}
                          </label>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(payment.date).toLocaleDateString()} • {payment.paymentMode}
                            {payment.remarks && ` • ${payment.remarks}`}
                          </div>
                        </div>
                        <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          ₹ {payment.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedPaymentIds.length > 0 && (
                    <span>
                      Selected: {selectedPaymentIds.length} installment(s) • 
                      Total: ₹ {studentPayments
                        .filter(p => selectedPaymentIds.includes(p.paymentId))
                        .reduce((sum, p) => sum + p.amount, 0)
                        .toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsDeleteDialogOpen(false)} 
                    className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeletePayment} 
                    disabled={selectedPaymentIds.length === 0 || isDeletingPayments}
                    className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'} ${selectedPaymentIds.length === 0 || isDeletingPayments ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isDeletingPayments ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </span>
                    ) : (
                      `Delete ${selectedPaymentIds.length > 0 ? `(${selectedPaymentIds.length})` : ''}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Payment Dialog */}
      {isViewDialogOpen && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsViewDialogOpen(false)} />
          <div className={`relative w-[700px] max-w-full mx-4 rounded-2xl shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment Details</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Complete payment history and summary</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsViewDialogOpen(false)}
                  className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Student Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Student</p>
                      <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRow.studentName}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Class</p>
                      <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRow.className} • {selectedRow.division}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Roll No</p>
                      <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRow.rollNo}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Fees</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹ {selectedRow.totalFees.toLocaleString()}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Paid Amount</p>
                      <p className={`text-2xl font-bold text-green-600`}>₹ {selectedRow.paidFees.toLocaleString()}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Remaining</p>
                      <p className={`text-2xl font-bold ${(selectedRow.totalFees - selectedRow.paidFees) >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                        ₹ {(selectedRow.totalFees - selectedRow.paidFees).toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${(selectedRow.totalFees - selectedRow.paidFees) >= 0 ? (isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600') : (isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600')}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Installments Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment Installments</h4>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    {studentPayments.length} installment{studentPayments.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {isLoadingPayments ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border animate-pulse ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="h-5 bg-gray-300 rounded w-32"></div>
                          <div className="h-5 bg-gray-300 rounded w-20"></div>
                        </div>
                        <div className="h-4 bg-gray-300 rounded w-48"></div>
                      </div>
                    ))}
                  </div>
                ) : studentPayments.length === 0 ? (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">No payment installments found</p>
                    <p className="text-xs">This student hasn't made any payments yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {studentPayments.map((payment, index) => (
                      <div key={payment.paymentId} className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:border-gray-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                              {index + 1}
                            </div>
                            <span className={`ml-3 text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Installment {index + 1}
                            </span>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            payment.paymentMode === 'UPI' ? (isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600') :
                            payment.paymentMode === 'Cash' ? (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600') :
                            payment.paymentMode === 'Card' ? (isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600') :
                            (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')
                          }`}>
                            {payment.paymentMode}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                              <span className="inline-flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(payment.date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                              {payment.transactionId && (
                                <span className="ml-3 inline-flex items-center">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                  </svg>
                                  {payment.transactionId}
                                </span>
                              )}
                            </div>
                            {payment.remarks && (
                              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>
                                "{payment.remarks}"
                              </div>
                            )}
                          </div>
                          <div className={`text-right ml-4`}>
                            <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              ₹ {payment.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => setIsViewDialogOpen(false)} 
                  className={`px-6 py-3 rounded-xl font-medium transition-colors ${isDarkMode ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-primary-500 hover:bg-primary-600 text-white'}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFees; 