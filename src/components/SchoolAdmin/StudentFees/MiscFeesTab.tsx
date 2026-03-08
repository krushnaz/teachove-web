import React, { useEffect, useMemo, useState } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { classroomService, Classroom } from '../../../services/classroomService';
import { studentFeesService } from '../../../services/studentFeesService';

interface MiscFeesTabProps {
  feeType: 'Admission' | 'Book' | 'Uniform' | 'Bag';
}

interface StudentRow {
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  rollNo: string;
  totalPaid: number;
  classId: string;
  transactions: any[];
}

const paymentModes = ['Cash', 'UPI', 'Card', 'Net Banking', 'Cheque'];

const MiscFeesTab: React.FC<MiscFeesTabProps> = ({ feeType }) => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);

  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  // Sidebar / Modal states
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const [feeToDelete, setFeeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    amount: '',
    paymentMode: 'Cash',
    transactionId: '',
    remarks: ''
  });

  const schoolId = user?.schoolId;
  const yearId = (user as any)?.yearId || '2025-2026';

  const loadData = async (isBackgroundReload = false) => {
    if (!schoolId) return;
    try {
      if (!isBackgroundReload) setIsLoading(true);
      const [classes, summary] = await Promise.all([
        classroomService.getClassesBySchoolId(schoolId, yearId),
        studentFeesService.getMiscFeeSummary(schoolId, feeType)
      ]);
      setClassrooms(classes);
      setTotalCollected(summary?.totalCollected || 0);

      const mapped: StudentRow[] = (summary?.students || []).map((s: any) => ({
        ...s,
        studentName: s.studentName || s.name || 'Unknown',
        totalPaid: s.totalPaid || s.totalAdmissionFeesPaid || 0,
        transactions: s.transactions || s.admissionFees || s.uniformFees || s.bagFees || s.bookFees || []
      }));
      setRows(mapped);
    } catch (e) {
      console.error('Error loading misc fees', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [schoolId, yearId, feeType]);

  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      const matchesQuery = `${r.studentName} ${r.className} ${r.rollNo}`.toLowerCase().includes(query.toLowerCase());
      const matchesClass = classFilter ? r.classId === classFilter : true;
      const matchesStatus = statusFilter === 'all' ? true : (statusFilter === 'paid' ? r.totalPaid > 0 : r.totalPaid === 0);
      return matchesQuery && matchesClass && matchesStatus;
    });
  }, [rows, query, classFilter, statusFilter]);

  const openManagePanel = (student: StudentRow) => {
    setSelectedStudent(student);
    setEditingCardId(null);
    setForm({ amount: '', paymentMode: 'Cash', transactionId: '', remarks: '' });
    setIsSidebarOpen(true);
  };

  const handleSaveFee = async () => {
    if (!selectedStudent || !schoolId) return;
    try {
      setIsSaving(true);
      const parsedAmount = parseFloat(form.amount) || 0;
      let payload: any = {
        schoolId,
        studentId: selectedStudent.studentId,
        classId: selectedStudent.classId || classFilter,
        paymentMode: form.paymentMode,
        transactionId: form.transactionId,
        remarks: form.remarks,
        remark: form.remarks, // book uses remark
        date: new Date().toISOString()
      };

      if (feeType === 'Admission') {
        payload.formFeeAmount = parsedAmount;
      } else if (feeType === 'Book') {
        payload.bookSetAmount = parsedAmount;
      } else if (feeType === 'Bag') {
        payload.bagAmount = parsedAmount;
      } else {
        payload.amount = parsedAmount;
      }

      if (editingCardId) {
        await studentFeesService.updateMiscFee(feeType, editingCardId, payload);
      } else {
        await studentFeesService.addMiscFee(feeType, payload);
      }
      
      await loadData(true); // Background reload to get IDs without flashing loading indicator
      
      // Keep the panel open, just update selected student data from new load
      if (editingCardId) {
        setEditingCardId(null);
        setForm({ amount: '', paymentMode: 'Cash', transactionId: '', remarks: '' });
      } else {
        setIsSidebarOpen(false);
      }
    } catch (e) {
      console.error('Error saving', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFee = (feeId: string) => {
    setFeeToDelete(feeId);
  };

  const confirmDeleteFee = async () => {
    if (!selectedStudent || !schoolId || !feeToDelete) return;
    try {
      setIsDeleting(true);
      await studentFeesService.deleteMiscFee(feeType, feeToDelete, schoolId, selectedStudent.studentId);
      await loadData(true);
      setFeeToDelete(null);
    } catch (e) {
      console.error('Error deleting', e);
    } finally {
      setIsDeleting(false);
    }
  };

  // Keep `selectedStudent` updated whenever `rows` change
  useEffect(() => {
    if (selectedStudent) {
      const updatedMatch = rows.find(r => r.studentId === selectedStudent.studentId);
      if (updatedMatch) {
        setSelectedStudent(updatedMatch);
      }
    }
  }, [rows]);

  const getTransactionAmount = (tx: any) => tx.amount ?? tx.bookSetAmount ?? tx.bagAmount ?? tx.formFeeAmount ?? 0;
  const getTransactionId = (tx: any) => tx.feeId ?? tx.uniformFeeId ?? tx.bagFeeId ?? tx.admissionFormFeeId ?? tx.id;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 md:grid-cols-2">
        <div className={`p-6 rounded-xl border shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Collected ({feeType} Fees)</p>
          <p className={`mt-1 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹ {totalCollected.toLocaleString()}</p>
        </div>
        <div className={`p-6 rounded-xl border shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Students</p>
          <p className={`mt-1 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{rows.length}</p>
        </div>
      </div>

      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, roll no..."
            className={`flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={`px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className={`px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="">All Classes</option>
            {classrooms.map(c => (
              <option key={c.classId} value={c.classId}>{c.className} {c.section}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Class • Sec</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total Paid</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'bg-gray-800 divide-gray-700 text-gray-200' : 'bg-white divide-gray-200 text-gray-800'}`}>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm">Loading...</td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm">No records found</td>
                </tr>
              ) : (
                filteredRows.map((r, i) => (
                  <tr key={i} className={`hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">{r.studentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{r.className} • {r.section}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{r.rollNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600 dark:text-green-400">₹ {r.totalPaid.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => openManagePanel(r)}
                        className={`text-primary-600 hover:text-primary-700 font-medium ${isDarkMode ? 'dark:text-primary-400 dark:hover:text-primary-300' : ''}`}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sidebar for Managing Individual Fees */}
      {isSidebarOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setIsSidebarOpen(false)} />
          <div className={`relative w-full max-w-md h-full shadow-2xl flex flex-col transition-transform transform ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'} flex items-center justify-between`}>
              <div>
                <h3 className="text-xl font-bold">Manage {feeType} Fees</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{selectedStudent.studentName}</p>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className={`p-2 rounded-lg hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                ✕
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Add / Edit Form */}
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} space-y-4`}>
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{editingCardId ? 'Edit Payment' : 'New Payment'}</h4>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amount</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className={`w-full px-3 py-2 rounded-md border focus:ring-primary-500 focus:border-primary-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Payment Mode</label>
                  <select
                    value={form.paymentMode}
                    onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                    className={`w-full px-3 py-2 rounded-md border focus:ring-primary-500 focus:border-primary-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    {paymentModes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Transaction ID</label>
                  <input
                    type="text"
                    value={form.transactionId}
                    onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-md border focus:ring-primary-500 focus:border-primary-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Remarks</label>
                  <input
                    type="text"
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    className={`w-full px-3 py-2 rounded-md border focus:ring-primary-500 focus:border-primary-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={handleSaveFee}
                    disabled={isSaving || !form.amount}
                    className={`flex-1 py-2 font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50`}
                  >
                    {isSaving ? 'Saving...' : (editingCardId ? 'Update' : 'Add')}
                  </button>
                  {editingCardId && (
                    <button
                      onClick={() => {
                        setEditingCardId(null);
                        setForm({ amount: '', paymentMode: 'Cash', transactionId: '', remarks: '' });
                      }}
                      className={`flex-1 py-2 font-medium border rounded-lg ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Transaction List */}
              <div className="space-y-4">
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Past Transactions</h4>
                {selectedStudent.transactions.length === 0 ? (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No transactions found.</p>
                ) : (
                  selectedStudent.transactions.map((tx: any, idx: number) => {
                    const amount = getTransactionAmount(tx);
                    const txId = getTransactionId(tx);
                    return (
                      <div key={idx} className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-lg">₹ {amount}</p>
                            <p className="text-sm opacity-80">{tx.paymentMode} - {tx.transactionId || 'No Tx ID'}</p>
                            {(tx.remarks || tx.remark) && <p className="text-sm opacity-80 mt-1 italic">{tx.remarks || tx.remark}</p>}
                            <p className="text-xs opacity-60 mt-2">{new Date(tx.createdAt || tx.date).toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingCardId(txId);
                                setForm({
                                  amount: amount.toString(),
                                  paymentMode: tx.paymentMode || 'Cash',
                                  transactionId: tx.transactionId || '',
                                  remarks: tx.remarks || tx.remark || ''
                                });
                              }}
                              className="p-1.5 rounded text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteFee(txId)}
                              className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {feeToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => !isDeleting && setFeeToDelete(null)} />
          <div className={`relative w-[400px] max-w-full mx-4 rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-600'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className={`ml-3 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delete Payment</h3>
              </div>
              
              <div className="mb-6">
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                  Are you sure you want to delete this payment? This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setFeeToDelete(null)} 
                  disabled={isDeleting}
                  className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteFee} 
                  disabled={isDeleting}
                  className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'} ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiscFeesTab;
