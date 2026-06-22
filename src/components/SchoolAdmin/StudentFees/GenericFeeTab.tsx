import React, { useEffect, useMemo, useState } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { classroomService, Classroom } from '../../../services/classroomService';
import { FeeType } from '../../../services/feeTypeService';
import { feeEngineService, FeePayment, FeeStudentSummary } from '../../../services/feeEngineService';
import { toast } from 'react-toastify';

interface GenericFeeTabProps {
  feeType: FeeType;
  yearId: string;
}

const paymentModes = ['Cash', 'UPI', 'Card', 'Net Banking', 'Cheque'];

const GenericFeeTab: React.FC<GenericFeeTabProps> = ({ feeType, yearId }) => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const schoolId = user?.schoolId;
  const feeTypeId = feeType.feeTypeId || feeType.id || '';

  const [loading, setLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [rows, setRows] = useState<FeeStudentSummary[]>([]);
  const [totalDue, setTotalDue] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [defaultAmount, setDefaultAmount] = useState('');
  const [oneTimeDiscount, setOneTimeDiscount] = useState('');
  const [savingStructure, setSavingStructure] = useState(false);

  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [actionMenuRowId, setActionMenuRowId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  const [selectedStudent, setSelectedStudent] = useState<FeeStudentSummary | null>(null);
  const [isPaymentSidebarOpen, setIsPaymentSidebarOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'add' | 'edit'>('add');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAssignmentSidebarOpen, setIsAssignmentSidebarOpen] = useState(false);
  const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState<FeePayment | null>(null);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMode: 'Cash',
    transactionId: '',
    remarks: '',
  });

  const [assignmentForm, setAssignmentForm] = useState({
    baseAmount: '',
    discountAmount: '',
    discountReason: '',
    status: 'required' as 'required' | 'not_required' | 'waived',
    notRequiredReason: '',
  });

  const loadData = async () => {
    if (!schoolId || !feeTypeId) return;
    try {
      setLoading(true);
      const [classes, summary] = await Promise.all([
        classroomService.getClassesBySchoolId(schoolId, yearId),
        feeEngineService.getSummary(schoolId, yearId, feeTypeId),
      ]);
      setClassrooms(classes);
      setRows(summary.students || []);
      setTotalDue(summary.totalDue || 0);
      setTotalPaid(summary.totalPaid || 0);
      setRemaining(summary.remainingAmount || 0);
      setDefaultAmount(String(summary.structure?.defaultAmount ?? ''));
      const policy = summary.structure?.discountPolicies?.find(
        (p) => p.type === 'one_time_full' && p.isActive
      );
      setOneTimeDiscount(policy ? String(policy.value) : '');
    } catch (e) {
      console.error(e);
      toast.error('Failed to load fee data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [schoolId, yearId, feeTypeId]);

  useEffect(() => {
    const closeMenu = () => setActionMenuRowId(null);
    if (actionMenuRowId) {
      window.addEventListener('scroll', closeMenu, true);
      return () => window.removeEventListener('scroll', closeMenu, true);
    }
  }, [actionMenuRowId]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const q = query.toLowerCase();
      const matchQ = `${r.studentName} ${r.rollNo} ${r.className}`.toLowerCase().includes(q);
      const matchClass = classFilter ? r.classId === classFilter : true;
      const matchStatus = statusFilter === 'all' ? true : r.paymentStatus === statusFilter;
      return matchQ && matchClass && matchStatus;
    });
  }, [rows, query, classFilter, statusFilter]);

  const getStudentPayments = (student: FeeStudentSummary) => student.payments || [];

  const saveStructure = async () => {
    if (!schoolId) return;
    try {
      setSavingStructure(true);
      const policies = oneTimeDiscount
        ? [
            {
              id: 'one_time_full',
              name: 'One-time full payment',
              type: 'one_time_full' as const,
              value: Number(oneTimeDiscount) || 0,
              isActive: true,
            },
          ]
        : [];
      await feeEngineService.updateStructure(schoolId, yearId, feeTypeId, {
        defaultAmount: Number(defaultAmount) || 0,
        discountPolicies: policies,
        isEnabled: true,
      });
      toast.success('Fee settings saved');
      await loadData();
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSavingStructure(false);
    }
  };

  const openAddPayment = (student: FeeStudentSummary) => {
    setSelectedStudent(student);
    setPaymentMode('add');
    setSelectedPaymentForEdit(null);
    setPaymentForm({ amount: '', paymentMode: 'Cash', transactionId: '', remarks: '' });
    setIsPaymentSidebarOpen(true);
  };

  const openEditPayment = (student: FeeStudentSummary) => {
    setSelectedStudent(student);
    setPaymentMode('edit');
    setSelectedPaymentForEdit(null);
    setPaymentForm({ amount: '', paymentMode: 'Cash', transactionId: '', remarks: '' });
    setIsPaymentSidebarOpen(true);
  };

  const openDeleteDialog = (student: FeeStudentSummary) => {
    setSelectedStudent(student);
    setSelectedPaymentIds([]);
    setIsDeleteDialogOpen(true);
  };

  const openDiscountWaiver = (student: FeeStudentSummary) => {
    openAssignment(student);
  };

  const openViewDialog = (student: FeeStudentSummary) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  const feeStatusLabel = (status?: string) => {
    if (status === 'waived') return 'Waived';
    if (status === 'not_required') return 'Not required';
    return 'Required';
  };

  const openAssignment = (student: FeeStudentSummary) => {
    setSelectedStudent(student);
    setAssignmentForm({
      baseAmount: String(student.baseAmount ?? ''),
      discountAmount: String(student.discountAmount ?? ''),
      discountReason: student.discountReason || '',
      status: student.status || 'required',
      notRequiredReason: student.notRequiredReason || '',
    });
    setIsAssignmentSidebarOpen(true);
  };

  const handleSelectPaymentForEdit = (payment: FeePayment) => {
    setSelectedPaymentForEdit(payment);
    setPaymentForm({
      amount: String(payment.amount),
      paymentMode: payment.paymentMode,
      transactionId: payment.transactionId || '',
      remarks: payment.remarks || '',
    });
  };

  const savePayment = async () => {
    if (!schoolId || !selectedStudent) return;
    const amount = Number(paymentForm.amount) || 0;
    if (amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    try {
      setSaving(true);
      if (paymentMode === 'edit' && selectedPaymentForEdit) {
        await feeEngineService.updatePayment(schoolId, yearId, selectedPaymentForEdit.paymentId, {
          amount,
          paymentMode: paymentForm.paymentMode,
          transactionId: paymentForm.transactionId,
          remarks: paymentForm.remarks,
        });
        toast.success('Payment updated');
      } else {
        await feeEngineService.addPayment(schoolId, yearId, {
          studentId: selectedStudent.studentId,
          feeTypeId,
          amount,
          paymentMode: paymentForm.paymentMode,
          transactionId: paymentForm.transactionId,
          remarks: paymentForm.remarks,
        });
        toast.success('Payment added');
      }
      setIsPaymentSidebarOpen(false);
      await loadData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save payment';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDeletePayments = async () => {
    if (!schoolId || !selectedPaymentIds.length) return;
    try {
      setIsDeleting(true);
      await Promise.all(
        selectedPaymentIds.map((id) => feeEngineService.deletePayment(schoolId, yearId, id))
      );
      toast.success('Payment(s) deleted');
      setIsDeleteDialogOpen(false);
      await loadData();
    } catch {
      toast.error('Failed to delete payment(s)');
    } finally {
      setIsDeleting(false);
    }
  };

  const saveAssignment = async () => {
    if (!schoolId || !selectedStudent) return;
    try {
      setSaving(true);
      await feeEngineService.updateAssignment(schoolId, yearId, selectedStudent.assignmentId, {
        baseAmount: Number(assignmentForm.baseAmount) || 0,
        discountAmount: Number(assignmentForm.discountAmount) || 0,
        discountReason: assignmentForm.discountReason,
        status: assignmentForm.status,
        notRequiredReason: assignmentForm.notRequiredReason,
      });
      toast.success('Student fee updated');
      setIsAssignmentSidebarOpen(false);
      await loadData();
    } catch {
      toast.error('Failed to update student fee');
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      partial: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      not_paid: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      not_required: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
      overpaid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  const menuBtnClass = `w-full text-left px-4 py-2 text-sm ${
    isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-800'
  }`;

  if (loading) {
    return (
      <div className="flex justify-center h-48 items-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-primary-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {feeType.name} — Settings ({yearId})
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-gray-500">Default amount (₹)</label>
            <input
              type="number"
              value={defaultAmount}
              onChange={(e) => setDefaultAmount(e.target.value)}
              className={`w-full mt-1 px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              placeholder="e.g. 5000"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">One-time full pay discount (%)</label>
            <input
              type="number"
              value={oneTimeDiscount}
              onChange={(e) => setOneTimeDiscount(e.target.value)}
              className={`w-full mt-1 px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              placeholder="e.g. 5"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={saveStructure}
              disabled={savingStructure}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {savingStructure ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Total Due', value: totalDue },
          { label: 'Collected', value: totalPaid },
          { label: 'Pending', value: remaining },
        ].map((c) => (
          <div key={c.label} className={`p-5 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ₹ {c.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            placeholder="Search student..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`flex-1 px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
          />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
          >
            <option value="">All classes</option>
            {classrooms.map((c) => (
              <option key={c.classId} value={c.classId}>
                {c.className} {c.section}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
          >
            <option value="all">All status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="not_paid">Not paid</option>
            <option value="not_required">Not required</option>
          </select>
        </div>

        <div className="md:hidden space-y-3">
          {filtered.map((r) => (
            <div
              key={r.studentId}
              className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{r.studentName}</p>
                  <p className="text-xs text-gray-500">{r.className} {r.section} · Roll {r.rollNo}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs shrink-0 ${statusBadge(r.paymentStatus)}`}>
                  {r.paymentStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div><span className="text-gray-500">Due</span><p className="font-medium">₹{(r.dueAmount || 0).toLocaleString()}</p></div>
                <div><span className="text-gray-500">Paid</span><p className="font-medium">₹{(r.paidAmount || 0).toLocaleString()}</p></div>
                <div><span className="text-gray-500">Discount</span><p className="font-medium">{(r.discountAmount || 0) > 0 ? `₹${r.discountAmount}` : '—'}</p></div>
                <div><span className="text-gray-500">Fee status</span><p className="font-medium">{feeStatusLabel(r.status)}</p></div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <button onClick={() => openAddPayment(r)} className="flex-1 min-w-[100px] py-2 text-xs font-medium rounded-lg bg-primary-600 text-white">Add pay</button>
                <button onClick={() => openDiscountWaiver(r)} className="flex-1 min-w-[100px] py-2 text-xs font-medium rounded-lg border border-primary-600 text-primary-600">Discount</button>
                <button
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMenuPosition({ top: window.scrollY + rect.bottom + 8, right: window.innerWidth - rect.right });
                    setActionMenuRowId(actionMenuRowId === r.studentId ? null : r.studentId);
                  }}
                  className={`px-3 py-2 text-xs rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                >
                  More
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {['Student', 'Class', 'Due', 'Paid', 'Discount', 'Fee Status', 'Payment', ''].map((h) => (
                  <th key={h || 'actions'} className={`py-2 px-2 font-medium ${h === '' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const isMenuOpen = actionMenuRowId === r.studentId;
                return (
                  <tr key={r.studentId} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <td className={`py-3 px-2 ${isDarkMode ? 'text-white' : ''}`}>
                      <div className="font-medium">{r.studentName}</div>
                      <div className="text-xs text-gray-500">Roll {r.rollNo}</div>
                    </td>
                    <td className="py-3 px-2">{r.className} {r.section}</td>
                    <td className="py-3 px-2">₹{(r.dueAmount || 0).toLocaleString()}</td>
                    <td className="py-3 px-2">₹{(r.paidAmount || 0).toLocaleString()}</td>
                    <td className="py-3 px-2">
                      {(r.discountAmount || 0) > 0 ? (
                        <span className="text-green-600">₹{r.discountAmount?.toLocaleString()}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openDiscountWaiver(r)}
                          className="text-xs text-primary-600 hover:underline"
                        >
                          Apply
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        r.status === 'waived' ? 'bg-purple-100 text-purple-800' :
                        r.status === 'not_required' ? 'bg-gray-100 text-gray-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {feeStatusLabel(r.status)}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${statusBadge(r.paymentStatus)}`}>
                        {r.paymentStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right relative">
                      <button
                        onClick={(e) => {
                          if (isMenuOpen) {
                            setActionMenuRowId(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPosition({
                              top: window.scrollY + rect.bottom + 8,
                              right: window.innerWidth - rect.right,
                            });
                            setActionMenuRowId(r.studentId);
                          }
                        }}
                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        aria-label="Actions"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="5" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="12" cy="19" r="2" />
                        </svg>
                      </button>
                      {isMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActionMenuRowId(null)} />
                          <div
                            className={`fixed w-52 rounded-lg shadow-lg z-50 border overflow-hidden ${
                              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}
                            style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px` }}
                          >
                            <button onClick={() => { setActionMenuRowId(null); openAddPayment(r); }} className={menuBtnClass}>
                              Add Payment
                            </button>
                            <button onClick={() => { setActionMenuRowId(null); openEditPayment(r); }} className={menuBtnClass}>
                              Edit Payment
                            </button>
                            <button onClick={() => { setActionMenuRowId(null); openDeleteDialog(r); }} className={menuBtnClass}>
                              Delete Payment
                            </button>
                            <button onClick={() => { setActionMenuRowId(null); openViewDialog(r); }} className={menuBtnClass}>
                              View Payment
                            </button>
                            <button onClick={() => { setActionMenuRowId(null); openDiscountWaiver(r); }} className={`${menuBtnClass} text-primary-600 font-medium`}>
                              Discount / Waiver
                            </button>
                            <button onClick={() => { setActionMenuRowId(null); openAssignment(r); }} className={menuBtnClass}>
                              Manage Student Fee
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Payment Sidebar */}
      {isPaymentSidebarOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsPaymentSidebarOpen(false)} />
          <div className={`relative w-full max-w-md h-full overflow-y-auto p-6 shadow-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : ''}`}>
                {paymentMode === 'add' ? 'Add Payment' : 'Edit Payment'}
              </h3>
              <button onClick={() => setIsPaymentSidebarOpen(false)} className="text-gray-500">✕</button>
            </div>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedStudent.studentName} · Balance ₹{selectedStudent.remainingAmount.toLocaleString()}
            </p>

            {paymentMode === 'edit' && (
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select payment to edit
                </label>
                <select
                  value={selectedPaymentForEdit?.paymentId || ''}
                  onChange={(e) => {
                    const p = getStudentPayments(selectedStudent).find((x) => x.paymentId === e.target.value);
                    if (p) handleSelectPaymentForEdit(p);
                  }}
                  className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
                >
                  <option value="">Choose payment</option>
                  {getStudentPayments(selectedStudent).map((p) => (
                    <option key={p.paymentId} value={p.paymentId}>
                      ₹{p.amount} — {p.paymentMode}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-3">
              <input
                type="number"
                placeholder="Amount"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                disabled={paymentMode === 'edit' && !selectedPaymentForEdit}
                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
              />
              <select
                value={paymentForm.paymentMode}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                disabled={paymentMode === 'edit' && !selectedPaymentForEdit}
                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
              >
                {paymentModes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input
                placeholder="Transaction ID"
                value={paymentForm.transactionId}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                disabled={paymentMode === 'edit' && !selectedPaymentForEdit}
                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
              />
              <textarea
                placeholder="Remarks"
                value={paymentForm.remarks}
                onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                disabled={paymentMode === 'edit' && !selectedPaymentForEdit}
                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
              />
              <button
                onClick={savePayment}
                disabled={saving || (paymentMode === 'edit' && !selectedPaymentForEdit)}
                className="w-full py-2 bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : paymentMode === 'add' ? 'Add Payment' : 'Update Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Payment Dialog */}
      {isDeleteDialogOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsDeleteDialogOpen(false)} />
          <div className={`relative w-full max-w-md h-full overflow-y-auto p-6 shadow-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : ''}`}>Delete Payment</h3>
              <button onClick={() => setIsDeleteDialogOpen(false)} className="text-gray-500">✕</button>
            </div>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedStudent.studentName} — select payment(s) to delete
            </p>
            {getStudentPayments(selectedStudent).length === 0 ? (
              <p className="text-sm text-gray-500">No payments found.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                {getStudentPayments(selectedStudent).map((p) => (
                  <label
                    key={p.paymentId}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPaymentIds.includes(p.paymentId)}
                      onChange={(e) => {
                        setSelectedPaymentIds((prev) =>
                          e.target.checked ? [...prev, p.paymentId] : prev.filter((id) => id !== p.paymentId)
                        );
                      }}
                    />
                    <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>
                      ₹{p.amount} — {p.paymentMode}
                    </span>
                  </label>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className={`flex-1 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePayments}
                disabled={isDeleting || selectedPaymentIds.length === 0}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Payment Dialog */}
      {isViewDialogOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsViewDialogOpen(false)} />
          <div className={`relative w-full max-w-md h-full overflow-y-auto p-6 shadow-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : ''}`}>Payment History</h3>
              <button onClick={() => setIsViewDialogOpen(false)} className="text-gray-500">✕</button>
            </div>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedStudent.studentName} · {feeType.name}
            </p>
            {getStudentPayments(selectedStudent).length === 0 ? (
              <p className="text-sm text-gray-500">No payments recorded.</p>
            ) : (
              <div className="space-y-3">
                {getStudentPayments(selectedStudent).map((p) => (
                  <div
                    key={p.paymentId}
                    className={`p-3 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}
                  >
                    <div className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>₹{p.amount}</div>
                    <div className="text-sm text-gray-500">{p.paymentMode} · {p.transactionId || '—'}</div>
                    {p.remarks && <div className="text-sm text-gray-500 mt-1">{p.remarks}</div>}
                    {p.discountApplied ? (
                      <div className="text-xs text-green-600 mt-1">Discount ₹{p.discountApplied}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manage Student Fee Sidebar */}
      {isAssignmentSidebarOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsAssignmentSidebarOpen(false)} />
          <div className={`relative w-full max-w-md h-full overflow-y-auto p-6 shadow-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : ''}`}>Discount / Waiver</h3>
              <button onClick={() => setIsAssignmentSidebarOpen(false)} className="text-gray-500">✕</button>
            </div>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedStudent.studentName}</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Fee amount (₹)</label>
                <input
                  type="number"
                  value={assignmentForm.baseAmount}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, baseAmount: e.target.value })}
                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">Discount (₹)</label>
                <input
                  type="number"
                  value={assignmentForm.discountAmount}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, discountAmount: e.target.value })}
                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
                />
              </div>
              <input
                placeholder="Discount reason"
                value={assignmentForm.discountReason}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, discountReason: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
              />
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <select
                  value={assignmentForm.status}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      status: e.target.value as 'required' | 'not_required' | 'waived',
                    })
                  }
                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
                >
                  <option value="required">Required</option>
                  <option value="not_required">Not required</option>
                  <option value="waived">Waived</option>
                </select>
              </div>
              {assignmentForm.status === 'not_required' && (
                <input
                  placeholder="Reason (not required)"
                  value={assignmentForm.notRequiredReason}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, notRequiredReason: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
                />
              )}
              <button
                onClick={saveAssignment}
                disabled={saving}
                className="w-full py-2 bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericFeeTab;
