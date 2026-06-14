import React, { useEffect, useMemo, useState } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { toast } from 'react-toastify';
import {
  masterAdminQuestionPapersService,
  QUESTION_PAPER_TYPES,
  QPClass,
  QuestionPaper,
} from '../../../services/masterAdminQuestionPapersService';
import { BookOpen, ChevronRight, Edit, Eye, FileText, Plus, Trash2, Upload } from 'lucide-react';
import PaperModal from './PaperModal';
import ClassModal from '../VEBooks/ClassModal';
import ConfirmDeleteModal from '../VEBooks/ConfirmDeleteModal';
import PdfPreviewModal from '../VEBooks/PdfPreviewModal';
import {
  ClassAvatar,
  LibraryBreadcrumb,
  LibraryEmptyState,
  LibraryLoading,
  LibraryPageHeader,
  LibraryPanel,
  LibrarySearchField,
  useLibraryTheme,
} from '../shared/contentLibraryUi';

type View = 'classes' | 'types' | 'papers';

const MasterAdminQuestionPapers: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const t = useLibraryTheme(isDarkMode);

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

  const goBack = () => {
    if (view === 'papers') {
      setView('types');
      setPapers([]);
      setSelectedType('');
      setPaperSearch('');
    } else if (view === 'types') {
      setView('classes');
      setSelectedClass(null);
    }
  };

  const breadcrumbItems = useMemo(() => {
    const items = ['Question Papers'];
    if (selectedClass) items.push(selectedClass.className);
    if (selectedType) items.push(selectedType);
    return items;
  }, [selectedClass, selectedType]);

  if (loading) {
    return (
      <div className={t.page}>
        <LibraryLoading />
      </div>
    );
  }

  return (
    <div className={t.page}>
      <LibraryPageHeader
        isDarkMode={isDarkMode}
        title={
          view === 'classes'
            ? 'Question Papers'
            : view === 'types'
              ? selectedClass?.className || 'Test Types'
              : selectedType
        }
        subtitle={
          view === 'classes'
            ? 'Organize exam papers by class and test type'
            : view === 'types'
              ? 'Choose a test type to manage papers'
              : 'Upload and manage PDF question papers'
        }
        onBack={view !== 'classes' ? goBack : undefined}
        actions={
          view === 'classes' ? (
            <button
              type="button"
              className={`${t.primaryBtn} w-full sm:w-auto`}
              onClick={() => {
                setClassModalMode('add');
                setEditingClass(null);
                setClassModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add Class
            </button>
          ) : view === 'papers' ? (
            <button
              type="button"
              className={`${t.primaryBtn} w-full sm:w-auto`}
              onClick={() => {
                setPaperModalMode('add');
                setActivePaper(null);
                setPaperModalOpen(true);
              }}
            >
              <Upload className="h-4 w-4" /> Upload Paper
            </button>
          ) : undefined
        }
      />

      {view !== 'classes' && (
        <LibraryBreadcrumb isDarkMode={isDarkMode} items={breadcrumbItems} />
      )}

      {view === 'classes' && (
        <div className="space-y-4">
          <LibrarySearchField
            isDarkMode={isDarkMode}
            value={classSearch}
            onChange={setClassSearch}
            placeholder="Search classes..."
          />

          <LibraryPanel isDarkMode={isDarkMode} title="Classes" icon={BookOpen} count={filteredClasses.length}>
            {filteredClasses.length === 0 ? (
              <LibraryEmptyState
                isDarkMode={isDarkMode}
                icon={BookOpen}
                message="No classes yet. Add a class to start uploading question papers."
                action={
                  <button
                    type="button"
                    className={t.primaryBtn}
                    onClick={() => {
                      setClassModalMode('add');
                      setEditingClass(null);
                      setClassModalOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" /> Add Class
                  </button>
                }
              />
            ) : (
              <div className={`divide-y ${isDarkMode ? 'divide-gray-700/60' : 'divide-gray-100'}`}>
                {filteredClasses.map((c) => (
                  <div
                    key={c.classId}
                    className={`flex flex-col gap-3 px-4 py-4 transition sm:flex-row sm:items-center sm:justify-between sm:px-5 ${
                      isDarkMode ? 'hover:bg-gray-700/20' : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClass(c);
                        setView('types');
                      }}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <ClassAvatar name={c.className} isDarkMode={isDarkMode} />
                      <div className="min-w-0">
                        <p className={`truncate font-medium ${t.title}`}>{c.className}</p>
                        <p className={`truncate text-xs ${t.muted}`}>{c.classId}</p>
                      </div>
                      <ChevronRight className={`ml-auto h-4 w-4 flex-shrink-0 sm:hidden ${t.muted}`} />
                    </button>

                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <button
                        type="button"
                        className={t.accentBtn}
                        onClick={() => {
                          setSelectedClass(c);
                          setView('types');
                        }}
                      >
                        <FileText className="h-4 w-4" /> Open
                      </button>
                      <button
                        type="button"
                        className={t.secondaryBtn}
                        onClick={() => {
                          setClassModalMode('edit');
                          setEditingClass(c);
                          setClassModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                      <button
                        type="button"
                        className={t.dangerBtn}
                        onClick={() =>
                          openDelete({
                            title: 'Delete Class',
                            description:
                              'This removes the class from Question Papers and Vedant Education Books, including all subjects and merged books.',
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
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </LibraryPanel>
        </div>
      )}

      {view === 'types' && selectedClass && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUESTION_PAPER_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={async () => {
                setSelectedType(type);
                setView('papers');
                setPapers([]);
                setPaperSearch('');
                await loadPapers(selectedClass.classId, type);
              }}
              className={`group rounded-2xl border p-4 text-left transition ${
                isDarkMode
                  ? 'border-gray-700/70 bg-gray-800/50 hover:border-indigo-500/50 hover:bg-gray-800'
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                <FileText className="h-5 w-5 text-indigo-500" />
              </div>
              <p className={`font-medium ${t.title}`}>{type}</p>
              <p className={`mt-1 text-xs ${t.muted}`}>View & upload papers</p>
            </button>
          ))}
        </div>
      )}

      {view === 'papers' && selectedClass && selectedType && (
        <div className="space-y-4">
          <LibrarySearchField
            isDarkMode={isDarkMode}
            value={paperSearch}
            onChange={setPaperSearch}
            placeholder="Search papers..."
          />

          <LibraryPanel
            isDarkMode={isDarkMode}
            title="Papers"
            icon={FileText}
            count={filteredPapers.length}
            headerExtra={
              <button
                type="button"
                className={t.secondaryBtn}
                onClick={() => loadPapers(selectedClass.classId, selectedType)}
                disabled={actionLoading === 'load-papers'}
              >
                {actionLoading === 'load-papers' ? 'Loading...' : 'Refresh'}
              </button>
            }
          >
            <div className={t.panelBody}>
              {actionLoading === 'load-papers' ? (
                <LibraryLoading />
              ) : filteredPapers.length === 0 ? (
                <LibraryEmptyState
                  isDarkMode={isDarkMode}
                  icon={FileText}
                  message="No papers uploaded for this test type yet."
                  action={
                    <button
                      type="button"
                      className={t.primaryBtn}
                      onClick={() => {
                        setPaperModalMode('add');
                        setActivePaper(null);
                        setPaperModalOpen(true);
                      }}
                    >
                      <Upload className="h-4 w-4" /> Upload Paper
                    </button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {filteredPapers.map((p) => (
                    <div key={p.paperId} className={t.itemCard}>
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                          <FileText className="h-4 w-4 text-red-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate font-medium ${t.title}`}>{p.name}</p>
                          <p className={`truncate text-xs ${t.muted}`}>{p.paperId}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                        <button
                          type="button"
                          className={t.accentBtn}
                          onClick={() => setPdfPreview({ open: true, title: p.name, url: p.fileUrl })}
                        >
                          <Eye className="h-4 w-4" /> Preview
                        </button>
                        <button
                          type="button"
                          className={t.secondaryBtn}
                          onClick={() => {
                            setPaperModalMode('rename');
                            setActivePaper(p);
                            setPaperModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" /> Rename
                        </button>
                        <button
                          type="button"
                          className={t.secondaryBtn}
                          onClick={() => {
                            setPaperModalMode('replace');
                            setActivePaper(p);
                            setPaperModalOpen(true);
                          }}
                        >
                          <Upload className="h-4 w-4" /> Replace
                        </button>
                        <button
                          type="button"
                          className={`${t.dangerBtn} col-span-2 sm:col-span-1`}
                          onClick={() =>
                            openDelete({
                              title: 'Delete Question Paper',
                              description: 'This will permanently delete the paper and its PDF file.',
                              confirmText: 'Delete paper',
                              loadingKey: `delete-paper-${p.paperId}`,
                              onConfirm: async () => {
                                try {
                                  setActionLoading(`delete-paper-${p.paperId}`);
                                  await masterAdminQuestionPapersService.deletePaper(
                                    selectedClass.classId,
                                    selectedType,
                                    p.paperId
                                  );
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
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </LibraryPanel>
        </div>
      )}

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
