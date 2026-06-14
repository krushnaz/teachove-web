import React from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { SchoolPlanSummary } from '../../../utils/schoolPlanHelpers';

interface SchoolPlanBadgeProps {
  plan: SchoolPlanSummary;
  compact?: boolean;
}

const SchoolPlanBadge: React.FC<SchoolPlanBadgeProps> = ({ plan, compact = false }) => {
  const { isDarkMode } = useDarkMode();

  const styles: Record<SchoolPlanSummary['status'], string> = {
    free_trial: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    none: isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600',
  };

  const statusHint: Record<SchoolPlanSummary['status'], string> = {
    free_trial: 'Trial',
    active: 'Active',
    expired: 'Expired',
    pending: 'Pending',
    none: '',
  };

  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`inline-flex max-w-[140px] items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[plan.status]}`}
        title={plan.planLabel}
      >
        <span className="truncate">{plan.planLabel}</span>
      </span>
      {!compact && plan.status !== 'none' && statusHint[plan.status] ? (
        <span className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {statusHint[plan.status]}
        </span>
      ) : null}
    </div>
  );
};

export default SchoolPlanBadge;
