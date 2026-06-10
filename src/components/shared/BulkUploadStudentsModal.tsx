import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { X, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { classroomService, Classroom } from '../../services/classroomService';
import {
  studentService,
  BulkUploadStudentsResponse,
  BulkUploadStudentError,
  BulkUploadError,
} from '../../services/studentService';
import { subscriptionService } from '../../services/subscriptionService';
import { CanAddStudentsResponse } from '../../services/subscriptionService';
import SubscriptionStudentBlockModal from '../shared/SubscriptionStudentBlockModal';

interface BulkUploadStudentsModalProps {
  open: boolean;
  onClose: () => void;
  schoolId: string;
  onSuccess: () => void;
  fixedClassId?: string;
  fixedClassLabel?: string;
  role?: 'school' | 'teacher';
  onPurchaseSubscription?: () => void;
}

interface UploadFeedbackDialog {
  type: 'error' | 'warning' | 'success';
  title: string;
  message: string;
  errors?: BulkUploadStudentError[];
  successCount?: number;
  failedCount?: number;
}

const currentAdmissionYear = () => {
  const year = new Date().getFullYear();
  return `${year}-${year + 1}`;
};

const formatClassLabel = (className?: string, section?: string, fallback = ''): string => {
  const label = [className, section].filter(Boolean).join('-');
  return label || fallback;
};

const BulkUploadStudentsModal: React.FC<BulkUploadStudentsModalProps> = ({
  open,
  onClose,
  schoolId,
  onSuccess,
  fixedClassId,
  fixedClassLabel,
  role = 'school',
  onPurchaseSubscription,
}) => {
  const { isDarkMode } = useDarkMode();
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [classId, setClassId] = useState('');
  const [admissionYear, setAdmissionYear] = useState(currentAdmissionYear());
  const [defaultPassword, setDefaultPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [result, setResult] = useState<BulkUploadStudentsResponse | null>(null);
  const [feedbackDialog, setFeedbackDialog] = useState<UploadFeedbackDialog | null>(null);
  const [subscriptionBlockOpen, setSubscriptionBlockOpen] = useState(false);
  const [subscriptionBlockData, setSubscriptionBlockData] = useState<CanAddStudentsResponse | null>(null);

  useEffect(() => {
    if (!open) return;

    setResult(null);
    setFeedbackDialog(null);
    setSelectedFile(null);
    setAdmissionYear(currentAdmissionYear());
    setDefaultPassword('');
    setClassId(fixedClassId || '');

    const fetchClasses = async () => {
      if (fixedClassId) return;
      try {
        setClassesLoading(true);
        const fetched = await classroomService.getClassesBySchoolId(schoolId);
        setClasses(fetched);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
        setFeedbackDialog({
          type: 'error',
          title: 'Could not load classes',
          message: 'Failed to load class list. Please close and try again.',
        });
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClasses();
  }, [open, schoolId, fixedClassId]);

  const showValidationError = (message: string) => {
    setFeedbackDialog({
      type: 'error',
      title: 'Validation Error',
      message,
    });
  };

  const showUploadFeedback = (response: BulkUploadStudentsResponse) => {
    if (response.failedCount > 0) {
      setFeedbackDialog({
        type: response.successCount > 0 ? 'warning' : 'error',
        title: response.successCount > 0 ? 'Upload Partially Completed' : 'Upload Failed',
        message: response.message,
        errors: response.errors,
        successCount: response.successCount,
        failedCount: response.failedCount,
      });
      return;
    }

    setFeedbackDialog({
      type: 'success',
      title: 'Upload Successful',
      message: response.message || `Successfully added ${response.successCount} student(s).`,
      successCount: response.successCount,
      failedCount: 0,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExt = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    if (!validExt) {
      showValidationError('Please select a valid Excel file (.xlsx or .xls).');
      return;
    }

    setSelectedFile(file);
    setResult(null);
    setFeedbackDialog(null);
  };

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      await studentService.downloadBulkUploadTemplate();
      toast.success('Template downloaded');
    } catch (error: any) {
      setFeedbackDialog({
        type: 'error',
        title: 'Download Failed',
        message: error.message || 'Could not download the Excel template. Please try again.',
      });
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleUpload = async () => {
    const targetClassId = fixedClassId || classId;
    if (!targetClassId) {
      showValidationError('Please select a class before uploading.');
      return;
    }
    if (!selectedFile) {
      showValidationError('Please choose an Excel file to upload.');
      return;
    }
    if (!admissionYear.trim()) {
      showValidationError('Please enter the admission year (e.g. 2025-2026).');
      return;
    }
    if (!defaultPassword.trim()) {
      showValidationError('Password is required.');
      return;
    }
    if (defaultPassword.trim().length < 6) {
      showValidationError('Password must be at least 6 characters.');
      return;
    }

    try {
      const canAdd = await subscriptionService.getCanAddStudents(schoolId);
      if (canAdd && !canAdd.canAdd) {
        setSubscriptionBlockData(canAdd);
        setSubscriptionBlockOpen(true);
        return;
      }

      setUploading(true);
      setFeedbackDialog(null);

      const response = await studentService.bulkUploadStudents({
        schoolId,
        classId: targetClassId,
        admissionYear: admissionYear.trim(),
        defaultPassword: defaultPassword.trim(),
        file: selectedFile,
      });

      setResult(response);
      showUploadFeedback(response);

      if (response.successCount > 0) {
        onSuccess();
      }
    } catch (error: any) {
      if (error instanceof BulkUploadError) {
        setFeedbackDialog({
          type: 'error',
          title: 'Upload Failed',
          message: error.message,
          errors: error.errors,
        });
      } else {
        setFeedbackDialog({
          type: 'error',
          title: 'Upload Failed',
          message: error?.message || 'Something went wrong while uploading. Please try again.',
        });
      }
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  const matchedClass = classes.find((c) => c.classId === classId);
  const selectedClassLabel =
    fixedClassLabel ||
    formatClassLabel(matchedClass?.className, matchedClass?.section);

  const dialogStyles = {
    error: {
      icon: AlertCircle,
      iconBg: isDarkMode ? 'bg-red-900/30' : 'bg-red-100',
      iconColor: 'text-red-600 dark:text-red-400',
      border: isDarkMode ? 'border-red-800/50' : 'border-red-200',
    },
    warning: {
      icon: AlertCircle,
      iconBg: isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100',
      iconColor: 'text-amber-600 dark:text-amber-400',
      border: isDarkMode ? 'border-amber-800/50' : 'border-amber-200',
    },
    success: {
      icon: CheckCircle2,
      iconBg: isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-100',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      border: isDarkMode ? 'border-emerald-800/50' : 'border-emerald-200',
    },
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg border shadow-2xl flex flex-col ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Upload Students (Excel)
            </h3>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Add multiple students to one class using an Excel file
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className={`p-4 rounded-md border text-sm ${isDarkMode ? 'bg-gray-900/50 border-gray-700 text-gray-300' : 'bg-indigo-50 border-indigo-100 text-indigo-900'}`}>
            <p className="font-semibold mb-1">Excel columns</p>
            <p>Name, Roll No, Email, Phone No, Password (all required in Excel)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!fixedClassId ? (
              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Class *
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  disabled={classesLoading || uploading}
                  className={`w-full px-3 py-2.5 text-sm rounded-md border ${
                    isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200'
                  }`}
                >
                  <option value="">Select class</option>
                  {classes.map((c) => (
                    <option key={c.classId} value={c.classId}>
                      {c.className}-{c.section}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Class
                </label>
                <div className={`px-3 py-2.5 text-sm rounded-md border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}>
                  {selectedClassLabel || 'My Class'}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className={`text-xs font-bold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Admission Year *
              </label>
              <input
                type="text"
                value={admissionYear}
                onChange={(e) => setAdmissionYear(e.target.value)}
                disabled={uploading}
                placeholder="2025-2026"
                className={`w-full px-3 py-2.5 text-sm rounded-md border ${
                  isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={defaultPassword}
              onChange={(e) => setDefaultPassword(e.target.value)}
              disabled={uploading}
              required
              minLength={6}
              placeholder="Required — min 6 characters (used when Excel Password cell is empty)"
              className={`w-full px-3 py-2.5 text-sm rounded-md border ${
                isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200'
              }`}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={downloadingTemplate}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border ${
                isDarkMode
                  ? 'border-gray-600 text-gray-200 hover:bg-gray-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Download size={16} />
              {downloadingTemplate ? 'Downloading...' : 'Download Template'}
            </button>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <FileSpreadsheet className={`w-10 h-10 mx-auto mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
              id="bulk-student-file"
            />
            <label
              htmlFor="bulk-student-file"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold cursor-pointer ${
                uploading ? 'opacity-50 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <Upload size={16} />
              Choose Excel File
            </label>
            {selectedFile && (
              <p className={`mt-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Selected: <span className="font-medium">{selectedFile.name}</span>
              </p>
            )}
          </div>

          {result && result.successCount > 0 && result.failedCount === 0 && (
            <div className={`p-4 rounded-md border ${isDarkMode ? 'border-emerald-800/50 bg-emerald-900/20' : 'border-emerald-200 bg-emerald-50'}`}>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{result.message}</p>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {result.successCount} student(s) added successfully.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className={`px-4 py-2 text-sm font-semibold rounded-md ${
              isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || !(fixedClassId || classId) || !selectedFile || !defaultPassword.trim()}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload Students
              </>
            )}
          </button>
        </div>
      </div>

      {feedbackDialog && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
            onClick={() => setFeedbackDialog(null)}
          />
          <div
            className={`relative w-full max-w-lg max-h-[85vh] overflow-hidden rounded-lg border shadow-2xl flex flex-col ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } ${dialogStyles[feedbackDialog.type].border}`}
          >
            <div className="p-6 pb-4">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${dialogStyles[feedbackDialog.type].iconBg}`}>
                  {React.createElement(dialogStyles[feedbackDialog.type].icon, {
                    className: `w-6 h-6 ${dialogStyles[feedbackDialog.type].iconColor}`,
                  })}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {feedbackDialog.title}
                  </h4>
                  <p className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {feedbackDialog.message}
                  </p>
                  {(feedbackDialog.successCount != null || feedbackDialog.failedCount != null) && (
                    <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Added: {feedbackDialog.successCount ?? 0} · Failed: {feedbackDialog.failedCount ?? 0}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setFeedbackDialog(null)}
                  className={`p-1 rounded-full ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {feedbackDialog.errors && feedbackDialog.errors.length > 0 && (
              <div className={`mx-6 mb-4 rounded-md border overflow-hidden ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                  Error Details ({feedbackDialog.errors.length})
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {feedbackDialog.errors.map((err, idx) => (
                    <div
                      key={`${err.row}-${idx}`}
                      className={`px-4 py-2.5 text-sm border-t ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-100 text-gray-700'}`}
                    >
                      <span className="font-semibold">Row {err.row}</span>
                      {err.rollNo ? ` · Roll No: ${err.rollNo}` : ''}
                      {err.phoneNo ? ` · Phone: ${err.phoneNo}` : ''}
                      <br />
                      <span className={isDarkMode ? 'text-red-300' : 'text-red-600'}>{err.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={`px-6 py-4 border-t flex justify-end ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <button
                type="button"
                onClick={() => setFeedbackDialog(null)}
                className={`px-5 py-2 text-sm font-semibold rounded-md ${
                  feedbackDialog.type === 'success'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {subscriptionBlockOpen && subscriptionBlockData && (
        <SubscriptionStudentBlockModal
          open={subscriptionBlockOpen}
          onClose={() => setSubscriptionBlockOpen(false)}
          data={subscriptionBlockData}
          role={role}
          onPurchase={role === 'school' ? onPurchaseSubscription : undefined}
        />
      )}
    </div>
  );
};

export default BulkUploadStudentsModal;
