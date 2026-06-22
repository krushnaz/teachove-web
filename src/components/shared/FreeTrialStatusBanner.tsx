import React from 'react';
import { Sparkles } from 'lucide-react';

interface FreeTrialStatusBannerProps {
  studentCount?: number;
  compact?: boolean;
}

const FreeTrialStatusBanner: React.FC<FreeTrialStatusBannerProps> = ({
  studentCount,
  compact = false,
}) => {
  return (
    <div
      className={`w-full rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-800/50 dark:from-amber-950/40 dark:to-orange-950/30 ${
        compact ? 'p-3.5' : 'p-4'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ${
            compact ? 'h-9 w-9' : 'h-10 w-10'
          }`}
        >
          <Sparkles className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={`font-bold text-amber-900 dark:text-amber-200 ${
              compact ? 'text-sm' : 'text-base'
            }`}
          >
            Free Trial Active
          </p>
          <p
            className={`mt-1 leading-relaxed text-amber-900/80 dark:text-amber-100/80 ${
              compact ? 'text-xs' : 'text-sm'
            }`}
          >
            Your school can add students and use all modules without subscription limits while free
            trial is enabled.
          </p>
          {studentCount != null && (
            <p className="mt-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              Students enrolled: {studentCount}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreeTrialStatusBanner;
