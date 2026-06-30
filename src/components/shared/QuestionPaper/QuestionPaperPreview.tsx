import React, { forwardRef } from 'react';
import {
  GeneratedQuestionPaper,
  QuestionItem,
  QUESTION_TYPE_LABELS,
} from '../../../models/generatedQuestionPaper';
import { formatQuestionNumber } from './utils';

interface SchoolInfo {
  name?: string;
  address?: string;
  logoUrl?: string;
}

interface QuestionPaperPreviewProps {
  paper: GeneratedQuestionPaper;
  school?: SchoolInfo;
  singleQuestion?: QuestionItem | null;
}

const templateStyles: Record<string, string> = {
  classic: 'font-serif',
  cbse: 'font-sans border-double border-4 border-black p-8',
  state_board: 'font-sans',
  icse: 'font-serif italic-headings',
  minimal: 'font-sans text-sm',
  modern: 'font-sans bg-gradient-to-b from-white to-gray-50',
  custom: 'font-sans',
};

const QuestionPaperPreview = forwardRef<HTMLDivElement, QuestionPaperPreviewProps>(
  ({ paper, school, singleQuestion }, ref) => {
    const templateClass = templateStyles[paper.template] || templateStyles.classic;

    const renderQuestion = (q: QuestionItem, num: string) => (
      <div key={q.id} className="mb-6 break-inside-avoid">
        <div className="flex gap-2">
          <span className="font-semibold min-w-[2rem]">{num}</span>
          <div className="flex-1">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: q.questionText || '<p><em>No question text</em></p>' }}
            />
            {q.imageUrls?.map((url, i) => (
              <img key={i} src={url} alt="" className="max-h-48 my-2 rounded" />
            ))}
            {q.questionType === 'mcq' && q.options && (
              <div className="mt-2 space-y-1 ml-4">
                {(['A', 'B', 'C', 'D', 'E'] as const).map(
                  (key) =>
                    q.options?.[key] && (
                      <div key={key} className="flex gap-2">
                        <span>({key})</span>
                        <span>{q.options[key]}</span>
                      </div>
                    )
                )}
              </div>
            )}
            {q.questionType === 'true_false' && (
              <div className="mt-2 ml-4 text-sm text-gray-600">( ) True &nbsp;&nbsp; ( ) False</div>
            )}
            {q.questionType === 'fill_blank' && (
              <div className="mt-2 border-b border-gray-400 w-48" />
            )}
            {q.questionType === 'match_following' && q.matchPairs && (
              <div className="mt-2 grid grid-cols-2 gap-4 ml-4">
                <div>
                  {q.matchPairs.left.map((item, i) => (
                    <div key={i} className="mb-1">
                      ({String.fromCharCode(97 + i)}) {item}
                    </div>
                  ))}
                </div>
                <div>
                  {q.matchPairs.right.map((item, i) => (
                    <div key={i} className="mb-1">
                      ({i + 1}) {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(q.questionType === 'short_answer' || q.questionType === 'long_answer') && (
              <div className="mt-4 border border-gray-300 rounded min-h-[60px] p-2" />
            )}
            <p className="text-right text-xs text-gray-500 mt-1">[{q.marks} mark{q.marks !== 1 ? 's' : ''}]</p>
          </div>
        </div>
      </div>
    );

    if (singleQuestion) {
      return (
        <div ref={ref} className={`p-6 bg-white text-black ${templateClass}`}>
          <p className="text-xs text-gray-500 mb-4">{QUESTION_TYPE_LABELS[singleQuestion.questionType]}</p>
          {renderQuestion(singleQuestion, '1.')}
        </div>
      );
    }

    return (
      <div ref={ref} className={`question-paper-preview bg-white text-black ${templateClass}`}>
        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
          {school?.logoUrl && (
            <img src={school.logoUrl} alt="School logo" className="h-16 mx-auto mb-2 object-contain" />
          )}
          <h1 className="text-xl font-bold uppercase">{school?.name || 'School Name'}</h1>
          {school?.address && <p className="text-sm text-gray-600">{school.address}</p>}
          <h2 className="text-lg font-semibold mt-4">{paper.examName}</h2>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm mt-2">
            <span>
              <strong>Subject:</strong> {paper.subjectName}
            </span>
            {paper.className && (
              <span>
                <strong>Class:</strong> {paper.className}
                {paper.sectionName ? ` - ${paper.sectionName}` : ''}
              </span>
            )}
            {paper.examDate && (
              <span>
                <strong>Date:</strong> {paper.examDate}
              </span>
            )}
            {paper.examTime && (
              <span>
                <strong>Time:</strong> {paper.examTime}
              </span>
            )}
            <span>
              <strong>Duration:</strong> {paper.duration}
            </span>
            <span>
              <strong>Total Marks:</strong> {paper.totalMarks}
            </span>
          </div>
        </div>

        {/* Student details */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm border border-gray-300 p-3">
          <div>
            Name: <span className="inline-block border-b border-gray-400 min-w-[120px]" />
          </div>
          <div>
            Roll No: <span className="inline-block border-b border-gray-400 min-w-[80px]" />
          </div>
          <div>
            Signature: <span className="inline-block border-b border-gray-400 min-w-[100px]" />
          </div>
        </div>

        {/* Instructions */}
        {paper.instructions && (
          <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded">
            <p className="font-semibold text-sm mb-1">General Instructions:</p>
            <p className="text-sm whitespace-pre-wrap">{paper.instructions}</p>
          </div>
        )}

        {/* Sections & Questions */}
        {paper.sections.map((section, sIdx) => (
          <div key={section.id} className="mb-8">
            <h3 className="text-center font-bold uppercase tracking-wide mb-2">{section.name}</h3>
            {section.instructions && (
              <p className="text-sm text-center italic mb-4 text-gray-600">{section.instructions}</p>
            )}
            {section.questions.map((q, qIdx) =>
              renderQuestion(q, formatQuestionNumber(sIdx, qIdx))
            )}
          </div>
        ))}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between text-xs text-gray-500 print:fixed print:bottom-0 print:left-0 print:right-0 print:px-8">
          <span>Generated by TeachoVE</span>
          <span className="page-number" />
        </div>
      </div>
    );
  }
);

QuestionPaperPreview.displayName = 'QuestionPaperPreview';

export default QuestionPaperPreview;
