import { apiHelper } from '../utils/apiHelper';

export type SessionStatus = 'active' | 'logged_out';
export type SessionPlatform = 'web' | 'ios' | 'android';
export type LogoutType = 'manual' | 'revoked_by_admin' | 'automatic' | null;

export interface AuthSession {
  sessionId: string;
  userId: string;
  userName: string;
  role: string;
  schoolId?: string | null;
  schoolName?: string | null;
  email?: string | null;
  phoneNo?: string | null;
  platform: SessionPlatform | string;
  deviceId: string;
  deviceName: string;
  ipAddress?: string;
  userAgent?: string;
  status: SessionStatus;
  logoutType: LogoutType;
  loginTime: string;
  logoutTime?: string | null;
  lastActiveAt?: string;
}

export interface SessionOverview {
  total: number;
  active: number;
  loggedOut: number;
  byPlatform: Record<string, number>;
  recentSessions: AuthSession[];
}

class AuthSessionService {
  async getOverview(): Promise<SessionOverview> {
    const response = await apiHelper.get<{ success: boolean; data: SessionOverview }>(
      '/master-admin/sessions/overview'
    );
    return response.data;
  }

  async getAllSessions(params?: {
    status?: SessionStatus;
    role?: string;
    limit?: number;
  }): Promise<AuthSession[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    const response = await apiHelper.get<{ success: boolean; data: AuthSession[] }>(
      `/master-admin/sessions${query ? `?${query}` : ''}`
    );
    return response.data;
  }

  async getSchoolSessions(
    schoolId: string,
    params?: { status?: SessionStatus; role?: string; limit?: number }
  ): Promise<AuthSession[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    const response = await apiHelper.get<{ success: boolean; data: AuthSession[] }>(
      `/master-admin/sessions/school/${schoolId}${query ? `?${query}` : ''}`
    );
    return response.data;
  }

  async revokeSession(sessionId: string): Promise<void> {
    await apiHelper.post(`/master-admin/sessions/${sessionId}/revoke`, {});
  }
}

export const authSessionService = new AuthSessionService();
