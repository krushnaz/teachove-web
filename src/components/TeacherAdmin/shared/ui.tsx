import React from 'react';
import { LucideIcon, AlertCircle, Search } from 'lucide-react';

export type StatColor = 'indigo' | 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'sky';

const statColors: Record<StatColor, { bg: string; text: string }> = {
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400' },
  sky: { bg: 'bg-sky-50 dark:bg-sky-900/20', text: 'text-sky-600 dark:text-sky-400' },
};

export const TeacherPageShell: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`space-y-3 sm:space-y-6 font-sans ${className}`}>{children}</div>
);

export const TeacherPageHeader: React.FC<{
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => (
  <div className="flex items-start justify-between gap-3 sm:gap-4">
    <div className="min-w-0 flex-1 pr-2">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
        {title}
      </h1>
      {description && (
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">{description}</p>
      )}
    </div>
    {action && (
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 flex-nowrap self-start">
        {action}
      </div>
    )}
  </div>
);

export const TeacherHeaderActions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap justify-end">{children}</div>
);

export const TeacherStatsGrid: React.FC<{ children: React.ReactNode; cols?: 2 | 3 | 4 }> = ({
  children,
  cols = 4,
}) => (
  <div
    className={`grid gap-3 sm:gap-4 ${
      cols === 2
        ? 'grid-cols-2'
        : cols === 3
          ? 'grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-2 lg:grid-cols-4'
    }`}
  >
    {children}
  </div>
);

export const TeacherStatCard: React.FC<{
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  color?: StatColor;
  subtitle?: string;
}> = ({ title, value, icon: Icon, color = 'indigo', subtitle }) => {
  const c = statColors[color];
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-2 sm:mb-3">
        <div className={`p-2 sm:p-2.5 rounded-lg ${c.bg} ${c.text}`}>
          <Icon size={18} />
        </div>
        {subtitle && (
          <span className={`text-[10px] sm:text-xs font-medium ${c.text} text-right leading-tight`}>
            {subtitle}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{value}</h3>
        <p className="text-[10px] sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5 truncate">
          {title}
        </p>
      </div>
    </div>
  );
};

export const TeacherFilterBar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
    <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">{children}</div>
  </div>
);

export const TeacherSearchInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder = 'Search...', className = '' }) => (
  <div className={`relative flex-1 min-w-0 ${className}`}>
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
    />
  </div>
);

export const TeacherSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}> = ({ value, onChange, options, className = 'sm:w-44' }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full ${className} px-3 py-2 sm:py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

export const TeacherPanel: React.FC<{
  children: React.ReactNode;
  title?: string;
  headerAction?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}> = ({ children, title, headerAction, className = '', noPadding }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}
  >
    {(title || headerAction) && (
      <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
        {title && (
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
        )}
        {headerAction}
      </div>
    )}
    <div className={noPadding ? '' : 'p-4 sm:p-6'}>{children}</div>
  </div>
);

export const TeacherCardGrid: React.FC<{
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
}> = ({ children, cols = 3 }) => {
  const colClass =
    cols === 1
      ? 'grid-cols-1'
      : cols === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  return <div className={`grid ${colClass} gap-3 sm:gap-4`}>{children}</div>;
};

export const TeacherItemCard: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = '' }) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 ${
      onClick ? 'cursor-pointer hover:border-indigo-500/30 dark:hover:border-indigo-400/30' : ''
    } ${className}`}
  >
    {children}
  </div>
);

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export const TeacherButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    loading?: boolean;
    icon?: LucideIcon;
    compact?: boolean;
  }
> = ({ variant = 'primary', loading, icon: Icon, compact, children, className = '', disabled, ...props }) => {
  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 disabled:bg-indigo-400',
    secondary:
      'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-400',
    ghost:
      'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  };

  const sizeClass = compact
    ? 'px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm'
    : 'px-4 py-2 sm:py-2.5 text-sm';

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed whitespace-nowrap ${sizeClass} ${variants[variant]} ${className}`}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {!loading && Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

export const TeacherTableWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TeacherPanel noPadding>
    <div className="overflow-x-auto">{children}</div>
  </TeacherPanel>
);

export const TeacherTable: React.FC<{
  headers: string[];
  children: React.ReactNode;
  minWidth?: string;
}> = ({ headers, children, minWidth = '640px' }) => (
  <table className="w-full text-left border-collapse" style={{ minWidth }}>
    <thead>
      <tr className="bg-gray-50 dark:bg-gray-900/50">
        {headers.map((header) => (
          <th
            key={header}
            className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">{children}</tbody>
  </table>
);

export const TeacherLoading: React.FC<{ message?: string }> = ({
  message = 'Loading...',
}) => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="flex flex-col items-center text-center px-4">
      <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-600 rounded-full animate-spin" />
      <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  </div>
);

export const TeacherError: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Something went wrong', message, onRetry }) => (
  <div className="flex items-center justify-center min-h-[50vh] p-4">
    <div className="max-w-md w-full text-center bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={28} />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{message}</p>
      {onRetry && (
        <TeacherButton onClick={onRetry} className="w-full sm:w-auto">
          Try Again
        </TeacherButton>
      )}
    </div>
  </div>
);

export const TeacherEmpty: React.FC<{
  title?: string;
  description?: string;
  icon?: LucideIcon;
}> = ({ title = 'No data found', description, icon: Icon }) => (
  <div className="text-center py-10 sm:py-12 px-4">
    {Icon && (
      <div className="mx-auto w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
        <Icon size={22} className="text-gray-400" />
      </div>
    )}
    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
    {description && (
      <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">{description}</p>
    )}
  </div>
);

export const TeacherStatsSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <TeacherStatsGrid>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 animate-pulse h-28 sm:h-32"
      >
        <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 mb-4" />
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    ))}
  </TeacherStatsGrid>
);

export const TeacherTableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 5,
}) => (
  <TeacherPanel noPadding>
    <div className="overflow-x-auto p-4 sm:p-6 space-y-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 animate-pulse">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"
              style={{ maxWidth: c === 0 ? '40px' : undefined }}
            />
          ))}
        </div>
      ))}
    </div>
  </TeacherPanel>
);
