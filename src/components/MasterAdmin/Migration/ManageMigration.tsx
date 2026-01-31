import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Search, PlayCircle, RefreshCw, ClipboardList } from 'lucide-react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { masterAdminMigrationService, LegacySchool, MigrationRun } from '../../../services/masterAdminMigrationService';
import StartMigrationModal from './StartMigrationModal';

const ManageMigration: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<LegacySchool[]>([]);
  const [search, setSearch] = useState('');

  const [selectedSchool, setSelectedSchool] = useState<LegacySchool | null>(null);
  const [startModalOpen, setStartModalOpen] = useState(false);

  const [activeRunId, setActiveRunId] = useState<string>('');
  const [activeRun, setActiveRun] = useState<MigrationRun | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const data = await masterAdminMigrationService.getLegacySchools();
      setSchools(data);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return schools;
    return schools.filter(
      (s) =>
        (s.schoolName || '').toLowerCase().includes(t) ||
        (s.email || '').toLowerCase().includes(t) ||
        (s.legacySchoolId || '').toLowerCase().includes(t)
    );
  }, [schools, search]);

  // Poll active run
  useEffect(() => {
    if (!activeRunId) return;
    let stopped = false;
    let timer: any;

    const tick = async () => {
      try {
        const [run, runLogs] = await Promise.all([
          masterAdminMigrationService.getRun(activeRunId),
          masterAdminMigrationService.getRunLogs(activeRunId),
        ]);
        if (stopped) return;
        setActiveRun(run);
        setLogs(runLogs);
        if (run.status === 'running' || run.status === 'queued') {
          timer = setTimeout(tick, 2500);
        }
      } catch (_e) {
        timer = setTimeout(tick, 4000);
      }
    };

    tick();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [activeRunId]);

  const renderStatusBadge = (status?: string) => {
    if (!status) return null;
    const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold';
    if (status === 'completed') return <span className={`${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`}>Completed</span>;
    if (status === 'failed') return <span className={`${base} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`}>Failed</span>;
    if (status === 'running') return <span className={`${base} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`}>Running</span>;
    if (status === 'queued') return <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`}>Queued</span>;
    return <span className={`${base} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Manage Migration</h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Migrate old Firebase-only school data into new paths (safe copy + logs).
          </p>
        </div>
        <button
          onClick={fetchSchools}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search legacy schools by name / email / legacyId..."
          className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
          }`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Schools</h2>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{filtered.length}</span>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="p-10 text-center">
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No schools found.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.map((s) => {
                  const id = s.legacySchoolId || '';
                  return (
                    <div key={id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{s.schoolName}</p>
                        <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          LegacyId: {id} {s.email ? `• ${s.email}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <button
                          onClick={async () => {
                            try {
                              const runs = await masterAdminMigrationService.getLegacySchoolRuns(id);
                              if (runs.length === 0) {
                                toast.info('No previous runs for this school');
                                return;
                              }
                              setActiveRunId(runs[0].runId);
                            } catch (e: any) {
                              toast.error(e.message || 'Failed to load runs');
                            }
                          }}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          }`}
                        >
                          <ClipboardList className="w-4 h-4" /> View last run
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSchool(s);
                            setStartModalOpen(true);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          <PlayCircle className="w-4 h-4" /> Migrate
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Migration Status</h2>
                {activeRun ? renderStatusBadge(activeRun.status) : null}
              </div>
            </div>

            <div className="p-5 space-y-4">
              {!activeRunId ? (
                <div className="text-center py-10">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Select a school and start migration to see progress.</p>
                </div>
              ) : !activeRun ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-gray-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <b>Run:</b> {activeRun.runId}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <b>School:</b> {activeRun.schoolId}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <b>Legacy:</b> {activeRun.legacySchoolId}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <b>Academic Year:</b> {activeRun.yearId || '—'}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <b>Current module:</b> {activeRun.currentModule || '—'}
                    </p>
                    {activeRun.status === 'failed' && activeRun.error ? (
                      <p className="text-sm text-red-600 dark:text-red-300 mt-2">
                        <b>Error:</b> {activeRun.error}
                      </p>
                    ) : null}
                  </div>

                  {activeRun.modules ? (
                    <div className="space-y-2">
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Modules</p>
                      <div className="space-y-2">
                        {Object.entries(activeRun.modules).map(([k, v]) => (
                          <div key={k} className={`p-3 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex items-center justify-between">
                              <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{k}</p>
                              {renderStatusBadge(v.status)}
                            </div>
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              processed: {v.processed} • written: {v.written} • skipped: {v.skipped} • errors: {v.errors}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Live log</p>
                    <div className={`max-h-[320px] overflow-y-auto rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-gray-50'}`}>
                      {logs.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No logs yet.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {logs.map((l: any) => (
                            <div key={l.id} className="p-3">
                              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {l.level?.toUpperCase()} {l.module ? `• ${l.module}` : ''} {l.ts?._seconds ? `• ${new Date(l.ts._seconds * 1000).toLocaleString()}` : ''}
                              </p>
                              <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'} text-sm`}>{l.message}</p>
                              {l.stats ? (
                                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {JSON.stringify(l.stats)}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedSchool && (
        <StartMigrationModal
          isOpen={startModalOpen}
          legacySchoolId={selectedSchool.legacySchoolId || ''}
          schoolName={selectedSchool.schoolName || selectedSchool.legacySchoolId || 'School'}
          onClose={() => setStartModalOpen(false)}
          onStarted={(runId) => {
            toast.success('Migration started');
            setStartModalOpen(false);
            setActiveRunId(runId);
            setActiveRun(null);
            setLogs([]);
          }}
        />
      )}
    </div>
  );
};

export default ManageMigration;

