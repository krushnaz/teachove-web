import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  FileDown,
  Loader2,
  Pencil,
  Percent,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { FeeType } from '../../../services/feeTypeService';
import { feeEngineService } from '../../../services/feeEngineService';
import { studentFeesService } from '../../../services/studentFeesService';
import { StudentFeeBreakdown, UnifiedStudent } from '../../../services/unifiedFeesService';
import { toast } from 'react-toastify';
import {
  feesActionBtn,
  feesBtnPrimary,
  feesBtnSecondary,
  feesCard,
  feesInput,
  feesMuted,
  feesSelect,
} from './feesTheme';

const paymentModes = ['Cash', 'UPI', 'Card', 'Net Banking', 'Cheque'];

type AssignmentStatus = 'required' | 'not_required' | 'waived';

function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: Record<string, unknown> } }).response?.data;
    const msg = data?.message || data?.error;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return fallback;
}

interface Props {
  student: UnifiedStudent;
  fee: StudentFeeBreakdown;
  feeType: FeeType;
  schoolId: string;
  yearId: string;
  onRefresh: () => void;
}

const StudentFeeTypeSection: React.FC<Props> = ({
  student,
  fee,
  feeType,
  schoolId,
  yearId,
  onRefresh,
}) => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit' | 'discount' | 'view' | 'delete' | null>(null);
  const [saving, setSaving] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [deletePaymentIds, setDeletePaymentIds] = useState<string[]>([]);
  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentMode: 'Cash', transactionId: '', remarks: '' });
  const [assignmentForm, setAssignmentForm] = useState<{
    baseAmount: string;
    discountAmount: string;
    discountReason: string;
    status: AssignmentStatus;
    notRequiredReason: string;
  }>({
    baseAmount: String(fee.baseAmount ?? fee.due ?? ''),
    discountAmount: String(fee.discountAmount ?? ''),
    discountReason: fee.discountReason || '',
    status: (fee.assignmentStatus as AssignmentStatus) || 'required',
    notRequiredReason: fee.notRequiredReason || '',
  });
  const [selectedPaymentId, setSelectedPaymentId] = useState('');

  const isEngine = feeType.category === 'custom' || (!feeType.legacyTabName && feeType.category !== 'school_fee');
  const isSchool = feeType.category === 'school_fee';
  const legacy = feeType.legacyTabName as 'Admission' | 'Uniform' | 'Bag' | 'Book' | undefined;
  const paymentBlocked =
    fee.assignmentStatus === 'waived' || fee.assignmentStatus === 'not_required';

  const payments = (fee.payments || fee.transactions || []) as Array<Record<string, unknown>>;

  const getPaymentId = (p: Record<string, unknown>) =>
    String(p.paymentId || p.id || p.admissionFormFeeId || p.uniformFeeId || p.bagFeeId || p.feeId || '');

  const getPaymentAmount = (p: Record<string, unknown>) =>
    Number(p.amount ?? p.formFeeAmount ?? p.bookSetAmount ?? p.bagAmount ?? 0);

  const fillPaymentForm = (p: Record<string, unknown>) => {
    setSelectedPaymentId(getPaymentId(p));
    setPaymentForm({
      amount: String(getPaymentAmount(p)),
      paymentMode: String(p.paymentMode || 'Cash'),
      transactionId: String(p.transactionId || ''),
      remarks: String(p.remarks || p.remark || ''),
    });
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const safeName = student.studentName.replace(/[^\w\s-]/g, '').trim() || student.studentId;
      if (isEngine && !isSchool) {
        const feeTypeId = feeType.feeTypeId || feeType.id || '';
        const blob = await feeEngineService.exportReport(schoolId, yearId, {
          feeTypeId,
          classId: student.classId,
          format: 'xlsx',
        });
        downloadBlob(blob, `${fee.feeTypeName}-${safeName}-${yearId}.xlsx`);
        toast.success('Report downloaded');
      } else {
        const blob = await studentFeesService.downloadStudentPaymentReport(schoolId, yearId, student.studentId);
        downloadBlob(blob, `${fee.feeTypeName}-${safeName}-${yearId}.pdf`);
        toast.success('PDF downloaded');
      }
    } catch {
      toast.error('Failed to download report');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDeletePayments = async () => {
    if (deletePaymentIds.length === 0) return toast.error('Select at least one payment');
    setSaving(true);
    try {
      if (isSchool) {
        await studentFeesService.deletePayments(schoolId, yearId, student.studentId, deletePaymentIds);
      } else if (legacy) {
        await Promise.all(
          deletePaymentIds.map((id) => studentFeesService.deleteMiscFee(legacy, id, schoolId, student.studentId))
        );
      } else if (isEngine) {
        await Promise.all(
          deletePaymentIds.map((id) => feeEngineService.deletePayment(schoolId, yearId, id))
        );
      }
      toast.success('Payment(s) deleted');
      setMode(null);
      setDeletePaymentIds([]);
      onRefresh();
    } catch {
      toast.error('Failed to delete payment(s)');
    } finally {
      setSaving(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === 'paid' || status === 'Paid') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    }
    if (status === 'partial' || status === 'partially paid') {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    }
    if (status === 'waived' || fee.assignmentStatus === 'waived') {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
    }
    return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
  };

  const saveSchoolPayment = async (isEdit: boolean) => {
    const amount = Number(paymentForm.amount) || 0;
    if (amount <= 0) return toast.error('Enter valid amount');
    setSaving(true);
    try {
      if (isEdit && selectedPaymentId) {
        await studentFeesService.updatePayment(schoolId, yearId, student.studentId, selectedPaymentId, {
          installment: 'Installment',
          studentId: student.studentId,
          classId: student.classId,
          amount,
          paymentMode: paymentForm.paymentMode,
          transactionId: paymentForm.transactionId,
          remarks: paymentForm.remarks,
          date: new Date().toISOString(),
        });
      } else {
        await studentFeesService.addPayment(yearId, {
          schoolId,
          studentId: student.studentId,
          classId: student.classId,
          amount,
          paymentMode: paymentForm.paymentMode,
          transactionId: paymentForm.transactionId,
          remarks: paymentForm.remarks,
          date: new Date().toISOString(),
          installment: 'Installment',
        });
      }
      toast.success('Payment saved');
      setMode(null);
      onRefresh();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to save payment'));
    } finally {
      setSaving(false);
    }
  };

  const saveMiscPayment = async () => {
    const amount = Number(paymentForm.amount) || 0;
    if (!legacy || amount <= 0) return toast.error('Enter valid amount');
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        schoolId,
        studentId: student.studentId,
        classId: student.classId,
        yearId,
        paymentMode: paymentForm.paymentMode,
        transactionId: paymentForm.transactionId,
        remarks: paymentForm.remarks,
        date: new Date().toISOString(),
      };
      if (legacy === 'Admission') payload.formFeeAmount = amount;
      else if (legacy === 'Book') payload.bookSetAmount = amount;
      else if (legacy === 'Bag') payload.bagAmount = amount;
      else payload.amount = amount;

      if (mode === 'edit' && selectedPaymentId) {
        await studentFeesService.updateMiscFee(legacy, selectedPaymentId, payload);
      } else {
        await studentFeesService.addMiscFee(legacy, payload);
      }
      toast.success('Payment saved');
      setMode(null);
      onRefresh();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to save payment'));
    } finally {
      setSaving(false);
    }
  };

  const saveEnginePayment = async () => {
    const amount = Number(paymentForm.amount) || 0;
    if (amount <= 0) return toast.error('Enter valid amount');
    setSaving(true);
    try {
      const feeTypeId = feeType.feeTypeId || feeType.id || '';
      if (mode === 'edit' && selectedPaymentId) {
        await feeEngineService.updatePayment(schoolId, yearId, selectedPaymentId, {
          amount,
          paymentMode: paymentForm.paymentMode,
          transactionId: paymentForm.transactionId,
          remarks: paymentForm.remarks,
        });
      } else {
        await feeEngineService.addPayment(schoolId, yearId, {
          studentId: student.studentId,
          feeTypeId,
          amount,
          paymentMode: paymentForm.paymentMode,
          transactionId: paymentForm.transactionId,
          remarks: paymentForm.remarks,
        });
      }
      toast.success('Payment saved');
      setMode(null);
      onRefresh();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to save payment'));
    } finally {
      setSaving(false);
    }
  };

  const saveDiscount = async () => {
    const feeTypeId = feeType.feeTypeId || feeType.id || fee.feeTypeId;
    if (!feeTypeId) return toast.error('Fee type not found');
    setSaving(true);
    try {
      await feeEngineService.upsertStudentFeeAssignment(schoolId, yearId, student.studentId, feeTypeId, {
        baseAmount: Number(assignmentForm.baseAmount) || 0,
        discountAmount: Number(assignmentForm.discountAmount) || 0,
        discountReason: assignmentForm.discountReason,
        status: assignmentForm.status,
        notRequiredReason: assignmentForm.notRequiredReason,
        actorRole: user?.role,
      });
      toast.success('Fee updated');
      setMode(null);
      onRefresh();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to update fee'));
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (mode === 'discount') return saveDiscount();
    if (isSchool) return saveSchoolPayment(mode === 'edit');
    if (legacy) return saveMiscPayment();
    if (isEngine) return saveEnginePayment();
  };

  const feeProgress = fee.due > 0 ? Math.min(100, Math.round((fee.paid / fee.due) * 100)) : fee.paid > 0 ? 100 : 0;

  const formFieldClass = `${feesInput(isDarkMode)} w-full`;

  const ActionButton = ({
    icon: Icon,
    label,
    onClick,
    variant = 'outline',
    disabled = false,
  }: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'outline' | 'danger';
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${feesActionBtn(isDarkMode, variant)} disabled:opacity-50`}
    >
      {disabled && label === 'PDF' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
      {label}
    </button>
  );

  return (
    <div className={`overflow-hidden shadow-sm ${feesCard(isDarkMode)}`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`w-full p-4 text-left transition-colors ${isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold ${isDarkMode ? 'bg-primary-900/40 text-primary-300' : 'bg-primary-50 text-primary-700'}`}>
            ₹
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{fee.feeTypeName}</p>
              <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium shrink-0 capitalize ${statusColor(fee.paymentStatus)}`}>
                {fee.assignmentStatus === 'waived' ? 'waived' : fee.paymentStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { l: 'Due', v: fee.due, c: isDarkMode ? 'text-blue-400' : 'text-blue-600' },
                { l: 'Paid', v: fee.paid, c: isDarkMode ? 'text-green-400' : 'text-green-600' },
                { l: 'Bal.', v: fee.balance, c: isDarkMode ? 'text-orange-400' : 'text-orange-600' },
              ].map((x) => (
                <div key={x.l} className={`rounded-lg px-2.5 py-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${feesMuted(isDarkMode)}`}>{x.l}</p>
                  <p className={`text-base font-bold ${x.c}`}>₹{x.v.toLocaleString()}</p>
                </div>
              ))}
            </div>
            {fee.due > 0 && (
              <div className="mt-3 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${feeProgress}%` }} />
              </div>
            )}
            {payments.length > 0 && (
              <p className={`text-sm mt-2 ${feesMuted(isDarkMode)}`}>{payments.length} payment(s)</p>
            )}
            {((fee.discountAmount || 0) > 0 || fee.assignmentStatus === 'waived') && (
              <div className={`flex flex-wrap gap-2 mt-2 text-sm ${feesMuted(isDarkMode)}`}>
                {(fee.baseAmount || 0) > fee.due && (
                  <span>Fee ₹{(fee.baseAmount || 0).toLocaleString()}</span>
                )}
                {(fee.discountAmount || 0) > 0 && (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Discount −₹{(fee.discountAmount || 0).toLocaleString()}
                  </span>
                )}
                {fee.assignmentStatus === 'waived' && (
                  <span className="text-purple-600 dark:text-purple-400 font-medium">Waived</span>
                )}
                {fee.discountReason ? (
                  <span className="italic">{fee.discountReason}</span>
                ) : null}
              </div>
            )}
          </div>
          <span className={`shrink-0 ${feesMuted(isDarkMode)}`}>
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </span>
        </div>
      </button>

      {expanded && (
        <div className={`px-4 pb-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          {(fee.discountAmount || 0) > 0 && (
            <p className={`text-sm mt-3 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              Discount: ₹{fee.discountAmount?.toLocaleString()}
            </p>
          )}
          <p className={`text-sm font-medium mt-4 mb-3 ${feesMuted(isDarkMode)}`}>Actions</p>
          <div className="grid grid-cols-3 gap-2">
            <ActionButton
              icon={Plus}
              label="Add"
              variant="primary"
              disabled={paymentBlocked}
              onClick={() => {
                if (paymentBlocked) {
                  toast.info(
                    fee.assignmentStatus === 'waived'
                      ? 'This fee is waived. Change status to Required under Discount to collect payment.'
                      : 'This fee is marked not required.'
                  );
                  return;
                }
                setMode('add');
                setPaymentForm({ amount: '', paymentMode: 'Cash', transactionId: '', remarks: '' });
              }}
            />
            <ActionButton
              icon={Eye}
              label="View"
              onClick={() => {
                if (payments.length) setMode('view');
                else toast.info('No payments yet');
              }}
            />
            <ActionButton
              icon={Pencil}
              label="Edit"
              onClick={() => {
                if (!payments.length) return toast.info('No payments to edit');
                setMode('edit');
                fillPaymentForm(payments[0]);
              }}
            />
            <ActionButton
              icon={Trash2}
              label="Delete"
              variant="danger"
              onClick={() => {
                if (!payments.length) return toast.info('No payments to delete');
                setMode('delete');
                setDeletePaymentIds([getPaymentId(payments[0])].filter(Boolean));
              }}
            />
            <ActionButton
              icon={FileDown}
              label={downloadingPdf ? '...' : 'PDF'}
              disabled={downloadingPdf}
              onClick={handleDownloadPdf}
            />
            <ActionButton
              icon={Percent}
              label="Discount"
              onClick={() => {
                setMode('discount');
                setAssignmentForm({
                  baseAmount: String(fee.baseAmount ?? fee.due ?? ''),
                  discountAmount: String(fee.discountAmount ?? ''),
                  discountReason: fee.discountReason || '',
                  status: (fee.assignmentStatus as AssignmentStatus) || 'required',
                  notRequiredReason: fee.notRequiredReason || '',
                });
              }}
            />
          </div>

          {mode === 'view' && (
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {payments.map((p, i) => (
                <div key={i} className={`p-3 rounded-lg text-base ${isDarkMode ? 'bg-gray-900/80 border border-gray-700' : 'bg-gray-50 border border-gray-100'}`}>
                  <p className="font-medium">₹{getPaymentAmount(p).toLocaleString()} · {String(p.paymentMode || '-')}</p>
                  {p.transactionId ? <p className={`text-sm mt-1 ${feesMuted(isDarkMode)}`}>Txn: {String(p.transactionId)}</p> : null}
                  {(p.remarks || p.remark) ? <p className={`text-sm ${feesMuted(isDarkMode)}`}>Remarks: {String(p.remarks || p.remark)}</p> : null}
                  {p.date || p.createdAt ? <p className={`text-sm ${feesMuted(isDarkMode)}`}>Date: {String(p.date || p.createdAt)}</p> : null}
                </div>
              ))}
            </div>
          )}

          {mode === 'delete' && payments.length > 0 && (
            <div className="mt-4 space-y-3">
              <p className={`text-sm ${feesMuted(isDarkMode)}`}>Select payment(s) to delete. This cannot be undone.</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {payments.map((p, i) => {
                  const pid = getPaymentId(p);
                  if (!pid) return null;
                  return (
                    <label key={i} className={`flex items-center gap-3 p-3 rounded-lg text-base cursor-pointer ${isDarkMode ? 'bg-gray-900/80 border border-gray-700' : 'bg-gray-50 border border-gray-100'}`}>
                      <input
                        type="checkbox"
                        checked={deletePaymentIds.includes(pid)}
                        onChange={(e) => {
                          setDeletePaymentIds((prev) =>
                            e.target.checked ? [...prev, pid] : prev.filter((id) => id !== pid)
                          );
                        }}
                      />
                      <span>₹{getPaymentAmount(p).toLocaleString()} · {String(p.paymentMode || '-')}</span>
                    </label>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setMode(null); setDeletePaymentIds([]); }} className={`flex-1 ${feesBtnSecondary(isDarkMode)}`}>
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button type="button" onClick={handleDeletePayments} disabled={saving || deletePaymentIds.length === 0} className={`flex-1 ${feesBtnPrimary} !bg-red-600 hover:!bg-red-700`}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {saving ? 'Deleting...' : `Delete (${deletePaymentIds.length})`}
                </button>
              </div>
            </div>
          )}

          {(mode === 'add' || mode === 'edit') && (
            <div className="mt-4 space-y-3">
              {mode === 'edit' && payments.length > 1 && (
                <select
                  value={selectedPaymentId}
                  onChange={(e) => {
                    setSelectedPaymentId(e.target.value);
                    const p = payments.find((x) => getPaymentId(x) === e.target.value);
                    if (p) fillPaymentForm(p);
                  }}
                  className={formFieldClass}
                >
                  {payments.map((p, i) => (
                    <option key={i} value={getPaymentId(p)}>
                      ₹{getPaymentAmount(p).toLocaleString()} — {String(p.paymentMode || '')}
                    </option>
                  ))}
                </select>
              )}
              <input type="number" placeholder="Amount" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} className={formFieldClass} />
              <select value={paymentForm.paymentMode} onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })} className={formFieldClass}>
                {paymentModes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <input placeholder="Transaction ID" value={paymentForm.transactionId} onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })} className={formFieldClass} />
              <textarea placeholder="Remarks" value={paymentForm.remarks} onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })} className={formFieldClass} rows={2} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setMode(null)} className={`flex-1 ${feesBtnSecondary(isDarkMode)}`}>
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button type="button" onClick={handleSave} disabled={saving} className={`flex-1 ${feesBtnPrimary}`}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}

          {mode === 'discount' && (
            <div className="mt-4 space-y-3">
              <input
                type="number"
                placeholder="Fee amount"
                value={assignmentForm.baseAmount}
                readOnly={isSchool}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, baseAmount: e.target.value })}
                className={formFieldClass}
              />
              <input type="number" placeholder="Discount (₹)" value={assignmentForm.discountAmount} onChange={(e) => setAssignmentForm({ ...assignmentForm, discountAmount: e.target.value })} className={formFieldClass} />
              <input placeholder="Discount / waiver reason" value={assignmentForm.discountReason} onChange={(e) => setAssignmentForm({ ...assignmentForm, discountReason: e.target.value })} className={formFieldClass} />
              <select value={assignmentForm.status} onChange={(e) => setAssignmentForm({ ...assignmentForm, status: e.target.value as AssignmentStatus })} className={formFieldClass}>
                <option value="required">Required — collect fee</option>
                <option value="waived">Waived — no payment needed</option>
                <option value="not_required">Not required</option>
              </select>
              <div className={`p-3 rounded-lg text-base font-medium flex justify-between ${isDarkMode ? 'bg-primary-900/30 border border-primary-800' : 'bg-primary-50 border border-primary-100'}`}>
                <span>Net due after discount</span>
                <span>
                  ₹
                  {(
                    assignmentForm.status === 'waived' || assignmentForm.status === 'not_required'
                      ? 0
                      : Math.max(0, (Number(assignmentForm.baseAmount) || 0) - (Number(assignmentForm.discountAmount) || 0))
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setMode(null)} className={`flex-1 ${feesBtnSecondary(isDarkMode)}`}>
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button type="button" onClick={handleSave} disabled={saving} className={`flex-1 ${feesBtnPrimary}`}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentFeeTypeSection;
