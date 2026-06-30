import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FileUp, RefreshCw, Filter, HardDrive } from 'lucide-react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import {
  masterAdminUploadService,
  FileUploadRecord,
  UploadOverview,
  categoryLabel,
  formatUploadBytes,
} from '../../../services/masterAdminUploadService';

interface UploadTrackingPanelProps {
  schoolId?: string;
  title?: string;
  showSchoolColumn?: boolean;
  limit?: number;
}

const formatDate = (value?: string) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const UploadTrackingPanel: React.FC<UploadTrackingPanelProps> = ({
  schoolId,
  title = 'File Uploads',
  showSchoolColumn = !schoolId,
  limit = 100,
}) => {
  const { isDarkMode } = useDarkMode();
  const [uploads, setUploads] = useState<FileUploadRecord[]>([]);
  const [stats, setStats] = useState<UploadOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (schoolId) {
        const [list, schoolStats] = await Promise.all([
          masterAdminUploadService.getSchoolUploads(schoolId, {
            category: categoryFilter || undefined,
            limit,
          }),
          masterAdminUploadService.getSchoolStats(schoolId),
        ]);
        setUploads(list);
        setStats(schoolStats);
      } else {
        const [list, overview] = await Promise.all([
          masterAdminUploadService.getAllUploads({
            category: categoryFilter || undefined,
            limit,
          }),
          masterAdminUploadService.getOverview(),
        ]);
        setUploads(list);
        setStats(overview);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load upload data');
    } finally {
      setLoading(false);
    }
  }, [schoolId, categoryFilter, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const categories = stats
    ? Object.keys(stats.byCategory).sort()
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {categories.length > 0 && (
            <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              isDarkMode ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200 bg-gray-50'
            }`}>
              <Filter className="w-4 h-4 opacity-60" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`bg-transparent outline-none ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{categoryLabel(cat)}</option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={fetchData}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`rounded-xl border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Uploads</p>
            <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.totalUploads}
            </p>
          </div>
          <div className={`rounded-xl border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Storage Used</p>
            <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.totalSizeLabel || formatUploadBytes(stats.totalSizeBytes)}
            </p>
          </div>
          <div className={`rounded-xl border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Categories</p>
            <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {Object.keys(stats.byCategory).length}
            </p>
          </div>
        </div>
      )}

      {stats && Object.keys(stats.byCategory).length > 0 && (
        <div className={`rounded-xl border p-4 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <p className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <HardDrive className="w-4 h-4" />
            Storage by category
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byCategory).map(([cat, data]) => (
              <span
                key={cat}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                  isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {categoryLabel(cat)}: {data.count} · {formatUploadBytes(data.sizeBytes)}
              </span>
            ))}
          </div>
        </div>
      )}

      {uploads.length === 0 ? (
        <div className={`rounded-xl border p-8 text-center ${isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50'}`}>
          <FileUp className={`w-10 h-10 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No file uploads tracked yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full min-w-[900px]">
            <thead className={isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}>
              <tr>
                {showSchoolColumn && (
                  <th className={`px-3 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>School</th>
                )}
                <th className={`px-3 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>File</th>
                <th className={`px-3 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Size</th>
                <th className={`px-3 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Category</th>
                <th className={`px-3 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Module</th>
                <th className={`px-3 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Type</th>
                <th className={`px-3 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Uploaded</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {uploads.map((upload) => (
                <tr key={upload.uploadId} className={isDarkMode ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50'}>
                  {showSchoolColumn && (
                    <td className={`px-3 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {upload.schoolName || '—'}
                    </td>
                  )}
                  <td className={`px-3 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <div className="font-medium truncate max-w-[200px]" title={upload.originalName}>
                      {upload.originalName}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {upload.method} {upload.route}
                    </div>
                  </td>
                  <td className={`px-3 py-3 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {upload.sizeLabel || formatUploadBytes(upload.sizeBytes)}
                  </td>
                  <td className={`px-3 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {categoryLabel(upload.category)}
                  </td>
                  <td className={`px-3 py-3 text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {upload.module?.replace(/_/g, ' ')}
                  </td>
                  <td className={`px-3 py-3 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {upload.mimeType}
                  </td>
                  <td className={`px-3 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formatDate(upload.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UploadTrackingPanel;
