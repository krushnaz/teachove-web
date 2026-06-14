import { getToken, onMessage } from 'firebase/messaging';
import { FIREBASE_VAPID_KEY, getFirebaseMessaging } from '../config/firebase';
import { apiHelper } from '../utils/apiHelper';

const FCM_TOKEN_STORAGE_KEY = 'master_admin_fcm_token';
const FCM_PROMPT_SESSION_KEY = 'master_admin_fcm_prompt_attempted';

export type PushNotificationStatus = 'unsupported' | 'disabled' | 'not_configured' | 'enabled' | 'blocked';

let resolvedVapidKey: string | null = null;

export function getStoredFcmToken(): string | null {
  return localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
}

export async function loadFcmConfig(): Promise<{ configured: boolean; vapidKey: string }> {
  if (resolvedVapidKey) {
    return { configured: true, vapidKey: resolvedVapidKey };
  }

  if (FIREBASE_VAPID_KEY) {
    resolvedVapidKey = FIREBASE_VAPID_KEY;
    return { configured: true, vapidKey: resolvedVapidKey };
  }

  try {
    const response = await apiHelper.get('/master-admin/fcm/config');
    const vapidKey = response?.data?.vapidKey || response?.vapidKey || '';
    if (vapidKey) {
      resolvedVapidKey = vapidKey;
      return { configured: true, vapidKey };
    }
  } catch (error) {
    console.error('Failed to load FCM config:', error);
  }

  return { configured: false, vapidKey: '' };
}

export async function getPushNotificationStatus(): Promise<PushNotificationStatus> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  const { configured } = await loadFcmConfig();
  if (!configured) return 'not_configured';

  const messaging = await getFirebaseMessaging();
  if (!messaging) return 'unsupported';

  if (Notification.permission === 'denied') return 'blocked';
  if (Notification.permission === 'granted' && getStoredFcmToken()) return 'enabled';
  return 'disabled';
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported in this browser.');
  }

  const existing = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
  if (existing?.active) return existing;

  return navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
}

export async function enablePushNotifications(adminEmail?: string): Promise<string | null> {
  const { configured, vapidKey } = await loadFcmConfig();
  if (!configured || !vapidKey) {
    throw new Error(
      'Push notifications are not configured on the server. Add FIREBASE_WEB_VAPID_KEY to backend .env (Firebase Console → Cloud Messaging → Web Push certificates).'
    );
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    throw new Error('Push notifications are not supported in this browser. Try Chrome or Edge on desktop.');
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }

  if (permission !== 'granted') {
    throw new Error('Notification permission was blocked. Enable notifications for this site in browser settings.');
  }

  const registration = await registerServiceWorker();
  await navigator.serviceWorker.ready;

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new Error('Unable to get notification token. Refresh the page and try again.');
  }

  await apiHelper.post('/master-admin/fcm/register', {
    token,
    adminEmail: adminEmail || null,
    platform: 'web',
  });

  localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
  return token;
}

export async function promptPushNotificationsIfNeeded(adminEmail?: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'default') return false;
  if (sessionStorage.getItem(FCM_PROMPT_SESSION_KEY) === '1') return false;

  sessionStorage.setItem(FCM_PROMPT_SESSION_KEY, '1');

  try {
    await enablePushNotifications(adminEmail);
    return true;
  } catch (error) {
    console.warn('Push notification setup skipped:', error);
    return false;
  }
}

export async function disablePushNotifications(): Promise<void> {
  const token = getStoredFcmToken();
  if (token) {
    try {
      await apiHelper.post('/master-admin/fcm/unregister', { token });
    } catch (error) {
      console.error('Failed to unregister FCM token:', error);
    }
  }
  localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
}

export async function subscribeToForegroundMessages(
  onNotify: (title: string, body: string) => void
): Promise<(() => void) | null> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  return onMessage(messaging, (payload) => {
    const title = payload.notification?.title || 'New notification';
    const body = payload.notification?.body || '';
    onNotify(title, body);

    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon.png',
      });
    }
  });
}
