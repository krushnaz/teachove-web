import React from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { School } from '../../../services/masterAdminSchoolService';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (schoolId: string) => Promise<void>;
  school: School;
  loading: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose, onConfirm, school, loading }) => {
  const { isDarkMode } = useDarkMode();

  const handleConfirm = async () => {
    const schoolId = school.id || school.schoolId || '';
    if (!schoolId) return;
    await onConfirm(schoolId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Delete School
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Are you sure you want to delete <span className="font-semibold">{school.schoolName}</span>? 
            This action cannot be undone.
          </p>
          <div className={`p-4 rounded-lg mb-4 ${
            isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
              <strong>Warning:</strong> This will permanently delete the school and all associated data.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex flex-col-reverse sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={`px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-colors touch-manipulation min-h-[44px] ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            } disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2.5 sm:py-2 rounded-lg font-medium text-white transition-colors touch-manipulation min-h-[44px] ${
              loading
                ? 'bg-red-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? 'Deleting...' : 'Delete School'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
