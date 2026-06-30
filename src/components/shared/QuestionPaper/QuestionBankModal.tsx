import React, { useEffect, useState } from 'react';
import { Search, X, Plus } from 'lucide-react';
import {
  QuestionBankItem,
  QuestionItem,
  QuestionType,
  QUESTION_TYPE_LABELS,
} from '../../../models/generatedQuestionPaper';
import { questionBankService } from '../../../services/generatedQuestionPaperService';
import { uid } from './utils';

interface QuestionBankModalProps {
  open: boolean;
  onClose: () => void;
  schoolId: string;
  onImport: (questions: QuestionItem[]) => void;
  subjectFilter?: string;
}

const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  open,
  onClose,
  schoolId,
  onImport,
  subjectFilter,
}) => {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open || !schoolId) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await questionBankService.list(schoolId, {
          keyword: keyword || undefined,
          questionType: questionType || undefined,
          difficulty: difficulty || undefined,
          subjectId: subjectFilter,
        });
        setQuestions(data);
      } catch {
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [open, schoolId, keyword, questionType, difficulty, subjectFilter]);

  if (!open) return null;

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleImport = () => {
    const items = questions
      .filter((q) => selected.has(q.id!))
      .map(
        (q): QuestionItem => ({
          id: uid(),
          questionType: q.questionType,
          questionText: q.questionText,
          imageUrls: q.imageUrls || [],
          options: q.options,
          correctAnswer: q.correctAnswer,
          answerExplanation: q.answerExplanation,
          suggestedAnswer: q.suggestedAnswer,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
          matchPairs: q.matchPairs,
          subQuestions: q.subQuestions,
          orderNo: 0,
          collapsed: false,
          aiMetadata: q.aiMetadata as QuestionItem['aiMetadata'],
        })
      );
    onImport(items);
    setSelected(new Set());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Question Bank</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Search by keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
          >
            <option value="">All types</option>
            {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((t) => (
              <option key={t} value={t}>
                {QUESTION_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">All difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && <p className="text-center text-gray-500 py-8">Loading...</p>}
          {!loading && questions.length === 0 && (
            <p className="text-center text-gray-500 py-8">No questions found</p>
          )}
          {questions.map((q) => (
            <label
              key={q.id}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selected.has(q.id!)
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(q.id!)}
                onChange={() => toggleSelect(q.id!)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex gap-2 text-xs text-gray-500 mb-1">
                  <span>{QUESTION_TYPE_LABELS[q.questionType]}</span>
                  <span>·</span>
                  <span>{q.marks} marks</span>
                  {q.subjectName && (
                    <>
                      <span>·</span>
                      <span>{q.subjectName}</span>
                    </>
                  )}
                </div>
                <div
                  className="text-sm line-clamp-2 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: q.questionText }}
                />
              </div>
            </label>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <span className="text-sm text-gray-500">{selected.size} selected</span>
          <button
            onClick={handleImport}
            disabled={selected.size === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-indigo-700"
          >
            <Plus size={16} /> Import Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionBankModal;
