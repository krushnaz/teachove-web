import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  PaperSection,
  QuestionType,
  QUESTION_TYPE_LABELS,
} from '../../../models/generatedQuestionPaper';
import QuestionCard from './QuestionCard';
import { createEmptyQuestion, formatQuestionNumber, moveItem, reorder, uid } from './utils';
import { QuestionItem } from '../../../models/generatedQuestionPaper';

interface SectionEditorProps {
  section: PaperSection;
  sectionIndex: number;
  onChange: (section: PaperSection) => void;
  onDelete: () => void;
  canDelete: boolean;
  onImageUpload?: (file: File) => Promise<string>;
  onPreviewQuestion?: (q: QuestionItem) => void;
  onSaveToBank?: (q: QuestionItem) => void;
}

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';

const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  sectionIndex,
  onChange,
  onDelete,
  canDelete,
  onImageUpload,
  onPreviewQuestion,
  onSaveToBank,
}) => {
  const sectionMarks = section.questions.reduce((s, q) => s + (Number(q.marks) || 0), 0);

  const updateQuestion = (qIndex: number, updates: Partial<QuestionItem>) => {
    const questions = [...section.questions];
    questions[qIndex] = { ...questions[qIndex], ...updates };
    onChange({ ...section, questions });
  };

  const addQuestion = (type: QuestionType) => {
    const q = createEmptyQuestion(type, section.questions.length + 1);
    onChange({ ...section, questions: [...section.questions, q] });
  };

  const duplicateQuestion = (qIndex: number) => {
    const src = section.questions[qIndex];
    const copy = { ...src, id: uid(), collapsed: false };
    const questions = [...section.questions];
    questions.splice(qIndex + 1, 0, copy);
    onChange({ ...section, questions: reorder(questions) });
  };

  const copyQuestion = (qIndex: number) => {
    const src = section.questions[qIndex];
    navigator.clipboard.writeText(JSON.stringify(src));
  };

  const deleteQuestion = (qIndex: number) => {
    onChange({ ...section, questions: reorder(section.questions.filter((_, i) => i !== qIndex)) });
  };

  const moveQuestion = (from: number, to: number) => {
    onChange({ ...section, questions: reorder(moveItem(section.questions, from, to)) });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
      <div className="px-3 sm:px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
        <div className="flex-1 space-y-2">
          <input
            className={`${inputClass} font-semibold text-base sm:text-lg`}
            value={section.name}
            onChange={(e) => onChange({ ...section, name: e.target.value })}
            placeholder="Section Name"
          />
          <textarea
            className={inputClass}
            rows={2}
            value={section.instructions}
            onChange={(e) => onChange({ ...section, instructions: e.target.value })}
            placeholder="Section instructions (e.g. Answer any 10 questions. Each carries 1 mark.)"
          />
          <div className="flex gap-4 text-xs text-gray-500">
            <span>{section.questions.length} question(s)</span>
            <span>{sectionMarks} mark(s)</span>
          </div>
        </div>
        {canDelete && (
          <button type="button" onClick={onDelete} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {section.questions.map((q, qIndex) => (
          <QuestionCard
            key={q.id}
            question={q}
            questionNumber={formatQuestionNumber(sectionIndex, qIndex)}
            onChange={(updates) => updateQuestion(qIndex, updates)}
            onDelete={() => deleteQuestion(qIndex)}
            onDuplicate={() => duplicateQuestion(qIndex)}
            onCopy={() => copyQuestion(qIndex)}
            onMoveUp={() => moveQuestion(qIndex, qIndex - 1)}
            onMoveDown={() => moveQuestion(qIndex, qIndex + 1)}
            onPreview={onPreviewQuestion ? () => onPreviewQuestion(q) : undefined}
            onSaveToBank={onSaveToBank ? () => onSaveToBank(q) : undefined}
            onImageUpload={onImageUpload}
            isFirst={qIndex === 0}
            isLast={qIndex === section.questions.length - 1}
          />
        ))}

        <div className="flex flex-wrap sm:flex-nowrap gap-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 w-full mb-1">Add question:</span>
          <div className="flex gap-2 overflow-x-auto pb-1 w-full -mx-1 px-1">
          {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => addQuestion(type)}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs rounded-full border border-gray-200 dark:border-gray-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors whitespace-nowrap flex-shrink-0 touch-manipulation"
            >
              <Plus size={12} /> {QUESTION_TYPE_LABELS[type].split(' ')[0]}
            </button>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionEditor;
