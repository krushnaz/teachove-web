export const ACADEMIC_YEARS = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];

export function getDefaultAcademicYear(userYear?: string): string {
  if (userYear && ACADEMIC_YEARS.includes(userYear)) return userYear;
  return '2025-2026';
}
