import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Archive, Copy, History, Save, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { classroomService, Classroom } from '../../../services/classroomService';
import {
  generatedQuestionPaperService,
  questionBankService,
} from '../../../services/generatedQuestionPaperService';
import { schoolProfileService } from '../../../services/schoolProfileService';
import {
  GeneratedQuestionPaper,
  PaperSection,
  QuestionItem,
  PaperVersion,
} from '../../../models/generatedQuestionPaper';
import BasicInfoForm from './BasicInfoForm';
import SectionEditor from './SectionEditor';
import MarksSummary from './MarksSummary';
import {
  compressImage,
  computeMarksStats,
  createEmptyPaper,
  createEmptySection,
  reorder,
} from './utils';

interface QuestionPaperBuilderProps {
  basePath: string;
  role: 'school' | 'teacher';
}

const QuestionPaperBuilder: React.FC<QuestionPaperBuilderProps> = ({ basePath, role }) => {
  const { paperId } = useParams<{ paperId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [paper, setPaper] = useState<GeneratedQuestionPaper>(createEmptyPaper());
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [schoolAcademicYear, setSchoolAcademicYear] = useState('');
  const [loading, setLoading] = useState(!!paperId);
  const [saving, setSaving] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versions, setVersions] = useState<PaperVersion[]>([]);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const schoolId = user?.schoolId || '';
  const isNew = !paperId || paperId === 'new';

  const updatePaper = useCallback((updates: Partial<GeneratedQuestionPaper>) => {
    setPaper((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!schoolId) throw new Error('No school');
      const compressed = await compressImage(file);
      return generatedQuestionPaperService.uploadImage(schoolId, compressed);
    },
    [schoolId]
  );

  useEffect(() => {
    if (!schoolId) return;
    classroomService.getClassesBySchoolId(schoolId).then((cls) => {
      setClasses(cls);
      const subs = new Set<string>();
      cls.forEach((c) => (c.subjects || []).forEach((s) => subs.add(s.subjectName)));
      setSubjects(Array.from(subs).filter(Boolean));
    }).catch(console.error);
    schoolProfileService.getSchoolProfile(schoolId).then((p) => {
      setSchoolAcademicYear(p?.currentAcademicYear || '');
    }).catch(console.error);
  }, [schoolId]);

  useEffect(() => {
    if (isNew && schoolAcademicYear && !paper.academicYear) {
      updatePaper({ academicYear: schoolAcademicYear });
    }
  }, [isNew, schoolAcademicYear, paper.academicYear, updatePaper]);

  useEffect(() => {
    if (!paperId || paperId === 'new' || !schoolId) return;
    setLoading(true);
    generatedQuestionPaperService
      .get(schoolId, paperId)
      .then(setPaper)
      .catch(() => {
        toast.error('Failed to load question paper');
        navigate(basePath);
      })
      .finally(() => setLoading(false));
  }, [paperId, schoolId, basePath, navigate]);

  const validate = (): boolean => {
    if (!paper.examName.trim()) {
      toast.error('Exam name is required');
      return false;
    }
    if (!paper.subjectName.trim()) {
      toast.error('Subject is required');
      return false;
    }
    if (!paper.totalMarks || paper.totalMarks <= 0) {
      toast.error('Total marks is required');
      return false;
    }
    const stats = computeMarksStats(paper);
    if (stats.marksExceeded) {
      toast.error('Total question marks exceed exam marks');
      return false;
    }
    return true;
  };

  const persist = async (status?: GeneratedQuestionPaper['status'], silent = false) => {
    if (!schoolId) return;
    if (!silent && !validate()) return;

    setSaving(true);
    try {
      const stats = computeMarksStats(paper);
      const creatorName =
        role === 'school'
          ? user?.name || user?.schoolName || 'School Admin'
          : user?.name || 'Teacher';
      const payload: GeneratedQuestionPaper = {
        ...paper,
        ...stats,
        status: status || paper.status,
        createdBy: paper.createdBy || user?.teacherId || user?.userId || null,
        createdByRole: paper.createdByRole || role,
        createdByName: paper.createdByName || creatorName,
        academicYear: paper.academicYear || schoolAcademicYear || '',
        schoolId,
      };

      if (isNew && !paper.id) {
        const created = await generatedQuestionPaperService.create(schoolId, payload);
        setPaper(created);
        setLastSaved(new Date().toLocaleTimeString());
        if (!silent) {
          const finalStatus = status || payload.status;
          if (finalStatus === 'published') {
            toast.success('Question paper published successfully!');
          } else {
            toast.success('Question paper saved as draft');
          }
        }
        navigate(`${basePath}/${created.id || created.paperId}`, { replace: true });
      } else {
        const id = paper.id || paper.paperId || paperId!;
        await generatedQuestionPaperService.update(schoolId, id, payload);
        setLastSaved(new Date().toLocaleTimeString());
        if (!silent) {
          if (status === 'published') {
            toast.success('Question paper published successfully!');
          } else if (status === 'draft') {
            toast.success('Question paper saved as draft');
          } else {
            toast.success('Question paper saved');
          }
        }
        if (status) updatePaper({ status });
      }
    } catch {
      if (!silent) toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (isNew || !paper.examName) return;
    autoSaveRef.current = setInterval(() => {
      persist(undefined, true);
    }, 30000);
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper, isNew]);

  const updateSection = (index: number, section: PaperSection) => {
    const sections = [...paper.sections];
    sections[index] = section;
    updatePaper({ sections });
  };

  const addSection = () => {
    updatePaper({ sections: [...paper.sections, createEmptySection(paper.sections.length + 1)] });
  };

  const deleteSection = (index: number) => {
    if (paper.sections.length <= 1) {
      toast.warn('At least one section is required');
      return;
    }
    updatePaper({ sections: reorder(paper.sections.filter((_, i) => i !== index)) });
  };

  const saveToBank = async (question: QuestionItem) => {
    if (!schoolId) return;
    try {
      await questionBankService.create(schoolId, {
        questionType: question.questionType,
        questionText: question.questionText,
        imageUrls: question.imageUrls,
        options: question.options,
        correctAnswer: question.correctAnswer,
        answerExplanation: question.answerExplanation,
        suggestedAnswer: question.suggestedAnswer,
        marks: question.marks,
        negativeMarks: question.negativeMarks,
        matchPairs: question.matchPairs,
        subjectName: paper.subjectName,
        createdBy: user?.teacherId || user?.userId || null,
      });
      toast.success('Saved to question bank');
    } catch {
      toast.error('Failed to save to bank');
    }
  };

  const handleDuplicate = async () => {
    const id = paper.id || paper.paperId;
    if (!id || !schoolId) return;
    try {
      const copy = await generatedQuestionPaperService.duplicate(schoolId, id);
      toast.success('Duplicated');
      navigate(`${basePath}/${copy.id || copy.paperId}`);
    } catch {
      toast.error('Failed to duplicate');
    }
  };

  const handleArchive = async () => {
    const id = paper.id || paper.paperId;
    if (!id || !schoolId) return;
    try {
      await generatedQuestionPaperService.archive(schoolId, id);
      toast.success('Question paper archived successfully!');
      navigate(basePath);
    } catch {
      toast.error('Failed to archive');
    }
  };

  const loadVersions = async () => {
    const id = paper.id || paper.paperId;
    if (!id || !schoolId) return;
    try {
      const v = await generatedQuestionPaperService.listVersions(schoolId, id);
      setVersions(v);
      setVersionsOpen(true);
    } catch {
      toast.error('Failed to load versions');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-20 sm:pb-6 -mx-2 sm:mx-0 overflow-x-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(basePath)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0 touch-manipulation"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                {isNew ? 'Create Question Paper' : paper.examName || 'Edit Question Paper'}
              </h1>
              {!isNew && paper.createdByRole && (
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                  By {paper.createdByRole === 'school' ? 'School Admin' : 'Teacher Admin'}
                  {paper.createdByName ? ` · ${paper.createdByName}` : ''}
                </p>
              )}
            </div>
            {lastSaved && (
              <span className="text-[10px] text-gray-400 shrink-0 hidden sm:inline">Saved {lastSaved}</span>
            )}
          </div>

          {/* Desktop toolbar */}
          <div className="hidden sm:flex flex-wrap gap-2 mt-2">
            {!isNew && (
              <>
                <button type="button" onClick={handleDuplicate} className="p-2 rounded-lg border border-gray-200 dark:border-gray-600" title="Duplicate">
                  <Copy size={16} />
                </button>
                <button type="button" onClick={loadVersions} className="p-2 rounded-lg border border-gray-200 dark:border-gray-600" title="Versions">
                  <History size={16} />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => persist('draft')}
              disabled={saving}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
            >
              <Save size={14} /> Draft
            </button>
            <button
              type="button"
              onClick={() => persist('published')}
              disabled={saving}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white disabled:opacity-50"
            >
              <Send size={14} /> Publish
            </button>
            {!isNew && (
              <button
                type="button"
                onClick={handleArchive}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-amber-300 text-amber-700"
              >
                <Archive size={14} /> Archive
              </button>
            )}
          </div>

          {/* Mobile secondary actions */}
          {!isNew && (
            <div className="flex sm:hidden gap-2 mt-2">
              <button type="button" onClick={handleDuplicate} className="flex-1 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-600 touch-manipulation">
                Duplicate
              </button>
              <button type="button" onClick={loadVersions} className="flex-1 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-600 touch-manipulation">
                Versions
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Basic Information</h2>
              <BasicInfoForm
                paper={paper}
                onChange={updatePaper}
                classes={classes}
                subjects={subjects}
                schoolAcademicYear={schoolAcademicYear}
              />
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sections & Questions</h2>
                <button
                  type="button"
                  onClick={addSection}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2.5 px-3 rounded-lg border border-indigo-200 dark:border-indigo-800 sm:border-0 sm:py-0 sm:px-0 touch-manipulation w-full sm:w-auto text-center sm:text-left"
                >
                  + Add Section
                </button>
              </div>
              {paper.sections.map((section, idx) => (
                <SectionEditor
                  key={section.id}
                  section={section}
                  sectionIndex={idx}
                  onChange={(s) => updateSection(idx, s)}
                  onDelete={() => deleteSection(idx)}
                  canDelete={paper.sections.length > 1}
                  onImageUpload={handleImageUpload}
                  onSaveToBank={saveToBank}
                />
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <MarksSummary paper={paper} />
          </div>
        </div>
      </div>

      {versionsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-xl shadow-xl w-full max-w-md max-h-[70vh] overflow-y-auto p-4">
            <h3 className="font-semibold mb-4">Version History</h3>
            {versions.length === 0 ? (
              <p className="text-gray-500 text-sm">No versions saved yet</p>
            ) : (
              versions.map((v) => (
                <div key={v.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg mb-2 text-sm">
                  <p>Version {v.version}</p>
                  <p className="text-gray-500 text-xs">{new Date(v.savedAt).toLocaleString()}</p>
                </div>
              ))
            )}
            <button type="button" onClick={() => setVersionsOpen(false)} className="mt-4 w-full py-2 text-sm border rounded-lg">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Mobile bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="flex gap-2 max-w-7xl mx-auto">
          <button
            type="button"
            onClick={() => persist('draft')}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-800 disabled:opacity-50 touch-manipulation"
          >
            <Save size={16} /> Draft
          </button>
          <button
            type="button"
            onClick={() => persist('published')}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 text-sm font-medium rounded-xl bg-indigo-600 text-white disabled:opacity-50 touch-manipulation"
          >
            <Send size={16} /> Publish
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={handleArchive}
              className="inline-flex items-center justify-center px-4 py-3 rounded-xl border border-amber-300 text-amber-700 touch-manipulation"
              title="Archive"
            >
              <Archive size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPaperBuilder;
