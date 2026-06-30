import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { computeMarksStats } from './utils';
import { GeneratedQuestionPaper } from '../../../models/generatedQuestionPaper';

interface MarksSummaryProps {
  paper: GeneratedQuestionPaper;
}

const MarksSummary: React.FC<MarksSummaryProps> = ({ paper }) => {
  const stats = computeMarksStats(paper);

  return (
    <div className="lg:sticky lg:top-20 z-[5] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Marks Summary</h3>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 text-center">
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <p className="text-xs text-gray-500">Questions</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalQuestions}</p>
        </div>
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <p className="text-xs text-gray-500">Calculated</p>
          <p className="text-lg font-bold text-indigo-600">{stats.calculatedMarks}</p>
        </div>
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <p className="text-xs text-gray-500">Exam Total</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{paper.totalMarks}</p>
        </div>
        <div
          className={`p-2 rounded-lg ${
            stats.marksExceeded
              ? 'bg-red-50 dark:bg-red-900/20'
              : stats.remainingMarks === 0
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-amber-50 dark:bg-amber-900/20'
          }`}
        >
          <p className="text-xs text-gray-500">Remaining</p>
          <p
            className={`text-lg font-bold ${
              stats.marksExceeded ? 'text-red-600' : stats.remainingMarks === 0 ? 'text-green-600' : 'text-amber-600'
            }`}
          >
            {stats.remainingMarks}
          </p>
        </div>
      </div>

      {stats.sectionStats.length > 0 && (
        <div className="mt-3 space-y-1">
          {stats.sectionStats.map((sec) => (
            <div key={sec.sectionId} className="flex justify-between text-xs text-gray-500">
              <span>{sec.name}</span>
              <span>
                {sec.questionCount} Q · {sec.marks} marks
              </span>
            </div>
          ))}
        </div>
      )}

      {stats.marksExceeded && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
          <AlertTriangle size={16} />
          Total marks exceed exam marks by {stats.calculatedMarks - paper.totalMarks}
        </div>
      )}
      {!stats.marksExceeded && stats.remainingMarks === 0 && stats.totalQuestions > 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
          <CheckCircle2 size={16} />
          Marks balanced perfectly
        </div>
      )}
    </div>
  );
};

export default MarksSummary;
