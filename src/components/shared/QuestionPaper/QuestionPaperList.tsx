import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, FileQuestion, Plus, Search, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { generatedQuestionPaperService } from '../../../services/generatedQuestionPaperService';
import { schoolProfileService } from '../../../services/schoolProfileService';
import { GeneratedQuestionPaper } from '../../../models/generatedQuestionPaper';
import PaperCardMenu, { paperMenuIcons } from './PaperCardMenu';
import PaperPreviewModal from './PaperPreviewModal';
import { exportPaperAsPdf, exportPaperAsWord, SchoolInfo } from './exportUtils';

interface QuestionPaperListProps {
  basePath: string;
  role: 'school' | 'teacher';
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  archived: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
};

const roleBadgeColors: Record<string, string> = {
  school: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  teacher: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
};

const QuestionPaperList: React.FC<QuestionPaperListProps> = ({ basePath, role }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [papers, setPapers] = useState<GeneratedQuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewPaper, setPreviewPaper] = useState<GeneratedQuestionPaper | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({});

  const schoolId = user?.schoolId || '';
  const createdByFilter = role === 'teacher' ? user?.teacherId || user?.userId : undefined;

  useEffect(() => {
    if (!schoolId) return;
    schoolProfileService.getSchoolProfile(schoolId).then((p) => {
      const addr = p?.address;
      setSchoolInfo({
        name: p?.schoolName,
        address: addr ? [addr.line1, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ') : undefined,
        logoUrl: p?.logo,
      });
    }).catch(console.error);
  }, [schoolId]);

  const load = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const data = await generatedQuestionPaperService.list(schoolId, {
        status: statusFilter || undefined,
        createdBy: createdByFilter || undefined,
      });
      setPapers(data);
    } catch {
      toast.error('Failed to load question papers');
    } finally {
      setLoading(false);
    }
  }, [schoolId, statusFilter, createdByFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = papers.filter(
    (p) =>
      !search ||
      p.examName.toLowerCase().includes(search.toLowerCase()) ||
      p.subjectName.toLowerCase().includes(search.toLowerCase())
  );

  const openPreview = async (id: string) => {
    setPreviewLoading(true);
    setPreviewPaper(null);
    try {
      const paper = await generatedQuestionPaperService.get(schoolId, id);
      setPreviewPaper(paper);
    } catch {
      toast.error('Failed to load preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePdfDownload = async (id: string) => {
    setPdfLoadingId(id);
    try {
      const paper = await generatedQuestionPaperService.get(schoolId, id);
      await exportPaperAsPdf(paper, schoolInfo);
      toast.success('PDF downloaded');
    } catch {
      toast.error('Failed to download PDF');
    } finally {
      setPdfLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !schoolId) return;
    try {
      await generatedQuestionPaperService.delete(schoolId, deleteId);
      toast.success('Deleted');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const copy = await generatedQuestionPaperService.duplicate(schoolId, id);
      toast.success('Duplicated');
      navigate(`${basePath}/${copy.id || copy.paperId}`);
    } catch {
      toast.error('Failed to duplicate');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await generatedQuestionPaperService.archive(schoolId, id);
      toast.success('Question paper archived successfully!');
      load();
    } catch {
      toast.error('Failed to archive');
    }
  };

  const handleWordDownload = async (id: string) => {
    try {
      const paper = await generatedQuestionPaperService.get(schoolId, id);
      await exportPaperAsWord(paper, schoolInfo);
      toast.success('Word file downloaded');
    } catch {
      toast.error('Failed to download Word file');
    }
  };

  const getMenuActions = (p: GeneratedQuestionPaper) => {
    const id = p.id || p.paperId!;
    const pdfBusy = pdfLoadingId === id;
    return [
      { id: 'preview', label: 'Preview', icon: paperMenuIcons.preview, onClick: () => openPreview(id) },
      {
        id: 'pdf',
        label: pdfBusy ? 'Generating PDF…' : 'Download PDF',
        icon: paperMenuIcons.pdf,
        onClick: () => handlePdfDownload(id),
        disabled: pdfBusy,
      },
      { id: 'word', label: 'Download Word', icon: paperMenuIcons.word, onClick: () => handleWordDownload(id) },
      { id: 'edit', label: 'Edit', icon: paperMenuIcons.edit, onClick: () => navigate(`${basePath}/${id}`) },
      { id: 'duplicate', label: 'Duplicate', icon: paperMenuIcons.duplicate, onClick: () => handleDuplicate(id) },
      ...(p.status !== 'archived'
        ? [{ id: 'archive', label: 'Archive', icon: paperMenuIcons.archive, onClick: () => handleArchive(id) }]
        : []),
      { id: 'delete', label: 'Delete', icon: paperMenuIcons.delete, onClick: () => setDeleteId(id), danger: true },
    ];
  };

  return (
    <div className={`px-3 py-4 sm:p-6 max-w-7xl mx-auto ${isDarkMode ? 'text-white' : ''}`}>
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileQuestion className="text-indigo-600 shrink-0" size={24} />
            Question Papers
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage question papers
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`${basePath}/new`)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
        >
          <Plus size={18} /> Create Question Paper
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Search exam or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="w-full sm:w-auto px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 px-4">
          <FileQuestion size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">No question papers yet</p>
          <button
            type="button"
            onClick={() => navigate(`${basePath}/new`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
          >
            <Plus size={16} /> Create your first question paper
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((p) => {
            const id = p.id || p.paperId!;
            const creatorRole = p.createdByRole || 'teacher';
            return (
              <div
                key={id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-start gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm sm:text-base">
                      {p.examName}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {p.subjectName}
                      {p.className ? ` · ${p.className}` : ''}
                      {p.sectionName ? ` (${p.sectionName})` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${statusColors[p.status] || statusColors.draft}`}>
                      {p.status}
                    </span>
                    <PaperCardMenu actions={getMenuActions(p)} />
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-4 flex-1">
                  <p>
                    {p.totalQuestions ?? 0} questions · {p.calculatedMarks ?? 0}/{p.totalMarks} marks
                  </p>
                  {p.academicYear && <p>Year: {p.academicYear}</p>}
                  {p.updatedAt && (
                    <p className="text-xs">Updated {new Date(p.updatedAt).toLocaleDateString('en-IN')}</p>
                  )}
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    <User size={12} className="shrink-0" />
                    <span
                      className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded ${roleBadgeColors[creatorRole] || roleBadgeColors.teacher}`}
                    >
                      {creatorRole === 'school' ? 'School Admin' : 'Teacher Admin'}
                    </span>
                    {p.createdByName && (
                      <span className="text-xs truncate">{p.createdByName}</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`${basePath}/${id}`)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <Edit size={16} /> Edit Paper
                </button>
              </div>
            );
          })}
        </div>
      )}

      <PaperPreviewModal
        open={!!previewPaper || previewLoading}
        onClose={() => {
          setPreviewPaper(null);
          setPreviewLoading(false);
        }}
        paper={previewPaper}
        school={schoolInfo}
        loading={previewLoading}
      />

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-2">Delete question paper?</h3>
            <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setDeleteId(null)} className="flex-1 py-2.5 text-sm border rounded-lg">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} className="flex-1 py-2.5 text-sm bg-red-600 text-white rounded-lg">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPaperList;
