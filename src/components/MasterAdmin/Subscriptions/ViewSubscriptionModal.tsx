import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { SubscriptionRequest, masterAdminSubscriptionService } from '../../../services/masterAdminSubscriptionService';
import {
  X,
  Building,
  Users,
  DollarSign,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Mail,
  Phone,
  MapPin,
  Crown
} from 'lucide-react';
import { toast } from 'react-toastify';

interface ViewSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionRequest;
  onStatusUpdate: (newStatus: 'approved' | 'pending') => Promise<void>;
  loading: boolean;
}

const ViewSubscriptionModal: React.FC<ViewSubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onStatusUpdate,
  loading
}) => {
  const { isDarkMode } = useDarkMode();
  const [detailedSubscription, setDetailedSubscription] = useState<SubscriptionRequest | null>(subscription);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (isOpen && subscription) {
      fetchDetailedSubscription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchDetailedSubscription = async () => {
    try {
      setLoadingDetails(true);
      const subscriptionId = subscription.id || subscription.subscriptionId;
      const response = await masterAdminSubscriptionService.getSubscriptionById(subscriptionId);
      setDetailedSubscription(response.subscription);
    } catch (error: any) {
      console.error('Error fetching subscription details:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setLoadingDetails(false);
    }
  };

  if (!isOpen) return null;

  const sub = detailedSubscription || subscription;
  const subscriptionId = sub.id || sub.subscriptionId || '';
  
  // Calculate total amount with safe defaults
  const costPerUser = sub.subscription_cost_per_user ?? 0;
  const numUsers = sub.num_of_users ?? 0;
  const totalAmount = sub.amount ?? (costPerUser * numUsers);

  const formatDate = (timestamp?: { _seconds: number; _nanoseconds?: number } | null) => {
    if (!timestamp || timestamp._seconds == null) return '-';
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusChip = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="w-4 h-4" />
          Approved
        </span>
      );
    } else if (statusLower === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Clock className="w-4 h-4" />
          Pending
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <XCircle className="w-4 h-4" />
          {status === 'rejected' ? 'Rejected' : 'Denied'}
        </span>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className={`relative w-full max-w-4xl rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 flex items-center justify-between p-4 sm:p-6 border-b z-10 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="min-w-0 flex-1 pr-2">
            <h2 className={`text-lg sm:text-2xl font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Subscription Details
            </h2>
            <p className={`mt-1 text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {sub.schoolName || 'Unknown School'}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {loadingDetails ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-6">
            {/* School Information */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Building className="w-5 h-5" />
                School Information
              </h3>
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
              } rounded-lg p-4`}>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    School Name
                  </p>
                  <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {sub.schoolName || 'N/A'}
                  </p>
                </div>
                {sub.schoolEmail && (
                  <div className="flex items-start gap-2">
                    <Mail className={`w-4 h-4 mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Email
                      </p>
                      <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {sub.schoolEmail}
                      </p>
                    </div>
                  </div>
                )}
                {sub.schoolPhone && (
                  <div className="flex items-start gap-2">
                    <Phone className={`w-4 h-4 mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Phone
                      </p>
                      <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {sub.schoolPhone}
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    School ID
                  </p>
                  <p className={`mt-1 font-mono text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {sub.school_id}
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <FileText className="w-5 h-5" />
                Subscription Details
              </h3>
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
              } rounded-lg p-4`}>
                <div className="flex items-start gap-2">
                  <Crown className={`w-4 h-4 mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Subscription Type
                    </p>
                    <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {sub.subscription_type || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className={`w-4 h-4 mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Number of Users
                    </p>
                    <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {sub.num_of_users}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className={`w-4 h-4 mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Cost Per User
                    </p>
                    <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ₹{sub.subscription_cost_per_user?.toLocaleString('en-IN') || '0'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className={`w-4 h-4 mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Total Amount
                    </p>
                    <p className={`mt-1 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                {sub.remaining_amount && sub.remaining_amount > 0 && (
                  <div className="flex items-start gap-2">
                    <DollarSign className={`w-4 h-4 mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Remaining Amount
                      </p>
                      <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ₹{sub.remaining_amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <CreditCard className={`w-4 h-4 mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Payment Method
                    </p>
                    <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {sub.payment_method || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <CheckCircle className="w-5 h-5" />
                Status Information
              </h3>
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
              } rounded-lg p-4`}>
                <div>
                  <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Approval Status
                  </p>
                  {getStatusChip(sub.approve_status)}
                </div>
                <div>
                  <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Payment Status
                  </p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    sub.payment_status === 'paid' || sub.payment_status === 'successful'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : sub.payment_status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {sub.payment_status || 'N/A'}
                  </span>
                </div>
                {sub.razorpay_payment_id && (
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Razorpay Payment ID
                    </p>
                    <p className={`mt-1 font-mono text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {sub.razorpay_payment_id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Calendar className="w-5 h-5" />
                Timestamps
              </h3>
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
              } rounded-lg p-4`}>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Request Created At
                  </p>
                  <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(sub.request_created_at)}
                  </p>
                </div>
                {sub.payment_created_at && (
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Payment Created At
                    </p>
                    <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(sub.payment_created_at)}
                    </p>
                  </div>
                )}
                {sub.updated_at && (
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Last Updated
                    </p>
                    <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(sub.updated_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`flex justify-end gap-3 pt-4 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              {sub.approve_status.toLowerCase() !== 'approved' && (
                <button
                  onClick={() => onStatusUpdate('approved')}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 ${
                    loading
                      ? 'bg-green-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Approve
                </button>
              )}
              {sub.approve_status.toLowerCase() !== 'pending' && (
                <button
                  onClick={() => onStatusUpdate('pending')}
                  disabled={loading}
                  className={`px-4 py-2.5 sm:py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 touch-manipulation min-h-[44px] ${
                    loading
                      ? 'bg-yellow-400 cursor-not-allowed'
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  Mark as Pending
                </button>
              )}
              <button
                onClick={onClose}
                className={`px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-colors touch-manipulation min-h-[44px] ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSubscriptionModal;
