const DEVICE_ID_KEY = 'teachove_device_id';

const generateDeviceId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `web-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

export const getOrCreateDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

const detectBrowser = (ua: string): string => {
  if (ua.includes('Edg/')) return 'Microsoft Edge';
  if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Google Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  if (ua.includes('Firefox/')) return 'Firefox';
  return 'Unknown Browser';
};

const detectOS = (ua: string): string => {
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown OS';
};

export interface SessionMeta {
  deviceId: string;
  platform: 'web';
  deviceName: string;
}

export const getSessionMeta = (): SessionMeta => {
  const ua = navigator.userAgent || '';
  const browser = detectBrowser(ua);
  const os = detectOS(ua);

  return {
    deviceId: getOrCreateDeviceId(),
    platform: 'web',
    deviceName: `${browser} on ${os}`,
  };
};

export const formatSessionDate = (value?: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getPlatformLabel = (platform?: string): string => {
  switch (platform) {
    case 'web':
      return 'Web';
    case 'ios':
      return 'iOS';
    case 'android':
      return 'Android';
    default:
      return platform || 'Unknown';
  }
};

export const getStatusLabel = (status?: string): string => {
  return status === 'active' ? 'Logged In' : 'Logged Out';
};

export const getLogoutTypeLabel = (logoutType?: string | null): string => {
  switch (logoutType) {
    case 'manual':
      return 'Manual';
    case 'revoked_by_admin':
      return 'Revoked by Admin';
    case 'automatic':
      return 'Automatic';
    default:
      return '—';
  }
};
