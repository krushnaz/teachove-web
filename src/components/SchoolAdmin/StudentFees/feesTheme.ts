/** Shared typography & surface classes for the Student Fees module */

export const feesRoot = (isDark: boolean) =>
  `text-base leading-relaxed ${isDark ? 'text-gray-100' : 'text-gray-900'}`;

export const feesCard = (isDark: boolean) =>
  `rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;

export const feesMuted = (isDark: boolean) => (isDark ? 'text-gray-400' : 'text-gray-600');

export const feesBanner = (isDark: boolean) =>
  `text-base px-4 py-3 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700 text-gray-200' : 'bg-primary-50 border border-primary-100 text-primary-900'}`;

export const feesInput = (isDark: boolean) =>
  `px-4 py-2.5 rounded-lg border text-base outline-none focus:ring-2 focus:ring-primary-500/40 ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
  }`;

export const feesSelect = feesInput;

export const feesBtnPrimary =
  'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-base font-medium transition-colors disabled:opacity-50';

export const feesBtnSecondary = (isDark: boolean) =>
  `inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-base font-medium transition-colors ${
    isDark
      ? 'border-gray-600 bg-gray-800 text-gray-100 hover:bg-gray-700'
      : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
  }`;

export const feesBtnGhost = (isDark: boolean) =>
  `inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
    isDark ? 'text-primary-400 hover:bg-gray-800' : 'text-primary-700 hover:bg-primary-50'
  }`;

export const feesHeading = (isDark: boolean) =>
  `text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`;

export const feesSectionTitle = (isDark: boolean) =>
  `text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`;

export const feesStatLabel = (isDark: boolean) =>
  `text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`;

export const feesStatValue = (isDark: boolean, accent?: string) =>
  `text-2xl font-bold mt-1 ${accent ?? (isDark ? 'text-white' : 'text-gray-900')}`;

export const feesTableWrap = (isDark: boolean) =>
  `rounded-xl border overflow-hidden text-base ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;

export const feesTableHead = (isDark: boolean) =>
  isDark ? 'bg-gray-700/80 text-gray-200' : 'bg-gray-50 text-gray-700';

export const feesTableRow = (isDark: boolean) =>
  isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900';

export const feesActionBtn = (isDark: boolean, variant: 'primary' | 'outline' | 'danger' = 'outline') => {
  const base =
    'inline-flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl text-sm font-medium transition-colors min-h-[72px]';
  if (variant === 'primary') return `${base} bg-primary-600 text-white hover:bg-primary-700`;
  if (variant === 'danger') {
    return `${base} ${isDark ? 'bg-red-950/40 text-red-300 hover:bg-red-950/60 border border-red-900/50' : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-100'}`;
  }
  return `${base} ${isDark ? 'bg-gray-700/80 text-gray-100 hover:bg-gray-700 border border-gray-600' : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200'}`;
};

export const feesChip = (isDark: boolean, active: boolean) =>
  `px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
    active
      ? 'bg-primary-600 text-white border-primary-600'
      : isDark
        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
  }`;
