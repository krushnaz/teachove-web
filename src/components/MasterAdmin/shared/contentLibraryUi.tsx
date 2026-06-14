import React from 'react';
import { ArrowLeft, LucideIcon, Search } from 'lucide-react';

export function useLibraryTheme(isDarkMode: boolean) {
  return {
    page: 'mx-auto max-w-5xl space-y-5 sm:space-y-6',
    panel: isDarkMode
      ? 'overflow-hidden rounded-2xl border border-gray-700/70 bg-gray-800/60 shadow-sm'
      : 'overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm',
    panelHeader: isDarkMode ? 'border-b border-gray-700/60 px-4 py-4 sm:px-5' : 'border-b border-gray-100 px-4 py-4 sm:px-5',
    panelBody: 'p-4 sm:p-5',
    search: isDarkMode
      ? 'w-full rounded-xl border border-gray-700 bg-gray-900/40 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30'
      : 'w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
    primaryBtn:
      'inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700',
    secondaryBtn: isDarkMode
      ? 'inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-xl border border-gray-600 bg-gray-700/60 px-3 py-2 text-sm font-medium text-gray-100 transition hover:bg-gray-600'
      : 'inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50',
    ghostBtn: isDarkMode
      ? 'inline-flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-xl text-gray-300 transition hover:bg-gray-700/70'
      : 'inline-flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100',
    accentBtn: isDarkMode
      ? 'inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-xl bg-indigo-500/15 px-3 py-2 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/25'
      : 'inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100',
    dangerBtn: isDarkMode
      ? 'inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20'
      : 'inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100',
    itemCard: isDarkMode
      ? 'flex flex-col gap-3 rounded-xl border border-gray-700/60 bg-gray-900/30 p-4'
      : 'flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-4',
    muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    title: isDarkMode ? 'text-white' : 'text-gray-900',
    subtitle: isDarkMode ? 'text-gray-400' : 'text-gray-600',
  };
}

interface PageHeaderProps {
  isDarkMode: boolean;
  title: string;
  subtitle: string;
  onBack?: () => void;
  backLabel?: string;
  actions?: React.ReactNode;
}

export const LibraryPageHeader: React.FC<PageHeaderProps> = ({
  isDarkMode,
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  actions,
}) => {
  const t = useLibraryTheme(isDarkMode);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        {onBack && (
          <button type="button" onClick={onBack} className={t.ghostBtn} title={backLabel} aria-label={backLabel}>
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className={`truncate text-xl font-semibold tracking-tight sm:text-2xl ${t.title}`}>{title}</h1>
          <p className={`mt-1 text-sm ${t.subtitle}`}>{subtitle}</p>
        </div>
      </div>
      {actions ? <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">{actions}</div> : null}
    </div>
  );
};

interface SearchFieldProps {
  isDarkMode: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const LibrarySearchField: React.FC<SearchFieldProps> = ({ isDarkMode, value, onChange, placeholder }) => {
  const t = useLibraryTheme(isDarkMode);
  return (
    <div className="relative">
      <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${t.muted}`} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={t.search}
      />
    </div>
  );
};

interface PanelProps {
  isDarkMode: boolean;
  title: string;
  icon?: LucideIcon;
  count?: number;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
}

export const LibraryPanel: React.FC<PanelProps> = ({ isDarkMode, title, icon: Icon, count, children, headerExtra }) => {
  const t = useLibraryTheme(isDarkMode);
  return (
    <div className={t.panel}>
      <div className={`${t.panelHeader} flex items-center justify-between gap-3`}>
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon ? <Icon className="h-5 w-5 flex-shrink-0 text-indigo-500" /> : null}
          <h2 className={`truncate text-base font-semibold ${t.title}`}>{title}</h2>
          {count !== undefined ? (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {count}
            </span>
          ) : null}
        </div>
        {headerExtra}
      </div>
      {children}
    </div>
  );
};

interface EmptyStateProps {
  isDarkMode: boolean;
  icon: LucideIcon;
  message: string;
  action?: React.ReactNode;
}

export const LibraryEmptyState: React.FC<EmptyStateProps> = ({ isDarkMode, icon: Icon, message, action }) => {
  const t = useLibraryTheme(isDarkMode);
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center sm:py-14">
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
          isDarkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-400'
        }`}
      >
        <Icon className="h-7 w-7" />
      </div>
      <p className={`max-w-sm text-sm ${t.subtitle}`}>{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
};

interface ClassAvatarProps {
  name: string;
  isDarkMode: boolean;
}

export const ClassAvatar: React.FC<ClassAvatarProps> = ({ name, isDarkMode }) => (
  <div
    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
      isDarkMode ? 'bg-indigo-500/20 text-indigo-200' : 'bg-indigo-100 text-indigo-700'
    }`}
  >
    {(name?.charAt(0) || 'C').toUpperCase()}
  </div>
);

interface BreadcrumbProps {
  isDarkMode: boolean;
  items: string[];
}

export const LibraryBreadcrumb: React.FC<BreadcrumbProps> = ({ isDarkMode, items }) => (
  <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
    {items.map((item, i) => (
      <React.Fragment key={`${item}-${i}`}>
        {i > 0 ? <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>/</span> : null}
        <span
          className={
            i === items.length - 1
              ? isDarkMode
                ? 'font-medium text-gray-200'
                : 'font-medium text-gray-800'
              : isDarkMode
                ? 'text-gray-500'
                : 'text-gray-400'
          }
        >
          {item}
        </span>
      </React.Fragment>
    ))}
  </div>
);

interface StatPillProps {
  isDarkMode: boolean;
  icon: LucideIcon;
  label: string;
  value: number;
}

export const LibraryStatPill: React.FC<StatPillProps> = ({ isDarkMode, icon: Icon, label, value }) => (
  <div
    className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
      isDarkMode ? 'border-gray-700/70 bg-gray-800/60' : 'border-gray-200 bg-white'
    }`}
  >
    <Icon className="h-4 w-4 text-indigo-500" />
    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
      {label} <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</span>
    </span>
  </div>
);

export const LibraryLoading: React.FC = () => (
  <div className="flex h-48 items-center justify-center">
    <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
  </div>
);
