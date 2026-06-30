import React from 'react';
import { ChevronDown, ChevronUp, Copy, CopyPlus, Eye, GripVertical, Trash2, BookMarked } from 'lucide-react';
import { QuestionItem, QUESTION_TYPE_LABELS } from '../../../models/generatedQuestionPaper';
import QuestionFormFields from './QuestionFormFields';

interface QuestionCardProps {
  question: QuestionItem;
  questionNumber: string;
  onChange: (updates: Partial<QuestionItem>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onPreview?: () => void;
  onSaveToBank?: () => void;
  onImageUpload?: (file: File) => Promise<string>;
  isFirst: boolean;
  isLast: boolean;
}

const actionBtn =
  'p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 flex-shrink-0 touch-manipulation';

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  onChange,
  onDelete,
  onDuplicate,
  onCopy,
  onMoveUp,
  onMoveDown,
  onPreview,
  onSaveToBank,
  onImageUpload,
  isFirst,
  isLast,
}) => {
  const collapsed = question.collapsed ?? false;
  const typeLabel = QUESTION_TYPE_LABELS[question.questionType];
  const shortType = typeLabel.split(' ')[0];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <div className="px-3 sm:px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex items-start gap-2 min-w-0">
          <GripVertical size={16} className="text-gray-400 cursor-grab flex-shrink-0 mt-0.5 hidden sm:block" />
          <span className="font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">{questionNumber}</span>
          <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 truncate max-w-[120px] sm:max-w-none">
            <span className="sm:hidden">{shortType}</span>
            <span className="hidden sm:inline">{typeLabel}</span>
          </span>
          <span className="text-xs text-gray-500 ml-auto shrink-0">{question.marks}m</span>
          <button
            type="button"
            title={collapsed ? 'Expand' : 'Collapse'}
            onClick={() => onChange({ collapsed: !collapsed })}
            className={`${actionBtn} sm:hidden`}
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button type="button" title="Delete" onClick={onDelete} className={`${actionBtn} text-red-600 sm:hidden`}>
            <Trash2 size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-thin">
          <button type="button" title="Move up" disabled={isFirst} onClick={onMoveUp} className={actionBtn}>
            <ChevronUp size={16} />
          </button>
          <button type="button" title="Move down" disabled={isLast} onClick={onMoveDown} className={actionBtn}>
            <ChevronDown size={16} />
          </button>
          <button type="button" title="Duplicate" onClick={onDuplicate} className={actionBtn}>
            <CopyPlus size={16} />
          </button>
          <button type="button" title="Copy" onClick={onCopy} className={actionBtn}>
            <Copy size={16} />
          </button>
          {onPreview && (
            <button type="button" title="Preview" onClick={onPreview} className={actionBtn}>
              <Eye size={16} />
            </button>
          )}
          {onSaveToBank && (
            <button type="button" title="Save to Question Bank" onClick={onSaveToBank} className={actionBtn}>
              <BookMarked size={16} />
            </button>
          )}
          <button
            type="button"
            title={collapsed ? 'Expand' : 'Collapse'}
            onClick={() => onChange({ collapsed: !collapsed })}
            className={`${actionBtn} hidden sm:inline-flex`}
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button type="button" title="Delete" onClick={onDelete} className={`${actionBtn} text-red-600 hidden sm:inline-flex`}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="p-3 sm:p-4">
          <QuestionFormFields
            question={question}
            onChange={onChange}
            onImageUpload={onImageUpload}
            showSuggestedAnswer={question.questionType !== 'short_answer' || true}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
