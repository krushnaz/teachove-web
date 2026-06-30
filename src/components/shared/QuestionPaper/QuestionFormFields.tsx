import React from 'react';
import RichTextEditor from './RichTextEditor';
import { QuestionItem } from '../../../models/generatedQuestionPaper';

interface QuestionFormFieldsProps {
  question: QuestionItem;
  onChange: (updates: Partial<QuestionItem>) => void;
  onImageUpload?: (file: File) => Promise<string>;
  showSuggestedAnswer?: boolean;
}

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

const QuestionFormFields: React.FC<QuestionFormFieldsProps> = ({
  question,
  onChange,
  onImageUpload,
  showSuggestedAnswer = true,
}) => {
  const handleImageFiles = async (files: FileList | null) => {
    if (!files?.length || !onImageUpload) return;
    const urls: string[] = [...question.imageUrls];
    for (let i = 0; i < files.length; i++) {
      const url = await onImageUpload(files[i]);
      urls.push(url);
    }
    onChange({ imageUrls: urls });
  };

  const removeImage = (index: number) => {
    onChange({ imageUrls: question.imageUrls.filter((_, i) => i !== index) });
  };

  const renderTypeFields = () => {
    switch (question.questionType) {
      case 'mcq':
        return (
          <div className="space-y-2">
            {(['A', 'B', 'C', 'D', 'E'] as const).map((key) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-6 text-sm font-medium text-gray-500">{key}.</span>
                <input
                  className={inputClass}
                  value={question.options?.[key] || ''}
                  onChange={(e) =>
                    onChange({
                      options: { ...question.options!, [key]: e.target.value },
                    })
                  }
                  placeholder={key === 'E' ? 'Option E (optional)' : `Option ${key}`}
                />
              </div>
            ))}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Correct Answer</label>
                <select
                  className={inputClass}
                  value={question.correctAnswer || ''}
                  onChange={(e) => onChange({ correctAnswer: e.target.value || null })}
                >
                  <option value="">Not set</option>
                  {['A', 'B', 'C', 'D', 'E'].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Negative Marks</label>
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  className={inputClass}
                  value={question.negativeMarks ?? ''}
                  onChange={(e) =>
                    onChange({
                      negativeMarks: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Explanation (optional)</label>
              <textarea
                className={inputClass}
                rows={2}
                value={question.answerExplanation || ''}
                onChange={(e) => onChange({ answerExplanation: e.target.value })}
              />
            </div>
          </div>
        );

      case 'true_false':
        return (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Correct Answer</label>
            <select
              className={inputClass}
              value={question.correctAnswer || 'true'}
              onChange={(e) => onChange({ correctAnswer: e.target.value })}
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
        );

      case 'fill_blank':
      case 'one_word':
        return (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Correct Answer</label>
            <input
              className={inputClass}
              value={question.correctAnswer || ''}
              onChange={(e) => onChange({ correctAnswer: e.target.value })}
            />
          </div>
        );

      case 'match_following':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Left Column</label>
              {(question.matchPairs?.left || []).map((item, i) => (
                <input
                  key={i}
                  className={`${inputClass} mb-2`}
                  value={item}
                  onChange={(e) => {
                    const left = [...(question.matchPairs?.left || [])];
                    left[i] = e.target.value;
                    onChange({ matchPairs: { ...question.matchPairs!, left } });
                  }}
                  placeholder={`Item ${i + 1}`}
                />
              ))}
              <button
                type="button"
                className="text-xs text-indigo-600"
                onClick={() =>
                  onChange({
                    matchPairs: {
                      left: [...(question.matchPairs?.left || []), ''],
                      right: [...(question.matchPairs?.right || []), ''],
                    },
                  })
                }
              >
                + Add row
              </button>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Right Column</label>
              {(question.matchPairs?.right || []).map((item, i) => (
                <input
                  key={i}
                  className={`${inputClass} mb-2`}
                  value={item}
                  onChange={(e) => {
                    const right = [...(question.matchPairs?.right || [])];
                    right[i] = e.target.value;
                    onChange({ matchPairs: { ...question.matchPairs!, right } });
                  }}
                  placeholder={`Match ${i + 1}`}
                />
              ))}
            </div>
          </div>
        );

      case 'short_answer':
      case 'long_answer':
        if (!showSuggestedAnswer) return null;
        return (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Suggested Answer {question.questionType === 'short_answer' ? '(Hidden from students)' : ''}
            </label>
            <RichTextEditor
              value={question.suggestedAnswer || ''}
              onChange={(html) => onChange({ suggestedAnswer: html })}
              minHeight="60px"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const showImageUpload = question.questionType !== 'fill_blank';

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
          Question *
        </label>
        <RichTextEditor
          value={question.questionText}
          onChange={(html) => onChange({ questionText: html })}
          onImageUpload={onImageUpload}
          minHeight="100px"
          placeholder="Enter question..."
        />
      </div>

      {showImageUpload && onImageUpload && (
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Images</label>
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleImageFiles(e.dataTransfer.files);
            }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.multiple = question.questionType === 'diagram';
              input.onchange = () => handleImageFiles(input.files);
              input.click();
            }}
          >
            <p className="text-sm text-gray-500">Drag & drop images or click to upload</p>
          </div>
          {question.imageUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {question.imageUrls.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="" className="h-20 w-20 object-cover rounded border" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {renderTypeFields()}

      <div className="w-full sm:w-32">
        <label className="text-xs text-gray-500 mb-1 block">Marks *</label>
        <input
          type="number"
          min={0}
          step={0.5}
          className={inputClass}
          value={question.marks}
          onChange={(e) => onChange({ marks: Number(e.target.value) || 0 })}
        />
      </div>
    </div>
  );
};

export default QuestionFormFields;
