import React from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, LayoutDashboard, Loader2, Users } from 'lucide-react';
import { ACADEMIC_YEARS, getDefaultAcademicYear } from '../../../constants/academicYears';
import { useFeesSubscriptionAccess } from '../../../hooks/useFeesSubscriptionAccess';
import UnifiedFeesView from './UnifiedFeesView';
import FeesSubscriptionBlock from './FeesSubscriptionBlock';
import { feesBanner, feesBtnPrimary, feesMuted, feesRoot, feesSelect } from './feesTheme';

const StudentFees: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const schoolId = user?.schoolId;
  const { loading: subscriptionLoading, canAccessFees, details } = useFeesSubscriptionAccess(schoolId);
  const [searchParams, setSearchParams] = useSearchParams();
  const yearId = getDefaultAcademicYear(
    searchParams.get('year') || (user as { yearId?: string })?.yearId
  );

  return (
    <div className={`space-y-6 ${feesRoot(isDarkMode)}`}>
      <div className={feesBanner(isDarkMode)}>
        <span className="inline-flex items-center gap-2">
          <Calendar className="w-4 h-4 shrink-0 opacity-80" />
          Academic year: <span className="font-semibold">{yearId}</span>
        </span>
        <span className="mx-2 opacity-50">·</span>
        <span className="inline-flex items-center gap-2">
          <Users className="w-4 h-4 shrink-0 opacity-80" />
          One student list — open a student to manage all fee types
        </span>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-end">
        <label className={`flex items-center gap-2 text-base font-medium ${feesMuted(isDarkMode)}`}>
          <Calendar className="w-4 h-4" />
          Year
        </label>
        <select
          value={yearId}
          onChange={(e) => setSearchParams({ year: e.target.value })}
          className={`min-w-[160px] ${feesSelect(isDarkMode)}`}
          disabled={!canAccessFees}
        >
          {ACADEMIC_YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        {canAccessFees && (
          <Link
            to={`/school-admin/fees/dashboard?year=${encodeURIComponent(yearId)}`}
            className={feesBtnPrimary}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        )}
      </div>

      {subscriptionLoading ? (
        <div className="flex justify-center h-48 items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
        </div>
      ) : canAccessFees ? (
        <UnifiedFeesView key={yearId} yearId={yearId} />
      ) : (
        <FeesSubscriptionBlock details={details} />
      )}
    </div>
  );
};

export default StudentFees;
