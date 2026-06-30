import React, { useMemo } from 'react';
import {
  GeneratedQuestionPaper,
  MEDIUM_OPTIONS,
  PAPER_TEMPLATES,
} from '../../../models/generatedQuestionPaper';
import { Classroom } from '../../../services/classroomService';

interface BasicInfoFormProps {
  paper: GeneratedQuestionPaper;
  onChange: (updates: Partial<GeneratedQuestionPaper>) => void;
  classes: Classroom[];
  subjects: string[];
  schoolAcademicYear?: string;
}

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500';

const labelClass = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  paper,
  onChange,
  classes,
  subjects,
  schoolAcademicYear = '',
}) => {
  const sectionOptions = useMemo(() => {
    if (paper.classId) {
      const cls = classes.find((c) => c.classId === paper.classId);
      if (cls?.section) return [cls.section];
    }
    if (paper.className) {
      return Array.from(
        new Set(
          classes.filter((c) => c.className === paper.className).map((c) => c.section).filter(Boolean)
        )
      );
    }
    return Array.from(new Set(classes.map((c) => c.section).filter(Boolean)));
  }, [classes, paper.classId, paper.className]);

  const handleClassChange = (classId: string) => {
    const cls = classes.find((c) => c.classId === classId);
    onChange({
      classId: classId || null,
      className: cls?.className || null,
      sectionName: cls?.section || null,
      academicYear: cls?.academicYear || paper.academicYear || schoolAcademicYear || '',
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="sm:col-span-2 lg:col-span-1">
        <label className={labelClass}>Exam Name *</label>
        <input
          className={inputClass}
          value={paper.examName}
          onChange={(e) => onChange({ examName: e.target.value })}
          placeholder="Mid Term Examination"
        />
      </div>
      <div>
        <label className={labelClass}>Subject *</label>
        {subjects.length > 0 ? (
          <select
            className={inputClass}
            value={paper.subjectName}
            onChange={(e) => onChange({ subjectName: e.target.value })}
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <input
            className={inputClass}
            value={paper.subjectName}
            onChange={(e) => onChange({ subjectName: e.target.value })}
            placeholder="Mathematics"
          />
        )}
      </div>
      <div>
        <label className={labelClass}>Total Marks *</label>
        <input
          type="number"
          min={1}
          className={inputClass}
          value={paper.totalMarks}
          onChange={(e) => onChange({ totalMarks: Number(e.target.value) || 0 })}
        />
      </div>
      <div>
        <label className={labelClass}>Duration (HH:MM)</label>
        <input
          className={inputClass}
          value={paper.duration}
          onChange={(e) => onChange({ duration: e.target.value })}
          placeholder="3:00"
        />
      </div>
      <div>
        <label className={labelClass}>Class (Optional)</label>
        <select
          className={inputClass}
          value={paper.classId || ''}
          onChange={(e) => handleClassChange(e.target.value)}
        >
          <option value="">Select class</option>
          {classes.map((c) => (
            <option key={c.classId} value={c.classId}>
              {c.className}{c.section ? ` - ${c.section}` : ''}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Section (from school)</label>
        {sectionOptions.length > 0 ? (
          <select
            className={inputClass}
            value={paper.sectionName || ''}
            onChange={(e) => onChange({ sectionName: e.target.value || null })}
          >
            <option value="">Select section</option>
            {sectionOptions.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        ) : (
          <input
            className={inputClass}
            value={paper.sectionName || ''}
            disabled
            placeholder="Select a class first"
          />
        )}
      </div>
      <div>
        <label className={labelClass}>Academic Year (from school)</label>
        <input
          className={`${inputClass} bg-gray-50 dark:bg-gray-800/80`}
          value={paper.academicYear || schoolAcademicYear || ''}
          readOnly
          placeholder="Loading from school..."
        />
      </div>
      <div>
        <label className={labelClass}>Medium</label>
        <select
          className={inputClass}
          value={paper.medium || 'English'}
          onChange={(e) => onChange({ medium: e.target.value })}
        >
          {MEDIUM_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Date of Exam</label>
        <input
          type="date"
          className={inputClass}
          value={paper.examDate || ''}
          onChange={(e) => onChange({ examDate: e.target.value || null })}
        />
      </div>
      <div>
        <label className={labelClass}>Time of Exam</label>
        <input
          type="time"
          className={inputClass}
          value={paper.examTime || ''}
          onChange={(e) => onChange({ examTime: e.target.value || null })}
        />
      </div>
      <div>
        <label className={labelClass}>Passing Marks</label>
        <input
          type="number"
          min={0}
          className={inputClass}
          value={paper.passingMarks ?? ''}
          onChange={(e) =>
            onChange({ passingMarks: e.target.value ? Number(e.target.value) : null })
          }
        />
      </div>
      <div>
        <label className={labelClass}>Template</label>
        <select
          className={inputClass}
          value={paper.template}
          onChange={(e) => onChange({ template: e.target.value as GeneratedQuestionPaper['template'] })}
        >
          {PAPER_TEMPLATES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <label className={labelClass}>Instructions for Students (Optional)</label>
        <textarea
          className={inputClass}
          rows={3}
          value={paper.instructions}
          onChange={(e) => onChange({ instructions: e.target.value })}
          placeholder="Read all questions carefully..."
        />
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <label className={labelClass}>Internal Notes (Visible only to teachers)</label>
        <textarea
          className={inputClass}
          rows={2}
          value={paper.internalNotes || ''}
          onChange={(e) => onChange({ internalNotes: e.target.value })}
          placeholder="Notes for internal reference..."
        />
      </div>
    </div>
  );
};

export default BasicInfoForm;
