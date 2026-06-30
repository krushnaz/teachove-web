import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Monitor,
  Smartphone,
  Tablet,
  ShieldOff,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import {
  authSessionService,
  AuthSession,
  SessionStatus,
} from '../../../services/authSessionService';
import RevokeSessionDialog from './RevokeSessionDialog';
import {
  formatSessionDate,
  getLogoutTypeLabel,
  getPlatformLabel,
  getStatusLabel,
} from '../../../utils/deviceInfo';

interface AuthSessionsPanelProps {
  schoolId?: string;
  title?: string;
  showRevoke?: boolean;
  compact?: boolean;
  limit?: number;
}

const PlatformIcon: React.FC<{ platform?: string }> = ({ platform }) => {
  if (platform === 'ios' || platform === 'android') {
    return <Smartphone className="w-4 h-4" />;
  }
  if (platform === 'web') {
    return <Monitor className="w-4 h-4" />;
  }
  return <Tablet className="w-4 h-4" />;
};

const statusBadgeClass = (status: SessionStatus, isDarkMode: boolean) => {
  if (status === 'active') {
    return isDarkMode
      ? 'bg-green-900/30 text-green-400'
      : 'bg-green-100 text-green-800';
  }
  return isDarkMode
    ? 'bg-gray-700 text-gray-300'
    : 'bg-gray-100 text-gray-700';
};

const AuthSessionsPanel: React.FC<AuthSessionsPanelProps> = ({
  schoolId,
  title = 'Auth Sessions',
  showRevoke = true,
  compact = false,
  limit = 100,
}) => {
  const { isDarkMode } = useDarkMode();
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'' | SessionStatus>('');
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<AuthSession | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = schoolId
        ? await authSessionService.getSchoolSessions(schoolId, {
            status: statusFilter || undefined,
            limit,
          })
        : await authSessionService.getAllSessions({
            status: statusFilter || undefined,
            limit,
          });
      setSessions(data);
    } catch (error: any) {
      console.error('Failed to load sessions:', error);
      toast.error(error.message || 'Failed to load auth sessions');
    } finally {
      setLoading(false);
    }
  }, [schoolId, statusFilter, limit]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevokeClick = (session: AuthSession) => {
    setRevokeTarget(session);
  };

  const handleRevokeConfirm = async () => {
    if (!revokeTarget) return;

    try {
      setRevokingId(revokeTarget.sessionId);
      await authSessionService.revokeSession(revokeTarget.sessionId);
      toast.success('Session revoked — user will be logged out');
      setRevokeTarget(null);
      await fetchSessions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke session');
    } finally {
      setRevokingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
            isDarkMode ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200 bg-gray-50'
          }`}>
            <Filter className="w-4 h-4 opacity-60" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as '' | SessionStatus)}
              className={`bg-transparent outline-none ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
            >
              <option value="">All statuses</option>
              <option value="active">Logged In</option>
              <option value="logged_out">Logged Out</option>
            </select>
          </div>
          <button
            onClick={fetchSessions}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className={`rounded-xl border p-8 text-center ${
          isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50'
        }`}>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            No auth sessions found yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full min-w-[900px]">
            <thead className={isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}>
              <tr>
                {!schoolId && !compact && (
                  <th className={`px-3 py-3 text-left text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>School</th>
                )}
                <th className={`px-3 py-3 text-left text-xs font-semibold uppercase ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>User</th>
                <th className={`px-3 py-3 text-left text-xs font-semibold uppercase ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Platform</th>
                <th className={`px-3 py-3 text-left text-xs font-semibold uppercase ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Device</th>
                <th className={`px-3 py-3 text-left text-xs font-semibold uppercase ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Login</th>
                <th className={`px-3 py-3 text-left text-xs font-semibold uppercase ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Logout</th>
                <th className={`px-3 py-3 text-left text-xs font-semibold uppercase ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Status</th>
                <th className={`px-3 py-3 text-left text-xs font-semibold uppercase ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Logout Type</th>
                {showRevoke && (
                  <th className={`px-3 py-3 text-left text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Action</th>
                )}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {sessions.map((session) => (
                <tr key={session.sessionId} className={isDarkMode ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50'}>
                  {!schoolId && !compact && (
                    <td className={`px-3 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {session.schoolName || '—'}
                    </td>
                  )}
                  <td className={`px-3 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <div className="font-medium">{session.userName}</div>
                    <div className={`text-xs capitalize ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {session.role}
                    </div>
                  </td>
                  <td className={`px-3 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={session.platform} />
                      {getPlatformLabel(session.platform)}
                    </div>
                  </td>
                  <td className={`px-3 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div>{session.deviceName}</div>
                    <div className={`text-xs font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {session.deviceId.slice(0, 12)}…
                    </div>
                  </td>
                  <td className={`px-3 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formatSessionDate(session.loginTime)}
                  </td>
                  <td className={`px-3 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formatSessionDate(session.logoutTime)}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeClass(session.status, isDarkMode)}`}>
                      {getStatusLabel(session.status)}
                    </span>
                  </td>
                  <td className={`px-3 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {getLogoutTypeLabel(session.logoutType)}
                  </td>
                  {showRevoke && (
                    <td className="px-3 py-3">
                      {session.status === 'active' ? (
                        <button
                          onClick={() => handleRevokeClick(session)}
                          disabled={revokingId === session.sessionId}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                            isDarkMode
                              ? 'bg-rose-900/30 text-rose-400 hover:bg-rose-900/50'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          <ShieldOff className="w-3.5 h-3.5" />
                          {revokingId === session.sessionId ? 'Revoking…' : 'Revoke'}
                        </button>
                      ) : (
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RevokeSessionDialog
        open={!!revokeTarget}
        session={revokeTarget}
        loading={!!revokingId}
        onClose={() => {
          if (!revokingId) setRevokeTarget(null);
        }}
        onConfirm={handleRevokeConfirm}
      />
    </div>
  );
};

export default AuthSessionsPanel;
