import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { ChevronRight, Search } from 'lucide-react';
import { classroomService, Classroom } from '../../../services/classroomService';
import { loadStudentFees, loadStudentFeesList, UnifiedStudent } from '../../../services/unifiedFeesService';
import { FeeType } from '../../../services/feeTypeService';
import StudentFeesPanel from './StudentFeesPanel';
import { toast } from 'react-toastify';
import {
  feesBtnPrimary,
  feesCard,
  feesInput,
  feesMuted,
  feesSelect,
  feesStatLabel,
  feesStatValue,
  feesTableHead,
  feesTableRow,
  feesTableWrap,
} from './feesTheme';

interface Props {
  yearId: string;
}

const PAGE_SIZE = 30;

const UnifiedFeesView: React.FC<Props> = ({ yearId }) => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const schoolId = user?.schoolId;

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [students, setStudents] = useState<UnifiedStudent[]>([]);
  const [totals, setTotals] = useState({ totalDue: 0, totalPaid: 0, totalBalance: 0 });
  const [pagination, setPagination] = useState({ page: 1, total: 0, hasMore: false });
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');
  const [selectedStudent, setSelectedStudent] = useState<UnifiedStudent | null>(null);
  const listRequestId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      if (!schoolId) return;
      const requestId = ++listRequestId.current;

      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        const data = await loadStudentFeesList(schoolId, yearId, {
          page,
          limit: PAGE_SIZE,
          search: debouncedQuery || undefined,
          classId: classFilter || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
        });

        if (requestId !== listRequestId.current) return;

        setFeeTypes(data.feeTypes);
        setTotals(data.totals);
        setPagination({
          page: data.pagination.page,
          total: data.pagination.total,
          hasMore: data.pagination.hasMore,
        });
        setStudents((prev) => (append ? [...prev, ...data.students] : data.students));
        if (!append) {
          setSelectedStudent((prev) => {
            if (!prev) return null;
            // Keep full fee breakdown when the detail panel is open (lite list only has school fee).
            if (prev.fees.length > 1) return prev;
            const row = data.students.find((s) => s.studentId === prev.studentId);
            return row || prev;
          });
        }
      } catch (err: unknown) {
        if (requestId === listRequestId.current) {
          const ax = err as { response?: { status?: number; data?: { code?: string } } };
          if (ax.response?.status !== 403 || ax.response?.data?.code !== 'SCHOOL_SUBSCRIPTION_EXPIRED') {
            toast.error('Failed to load fees');
          }
        }
      } finally {
        if (requestId === listRequestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [schoolId, yearId, debouncedQuery, classFilter, statusFilter]
  );

  useEffect(() => {
    if (!schoolId) return;
    classroomService.getClassesBySchoolId(schoolId, yearId).then(setClassrooms).catch(() => {});
  }, [schoolId, yearId]);

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = () => {
    if (!pagination.hasMore || loadingMore) return;
    fetchPage(pagination.page + 1, true);
  };

  const openStudent = async (s: UnifiedStudent) => {
    if (!schoolId) return;
    try {
      const full = await loadStudentFees(schoolId, yearId, s.studentId);
      setSelectedStudent(full);
    } catch {
      toast.error('Could not load fee details');
      setSelectedStudent(s);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      partial: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    };
    return map[status] || (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600');
  };

  const listSummary = useMemo(() => {
    const shown = students.length;
    const total = pagination.total;
    return total > shown ? `${shown} of ${total} students` : `${shown} student(s)`;
  }, [students.length, pagination.total]);

  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center h-48 items-center">
        <div className="animate-spin h-11 w-11 border-b-2 border-primary-600 rounded-full" />
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 mb-4">
        {[
          { label: 'Total Due', value: totals.totalDue, accent: isDarkMode ? 'text-blue-400' : 'text-blue-600' },
          { label: 'Collected', value: totals.totalPaid, accent: isDarkMode ? 'text-green-400' : 'text-green-600' },
          { label: 'Pending', value: totals.totalBalance, accent: isDarkMode ? 'text-orange-400' : 'text-orange-600' },
        ].map((c) => (
          <div key={c.label} className={`p-5 ${feesCard(isDarkMode)}`}>
            <p className={feesStatLabel(isDarkMode)}>{c.label}</p>
            <p className={feesStatValue(isDarkMode, c.accent)}>₹ {c.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className={`p-5 mb-4 ${feesCard(isDarkMode)}`}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${feesMuted(isDarkMode)}`} />
            <input
              placeholder="Search student name, roll no..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${feesInput(isDarkMode)} pl-11 w-full`}
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className={feesSelect(isDarkMode)}
          >
            <option value="">All classes</option>
            {classrooms.map((c) => (
              <option key={c.classId} value={c.classId}>{c.className} {c.section}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className={feesSelect(isDarkMode)}
          >
            <option value="all">All status</option>
            <option value="paid">Fully paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
        <p className={`text-sm mt-3 ${feesMuted(isDarkMode)}`}>
          {listSummary} · Tap a student to manage fees
        </p>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {students.map((s) => (
          <button
            key={s.studentId}
            type="button"
            onClick={() => openStudent(s)}
            className={`w-full text-left p-5 ${feesCard(isDarkMode)} hover:opacity-95 transition-opacity`}
          >
            <div className="flex justify-between gap-2 items-center">
              <div>
                <p className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{s.studentName}</p>
                <p className={`text-sm mt-1 ${feesMuted(isDarkMode)}`}>{s.className} {s.section} · Roll {s.rollNo}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-sm capitalize ${statusBadge(s.overallStatus)}`}>{s.overallStatus}</span>
                <ChevronRight className={`w-5 h-5 ${feesMuted(isDarkMode)}`} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className={`hidden md:block ${feesTableWrap(isDarkMode)}`}>
        <table className="w-full text-base">
          <thead className={feesTableHead(isDarkMode)}>
            <tr>
              {['Student', 'Class', 'Roll', 'Status', ''].map((h) => (
                <th key={h || 'action'} className={`px-4 py-3.5 font-semibold ${h === '' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.studentId} className={`border-t ${feesTableRow(isDarkMode)}`}>
                <td className="px-4 py-3.5 font-semibold">{s.studentName}</td>
                <td className="px-4 py-3.5">{s.className} {s.section}</td>
                <td className="px-4 py-3.5">{s.rollNo}</td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-sm capitalize ${statusBadge(s.overallStatus)}`}>{s.overallStatus}</span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => openStudent(s)}
                    className={`${feesBtnPrimary} !text-sm !py-2 !px-3`}
                  >
                    Manage fees
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && !loading && (
          <p className={`text-center py-12 text-base ${feesMuted(isDarkMode)}`}>No students found</p>
        )}
      </div>

      {pagination.hasMore && (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className={`${feesBtnPrimary} min-w-[160px]`}
          >
            {loadingMore ? 'Loading…' : 'Load more students'}
          </button>
        </div>
      )}

      {selectedStudent && schoolId && (
        <StudentFeesPanel
          student={selectedStudent}
          feeTypes={feeTypes}
          schoolId={schoolId}
          yearId={yearId}
          onClose={() => setSelectedStudent(null)}
          onRefresh={async () => {
            if (!schoolId || !selectedStudent) return;
            try {
              const updated = await loadStudentFees(schoolId, yearId, selectedStudent.studentId);
              setSelectedStudent(updated);
              setStudents((prev) =>
                prev.map((s) =>
                  s.studentId === updated.studentId
                    ? {
                        ...s,
                        totalDue: updated.totalDue,
                        totalPaid: updated.totalPaid,
                        totalBalance: updated.totalBalance,
                        overallStatus: updated.overallStatus,
                      }
                    : s
                )
              );
              fetchPage(1, false);
            } catch {
              toast.error('Failed to refresh student fees');
            }
          }}
        />
      )}
    </>
  );
};

export default UnifiedFeesView;
