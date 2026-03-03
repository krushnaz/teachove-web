import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { masterAdminSubscriptionService, SubscriptionRequest } from '../../../services/masterAdminSubscriptionService';
import {
  ArrowLeft,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Building,
  Users,
  Calendar,
  Trash2,
  Crown
} from 'lucide-react';
import { toast } from 'react-toastify';
import MasterAdminLayout from '../Layout';
import ViewSubscriptionModal from './ViewSubscriptionModal';
import DeleteConfirmModal from './DeleteConfirmModal';

interface LocationState {
  schoolName?: string;
  subscriptions?: SubscriptionRequest[];
}

const SchoolSubscriptionHistory: React.FC = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useDarkMode();
  const state = (location.state || {}) as LocationState;

  const [schoolName, setSchoolName] = useState(state.schoolName || '');
  const [subscriptions, setSubscriptions] = useState<SubscriptionRequest[]>(state.subscriptions || []);
  const [loading, setLoading] = useState(!state.subscriptions?.length);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionRequest | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    subscriptionId: string;
    newStatus: 'approved' | 'pending' | 'rejected' | 'denied';
    schoolName: string;
  } | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<SubscriptionRequest | null>(null);

  useEffect(() => {
    const decodedId = schoolId ? decodeURIComponent(schoolId) : '';
    if (!decodedId) {
      setLoading(false);
      return;
    }
    if (state.subscriptions?.length) {
      setSubscriptions(state.subscriptions);
      setSchoolName(state.schoolName || '');
      setLoading(false);
      return;
    }
    fetchSubscriptionsForSchool(decodedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  const fetchSubscriptionsForSchool = async (sid: string) => {
    try {
      setLoading(true);
      const response = await masterAdminSubscriptionService.getAllSubscriptionRequests();
      const valid = (response.subscriptions || []).filter(
        (sub: SubscriptionRequest) =>
          sub != null &&
          (sub.id || sub.subscriptionId) &&
          ((sub.school_id || sub.schoolName || '').trim() === sid)
      );
      setSubscriptions(valid);
      if (valid.length > 0 && !schoolName) setSchoolName(valid[0].schoolName || sid);
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast.error(error.message || 'Failed to load subscription history');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshHistory = async () => {
    const decodedId = schoolId ? decodeURIComponent(schoolId) : '';
    if (decodedId) await fetchSubscriptionsForSchool(decodedId);
  };

  const handleStatusToggle = (subscription: SubscriptionRequest) => {
    const subscriptionId = subscription.id || subscription.subscriptionId || '';
    const currentStatus = (subscription.approve_status || 'pending').toLowerCase();
    const newStatus: 'approved' | 'pending' | 'rejected' | 'denied' =
      currentStatus === 'approved' ? 'pending' : 'approved';
    setPendingStatusUpdate({
      subscriptionId,
      newStatus,
      schoolName: subscription.schoolName || schoolName || 'Unknown School',
    });
    setConfirmModalOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!pendingStatusUpdate) return;
    try {
      setActionLoading(pendingStatusUpdate.subscriptionId);
      await masterAdminSubscriptionService.updateSubscriptionStatus(
        pendingStatusUpdate.subscriptionId,
        pendingStatusUpdate.newStatus
      );
      toast.success(`Status updated to ${pendingStatusUpdate.newStatus} successfully`);
      await refreshHistory();
      setConfirmModalOpen(false);
      setPendingStatusUpdate(null);
    } catch (error: any) {
      console.error('Error updating subscription status:', error);
      const message = error?.response?.message || error.message || 'Failed to update subscription status';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const cancelStatusUpdate = () => {
    setConfirmModalOpen(false);
    setPendingStatusUpdate(null);
  };

  const handleDeleteClick = (subscription: SubscriptionRequest) => {
    setSubscriptionToDelete(subscription);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!subscriptionToDelete) return;
    try {
      const id = subscriptionToDelete.id || subscriptionToDelete.subscriptionId || '';
      setActionLoading(id);
      await masterAdminSubscriptionService.deleteSubscriptionRequest(id);
      toast.success('Subscription request deleted successfully');
      await refreshHistory();
      setDeleteModalOpen(false);
      setSubscriptionToDelete(null);
    } catch (error: any) {
      console.error('Error deleting subscription:', error);
      const message = error?.response?.message || error.message || 'Failed to delete subscription request';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setSubscriptionToDelete(null);
  };

  const openViewModal = (e: React.MouseEvent, subscription: SubscriptionRequest) => {
    e.stopPropagation();
    setSelectedSubscription(subscription);
    setViewModalOpen(true);
  };

  const getStatusChip = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="w-3 h-3" />
          Approved
        </span>
      );
    }
    if (s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        <XCircle className="w-3 h-3" />
        {status === 'rejected' ? 'Rejected' : 'Denied'}
      </span>
    );
  };

  const getPaymentStatusChip = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'paid' || s === 'successful') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Paid
        </span>
      );
    }
    if (s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        Failed
      </span>
    );
  };

  const formatDate = (timestamp?: { _seconds: number; _nanoseconds?: number } | null) => {
    if (!timestamp || timestamp._seconds == null) return '-';
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    const aSec = a.request_created_at?._seconds ?? 0;
    const bSec = b.request_created_at?._seconds ?? 0;
    return bSec - aSec;
  });

  if (loading) {
    return (
      <MasterAdminLayout title="Subscription History">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </MasterAdminLayout>
    );
  }

  return (
    <MasterAdminLayout
      title="Subscription History"
      subtitle={schoolName ? `All purchased plans for ${schoolName}` : 'Previous purchased plans'}
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            onClick={() => navigate('/master-admin/subscription-request')}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDarkMode
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to subscription list
          </button>
          {schoolName && (
            <div className="flex items-center gap-2">
              <Building className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {schoolName}
              </span>
            </div>
          )}
        </div>

        <div
          className={`rounded-xl border overflow-hidden ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          {sortedSubscriptions.length === 0 ? (
            <div
              className={`text-center py-12 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <Crown className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No subscription history for this school
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
                  className={`${
                    isDarkMode ? 'bg-gray-900 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'
                  }`}
                >
                  <tr>
                    <th
                      className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Type
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Users
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Amount
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Payment Status
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Approval Status
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Active / Expired
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Purchase Date
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Expiry Date
                    </th>
                    <th
                      className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {sortedSubscriptions.map((subscription) => {
                    const subscriptionId = subscription.id || subscription.subscriptionId || '';
                    const isActionLoading = actionLoading === subscriptionId;
                    const costPerUser = subscription.subscription_cost_per_user ?? 0;
                    const numUsers = subscription.num_of_users ?? 0;
                    const totalAmount = subscription.amount ?? costPerUser * numUsers;
                    const isActive = subscription.active ?? false;
                    const purchaseDate = subscription.purchaseDate ?? subscription.request_created_at;
                    const expiryAt = subscription.expiryAt ?? null;
                    return (
                      <tr
                        key={subscriptionId}
                        className={`transition-colors hover:${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                      >
                        <td
                          className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                              subscription.subscription_type === 'Both'
                                ? 'bg-purple-600 text-white dark:bg-purple-700 dark:text-white'
                                : 'bg-blue-600 text-white dark:bg-blue-700 dark:text-white'
                            }`}
                          >
                            {subscription.subscription_type || 'N/A'}
                          </span>
                        </td>
                        <td
                          className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <Users className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            {numUsers}
                          </div>
                        </td>
                        <td
                          className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          ₹{totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          {getPaymentStatusChip(subscription.payment_status)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {getStatusChip(subscription.approve_status)}
                            <button
                              onClick={() => handleStatusToggle(subscription)}
                              disabled={isActionLoading}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                (subscription.approve_status || '').toLowerCase() === 'approved'
                                  ? isDarkMode
                                    ? 'bg-green-600'
                                    : 'bg-green-600'
                                  : isDarkMode
                                    ? 'bg-gray-600'
                                    : 'bg-gray-300'
                              }`}
                              title={
                                (subscription.approve_status || '').toLowerCase() === 'approved'
                                  ? 'Click to set as Pending'
                                  : 'Click to Approve'
                              }
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  (subscription.approve_status || '').toLowerCase() === 'approved'
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          {expiryAt ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {isActive ? 'Active' : 'Expired'}
                            </span>
                          ) : (
                            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>—</span>
                          )}
                        </td>
                        <td
                          className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            {formatDate(purchaseDate)}
                          </div>
                        </td>
                        <td
                          className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            {formatDate(expiryAt)}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1 sm:gap-2">
                            <button
                              onClick={(e) => openViewModal(e, subscription)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode
                                  ? 'text-gray-400 hover:bg-gray-700 hover:text-blue-400'
                                  : 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'
                              }`}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(subscription)}
                              disabled={isActionLoading}
                              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                isDarkMode
                                  ? 'text-gray-400 hover:bg-gray-700 hover:text-red-400'
                                  : 'text-gray-500 hover:bg-gray-100 hover:text-red-600'
                              }`}
                              title="Delete Subscription"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedSubscription && (
          <ViewSubscriptionModal
            isOpen={viewModalOpen}
            onClose={() => {
              setViewModalOpen(false);
              setSelectedSubscription(null);
            }}
            subscription={selectedSubscription}
            onStatusUpdate={async (newStatus: 'approved' | 'pending') => {
              const id = selectedSubscription.id || selectedSubscription.subscriptionId || '';
              setPendingStatusUpdate({
                subscriptionId: id,
                newStatus,
                schoolName: selectedSubscription.schoolName || schoolName || 'Unknown School',
              });
              setViewModalOpen(false);
              setConfirmModalOpen(true);
            }}
            loading={actionLoading === (selectedSubscription.id || selectedSubscription.subscriptionId)}
          />
        )}

        {confirmModalOpen && pendingStatusUpdate && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
            <div
              className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl ${
                isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      pendingStatusUpdate.newStatus === 'approved'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-yellow-100 dark:bg-yellow-900/30'
                    }`}
                  >
                    {pendingStatusUpdate.newStatus === 'approved' ? (
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Confirm Status Update
                    </h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {pendingStatusUpdate.schoolName}
                    </p>
                  </div>
                </div>
                <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Are you sure you want to change the subscription status to{' '}
                  <span className="font-semibold">
                    {pendingStatusUpdate.newStatus === 'approved' ? 'Approved' : 'Pending'}
                  </span>
                  ?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={cancelStatusUpdate}
                    disabled={actionLoading === pendingStatusUpdate.subscriptionId}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStatusUpdate}
                    disabled={actionLoading === pendingStatusUpdate.subscriptionId}
                    className="px-4 py-2.5 sm:py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 touch-manipulation min-h-[44px] bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading === pendingStatusUpdate.subscriptionId ? 'Updating...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteModalOpen && subscriptionToDelete && (
          <DeleteConfirmModal
            isOpen={deleteModalOpen}
            subscription={subscriptionToDelete}
            onClose={cancelDelete}
            onConfirm={confirmDelete}
            loading={actionLoading === (subscriptionToDelete.id || subscriptionToDelete.subscriptionId || '')}
          />
        )}
      </div>
    </MasterAdminLayout>
  );
};

export default SchoolSubscriptionHistory;
