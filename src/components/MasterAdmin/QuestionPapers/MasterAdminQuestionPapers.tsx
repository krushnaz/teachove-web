import React, { useEffect, useMemo, useState } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { toast } from 'react-toastify';
import {
  masterAdminQuestionPapersService,
  QUESTION_PAPER_TYPES,
  QPClass,
  QuestionPaper,
} from '../../../services/masterAdminQuestionPapersService';
import { ArrowLeft, BookOpen, Edit, Eye, FileText, Plus, Search, Trash2, Upload } from 'lucide-react';
import PaperModal from './PaperModal';
import ClassModal from '../VEBooks/ClassModal';
import ConfirmDeleteModal from '../VEBooks/ConfirmDeleteModal';
import PdfPreviewModal from '../VEBooks/PdfPreviewModal';

type View = 'classes' | 'types' | 'papers';

const MasterAdminQuestionPapers: React.FC = () => {
  const { isDarkMode } = useDarkMode();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [view, setView] = useState<View>('classes');
  const [classes, setClasses] = useState<QPClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<QPClass | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');

  const [classSearch, setClassSearch] = useState('');
  const [paperSearch, setPaperSearch] = useState('');
  const [papers, setPapers] = useState<QuestionPaper[]>([]);

  const [classModalOpen, setClassModalOpen] = useState(false);
  const [classModalMode, setClassModalMode] = useState<'add' | 'edit'>('add');
  const [editingClass, setEditingClass] = useState<QPClass | null>(null);

  const [paperModalOpen, setPaperModalOpen] = useState(false);
  const [paperModalMode, setPaperModalMode] = useState<'add' | 'rename' | 'replace'>('add');
  const [activePaper, setActivePaper] = useState<QuestionPaper | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmText?: string;
    loadingKey: string;
    onConfirm: () => Promise<void>;
  }>({ open: false, title: '', description: '', confirmText: 'Delete', loadingKey: '', onConfirm: async () => {} });

  const [pdfPreview, setPdfPreview] = useState<{ open: boolean; title: string; url: string }>({
    open: false,
    title: '',
    url: '',
  });

  const refreshClasses = async () => {
    const cls = await masterAdminQuestionPapersService.getClasses();
    setClasses(cls);
    if (selectedClass && !cls.find((c) => c.classId === selectedClass.classId)) {
      setSelectedClass(null);
      setView('classes');
      setSelectedType('');
      setPapers([]);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await refreshClasses();
      } catch (e: any) {
        toast.error(e.message || 'Failed to load question paper classes');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredClasses = useMemo(() => {
    const term = classSearch.trim().toLowerCase();
    if (!term) return classes;
    return classes.filter((c) => c.className?.toLowerCase().includes(term));
  }, [classes, classSearch]);

  const filteredPapers = useMemo(() => {
    const term = paperSearch.trim().toLowerCase();
    if (!term) return papers;
    return papers.filter((p) => p.name?.toLowerCase().includes(term));
  }, [papers, paperSearch]);

  const loadPapers = async (classId: string, type: string) => {
    try {
      setActionLoading('load-papers');
      const list = await masterAdminQuestionPapersService.getPapers(classId, type);
      setPapers(list);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load papers');
      setPapers([]);
    } finally {
      setActionLoading(null);
    }
  };

  const openDelete = (cfg: Omit<typeof deleteModal, 'open'>) => setDeleteModal({ ...cfg, open: true });

  const actionBtn =
    'inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation min-h-[44px]';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1 w-full">
          {view !== 'classes' && (
            <button
              onClick={() => {
                if (view === 'papers') {
                  setView('types');
                  setPapers([]);
                  setSelectedType('');
                  setPaperSearch('');
                } else if (view === 'types') {
                  setView('classes');
                  setSelectedClass(null);
                }
              }}
              className={`p-2.5 rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0 ${
                isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {view === 'classes' && 'Question Papers'}
              {view === 'types' && `${selectedClass?.className} - Types`}
              {view === 'papers' && `${selectedClass?.className} - ${selectedType}`}
            </h1>
            <p className={`mt-1 text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {view === 'classes' && 'Manage classes and upload question papers by test type'}
              {view === 'types' && 'Select a test type'}
              {view === 'papers' && 'Upload, rename, replace, preview, or delete papers'}
            </p>
          </div>
        </div>

        {view === 'classes' && (
          <button
            onClick={() => {
              setClassModalMode('add');
              setEditingClass(null);
              setClassModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto touch-manipulation min-h-[44px]"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            Add Class
          </button>
        )}

        {view === 'papers' && (
          <button
            onClick={() => {
              setPaperModalMode('add');
              setActivePaper(null);
              setPaperModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto touch-manipulation min-h-[44px]"
          >
            <Upload className="w-5 h-5 flex-shrink-0" />
            Upload Paper
          </button>
        )}
      </div>

      {/* Classes view */}
      {view === 'classes' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              value={classSearch}
              onChange={(e) => setClassSearch(e.target.value)}
              placeholder="Search classes..."
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
              }`}
            />
          </div>

          <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`px-4 sm:px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Classes</h2>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{filteredClasses.length}</span>
              </div>
            </div>

            {filteredClasses.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No classes found.</p>
                <button
                  onClick={() => {
                    setClassModalMode('add');
                    setEditingClass(null);
                    setClassModalOpen(true);
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white touch-manipulation min-h-[44px]"
                >
                  <Plus className="w-5 h-5" /> Add first class
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClasses.map((c) => (
                  <div
                    key={c.classId}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${
                      isDarkMode ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedClass(c);
                        setView('types');
                      }}
                      className="text-left min-w-0 flex-1 touch-manipulation"
                      title="Open class"
                    >
                      <p className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{c.className}</p>
                      <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>ID: {c.classId}</p>
                    </button>

                    <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                      <button
                        onClick={() => {
                          setSelectedClass(c);
                          setView('types');
                        }}
                        className={`${actionBtn} ${
                          isDarkMode ? 'bg-indigo-900/20 hover:bg-indigo-900/30 text-indigo-200' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        <FileText className="w-4 h-4" /> Papers
                      </button>

                      <button
                        onClick={() => {
                          setClassModalMode('edit');
                          setEditingClass(c);
                          setClassModalOpen(true);
                        }}
                        className={`${actionBtn} ${
                          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>

                      <button
                        onClick={() =>
                          openDelete({
                            title: 'Delete Class',
                            description:
                              'This will delete the class from both Question Papers and Vedant Education Books. All subjects and merged books under this class will also be removed.',
                            confirmText: 'Delete class',
                            loadingKey: `delete-class-${c.classId}`,
                            onConfirm: async () => {
                              try {
                                setActionLoading(`delete-class-${c.classId}`);
                                await masterAdminQuestionPapersService.deleteClass(c.classId);
                                toast.success('Class deleted');
                                setDeleteModal((d) => ({ ...d, open: false }));
                                await refreshClasses();
                              } catch (e: any) {
                                toast.error(e.message || 'Failed to delete class');
                              } finally {
                                setActionLoading(null);
                              }
                            },
                          })
                        }
                        className={`${actionBtn} ${
                          isDarkMode ? 'bg-red-900/30 hover:bg-red-900/40 text-red-200' : 'bg-red-50 hover:bg-red-100 text-red-700'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Types view */}
      {view === 'types' && selectedClass && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {QUESTION_PAPER_TYPES.map((type) => (
            <button
              key={type}
              onClick={async () => {
                setSelectedType(type);
                setView('papers');
                setPapers([]);
                setPaperSearch('');
                await loadPapers(selectedClass.classId, type);
              }}
              className={`p-4 sm:p-6 rounded-xl shadow-lg border text-left transition-all duration-200 hover:shadow-xl touch-manipulation min-h-[88px] ${
                isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-indigo-500' : 'bg-white border-gray-200 hover:border-indigo-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <p className={`font-bold truncate text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{type}</p>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage papers</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Papers view */}
      {view === 'papers' && selectedClass && selectedType && (
        <div className="space-y-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              value={paperSearch}
              onChange={(e) => setPaperSearch(e.target.value)}
              placeholder="Search papers..."
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
              }`}
            />
          </div>

          <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`px-4 sm:px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Papers</p>
                  <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedClass.className} • {selectedType}
                  </p>
                </div>
                <button
                  onClick={() => loadPapers(selectedClass.classId, selectedType)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation min-h-[44px] w-full sm:w-auto ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                  disabled={actionLoading === 'load-papers'}
                >
                  {actionLoading === 'load-papers' ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {actionLoading === 'load-papers' ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
              ) : filteredPapers.length === 0 ? (
                <div className="text-center py-10 sm:py-12">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No papers found.</p>
                  <button
                    onClick={() => {
                      setPaperModalMode('add');
                      setActivePaper(null);
                      setPaperModalOpen(true);
                    }}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white touch-manipulation min-h-[44px]"
                  >
                    <Plus className="w-5 h-5" /> Upload first paper
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPapers.map((p) => (
                    <div
                      key={p.paperId}
                      className={`p-4 rounded-xl border flex flex-col gap-4 ${
                        isDarkMode ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
                        <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Paper ID: {p.paperId}</p>
                      </div>

                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                        <button
                          className={`${actionBtn} ${
                            isDarkMode ? 'bg-indigo-900/20 hover:bg-indigo-900/30 text-indigo-200' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                          }`}
                          onClick={() => setPdfPreview({ open: true, title: p.name, url: p.fileUrl })}
                        >
                          <Eye className="w-4 h-4" /> Preview
                        </button>

                        <button
                          className={`${actionBtn} ${
                            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'
                          }`}
                          onClick={() => {
                            setPaperModalMode('rename');
                            setActivePaper(p);
                            setPaperModalOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" /> Rename
                        </button>

                        <button
                          className={`${actionBtn} ${
                            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'
                          }`}
                          onClick={() => {
                            setPaperModalMode('replace');
                            setActivePaper(p);
                            setPaperModalOpen(true);
                          }}
                        >
                          <Upload className="w-4 h-4" /> Replace
                        </button>

                        <button
                          className={`${actionBtn} col-span-2 sm:col-span-1 ${
                            isDarkMode ? 'bg-red-900/30 hover:bg-red-900/40 text-red-200' : 'bg-red-50 hover:bg-red-100 text-red-700'
                          }`}
                          onClick={() =>
                            openDelete({
                              title: 'Delete Question Paper',
                              description: 'This will delete the paper and its PDF file.',
                              confirmText: 'Delete paper',
                              loadingKey: `delete-paper-${p.paperId}`,
                              onConfirm: async () => {
                                try {
                                  setActionLoading(`delete-paper-${p.paperId}`);
                                  await masterAdminQuestionPapersService.deletePaper(selectedClass.classId, selectedType, p.paperId);
                                  toast.success('Paper deleted');
                                  setDeleteModal((d) => ({ ...d, open: false }));
                                  await loadPapers(selectedClass.classId, selectedType);
                                } catch (e: any) {
                                  toast.error(e.message || 'Failed to delete paper');
                                } finally {
                                  setActionLoading(null);
                                }
                              },
                            })
                          }
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ClassModal
        isOpen={classModalOpen}
        mode={classModalMode}
        initial={editingClass}
        loading={actionLoading === (classModalMode === 'add' ? 'add-class' : `edit-class-${editingClass?.classId}`)}
        onClose={() => setClassModalOpen(false)}
        onSubmit={async ({ className }) => {
          try {
            const key = classModalMode === 'add' ? 'add-class' : `edit-class-${editingClass?.classId}`;
            setActionLoading(key);
            if (classModalMode === 'add') {
              await masterAdminQuestionPapersService.createClass({ className });
              toast.success('Class added');
            } else if (editingClass) {
              await masterAdminQuestionPapersService.updateClass(editingClass.classId, { className });
              toast.success('Class updated');
            }
            setClassModalOpen(false);
            await refreshClasses();
          } catch (e: any) {
            toast.error(e.message || 'Failed to save class');
          } finally {
            setActionLoading(null);
          }
        }}
      />

      <PaperModal
        isOpen={paperModalOpen}
        mode={paperModalMode}
        initial={activePaper}
        loading={actionLoading === 'paper-modal'}
        onClose={() => setPaperModalOpen(false)}
        onSubmit={async ({ name, pdf }) => {
          if (!selectedClass || !selectedType) return;
          try {
            setActionLoading('paper-modal');
            if (paperModalMode === 'add') {
              if (!name) throw new Error('Name is required');
              if (!pdf) throw new Error('PDF is required');
              await masterAdminQuestionPapersService.uploadPaper({
                classId: selectedClass.classId,
                type: selectedType,
                name,
                pdf,
              });
              toast.success('Paper uploaded');
            } else if (paperModalMode === 'rename') {
              if (!activePaper) return;
              if (!name) throw new Error('Name is required');
              await masterAdminQuestionPapersService.updatePaper({
                classId: selectedClass.classId,
                type: selectedType,
                paperId: activePaper.paperId,
                name,
              });
              toast.success('Paper renamed');
            } else if (paperModalMode === 'replace') {
              if (!activePaper) return;
              if (!pdf) throw new Error('PDF is required');
              await masterAdminQuestionPapersService.updatePaper({
                classId: selectedClass.classId,
                type: selectedType,
                paperId: activePaper.paperId,
                pdf,
              });
              toast.success('File replaced');
            }
            setPaperModalOpen(false);
            await loadPapers(selectedClass.classId, selectedType);
          } catch (e: any) {
            toast.error(e.message || 'Failed to save');
          } finally {
            setActionLoading(null);
          }
        }}
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        title={deleteModal.title}
        description={deleteModal.description}
        confirmText={deleteModal.confirmText}
        loading={actionLoading === deleteModal.loadingKey}
        onClose={() => setDeleteModal((d) => ({ ...d, open: false }))}
        onConfirm={() => deleteModal.onConfirm()}
      />

      <PdfPreviewModal
        isOpen={pdfPreview.open}
        title={pdfPreview.title}
        pdfUrl={pdfPreview.url}
        onClose={() => setPdfPreview({ open: false, title: '', url: '' })}
      />
    </div>
  );
};

export default MasterAdminQuestionPapers;
