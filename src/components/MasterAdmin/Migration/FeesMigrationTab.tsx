import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  PlayCircle,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import {
  FeeMigrationAnalysis,
  FeeMigrationOptions,
  FeeMigrationSchool,
  masterAdminMigrationService,
  MigrationLogEntry,
  MigrationRun,
} from '../../../services/masterAdminMigrationService';
import { ACADEMIC_YEARS } from '../../../constants/academicYears';

type MigrationMode = 'analyze_only' | 'migrate_skip_existing' | 'dry_run';

const FeesMigrationTab: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<FeeMigrationSchool[]>([]);
  const [options, setOptions] = useState<FeeMigrationOptions | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [yearId, setYearId] = useState('');
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [mode, setMode] = useState<MigrationMode>('migrate_skip_existing');
  const [selectedFeeTypes, setSelectedFeeTypes] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<FeeMigrationAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [running, setRunning] = useState(false);
  const [activeRunId, setActiveRunId] = useState('');
  const [activeRun, setActiveRun] = useState<MigrationRun | null>(null);
  const [logs, setLogs] = useState<MigrationLogEntry[]>([]);

  const card = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const [schoolList, opts] = await Promise.all([
        masterAdminMigrationService.getFeeMigrationSchools(),
        masterAdminMigrationService.getFeeMigrationOptions(),
      ]);
      setSchools(schoolList);
      setOptions(opts);
      setSelectedFeeTypes(opts.feeTypeCodes || []);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load fees migration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  const filteredSchools = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter(
      (s) =>
        (s.schoolName || '').toLowerCase().includes(q) ||
        s.schoolId.toLowerCase().includes(q)
    );
  }, [schools, search]);

  const selectedSchool = schools.find((s) => s.schoolId === selectedSchoolId);

  useEffect(() => {
    if (!selectedSchoolId) return;
    masterAdminMigrationService
      .getSchoolAcademicYears(selectedSchoolId)
      .then(({ years, currentYear }) => {
        const merged = Array.from(new Set([...years, ...ACADEMIC_YEARS])).sort();
        setAvailableYears(merged);
        setYearId(currentYear || selectedSchool?.currentAcademicYear || merged[merged.length - 1] || '2025-2026');
      })
      .catch(() => {
        setAvailableYears([...ACADEMIC_YEARS]);
        setYearId(selectedSchool?.currentAcademicYear || '2025-2026');
      });
  }, [selectedSchoolId, selectedSchool?.currentAcademicYear]);

  useEffect(() => {
    if (!activeRunId) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

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
        } else if (selectedSchoolId && yearId) {
          const fresh = await masterAdminMigrationService.analyzeSchoolFees(selectedSchoolId, yearId);
          setAnalysis(fresh);
        }
      } catch {
        timer = setTimeout(tick, 4000);
      }
    };

    tick();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [activeRunId, selectedSchoolId, yearId]);

  const runAnalyze = async () => {
    if (!selectedSchoolId || !yearId) return toast.error('Select school and academic year');
    setAnalyzing(true);
    try {
      const result = await masterAdminMigrationService.analyzeSchoolFees(selectedSchoolId, yearId);
      setAnalysis(result);
      toast.success('Analysis complete');
    } catch (e: any) {
      toast.error(e.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const runMigration = async () => {
    if (!selectedSchoolId || !yearId) return toast.error('Select school and academic year');
    setRunning(true);
    try {
      if (mode === 'analyze_only') {
        await runAnalyze();
        return;
      }
      const res = await masterAdminMigrationService.startFeeMigration({
        schoolId: selectedSchoolId,
        yearId,
        dryRun: mode === 'dry_run',
        skipExisting: mode === 'migrate_skip_existing',
        feeTypeCodes: selectedFeeTypes,
        syncFeeSettings: true,
      });
      if (res.runId) {
        setActiveRunId(res.runId);
        setActiveRun(null);
        setLogs([]);
        toast.success(mode === 'dry_run' ? 'Dry run started' : 'Fees migration started');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to start migration');
    } finally {
      setRunning(false);
    }
  };

  const toggleFeeType = (code: string) => {
    setSelectedFeeTypes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const renderStatusBadge = (status?: string) => {
    if (!status) return null;
    const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold';
    if (status === 'completed' || status === 'completed_with_errors')
      return <span className={`${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`}>{status}</span>;
    if (status === 'failed') return <span className={`${base} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`}>Failed</span>;
    if (status === 'running') return <span className={`${base} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`}>Running</span>;
    if (status === 'queued') return <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`}>Queued</span>;
    return <span className={`${base} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`rounded-xl border p-4 ${card}`}>
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Why fees show ₹0 after login</p>
            <p className={`text-sm mt-1 ${muted}`}>
              The new fees module reads from <code className="text-xs">feePayments</code> and{' '}
              <code className="text-xs">studentFeeAssignments</code>. Existing schools still store payments under legacy{' '}
              <code className="text-xs">studentFees/...</code> paths. This migration copies legacy records into the unified
              format without deleting old data. Safe to re-run — already migrated payments are skipped.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${muted}`} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search schools by name or ID..."
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div className={`rounded-xl border overflow-hidden max-h-[280px] overflow-y-auto ${card}`}>
            {filteredSchools.map((s) => (
              <button
                key={s.schoolId}
                type="button"
                onClick={() => setSelectedSchoolId(s.schoolId)}
                className={`w-full text-left px-4 py-3 border-b last:border-b-0 transition-colors ${
                  selectedSchoolId === s.schoolId
                    ? isDarkMode
                      ? 'bg-indigo-900/40'
                      : 'bg-indigo-50'
                    : isDarkMode
                      ? 'hover:bg-gray-700/50 border-gray-700'
                      : 'hover:bg-gray-50 border-gray-100'
                }`}
              >
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{s.schoolName}</p>
                <p className={`text-xs ${muted}`}>
                  {s.schoolId} · Year: {s.currentAcademicYear || '—'}
                </p>
              </button>
            ))}
          </div>

          {selectedSchoolId && (
            <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedSchool?.schoolName || selectedSchoolId}
              </h3>

              <div>
                <label className={`text-sm font-medium ${muted}`}>Academic year</label>
                <select
                  value={yearId}
                  onChange={(e) => setYearId(e.target.value)}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 ${
                    isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className={`text-sm font-medium mb-2 ${muted}`}>Migration mode</p>
                <div className="space-y-2">
                  {(options?.modes || []).map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${
                        mode === m.id
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
                          : isDarkMode
                            ? 'border-gray-700'
                            : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="feeMigrationMode"
                        checked={mode === m.id}
                        onChange={() => setMode(m.id as MigrationMode)}
                        className="mt-1"
                      />
                      <div>
                        <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {m.label}
                          {m.recommended ? ' (Recommended)' : ''}
                        </p>
                        <p className={`text-xs mt-0.5 ${muted}`}>{m.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className={`text-sm font-medium mb-2 ${muted}`}>Fee types to migrate</p>
                <div className="flex flex-wrap gap-2">
                  {(options?.presets || []).map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => toggleFeeType(p.code)}
                      className={`px-3 py-1.5 rounded-full text-sm border ${
                        selectedFeeTypes.includes(p.code)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : isDarkMode
                            ? 'border-gray-600 text-gray-300'
                            : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={runAnalyze}
                  disabled={analyzing}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  {analyzing ? 'Analyzing...' : 'Analyze'}
                </button>
                <button
                  type="button"
                  onClick={runMigration}
                  disabled={running || selectedFeeTypes.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                >
                  <PlayCircle className="w-4 h-4" />
                  {running ? 'Starting...' : mode === 'analyze_only' ? 'Run analysis' : 'Start migration'}
                </button>
                <button
                  type="button"
                  onClick={fetchInitial}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-4">
          {analysis && (
            <div className={`rounded-xl border p-5 space-y-3 ${card}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analysis</h3>
                {analysis.summary.needsMigration ? (
                  <span className="inline-flex items-center gap-1 text-amber-600 text-sm">
                    <AlertTriangle className="w-4 h-4" /> Needs migration
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> In sync
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <p className={muted}>Legacy total</p>
                  <p className="font-bold">₹{analysis.summary.legacyPaymentTotal.toLocaleString()}</p>
                </div>
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <p className={muted}>Engine total</p>
                  <p className="font-bold">₹{analysis.summary.engineTotalPaid.toLocaleString()}</p>
                </div>
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <p className={muted}>Delta</p>
                  <p className={`font-bold ${analysis.summary.deltaTotal !== 0 ? 'text-amber-600' : ''}`}>
                    ₹{analysis.summary.deltaTotal.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {analysis.discrepancies.map((d) => (
                  <div
                    key={d.feeTypeCode}
                    className={`p-2 rounded-lg text-xs ${isDarkMode ? 'bg-gray-900/40' : 'bg-gray-50'}`}
                  >
                    <p className="font-semibold">{d.feeTypeName}</p>
                    <p className={muted}>
                      Legacy: {d.legacyRecords} records · ₹{d.legacyTotalAmount.toLocaleString()} · Engine:{' '}
                      {d.enginePayments} payments · ₹{d.engineTotalPaid.toLocaleString()}
                      {d.needsMigration ? ' · ⚠ migrate' : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`rounded-xl border overflow-hidden ${card}`}>
            <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Migration logs</h3>
                {activeRun ? renderStatusBadge(activeRun.status) : null}
              </div>
            </div>
            <div className="p-4">
              {!activeRunId ? (
                <p className={`text-sm text-center py-8 ${muted}`}>Run analyze or migration to see logs.</p>
              ) : (
                <div className={`max-h-[360px] overflow-y-auto rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  {logs.length === 0 ? (
                    <p className={`p-4 text-sm text-center ${muted}`}>Waiting for logs...</p>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {logs.map((l) => (
                        <div key={l.id} className="p-3">
                          <p className={`text-xs ${muted}`}>
                            {l.level?.toUpperCase()} {l.module ? `· ${l.module}` : ''}
                            {l.ts?._seconds ? ` · ${new Date(l.ts._seconds * 1000).toLocaleString()}` : ''}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{l.message}</p>
                          {l.stats ? (
                            <pre className={`text-xs mt-1 overflow-x-auto ${muted}`}>{JSON.stringify(l.stats, null, 2)}</pre>
                          ) : null}
                          {l.discrepancies ? (
                            <pre className={`text-xs mt-1 overflow-x-auto max-h-24 ${muted}`}>
                              {JSON.stringify(l.discrepancies, null, 2)}
                            </pre>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesMigrationTab;
