import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Monitor,
  HardDrive,
  Shield,
  FileUp,
  RefreshCw,
  ArrowRight,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'react-toastify';
import MasterAdminLayout from '../Layout';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { authSessionService, SessionOverview } from '../../../services/authSessionService';
import {
  masterAdminUploadService,
  UploadOverview,
  categoryLabel,
  formatUploadBytes,
} from '../../../services/masterAdminUploadService';
import { masterAdminSchoolService, School } from '../../../services/masterAdminSchoolService';
import { getPlatformLabel } from '../../../utils/deviceInfo';

const StatCard: React.FC<{
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
}> = ({ label, value, hint, icon }) => {
  const { isDarkMode } = useDarkMode();
  return (
    <div
      className={`rounded-xl border p-5 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
          <p className={`text-2xl sm:text-3xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {hint && (
            <p className={`text-xs mt-1.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{hint}</p>
          )}
        </div>
        <div
          className={`p-2.5 rounded-lg shrink-0 ${
            isDarkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const PlatformAnalysis: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [sessionOverview, setSessionOverview] = useState<SessionOverview | null>(null);
  const [uploadOverview, setUploadOverview] = useState<UploadOverview | null>(null);
  const [schools, setSchools] = useState<School[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sessions, uploads, schoolList] = await Promise.all([
        authSessionService.getOverview(),
        masterAdminUploadService.getOverview(),
        masterAdminSchoolService.getSchools(),
      ]);
      setSessionOverview(sessions);
      setUploadOverview(uploads);
      setSchools(schoolList);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load platform analysis');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const platformBreakdown = useMemo(
    () =>
      Object.entries(sessionOverview?.byPlatform || {})
        .map(([key, value]) => ({ label: getPlatformLabel(key), value }))
        .sort((a, b) => b.value - a.value),
    [sessionOverview]
  );

  const categoryBreakdown = useMemo(
    () =>
      Object.entries(uploadOverview?.byCategory || {})
        .map(([key, val]) => ({
          label: categoryLabel(key),
          value: val.count,
          sub: formatUploadBytes(val.sizeBytes),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
    [uploadOverview]
  );

  const uploadSchoolMap = useMemo(() => {
    const map = new Map<string, { count: number; sizeBytes: number; schoolName: string }>();
    for (const s of uploadOverview?.topSchools || []) {
      map.set(s.schoolId, { count: s.count, sizeBytes: s.sizeBytes, schoolName: s.schoolName });
    }
    return map;
  }, [uploadOverview]);

  const cardClass = `rounded-xl border p-5 ${
    isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
  }`;

  const linkClass = `inline-flex items-center gap-1.5 text-sm font-medium ${
    isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
  }`;

  return (
    <MasterAdminLayout
      title="Platform Analysis"
      subtitle="Cross-school insights — sessions, uploads, and school-level drill-down"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isDarkMode ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                VedanTech Platform Overview
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Aggregate metrics across all schools
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/master-admin/admin-access"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Shield className="w-4 h-4" />
              Session Details
            </Link>
            <Link
              to="/master-admin/uploads"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              Upload Details
            </Link>
            <button
              type="button"
              onClick={fetchData}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className={`w-8 h-8 animate-spin ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Active Sessions"
                value={sessionOverview?.active ?? 0}
                hint={`${sessionOverview?.total ?? 0} total tracked`}
                icon={<Monitor className="w-5 h-5" />}
              />
              <StatCard
                label="Logged Out"
                value={sessionOverview?.loggedOut ?? 0}
                icon={<Shield className="w-5 h-5" />}
              />
              <StatCard
                label="Total Uploads"
                value={uploadOverview?.totalUploads ?? 0}
                icon={<FileUp className="w-5 h-5" />}
              />
              <StatCard
                label="Storage Used"
                value={uploadOverview?.totalSizeLabel ?? '0 B'}
                hint="Across all schools"
                icon={<HardDrive className="w-5 h-5" />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className={cardClass}>
                <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Sessions by Platform
                </h4>
                {platformBreakdown.length === 0 ? (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>No session data yet</p>
                ) : (
                  <div className="space-y-3">
                    {platformBreakdown.map((item) => {
                      const max = platformBreakdown[0]?.value || 1;
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
                            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {item.value}
                            </span>
                          </div>
                          <div className={`h-1.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div
                              className="h-full rounded-full bg-indigo-500"
                              style={{ width: `${(item.value / max) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Link to="/master-admin/admin-access" className={`mt-4 inline-flex ${linkClass}`}>
                  View full session list
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className={cardClass}>
                <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Uploads by Category
                </h4>
                {categoryBreakdown.length === 0 ? (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>No upload data yet</p>
                ) : (
                  <div className="space-y-3">
                    {categoryBreakdown.map((item) => {
                      const max = categoryBreakdown[0]?.value || 1;
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
                            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {item.value} · {item.sub}
                            </span>
                          </div>
                          <div className={`h-1.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div
                              className="h-full rounded-full bg-purple-500"
                              style={{ width: `${(item.value / max) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Link to="/master-admin/uploads" className={`mt-4 inline-flex ${linkClass}`}>
                  View full upload list
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Schools table */}
            <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`px-5 py-4 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <Building2 className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    School-wise Analysis
                  </h4>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {schools.length} schools
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={isDarkMode ? 'bg-gray-900/50 text-gray-400' : 'bg-gray-50 text-gray-600'}>
                      <th className="text-left px-5 py-3 font-medium">School</th>
                      <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Status</th>
                      <th className="text-right px-5 py-3 font-medium">Uploads</th>
                      <th className="text-right px-5 py-3 font-medium hidden md:table-cell">Storage</th>
                      <th className="text-right px-5 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schools.map((school) => {
                      const id = school.id || school.schoolId || '';
                      const uploadData = uploadSchoolMap.get(id);
                      return (
                        <tr
                          key={id}
                          className={`border-t ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50'}`}
                        >
                          <td className={`px-5 py-3 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {school.schoolName}
                          </td>
                          <td className={`px-5 py-3 hidden sm:table-cell ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {school.isActive !== false ? (
                              <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>Active</span>
                            ) : (
                              <span className={isDarkMode ? 'text-red-400' : 'text-red-600'}>Inactive</span>
                            )}
                          </td>
                          <td className={`px-5 py-3 text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {uploadData?.count ?? '—'}
                          </td>
                          <td className={`px-5 py-3 text-right hidden md:table-cell ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {uploadData ? formatUploadBytes(uploadData.sizeBytes) : '—'}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <Link
                              to={`/master-admin/schools/${id}`}
                              state={{ tab: 'analysis' }}
                              className={linkClass}
                            >
                              View analysis
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                    {schools.length === 0 && (
                      <tr>
                        <td colSpan={5} className={`px-5 py-8 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          No schools found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </MasterAdminLayout>
  );
};

export default PlatformAnalysis;
