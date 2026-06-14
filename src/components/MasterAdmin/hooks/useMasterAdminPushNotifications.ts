import { useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  getPushNotificationStatus,
  getStoredFcmToken,
  promptPushNotificationsIfNeeded,
  subscribeToForegroundMessages,
} from '../../../services/fcmService';

export function useMasterAdminPushNotifications() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'master_admin') return;

    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      const status = await getPushNotificationStatus();

      if (status === 'disabled') {
        const enabled = await promptPushNotificationsIfNeeded(user?.email);
        if (enabled) {
          toast.success('Notifications enabled — you will be alerted for new Get in Touch messages.');
        }
      }

      const latestStatus = await getPushNotificationStatus();
      if (latestStatus !== 'enabled' || !getStoredFcmToken()) return;

      const unsub = await subscribeToForegroundMessages((title, body) => {
        toast.info(body ? `${title}: ${body}` : title, { autoClose: 8000 });
      });
      if (typeof unsub === 'function') {
        unsubscribe = unsub;
      }
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated, user?.role, user?.email]);
}
