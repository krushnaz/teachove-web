import React, { useEffect, useMemo, useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAuth } from '../../contexts/AuthContext';
import { classroomService, Classroom } from '../../services/classroomService';
import { studentFeesService, StudentSummaryRow } from '../../services/studentFeesService';

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
            rollNo: '-',
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

  const openEditPayment = (row: StudentFeeRow) => {
    setSelectedRow(row);
    setPaymentMode('edit');
    setPaymentForm({ installment: '1', amount: row.paidFees, paymentMode: 'Cash', transactionId: '', remark: '' });
    setIsPaymentSidebarOpen(true);
  };

  const openDeleteDialog = (row: StudentFeeRow) => {
    setSelectedRow(row);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (row: StudentFeeRow) => {
    setSelectedRow(row);
    setIsViewDialogOpen(true);
  };

  const handleSavePayment = () => {
    // Placeholder: update local state to reflect payment change (no backend here)
    if (!selectedRow) return;
    if (paymentMode === 'add') {
      const updated = rows.map(r => r.studentId === selectedRow.studentId ? { ...r, paidFees: r.paidFees + paymentForm.amount } : r);
      setRows(updated);
    } else {
      const updated = rows.map(r => r.studentId === selectedRow.studentId ? { ...r, paidFees: paymentForm.amount } : r);
      setRows(updated);
    }
    setIsPaymentSidebarOpen(false);
  };

  const handleDeletePayment = () => {
    // Placeholder: no real payment rows, so just close
    setIsDeleteDialogOpen(false);
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
                        rollNo: '-',
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
                          onClick={() => setActionMenuRowId(isMenuOpen ? null : r.studentId)}
                          className={`p-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6h.01M12 12h.01M12 18h.01" />
                          </svg>
                        </button>
                        {isMenuOpen && (
                          <div className={`absolute right-2 mt-2 w-48 rounded-lg shadow-lg z-10 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="flex flex-col">
                              <button onClick={() => { setActionMenuRowId(null); openAddPayment(r); }} className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-800'}`}>Add Payment</button>
                              <button onClick={() => { setActionMenuRowId(null); openEditPayment(r); }} className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-800'}`}>Edit Payment</button>
                              <button onClick={() => { setActionMenuRowId(null); openDeleteDialog(r); }} className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-800'}`}>Delete Payment</button>
                              <button onClick={() => { setActionMenuRowId(null); openViewDialog(r); }} className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-800'}`}>View Payment</button>
                              <button onClick={() => { 
                                setActionMenuRowId(null); 
                                // Pre-select the class for this student
                                const studentClass = classrooms.find(c => c.className === r.className && c.division === r.division);
                                if (studentClass) {
                                  setReportClassId(studentClass.classId);
                                }
                                setIsReportOpen(true); 
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
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Installment</label>
                    <select
                      value={paymentForm.installment}
                      onChange={(e) => setPaymentForm({ ...paymentForm, installment: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Select installment</option>
                      <option value="1" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Installment 1</option>
                      <option value="2" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Installment 2</option>
                      <option value="3" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Installment 3</option>
                    </select>
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
                    className={`${isDarkMode ? 'bg-primary-600 hover:bg-primary-700' : 'bg-primary-500 hover:bg-primary-600'} text-white px-4 py-2 rounded-lg`}
                  >
                    {paymentMode === 'add' ? 'Add Payment' : 'Update Payment'}
                  </button>
                  <button
                    onClick={() => setIsPaymentSidebarOpen(false)}
                    className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
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
          <div className={`relative w-96 max-w-full mx-4 rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-600'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className={`ml-3 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delete Payment</h3>
              </div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-6`}>Are you sure you want to delete the payment for {selectedRow.studentName}? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsDeleteDialogOpen(false)} className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Cancel</button>
                <button onClick={handleDeletePayment} className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Payment Dialog */}
      {isViewDialogOpen && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsViewDialogOpen(false)} />
          <div className={`relative w-96 max-w-full mx-4 rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={`ml-3 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment Details</h3>
              </div>

              <div className="space-y-2 mb-6">
                <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Student: <span className="font-medium">{selectedRow.studentName}</span></div>
                <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Class: <span className="font-medium">{selectedRow.className} • {selectedRow.division}</span></div>
                <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Total Fees: <span className="font-medium">₹ {selectedRow.totalFees.toLocaleString()}</span></div>
                <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Paid: <span className="font-medium">₹ {selectedRow.paidFees.toLocaleString()}</span></div>
                <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Remaining: <span className="font-medium">₹ {(selectedRow.totalFees - selectedRow.paidFees).toLocaleString()}</span></div>
                <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Note: Detailed payment history integration pending.</div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => setIsViewDialogOpen(false)} className={`${isDarkMode ? 'bg-primary-600 hover:bg-primary-700' : 'bg-primary-500 hover:bg-primary-600'} text-white px-4 py-2 rounded-lg`}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFees; 