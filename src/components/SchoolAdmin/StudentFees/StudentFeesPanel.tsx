import React from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { ChevronDown, Layers, X } from 'lucide-react';
import { FeeType } from '../../../services/feeTypeService';
import { StudentFeeBreakdown, UnifiedStudent } from '../../../services/unifiedFeesService';
import StudentFeeTypeSection from './StudentFeeTypeSection';
import { feesCard, feesMuted, feesSectionTitle, feesStatLabel, feesStatValue } from './feesTheme';

interface Props {
  student: UnifiedStudent;
  feeTypes: FeeType[];
  schoolId: string;
  yearId: string;
  onClose: () => void;
  onRefresh: () => void;
}

const statusLabel = (status: string) => {
  if (status === 'paid') return 'Fully Paid';
  if (status === 'partial') return 'Partially Paid';
  return 'Unpaid';
};

const statusClass = (status: string) => {
  if (status === 'paid') return 'bg-green-500/20 text-green-100 border-green-400/30';
  if (status === 'partial') return 'bg-amber-500/20 text-amber-100 border-amber-400/30';
  return 'bg-red-500/20 text-red-100 border-red-400/30';
};

function resolveFeeType(fee: StudentFeeBreakdown, feeTypes: FeeType[]): FeeType {
  const key = fee.feeTypeId;
  const existing = feeTypes.find((ft) => (ft.feeTypeId || ft.id) === key);
  if (existing) return existing;
  return {
    feeTypeId: key,
    id: key,
    name: fee.feeTypeName,
    code: fee.feeTypeName.toLowerCase().replace(/\s+/g, '_'),
    category: (fee.category as FeeType['category']) || 'misc',
    pricingModel: fee.category === 'school_fee' ? 'class_based' : 'manual',
    legacyTabName: fee.legacyTabName,
    isActive: true,
    sortOrder: 0,
  };
}

const StudentFeesPanel: React.FC<Props> = ({ student, feeTypes, schoolId, yearId, onClose, onRefresh }) => {
  const { isDarkMode } = useDarkMode();
  const progress = student.totalDue > 0 ? Math.min(100, Math.round((student.totalPaid / student.totalDue) * 100)) : 0;

  const stats = [
    { label: 'Total Due', value: student.totalDue, accent: isDarkMode ? 'text-blue-400' : 'text-blue-600' },
    { label: 'Paid', value: student.totalPaid, accent: isDarkMode ? 'text-green-400' : 'text-green-600' },
    { label: 'Balance', value: student.totalBalance, accent: isDarkMode ? 'text-orange-400' : 'text-orange-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-lg h-full overflow-y-auto shadow-2xl text-base ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-600 text-white px-5 pt-5 pb-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-4 pr-12">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold shrink-0">
              {student.studentName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold truncate">{student.studentName}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-sm px-2.5 py-1 rounded-lg bg-white/15">{student.className} {student.section}</span>
                {student.rollNo ? <span className="text-sm px-2.5 py-1 rounded-lg bg-white/15">Roll {student.rollNo}</span> : null}
                <span className="text-sm px-2.5 py-1 rounded-lg bg-white/15">{yearId}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className={`text-sm px-3 py-1 rounded-full border font-medium ${statusClass(student.overallStatus)}`}>
              {statusLabel(student.overallStatus)}
            </span>
            {student.totalDue > 0 && (
              <span className="text-sm text-white/80 ml-auto">{progress}% collected</span>
            )}
          </div>
          {student.totalDue > 0 && (
            <div className="mt-2 h-2 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>

        <div className="px-4 -mt-5 relative z-10 space-y-2">
          {(student.totalDiscount || 0) > 0 && (
            <div className={`p-3 rounded-xl border shadow-sm flex justify-between text-sm ${feesCard(isDarkMode)}`}>
              <span className={feesMuted(isDarkMode)}>Gross fee</span>
              <span className="font-semibold">₹{(student.grossDue || student.totalDue + (student.totalDiscount || 0)).toLocaleString()}</span>
              <span className={feesMuted(isDarkMode)}>Discount</span>
              <span className="font-semibold text-green-600 dark:text-green-400">−₹{(student.totalDiscount || 0).toLocaleString()}</span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className={`p-4 rounded-xl border shadow-sm text-center ${feesCard(isDarkMode)}`}>
              <p className={feesStatLabel(isDarkMode)}>{s.label === 'Total Due' ? 'Net due' : s.label}</p>
              <p className={`${feesStatValue(isDarkMode, s.accent)} !text-lg`}>₹{s.value.toLocaleString()}</p>
            </div>
          ))}
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`${feesSectionTitle(isDarkMode)} flex items-center gap-2`}>
              <Layers className="w-5 h-5" />
              Fee types
              <span className={`text-sm px-2.5 py-0.5 rounded-full font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-primary-100 text-primary-700'}`}>
                {student.fees.length}
              </span>
            </h3>
            <span className={`text-sm inline-flex items-center gap-1 ${feesMuted(isDarkMode)}`}>
              <ChevronDown className="w-4 h-4" />
              Expand to manage
            </span>
          </div>

          {student.fees.length === 0 ? (
            <div className={`py-12 text-center rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'}`}>
              <p className={`text-base ${feesMuted(isDarkMode)}`}>No fee records for this student.</p>
            </div>
          ) : (
            student.fees.map((fee) => {
              const ft = resolveFeeType(fee, feeTypes);
              return (
                <StudentFeeTypeSection
                  key={fee.feeTypeId}
                  student={student}
                  fee={fee}
                  feeType={ft}
                  schoolId={schoolId}
                  yearId={yearId}
                  onRefresh={onRefresh}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentFeesPanel;
