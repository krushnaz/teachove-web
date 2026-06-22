import React, { useEffect, useState } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  IndianRupee,
  Loader2,
} from 'lucide-react';
import { feeEngineService } from '../../../services/feeEngineService';
import { feeTypeService, FeeType } from '../../../services/feeTypeService';
import { classroomService, Classroom } from '../../../services/classroomService';
import { ACADEMIC_YEARS, getDefaultAcademicYear } from '../../../constants/academicYears';
import { useFeesSubscriptionAccess } from '../../../hooks/useFeesSubscriptionAccess';
import FeesSubscriptionBlock from './FeesSubscriptionBlock';
import { toast } from 'react-toastify';
import {
  feesBanner,
  feesBtnPrimary,
  feesBtnSecondary,
  feesCard,
  feesChip,
  feesHeading,
  feesMuted,
  feesRoot,
  feesSectionTitle,
  feesSelect,
  feesStatLabel,
  feesStatValue,
} from './feesTheme';

const FeesDashboard: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const schoolId = user?.schoolId;
  const { loading: subscriptionLoading, canAccessFees, details } = useFeesSubscriptionAccess(schoolId);

  const yearId = getDefaultAcademicYear(
    searchParams.get('year') || (user as { yearId?: string })?.yearId
  );

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingExportMeta, setLoadingExportMeta] = useState(false);
  const [data, setData] = useState<Awaited<ReturnType<typeof feeEngineService.getDashboard>> | null>(null);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [exportFeeType, setExportFeeType] = useState('all');
  const [exportClass, setExportClass] = useState('');
  const [exportStatus, setExportStatus] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!schoolId || !canAccessFees) return;
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        setLoadingDashboard(true);
        const dash = await feeEngineService.getDashboard(schoolId, yearId);
        if (!cancelled) setData(dash);
      } catch {
        if (!cancelled) toast.error('Failed to load dashboard');
      } finally {
        if (!cancelled) setLoadingDashboard(false);
      }
    };

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [schoolId, yearId, canAccessFees]);

  useEffect(() => {
    if (!schoolId || !canAccessFees) return;
    let cancelled = false;

    const loadExportMeta = async () => {
      try {
        setLoadingExportMeta(true);
        const [types, classes] = await Promise.all([
          feeTypeService.getSchoolFeeTypes(schoolId),
          classroomService.getClassesBySchoolId(schoolId, yearId),
        ]);
        if (!cancelled) {
          setFeeTypes(types);
          setClassrooms(classes);
        }
      } catch {
        if (!cancelled) toast.error('Failed to load export filters');
      } finally {
        if (!cancelled) setLoadingExportMeta(false);
      }
    };

    loadExportMeta();
    return () => {
      cancelled = true;
    };
  }, [schoolId, yearId, canAccessFees]);

  const handleExport = async () => {
    if (!schoolId || !canAccessFees) return;
    try {
      setExporting(true);
      const blob = await feeEngineService.exportReport(schoolId, yearId, {
        feeTypeId: exportFeeType === 'all' ? undefined : exportFeeType,
        classId: exportClass || undefined,
        paymentStatus: exportStatus.length ? exportStatus : undefined,
        format: 'xlsx',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fees-report-${yearId}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const toggleExportStatus = (s: string) => {
    setExportStatus((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const statCards = [
    {
      label: 'Total Due',
      value: data?.totalDue,
      icon: IndianRupee,
      accent: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    },
    {
      label: 'Collected',
      value: data?.totalPaid,
      icon: CheckCircle2,
      accent: isDarkMode ? 'text-green-400' : 'text-green-600',
    },
    {
      label: 'Pending',
      value: data?.remainingAmount,
      icon: Clock,
      accent: isDarkMode ? 'text-orange-400' : 'text-orange-600',
    },
    {
      label: 'Collection Rate',
      value: `${data?.collectionRate ?? 0}%`,
      isText: true,
      icon: BarChart3,
      accent: isDarkMode ? 'text-primary-400' : 'text-primary-600',
    },
  ];

  return (
    <div className={`space-y-6 ${feesRoot(isDarkMode)}`}>
      <div className={feesBanner(isDarkMode)}>
        <span className="inline-flex items-center gap-2">
          <Calendar className="w-4 h-4 shrink-0 opacity-80" />
          Academic year: <span className="font-semibold">{yearId}</span>
        </span>
        {data?.yearId && data.yearId !== yearId ? (
          <span className={`ml-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>(loaded: {data.yearId})</span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className={feesHeading(isDarkMode)}>Fees Dashboard</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <label className={`flex items-center gap-2 text-base font-medium ${feesMuted(isDarkMode)}`}>
            <Calendar className="w-4 h-4" />
            Year
          </label>
          <select
            value={yearId}
            onChange={(e) => setSearchParams({ year: e.target.value })}
            className={feesSelect(isDarkMode)}
          >
            {ACADEMIC_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Link
            to={`/school-admin/fees?year=${encodeURIComponent(yearId)}`}
            className={feesBtnSecondary(isDarkMode)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to collections
          </Link>
        </div>
      </div>

      {subscriptionLoading ? (
        <div className="flex justify-center h-48 items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
        </div>
      ) : !canAccessFees ? (
        <FeesSubscriptionBlock details={details} />
      ) : loadingDashboard ? (
        <div className="flex justify-center h-48 items-center">
          <div className="animate-spin h-11 w-11 border-b-2 border-primary-600 rounded-full" />
        </div>
      ) : (
        <>
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-600 text-white p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-base text-white/80">Collection overview · {yearId}</p>
                <p className="text-4xl font-bold mt-1">{data?.collectionRate ?? 0}%</p>
                <p className="text-base text-white/85 mt-2">
                  ₹ {Number(data?.totalPaid || 0).toLocaleString()} collected of ₹ {Number(data?.totalDue || 0).toLocaleString()}
                </p>
              </div>
              <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center bg-white/10">
                <span className="text-xl font-bold">{data?.collectionRate ?? 0}%</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {statCards.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className={`p-5 ${feesCard(isDarkMode)}`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${c.accent}`} />
                    <p className={feesStatLabel(isDarkMode)}>{c.label}</p>
                  </div>
                  <p className={feesStatValue(isDarkMode, c.accent)}>
                    {c.isText ? c.value : `₹ ${Number(c.value || 0).toLocaleString()}`}
                  </p>
                </div>
              );
            })}
          </div>

          <div>
            <h3 className={`${feesSectionTitle(isDarkMode)} mb-4 flex items-center gap-2`}>
              Fee type breakdown
              <span className={`text-sm px-2.5 py-0.5 rounded-full font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-primary-100 text-primary-700'}`}>
                {(data?.byFeeType || []).length}
              </span>
            </h3>
            <div className="space-y-4">
              {(data?.byFeeType || []).map((row) => {
                const pct = row.totalDue > 0 ? Math.min(100, Math.round((row.totalPaid / row.totalDue) * 100)) : 0;
                return (
                  <div key={row.feeTypeId} className={`p-5 ${feesCard(isDarkMode)}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{row.name}</p>
                      <span className={`text-base font-bold ${isDarkMode ? 'text-primary-400' : 'text-primary-600'}`}>{pct}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4 text-base">
                      <div>
                        <span className={`text-sm ${feesMuted(isDarkMode)}`}>Due</span>
                        <p className="font-semibold mt-0.5">₹{row.totalDue.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className={`text-sm ${feesMuted(isDarkMode)}`}>Paid</span>
                        <p className="font-semibold mt-0.5">₹{row.totalPaid.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className={`text-sm ${feesMuted(isDarkMode)}`}>Pending</span>
                        <p className="font-semibold mt-0.5">₹{row.remaining.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className={`p-5 ${feesCard(isDarkMode)}`}>
        <h3 className={`${feesSectionTitle(isDarkMode)} mb-4 flex items-center gap-2`}>
          <Download className="w-5 h-5" />
          Download report
        </h3>
        {loadingExportMeta ? (
          <p className={`text-base inline-flex items-center gap-2 ${feesMuted(isDarkMode)}`}>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading filters...
          </p>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <select
                value={exportFeeType}
                onChange={(e) => setExportFeeType(e.target.value)}
                className={feesSelect(isDarkMode)}
              >
                <option value="all">All fee types</option>
                {feeTypes.map((ft) => (
                  <option key={ft.feeTypeId || ft.id} value={ft.feeTypeId || ft.id}>{ft.name}</option>
                ))}
              </select>
              <select
                value={exportClass}
                onChange={(e) => setExportClass(e.target.value)}
                className={feesSelect(isDarkMode)}
              >
                <option value="">All classes</option>
                {classrooms.map((c) => (
                  <option key={c.classId} value={c.classId}>{c.className} {c.section}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {['paid', 'partial', 'not_paid', 'not_required'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleExportStatus(s)}
                  className={feesChip(isDarkMode, exportStatus.includes(s))}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className={`mt-5 ${feesBtnPrimary}`}
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Excel
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FeesDashboard;
