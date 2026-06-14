import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAuth } from '../../contexts/AuthContext';
import MasterAdminLayout from './Layout';
import { masterAdminService, type ContactMessage } from '../../services/masterAdminService';
import {
  enablePushNotifications,
  disablePushNotifications,
  getPushNotificationStatus,
  promptPushNotificationsIfNeeded,
  PushNotificationStatus,
} from '../../services/fcmService';
import { Mail, Check, Trash2, Clock, RefreshCw, Phone, Bell, BellOff } from 'lucide-react';
import { toast } from 'react-toastify';

const GetInTouchMessages: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | ContactMessage['status']>('all');
  const [pushStatus, setPushStatus] = useState<PushNotificationStatus>('disabled');
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    const initPush = async () => {
      const status = await getPushNotificationStatus();
      setPushStatus(status);

      if (status === 'disabled') {
        const enabled = await promptPushNotificationsIfNeeded(user?.email);
        if (enabled) {
          setPushStatus('enabled');
          toast.success('Notifications enabled for Get in Touch messages.');
        }
      }
    };

    initPush();
  }, [user?.email]);

  const fetchContactMessages = async () => {
    setLoading(true);
    try {
      const msgs = await masterAdminService.getAllContactMessages();
      setContactMessages(msgs);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactMessages();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: ContactMessage['status']) => {
    try {
      await masterAdminService.updateContactMessageStatus(id, newStatus);
      setContactMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, status: newStatus } : msg))
      );
    } catch (error) {
      console.error('Failed to update message status:', error);
      alert('Failed to update message status.');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await masterAdminService.deleteContactMessage(id);
      setContactMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message.');
    }
  };

  const filteredMessages = contactMessages.filter(
    (msg) => statusFilter === 'all' || msg.status === statusFilter
  );

  const pendingCount = contactMessages.filter((m) => m.status === 'pending').length;

  const handleTogglePush = async () => {
    setPushLoading(true);
    try {
      if (pushStatus === 'enabled') {
        await disablePushNotifications();
        setPushStatus('disabled');
        toast.success('Push notifications disabled');
        return;
      }

      await enablePushNotifications(user?.email);
      setPushStatus('enabled');
      toast.success('Push notifications enabled. You will be alerted for new messages.');
    } catch (error: any) {
      const message = error?.message || 'Failed to update push notifications';
      if (message.includes('permission')) {
        setPushStatus('blocked');
      }
      toast.error(message);
    } finally {
      setPushLoading(false);
    }
  };

  const statusFilters: { value: typeof statusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'read', label: 'Read' },
    { value: 'resolved', label: 'Resolved' },
  ];

  return (
    <MasterAdminLayout
      title="Get in Touch"
      subtitle="Review and manage inquiries submitted via the public landing page contact form."
    >
      <div className="space-y-6">
        <div className={`rounded-xl border p-4 sm:p-5 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Push Notifications
              </h4>
              <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {pushStatus === 'enabled'
                  ? 'You will receive browser alerts when someone submits the contact form.'
                  : pushStatus === 'blocked'
                    ? 'Notifications are blocked in your browser. Click the lock icon in the address bar → Site settings → Allow notifications.'
                    : pushStatus === 'not_configured'
                      ? 'Server not configured yet. Add FIREBASE_WEB_VAPID_KEY to backend .env (Firebase Console → Cloud Messaging → Web Push certificates), then restart the backend.'
                      : pushStatus === 'unsupported'
                        ? 'Push notifications are not supported in this browser. Use Chrome or Edge on desktop.'
                        : 'Click Enable Alerts to allow browser notifications for new Get in Touch messages.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleTogglePush}
              disabled={pushLoading || pushStatus === 'unsupported' || pushStatus === 'blocked' || pushStatus === 'not_configured'}
              className={`inline-flex items-center gap-2 self-start rounded-lg px-4 py-2 text-sm font-semibold transition-colors sm:self-auto disabled:opacity-60 ${
                pushStatus === 'enabled'
                  ? isDarkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {pushStatus === 'enabled' ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              {pushLoading
                ? 'Please wait...'
                : pushStatus === 'enabled'
                  ? 'Disable Alerts'
                  : 'Enable Alerts'}
            </button>
          </div>
        </div>

        <div className={`rounded-xl border p-4 sm:p-5 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {statusFilters.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    statusFilter === value
                      ? 'bg-indigo-600 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                  {value === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={fetchContactMessages}
              className={`inline-flex items-center gap-2 self-start rounded-lg border px-3 py-2 text-sm font-semibold transition-colors sm:self-auto ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-28 w-full rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
              />
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div
            className={`rounded-xl border-2 border-dashed p-12 text-center ${
              isDarkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'
            }`}
          >
            <Mail className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p className="text-sm font-semibold">No messages found</p>
            <p className="mt-1 text-xs">
              {statusFilter === 'all'
                ? 'Contact form submissions will appear here.'
                : `No ${statusFilter} messages at the moment.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl border p-4 transition-all hover:shadow-sm sm:p-5 ${
                  msg.status === 'pending'
                    ? isDarkMode
                      ? 'border-blue-500/30 bg-gray-900/40'
                      : 'border-blue-100 bg-blue-50/20'
                    : isDarkMode
                      ? 'border-gray-700 bg-gray-800/20'
                      : 'border-gray-200 bg-gray-50/10'
                }`}
              >
                <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h4 className={`text-sm font-bold sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {msg.schoolName}
                    </h4>
                    <p className={`mt-0.5 text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {msg.schoolEmail}
                    </p>
                    {msg.mobileNumber && (
                      <a
                        href={`tel:${msg.mobileNumber}`}
                        className={`mt-1 inline-flex items-center gap-1 text-xs font-medium hover:underline ${
                          isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                        }`}
                      >
                        <Phone className="h-3 w-3" />
                        {msg.mobileNumber}
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        msg.status === 'pending'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : msg.status === 'read'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}
                    >
                      {msg.status}
                    </span>
                    <span className={`text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>
                </div>

                <p
                  className={`whitespace-pre-wrap text-xs leading-relaxed sm:text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {msg.message}
                </p>

                <div className="mt-4 flex justify-end gap-2 border-t border-dashed border-gray-200 pt-3 dark:border-gray-700">
                  {msg.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(msg.id!, 'read')}
                      className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                        isDarkMode
                          ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50'
                          : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                      }`}
                    >
                      <Clock size={12} />
                      Mark Read
                    </button>
                  )}
                  {msg.status !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(msg.id!, 'resolved')}
                      className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                        isDarkMode
                          ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      <Check size={12} />
                      Resolve
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(msg.id!)}
                    className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                      isDarkMode
                        ? 'bg-rose-900/30 text-rose-400 hover:bg-rose-900/50'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MasterAdminLayout>
  );
};

export default GetInTouchMessages;
