import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  Monitor,
  HardDrive,
  ArrowRight,
  RefreshCw,
  Smartphone,
  FileUp,
  Shield,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { authSessionService, AuthSession } from '../../../services/authSessionService';
import {
  masterAdminUploadService,
  UploadOverview,
  categoryLabel,
  formatUploadBytes,
} from '../../../services/masterAdminUploadService';
import { getPlatformLabel } from '../../../utils/deviceInfo';

interface SchoolAnalysisPanelProps {
  schoolId: string;
  schoolName?: string;
  teacherCount: number;
  studentCount: number;
  onViewSessions?: () => void;
  onViewUploads?: () => void;
}

interface SessionStats {
  total: number;
  active: number;
  loggedOut: number;
  byPlatform: Record<string, number>;
  byRole: Record<string, number>;
  recentSessions: AuthSession[];
}

const computeSessionStats = (sessions: AuthSession[]): SessionStats => {
  const byPlatform: Record<string, number> = {};
  const byRole: Record<string, number> = {};
  let active = 0;
  let loggedOut = 0;

  for (const s of sessions) {
    if (s.status === 'active') active++;
    else loggedOut++;
    const platform = s.platform || 'unknown';
    byPlatform[platform] = (byPlatform[platform] || 0) + 1;
    const role = s.role || 'unknown';
    byRole[role] = (byRole[role] || 0) + 1;
  }

  return {
    total: sessions.length,
    active,
    loggedOut,
    byPlatform,
    byRole,
    recentSessions: sessions.slice(0, 5),
  };
};

const StatCard: React.FC<{
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
  accent?: 'indigo' | 'green' | 'blue' | 'amber' | 'purple';
}> = ({ label, value, hint, icon, accent = 'indigo' }) => {
  const { isDarkMode } = useDarkMode();
  const accents = {
    indigo: isDarkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600',
    green: isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600',
    blue: isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600',
    amber: isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600',
    purple: isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600',
  };

  return (
    <div
      className={`rounded-xl border p-5 ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {label}
          </p>
          <p className={`text-2xl sm:text-3xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {hint && (
            <p className={`text-xs mt-1.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {hint}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg shrink-0 ${accents[accent]}`}>{icon}</div>
      </div>
    </div>
  );
};

const BreakdownList: React.FC<{
  title: string;
  items: { label: string; value: number; sub?: string }[];
  emptyMessage?: string;
}> = ({ title, items, emptyMessage = 'No data yet' }) => {
  const { isDarkMode } = useDarkMode();
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div
      className={`rounded-xl border p-5 ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h4>
      {items.length === 0 ? (
        <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.value}
                  {item.sub ? ` · ${item.sub}` : ''}
                </span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SchoolAnalysisPanel: React.FC<SchoolAnalysisPanelProps> = ({
  schoolId,
  schoolName,
  teacherCount,
  studentCount,
  onViewSessions,
  onViewUploads,
}) => {
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [uploadStats, setUploadStats] = useState<UploadOverview | null>(null);

  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      const [sessions, uploads] = await Promise.all([
        authSessionService.getSchoolSessions(schoolId, { limit: 500 }),
        masterAdminUploadService.getSchoolStats(schoolId),
      ]);
      setSessionStats(computeSessionStats(sessions));
      setUploadStats(uploads);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load school analysis');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const ratio = teacherCount > 0 ? (studentCount / teacherCount).toFixed(1) : '0';
  const totalUsers = teacherCount + studentCount;

  const platformBreakdown = useMemo(
    () =>
      Object.entries(sessionStats?.byPlatform || {})
        .map(([key, value]) => ({ label: getPlatformLabel(key), value }))
        .sort((a, b) => b.value - a.value),
    [sessionStats]
  );

  const roleBreakdown = useMemo(
    () =>
      Object.entries(sessionStats?.byRole || {})
        .map(([key, value]) => ({
          label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          value,
        }))
        .sort((a, b) => b.value - a.value),
    [sessionStats]
  );

  const categoryBreakdown = useMemo(
    () =>
      Object.entries(uploadStats?.byCategory || {})
        .map(([key, val]) => ({
          label: categoryLabel(key),
          value: val.count,
          sub: formatUploadBytes(val.sizeBytes),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6),
    [uploadStats]
  );

  const moduleBreakdown = useMemo(
    () =>
      Object.entries(uploadStats?.byModule || {})
        .map(([key, val]) => ({
          label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          value: val.count,
          sub: formatUploadBytes(val.sizeBytes),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [uploadStats]
  );

  const cardClass = `rounded-xl border p-5 ${
    isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
  }`;

  const detailButtonClass = `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    isDarkMode
      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
  }`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className={`w-8 h-8 animate-spin ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            School Analysis
            {schoolName ? ` — ${schoolName}` : ''}
          </h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Combined view of users, auth sessions, and file uploads for this school
          </p>
        </div>
        <button
          type="button"
          onClick={fetchAnalysis}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
            isDarkMode
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* User metrics */}
      <div>
        <h4 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          User Overview
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Teachers"
            value={teacherCount}
            icon={<Users className="w-5 h-5" />}
            accent="blue"
          />
          <StatCard
            label="Students"
            value={studentCount}
            icon={<Users className="w-5 h-5" />}
            accent="green"
          />
          <StatCard
            label="Students per Teacher"
            value={ratio}
            hint="Teacher–student ratio"
            icon={<TrendingUp className="w-5 h-5" />}
            accent="indigo"
          />
          <StatCard
            label="Total Users"
            value={totalUsers}
            hint="Teachers + students"
            icon={<Users className="w-5 h-5" />}
            accent="purple"
          />
        </div>
      </div>

      {/* Sessions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className={`text-sm font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Auth Sessions
          </h4>
          {onViewSessions ? (
            <button type="button" onClick={onViewSessions} className={detailButtonClass}>
              View all sessions
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              to={`/master-admin/schools/${schoolId}`}
              state={{ tab: 'sessions' }}
              className={detailButtonClass}
            >
              View all sessions
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <StatCard
            label="Total Sessions"
            value={sessionStats?.total ?? 0}
            icon={<Shield className="w-5 h-5" />}
            accent="indigo"
          />
          <StatCard
            label="Active Now"
            value={sessionStats?.active ?? 0}
            hint="Currently logged in"
            icon={<Monitor className="w-5 h-5" />}
            accent="green"
          />
          <StatCard
            label="Logged Out"
            value={sessionStats?.loggedOut ?? 0}
            icon={<Smartphone className="w-5 h-5" />}
            accent="amber"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BreakdownList title="Sessions by Platform" items={platformBreakdown} />
          <BreakdownList title="Sessions by Role" items={roleBreakdown} />
        </div>
      </div>

      {/* Uploads */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className={`text-sm font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            File Uploads
          </h4>
          {onViewUploads ? (
            <button type="button" onClick={onViewUploads} className={detailButtonClass}>
              View all uploads
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              to={`/master-admin/schools/${schoolId}`}
              state={{ tab: 'uploads' }}
              className={detailButtonClass}
            >
              View all uploads
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <StatCard
            label="Total Uploads"
            value={uploadStats?.totalUploads ?? 0}
            icon={<FileUp className="w-5 h-5" />}
            accent="blue"
          />
          <StatCard
            label="Storage Used"
            value={uploadStats?.totalSizeLabel ?? formatUploadBytes(uploadStats?.totalSizeBytes ?? 0)}
            hint="Tracked file uploads"
            icon={<HardDrive className="w-5 h-5" />}
            accent="purple"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BreakdownList title="Uploads by Category" items={categoryBreakdown} />
          <BreakdownList title="Uploads by Module" items={moduleBreakdown} />
        </div>
      </div>

      {/* Recent activity snapshot */}
      {(sessionStats?.recentSessions.length || uploadStats?.recentUploads.length) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={cardClass}>
            <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Recent Sessions
            </h4>
            <div className="space-y-2">
              {(sessionStats?.recentSessions || []).map((s) => (
                <div
                  key={s.sessionId}
                  className={`flex items-center justify-between text-sm py-2 border-b last:border-0 ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-100'
                  }`}
                >
                  <div>
                    <p className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{s.userName}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {getPlatformLabel(s.platform)} · {s.status === 'active' ? 'Active' : 'Logged out'}
                    </p>
                  </div>
                </div>
              ))}
              {!sessionStats?.recentSessions.length && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>No sessions yet</p>
              )}
            </div>
          </div>
          <div className={cardClass}>
            <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Recent Uploads
            </h4>
            <div className="space-y-2">
              {(uploadStats?.recentUploads || []).slice(0, 5).map((u) => (
                <div
                  key={u.uploadId}
                  className={`flex items-center justify-between text-sm py-2 border-b last:border-0 ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-100'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className={`truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {u.originalName || u.fileName}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {categoryLabel(u.category)} · {u.sizeLabel}
                    </p>
                  </div>
                </div>
              ))}
              {!uploadStats?.recentUploads?.length && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>No uploads yet</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SchoolAnalysisPanel;
