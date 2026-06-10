import React from 'react';
import { AlertCircle, ShoppingCart, XCircle, Clock } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { CanAddStudentsResponse } from '../../services/subscriptionService';
import {
  resolveCanAddStatus,
  resolveBlockTitle,
  resolveBlockMessage,
  showSlotUsage,
  getPurchaseButtonLabel,
} from '../../utils/subscriptionStudentGuard';

interface SubscriptionStudentBlockModalProps {
  open: boolean;
  onClose: () => void;
  data: CanAddStudentsResponse;
  role: 'school' | 'teacher';
  onPurchase?: () => void;
}

const SubscriptionStudentBlockModal: React.FC<SubscriptionStudentBlockModalProps> = ({
  open,
  onClose,
  data,
  role,
  onPurchase,
}) => {
  const { isDarkMode } = useDarkMode();

  if (!open) return null;

  const status = resolveCanAddStatus(data);
  const title = resolveBlockTitle(data);
  const message = resolveBlockMessage(data, role);
  const showPurchase = role === 'school' && onPurchase && status !== 'can_add';

  const iconConfig = {
    no_plan: { Icon: ShoppingCart, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' },
    expired: { Icon: Clock, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' },
    limit_reached: { Icon: AlertCircle, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
    can_add: { Icon: AlertCircle, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
  }[status] || { Icon: XCircle, bg: 'bg-gray-100 dark:bg-gray-800', color: 'text-gray-600' };

  const { Icon, bg, color } = iconConfig;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full max-w-lg transform transition-all overflow-hidden rounded-md border shadow-2xl ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${bg}`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
              <div className={`mt-3 space-y-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <p>{message}</p>
                {showSlotUsage(data) && (
                  <p>
                    Student slots used:{' '}
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{data.currentStudents}</span> of{' '}
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{data.totalSubscribedSlots}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 text-sm font-bold uppercase tracking-wider rounded transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Close
            </button>
            {showPurchase && (
              <button
                type="button"
                onClick={onPurchase}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold uppercase tracking-wider rounded hover:bg-indigo-700 shadow-sm transition-all"
              >
                {getPurchaseButtonLabel(data)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStudentBlockModal;
