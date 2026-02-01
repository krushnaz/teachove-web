import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { masterAdminSubscriptionService, SubscriptionRequest } from '../../../services/masterAdminSubscriptionService';
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Crown,
  Building,
  Users,
  Calendar,
  CreditCard,
  FileText,
  Trash2,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-toastify';
import MasterAdminLayout from '../Layout';
import ViewSubscriptionModal from './ViewSubscriptionModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const SubscriptionRequests: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const [subscriptions, setSubscriptions] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await masterAdminSubscriptionService.getAllSubscriptionRequests();
      // Filter out any null/undefined subscriptions and ensure data integrity
      const validSubscriptions = (response.subscriptions || []).filter(
        (sub: SubscriptionRequest) => sub != null && (sub.id || sub.subscriptionId)
      );
      setSubscriptions(validSubscriptions);
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast.error(error.message || 'Failed to load subscription requests');
      setSubscriptions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = (subscription: SubscriptionRequest) => {
    const subscriptionId = subscription.id || subscription.subscriptionId || '';
    const currentStatus = subscription.approve_status.toLowerCase();
    
    // Determine new status based on current status
    let newStatus: 'approved' | 'pending' | 'rejected' | 'denied';
    if (currentStatus === 'approved') {
      newStatus = 'pending';
    } else {
      newStatus = 'approved';
    }
    
    setPendingStatusUpdate({
      subscriptionId,
      newStatus,
      schoolName: subscription.schoolName || 'Unknown School'
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
      toast.success(`Subscription status updated to ${pendingStatusUpdate.newStatus}`);
      await fetchSubscriptions(); // Refresh the list
      setConfirmModalOpen(false);
      setPendingStatusUpdate(null);
    } catch (error: any) {
      console.error('Error updating subscription status:', error);
      toast.error(error.message || 'Failed to update subscription status');
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
      const subscriptionId = subscriptionToDelete.id || subscriptionToDelete.subscriptionId || '';
      setActionLoading(subscriptionId);
      await masterAdminSubscriptionService.deleteSubscriptionRequest(subscriptionId);
      toast.success('Subscription request deleted successfully');
      await fetchSubscriptions(); // Refresh the list
      setDeleteModalOpen(false);
      setSubscriptionToDelete(null);
    } catch (error: any) {
      console.error('Error deleting subscription:', error);
      toast.error(error.message || 'Failed to delete subscription request');
    } finally {
      setActionLoading(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setSubscriptionToDelete(null);
  };

  const openViewModal = (subscription: SubscriptionRequest) => {
    setSelectedSubscription(subscription);
    setViewModalOpen(true);
  };

  const filteredSubscriptions = subscriptions
    .filter(sub => sub != null) // Remove any null/undefined subscriptions
    .filter(sub =>
      sub.schoolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.school_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.subscription_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.approve_status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStatusChip = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="w-3 h-3" />
          Approved
        </span>
      );
    } else if (statusLower === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <XCircle className="w-3 h-3" />
          {status === 'rejected' ? 'Rejected' : 'Denied'}
        </span>
      );
    }
  };

  const getPaymentStatusChip = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'paid' || statusLower === 'successful') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Paid
        </span>
      );
    } else if (statusLower === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Pending
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Failed
        </span>
      );
    }
  };

  const formatDate = (timestamp?: { _seconds: number; _nanoseconds: number }) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <MasterAdminLayout title="Subscription Requests">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </MasterAdminLayout>
    );
  }

  return (
    <MasterAdminLayout title="Subscription Requests" subtitle="Manage all subscription requests from schools">
      <div className="space-y-4 sm:space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            placeholder="Search by school name, subscription type, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
            }`}
          />
        </div>

        {/* Subscriptions Table */}
        <div className={`rounded-xl border overflow-hidden ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {filteredSubscriptions.length === 0 ? (
            <div className={`text-center py-12 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <Crown className={`w-12 h-12 mx-auto mb-4 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p className={`text-lg font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {searchTerm ? 'No subscriptions found matching your search' : 'No subscription requests found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${
                  isDarkMode ? 'bg-gray-900 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'
                }`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      School Name
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Type
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Users
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Amount
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Payment Status
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Approval Status
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Created At
                    </th>
                    <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  {filteredSubscriptions.map((subscription) => {
                    if (!subscription) return null;
                    
                    const subscriptionId = subscription.id || subscription.subscriptionId || '';
                    const isActionLoading = actionLoading === subscriptionId;
                    
                    // Calculate total amount with safe defaults
                    const costPerUser = subscription.subscription_cost_per_user ?? 0;
                    const numUsers = subscription.num_of_users ?? 0;
                    const totalAmount = subscription.amount ?? (costPerUser * numUsers);
                    
                    return (
                      <tr
                        key={subscriptionId}
                        className={`transition-colors hover:${
                          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}
                      >
                        <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          <div className="flex items-center gap-2">
                            <Building className={`w-4 h-4 flex-shrink-0 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                            <span className="font-medium truncate">{subscription.schoolName || 'Unknown School'}</span>
                          </div>
                        </td>
                        <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                            subscription.subscription_type === 'Both'
                              ? 'bg-purple-600 text-white dark:bg-purple-700 dark:text-white'
                              : 'bg-blue-600 text-white dark:bg-blue-700 dark:text-white'
                          }">
                            {subscription.subscription_type || 'N/A'}
                          </span>
                        </td>
                        <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <div className="flex items-center gap-1">
                            <Users className={`w-4 h-4 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                            {subscription.num_of_users}
                          </div>
                        </td>
                        <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          ₹{totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                          {getPaymentStatusChip(subscription.payment_status)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {getStatusChip(subscription.approve_status)}
                            <button
                              onClick={() => handleStatusToggle(subscription)}
                              disabled={isActionLoading}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                subscription.approve_status.toLowerCase() === 'approved'
                                  ? isDarkMode ? 'bg-green-600' : 'bg-green-600'
                                  : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                              }`}
                              title={subscription.approve_status.toLowerCase() === 'approved' ? 'Click to set as Pending' : 'Click to Approve'}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  subscription.approve_status.toLowerCase() === 'approved' ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                        <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden xl:table-cell ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <div className="flex items-center gap-1">
                            <Calendar className={`w-4 h-4 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                            {formatDate(subscription.request_created_at)}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1 sm:gap-2">
                            <button
                              onClick={() => openViewModal(subscription)}
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

        {/* View Modal */}
        {selectedSubscription && (
          <ViewSubscriptionModal
            isOpen={viewModalOpen}
            onClose={() => {
              setViewModalOpen(false);
              setSelectedSubscription(null);
            }}
            subscription={selectedSubscription}
            onStatusUpdate={async (newStatus: 'approved' | 'pending') => {
              const subscriptionId = selectedSubscription.id || selectedSubscription.subscriptionId || '';
              setPendingStatusUpdate({
                subscriptionId,
                newStatus,
                schoolName: selectedSubscription.schoolName || 'Unknown School'
              });
              setViewModalOpen(false);
              setConfirmModalOpen(true);
            }}
            loading={actionLoading === (selectedSubscription.id || selectedSubscription.subscriptionId)}
          />
        )}

        {/* Confirmation Modal */}
        {confirmModalOpen && pendingStatusUpdate && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
            <div className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    pendingStatusUpdate.newStatus === 'approved'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-yellow-100 dark:bg-yellow-900/30'
                  }`}>
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
                  </span>?
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={cancelStatusUpdate}
                    disabled={actionLoading === pendingStatusUpdate.subscriptionId}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStatusUpdate}
                    disabled={actionLoading === pendingStatusUpdate.subscriptionId}
                    className={`px-4 py-2.5 sm:py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 touch-manipulation min-h-[44px] ${
                      pendingStatusUpdate.newStatus === 'approved'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                  >
                    {actionLoading === pendingStatusUpdate.subscriptionId ? 'Updating...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
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

export default SubscriptionRequests;
