import React, { useEffect, useMemo, useState } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import {
  masterAdminVEBooksService,
  VEBookClass,
  VEBookMergeBook,
  VEBookSubject,
} from '../../../services/masterAdminVEBooksService';
import { toast } from 'react-toastify';
import {
  BookOpen,
  ChevronRight,
  Edit,
  Eye,
  FileText,
  Image as ImageIcon,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react';
import ClassModal from './ClassModal';
import SubjectModal from './SubjectModal';
import MergeBookModal from './MergeBookModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import PdfPreviewModal from './PdfPreviewModal';
import {
  ClassAvatar,
  LibraryEmptyState,
  LibraryLoading,
  LibraryPageHeader,
  LibraryPanel,
  LibrarySearchField,
  LibraryStatPill,
  useLibraryTheme,
} from '../shared/contentLibraryUi';

const VEBooks: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const t = useLibraryTheme(isDarkMode);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [totals, setTotals] = useState<{ totalSubjects: number; totalMergedBooks: number } | null>(null);
  const [classes, setClasses] = useState<VEBookClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const selectedClass = useMemo(() => classes.find((c) => c.classId === selectedClassId) || null, [classes, selectedClassId]);

  const [classSearch, setClassSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  const [subjects, setSubjects] = useState<VEBookSubject[]>([]);
  const [mergeBooks, setMergeBooks] = useState<VEBookMergeBook[]>([]);

  const [classModalOpen, setClassModalOpen] = useState(false);
  const [classModalMode, setClassModalMode] = useState<'add' | 'edit'>('add');
  const [editingClass, setEditingClass] = useState<VEBookClass | null>(null);

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [subjectModalMode, setSubjectModalMode] = useState<'add' | 'edit'>('add');
  const [editingSubject, setEditingSubject] = useState<VEBookSubject | null>(null);

  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergeModalMode, setMergeModalMode] = useState<'add' | 'edit'>('add');
  const [editingMergeBook, setEditingMergeBook] = useState<VEBookMergeBook | null>(null);

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

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [cls, tot] = await Promise.all([
          masterAdminVEBooksService.getClasses(),
          masterAdminVEBooksService.getTotals(),
        ]);
        setClasses(cls);
        setTotals(tot);
      } catch (e: any) {
        toast.error(e.message || 'Failed to load Vedant Education Books');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    (async () => {
      try {
        setActionLoading('load-class-content');
        const [subs, merges] = await Promise.all([
          masterAdminVEBooksService.getSubjects(selectedClassId),
          masterAdminVEBooksService.getMergeBooks(selectedClassId),
        ]);
        setSubjects(subs);
        setMergeBooks(merges);
      } catch (e: any) {
        toast.error(e.message || 'Failed to load class books');
      } finally {
        setActionLoading(null);
      }
    })();
  }, [selectedClassId]);

  const refreshClassesAndTotals = async () => {
    const [cls, tot] = await Promise.all([
      masterAdminVEBooksService.getClasses(),
      masterAdminVEBooksService.getTotals(),
    ]);
    setClasses(cls);
    setTotals(tot);
    if (selectedClassId && !cls.find((c) => c.classId === selectedClassId)) {
      setSelectedClassId('');
      setSubjects([]);
      setMergeBooks([]);
    }
  };

  const refreshSelectedClassLists = async () => {
    if (!selectedClassId) return;
    const [subs, merges] = await Promise.all([
      masterAdminVEBooksService.getSubjects(selectedClassId),
      masterAdminVEBooksService.getMergeBooks(selectedClassId),
    ]);
    setSubjects(subs);
    setMergeBooks(merges);
  };

  const filteredClasses = useMemo(() => {
    const term = classSearch.trim().toLowerCase();
    if (!term) return classes;
    return classes.filter((c) => c.className?.toLowerCase().includes(term));
  }, [classes, classSearch]);

  const filteredSubjects = useMemo(() => {
    const term = bookSearch.trim().toLowerCase();
    if (!term) return subjects;
    return subjects.filter((s) => s.subjectName?.toLowerCase().includes(term));
  }, [subjects, bookSearch]);

  const filteredMergeBooks = useMemo(() => {
    const term = bookSearch.trim().toLowerCase();
    if (!term) return mergeBooks;
    return mergeBooks.filter((m) => m.mergeBookName?.toLowerCase().includes(term));
  }, [mergeBooks, bookSearch]);

  const openDelete = (cfg: Omit<typeof deleteModal, 'open'>) => setDeleteModal({ ...cfg, open: true });

  const renderBookActions = (
    actions: { label: string; icon: React.ReactNode; onClick: () => void; variant: 'accent' | 'secondary' | 'danger' | 'warning'; span?: number }[]
  ) => (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          className={`${
            action.variant === 'accent'
              ? t.accentBtn
              : action.variant === 'danger'
                ? t.dangerBtn
                : action.variant === 'warning'
                  ? isDarkMode
                    ? 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/20'
                    : 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100'
                  : t.secondaryBtn
          } ${action.span === 2 ? 'col-span-2 sm:col-span-1' : ''}`}
          onClick={action.onClick}
        >
          {action.icon} {action.label}
        </button>
      ))}
    </div>
  );

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
        title={selectedClassId ? selectedClass?.className || 'Class Books' : 'Vedant Education Books'}
        subtitle={
          selectedClassId
            ? 'Manage subject PDFs, covers, and merged books'
            : 'Upload and organize digital books by class'
        }
        onBack={
          selectedClassId
            ? () => {
                setSelectedClassId('');
                setSubjects([]);
                setMergeBooks([]);
                setBookSearch('');
              }
            : undefined
        }
        actions={
          !selectedClassId ? (
            <>
              <div className="flex flex-wrap gap-2">
                <LibraryStatPill
                  isDarkMode={isDarkMode}
                  icon={FileText}
                  label="Subjects"
                  value={totals?.totalSubjects ?? 0}
                />
                <LibraryStatPill
                  isDarkMode={isDarkMode}
                  icon={Layers}
                  label="Merged"
                  value={totals?.totalMergedBooks ?? 0}
                />
              </div>
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
            </>
          ) : (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <button
                type="button"
                className={`${t.primaryBtn} w-full sm:w-auto`}
                onClick={() => {
                  setSubjectModalMode('add');
                  setEditingSubject(null);
                  setSubjectModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Add Subject
              </button>
              <button
                type="button"
                className={`${t.secondaryBtn} w-full sm:w-auto`}
                onClick={() => {
                  setMergeModalMode('add');
                  setEditingMergeBook(null);
                  setMergeModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Add Merge Book
              </button>
            </div>
          )
        }
      />

      {!selectedClassId ? (
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
                message="No classes yet. Add a class to start uploading books."
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
                        setSelectedClassId(c.classId);
                        setBookSearch('');
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
                          setSelectedClassId(c.classId);
                          setBookSearch('');
                        }}
                      >
                        <BookOpen className="h-4 w-4" /> Open
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
                              'This will delete the class and all its subjects and merged books, including stored PDFs and covers.',
                            confirmText: 'Delete class',
                            loadingKey: `delete-class-${c.classId}`,
                            onConfirm: async () => {
                              try {
                                setActionLoading(`delete-class-${c.classId}`);
                                await masterAdminVEBooksService.deleteClass(c.classId);
                                toast.success('Class deleted');
                                setDeleteModal((d) => ({ ...d, open: false }));
                                await refreshClassesAndTotals();
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
      ) : (
        <div className="space-y-4">
          <LibrarySearchField
            isDarkMode={isDarkMode}
            value={bookSearch}
            onChange={setBookSearch}
            placeholder="Search subjects or merged books..."
          />

          {actionLoading === 'load-class-content' ? (
            <LibraryLoading />
          ) : (
            <>
              <LibraryPanel isDarkMode={isDarkMode} title="Subjects" icon={FileText} count={filteredSubjects.length}>
                <div className={t.panelBody}>
                  {filteredSubjects.length === 0 ? (
                    <LibraryEmptyState
                      isDarkMode={isDarkMode}
                      icon={FileText}
                      message="No subjects in this class yet."
                      action={
                        <button
                          type="button"
                          className={t.primaryBtn}
                          onClick={() => {
                            setSubjectModalMode('add');
                            setEditingSubject(null);
                            setSubjectModalOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4" /> Add Subject
                        </button>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {filteredSubjects.map((s) => (
                        <div key={s.subjectId} className={t.itemCard}>
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                              <FileText className="h-4 w-4 text-indigo-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`truncate font-medium ${t.title}`}>{s.subjectName}</p>
                              <p className={`truncate text-xs ${t.muted}`}>{s.subjectId}</p>
                            </div>
                          </div>
                          {renderBookActions([
                            ...(s.coverPageUrl
                              ? [
                                  {
                                    label: 'Cover',
                                    icon: <ImageIcon className="h-4 w-4" />,
                                    onClick: () => window.open(s.coverPageUrl!, '_blank'),
                                    variant: 'secondary' as const,
                                  },
                                ]
                              : []),
                            {
                              label: 'Preview',
                              icon: <Eye className="h-4 w-4" />,
                              onClick: () => setPdfPreview({ open: true, title: s.subjectName, url: s.pdfUrl }),
                              variant: 'accent',
                            },
                            {
                              label: 'Edit',
                              icon: <Edit className="h-4 w-4" />,
                              onClick: () => {
                                setSubjectModalMode('edit');
                                setEditingSubject(s);
                                setSubjectModalOpen(true);
                              },
                              variant: 'secondary',
                            },
                            ...(s.coverPageUrl
                              ? [
                                  {
                                    label: 'Del cover',
                                    icon: <Trash2 className="h-4 w-4" />,
                                    onClick: () =>
                                      openDelete({
                                        title: 'Delete Cover Page',
                                        description: 'This will remove the cover image for this subject.',
                                        confirmText: 'Delete cover',
                                        loadingKey: `delete-cover-${s.subjectId}`,
                                        onConfirm: async () => {
                                          try {
                                            setActionLoading(`delete-cover-${s.subjectId}`);
                                            await masterAdminVEBooksService.deleteSubjectCover(selectedClassId, s.subjectId);
                                            toast.success('Cover deleted');
                                            setDeleteModal((d) => ({ ...d, open: false }));
                                            await refreshSelectedClassLists();
                                            await refreshClassesAndTotals();
                                          } catch (e: any) {
                                            toast.error(e.message || 'Failed to delete cover');
                                          } finally {
                                            setActionLoading(null);
                                          }
                                        },
                                      }),
                                    variant: 'warning' as const,
                                  },
                                ]
                              : []),
                            {
                              label: 'Delete',
                              icon: <Trash2 className="h-4 w-4" />,
                              onClick: () =>
                                openDelete({
                                  title: 'Delete Subject',
                                  description: 'This will delete the subject PDF and cover (if any).',
                                  confirmText: 'Delete subject',
                                  loadingKey: `delete-subject-${s.subjectId}`,
                                  onConfirm: async () => {
                                    try {
                                      setActionLoading(`delete-subject-${s.subjectId}`);
                                      await masterAdminVEBooksService.deleteSubject(selectedClassId, s.subjectId);
                                      toast.success('Subject deleted');
                                      setDeleteModal((d) => ({ ...d, open: false }));
                                      await refreshSelectedClassLists();
                                      await refreshClassesAndTotals();
                                    } catch (e: any) {
                                      toast.error(e.message || 'Failed to delete subject');
                                    } finally {
                                      setActionLoading(null);
                                    }
                                  },
                                }),
                              variant: 'danger',
                              span: 2,
                            },
                          ])}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </LibraryPanel>

              <LibraryPanel isDarkMode={isDarkMode} title="Merged Books" icon={Layers} count={filteredMergeBooks.length}>
                <div className={t.panelBody}>
                  {filteredMergeBooks.length === 0 ? (
                    <LibraryEmptyState
                      isDarkMode={isDarkMode}
                      icon={Layers}
                      message="No merged books in this class yet."
                      action={
                        <button
                          type="button"
                          className={t.secondaryBtn}
                          onClick={() => {
                            setMergeModalMode('add');
                            setEditingMergeBook(null);
                            setMergeModalOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4" /> Add Merge Book
                        </button>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {filteredMergeBooks.map((m) => (
                        <div key={m.mergeBookId} className={t.itemCard}>
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                              <Layers className="h-4 w-4 text-violet-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`truncate font-medium ${t.title}`}>{m.mergeBookName}</p>
                              <p className={`truncate text-xs ${t.muted}`}>{m.mergeBookId}</p>
                            </div>
                          </div>
                          {renderBookActions([
                            {
                              label: 'Preview',
                              icon: <Eye className="h-4 w-4" />,
                              onClick: () => setPdfPreview({ open: true, title: m.mergeBookName, url: m.pdfUrl }),
                              variant: 'accent',
                            },
                            {
                              label: 'Edit',
                              icon: <Edit className="h-4 w-4" />,
                              onClick: () => {
                                setMergeModalMode('edit');
                                setEditingMergeBook(m);
                                setMergeModalOpen(true);
                              },
                              variant: 'secondary',
                            },
                            {
                              label: 'Delete',
                              icon: <Trash2 className="h-4 w-4" />,
                              onClick: () =>
                                openDelete({
                                  title: 'Delete Merged Book',
                                  description: 'This will delete the merged book and its PDF.',
                                  confirmText: 'Delete book',
                                  loadingKey: `delete-merge-${m.mergeBookId}`,
                                  onConfirm: async () => {
                                    try {
                                      setActionLoading(`delete-merge-${m.mergeBookId}`);
                                      await masterAdminVEBooksService.deleteMergeBook(selectedClassId, m.mergeBookId);
                                      toast.success('Book deleted');
                                      setDeleteModal((d) => ({ ...d, open: false }));
                                      await refreshSelectedClassLists();
                                      await refreshClassesAndTotals();
                                    } catch (e: any) {
                                      toast.error(e.message || 'Failed to delete book');
                                    } finally {
                                      setActionLoading(null);
                                    }
                                  },
                                }),
                              variant: 'danger',
                              span: 2,
                            },
                          ])}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </LibraryPanel>
            </>
          )}
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
              await masterAdminVEBooksService.createClass({ className });
              toast.success('Class added');
            } else if (editingClass) {
              await masterAdminVEBooksService.updateClass(editingClass.classId, { className });
              toast.success('Class updated');
            }
            setClassModalOpen(false);
            await refreshClassesAndTotals();
          } catch (e: any) {
            toast.error(e.message || 'Failed to save class');
          } finally {
            setActionLoading(null);
          }
        }}
      />

      <SubjectModal
        isOpen={subjectModalOpen}
        mode={subjectModalMode}
        initial={editingSubject}
        loading={actionLoading === (subjectModalMode === 'add' ? 'add-subject' : `edit-subject-${editingSubject?.subjectId}`)}
        onClose={() => setSubjectModalOpen(false)}
        onSubmit={async ({ subjectName, pdf, cover }) => {
          if (!selectedClassId) return;
          try {
            const key = subjectModalMode === 'add' ? 'add-subject' : `edit-subject-${editingSubject?.subjectId}`;
            setActionLoading(key);
            if (subjectModalMode === 'add') {
              if (!pdf) throw new Error('PDF is required');
              await masterAdminVEBooksService.createSubject({
                classId: selectedClassId,
                subjectName,
                pdf,
                cover: cover || undefined,
              });
              toast.success('Subject added');
            } else if (editingSubject) {
              await masterAdminVEBooksService.updateSubject({
                classId: selectedClassId,
                subjectId: editingSubject.subjectId,
                subjectName,
                pdf: pdf || undefined,
                cover: cover || undefined,
              });
              toast.success('Subject updated');
            }
            setSubjectModalOpen(false);
            await refreshSelectedClassLists();
            await refreshClassesAndTotals();
          } catch (e: any) {
            toast.error(e.message || 'Failed to save subject');
          } finally {
            setActionLoading(null);
          }
        }}
      />

      <MergeBookModal
        isOpen={mergeModalOpen}
        mode={mergeModalMode}
        initial={editingMergeBook}
        loading={actionLoading === (mergeModalMode === 'add' ? 'add-merge' : `edit-merge-${editingMergeBook?.mergeBookId}`)}
        onClose={() => setMergeModalOpen(false)}
        onSubmit={async ({ mergeBookName, pdf }) => {
          if (!selectedClassId) return;
          try {
            const key = mergeModalMode === 'add' ? 'add-merge' : `edit-merge-${editingMergeBook?.mergeBookId}`;
            setActionLoading(key);
            if (mergeModalMode === 'add') {
              if (!pdf) throw new Error('PDF is required');
              await masterAdminVEBooksService.createMergeBook({ classId: selectedClassId, mergeBookName, pdf });
              toast.success('Merged book added');
            } else if (editingMergeBook) {
              await masterAdminVEBooksService.updateMergeBook({
                classId: selectedClassId,
                mergeBookId: editingMergeBook.mergeBookId,
                mergeBookName,
                pdf: pdf || undefined,
              });
              toast.success('Merged book updated');
            }
            setMergeModalOpen(false);
            await refreshSelectedClassLists();
            await refreshClassesAndTotals();
          } catch (e: any) {
            toast.error(e.message || 'Failed to save merged book');
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

export default VEBooks;
