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
  Layers,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import ClassModal from './ClassModal';
import SubjectModal from './SubjectModal';
import MergeBookModal from './MergeBookModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import PdfPreviewModal from './PdfPreviewModal';

const VEBooks: React.FC = () => {
  const { isDarkMode } = useDarkMode();

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

  // Modals
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
        const [cls, tot] = await Promise.all([masterAdminVEBooksService.getClasses(), masterAdminVEBooksService.getTotals()]);
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
    const [cls, tot] = await Promise.all([masterAdminVEBooksService.getClasses(), masterAdminVEBooksService.getTotals()]);
    setClasses(cls);
    setTotals(tot);
    if (selectedClassId && !cls.find((c) => c.classId === selectedClassId)) {
      setSelectedClassId(cls[0]?.classId || '');
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
        <div className="min-w-0 flex-1">
          <h1 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Vedant Education Books</h1>
          <p className={`mt-1 text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage classes, subjects PDFs, cover pages, and merged books.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className={`px-4 py-2 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Subjects: <b>{totals?.totalSubjects ?? 0}</b>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Merged: <b>{totals?.totalMergedBooks ?? 0}</b>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setClassModalMode('add');
              setEditingClass(null);
              setClassModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white touch-manipulation min-h-[44px]"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            Add Class
          </button>
        </div>
      </div>

      {/* Hierarchy */}
      {!selectedClassId ? (
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
            <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Classes</h2>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{filteredClasses.length}</span>
              </div>
            </div>

            {filteredClasses.length === 0 ? (
              <div className="p-8 text-center">
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No classes found.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClasses.map((c) => (
                  <div
                    key={c.classId}
                    className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isDarkMode ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedClassId(c.classId);
                        setBookSearch('');
                      }}
                      className="text-left min-w-0"
                      title="Open class"
                    >
                      <p className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{c.className}</p>
                      <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>ID: {c.classId}</p>
                    </button>

                    <div className="flex items-center gap-2 justify-end flex-wrap">
                      <button
                        onClick={() => {
                          setClassModalMode('edit');
                          setEditingClass(c);
                          setClassModalOpen(true);
                        }}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-white hover:bg-gray-100 text-gray-800'
                        }`}
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>

                      <button
                        onClick={() =>
                          openDelete({
                            title: 'Delete Class',
                            description:
                              'This will delete the class and all its subjects + merged books (including PDFs/covers in storage). This action cannot be undone.',
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
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isDarkMode ? 'bg-red-900/30 hover:bg-red-900/40 text-red-200' : 'bg-red-50 hover:bg-red-100 text-red-700'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" /> Delete class
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`px-4 sm:px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => {
                      setSelectedClassId('');
                      setSubjects([]);
                      setMergeBooks([]);
                      setBookSearch('');
                    }}
                    className={`p-2.5 rounded-lg transition-colors flex-shrink-0 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center ${
                      isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    title="Back to classes"
                    aria-label="Back to classes"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="min-w-0">
                    <h2 className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedClass?.className}</h2>
                    <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Class ID: {selectedClassId}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      placeholder="Search books..."
                      className={`pl-9 pr-3 py-2 rounded-lg border text-sm transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  <button
                    onClick={() => {
                      setSubjectModalMode('add');
                      setEditingSubject(null);
                      setSubjectModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Add Subject
                  </button>
                  <button
                    onClick={() => {
                      setMergeModalMode('add');
                      setEditingMergeBook(null);
                      setMergeModalOpen(true);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-900 hover:bg-black text-white'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Add Merge Book
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-8">
              {actionLoading === 'load-class-content' ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  {/* Subjects */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Subjects</h3>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subjects.length}</span>
                    </div>

                    {filteredSubjects.length === 0 ? (
                      <div className="text-center py-10">
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No subjects found.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredSubjects.map((s) => (
                          <div
                            key={s.subjectId}
                            className={`p-4 rounded-xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                              isDarkMode ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="min-w-0">
                              <p className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{s.subjectName}</p>
                              <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Book ID: {s.subjectId}</p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              {s.coverPageUrl ? (
                                <a
                                  href={s.coverPageUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-white hover:bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  <ImageIcon className="w-4 h-4" /> View cover
                                </a>
                              ) : null}

                              <button
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  isDarkMode ? 'bg-indigo-900/20 hover:bg-indigo-900/30 text-indigo-200' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                                }`}
                                onClick={() => setPdfPreview({ open: true, title: s.subjectName, url: s.pdfUrl })}
                              >
                                <Eye className="w-4 h-4" /> Preview PDF
                              </button>

                              <button
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-white hover:bg-gray-100 text-gray-800'
                                }`}
                                onClick={() => {
                                  setSubjectModalMode('edit');
                                  setEditingSubject(s);
                                  setSubjectModalOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" /> Edit
                              </button>

                              {s.coverPageUrl ? (
                                <button
                                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isDarkMode ? 'bg-orange-900/20 hover:bg-orange-900/30 text-orange-200' : 'bg-orange-50 hover:bg-orange-100 text-orange-700'
                                  }`}
                                  onClick={() =>
                                    openDelete({
                                      title: 'Delete Cover Page',
                                      description: 'This will remove the cover image for this subject.',
                                      confirmText: 'Delete cover page',
                                      loadingKey: `delete-cover-${s.subjectId}`,
                                      onConfirm: async () => {
                                        try {
                                          setActionLoading(`delete-cover-${s.subjectId}`);
                                          await masterAdminVEBooksService.deleteSubjectCover(selectedClassId, s.subjectId);
                                          toast.success('Cover page deleted');
                                          setDeleteModal((d) => ({ ...d, open: false }));
                                          await refreshSelectedClassLists();
                                          await refreshClassesAndTotals();
                                        } catch (e: any) {
                                          toast.error(e.message || 'Failed to delete cover page');
                                        } finally {
                                          setActionLoading(null);
                                        }
                                      },
                                    })
                                  }
                                >
                                  <Trash2 className="w-4 h-4" /> Delete cover page
                                </button>
                              ) : null}

                              <button
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  isDarkMode ? 'bg-red-900/30 hover:bg-red-900/40 text-red-200' : 'bg-red-50 hover:bg-red-100 text-red-700'
                                }`}
                                onClick={() =>
                                  openDelete({
                                    title: 'Delete Book',
                                    description: 'This will delete the subject book and its PDF (and cover if present).',
                                    confirmText: 'Delete book',
                                    loadingKey: `delete-subject-${s.subjectId}`,
                                    onConfirm: async () => {
                                      try {
                                        setActionLoading(`delete-subject-${s.subjectId}`);
                                        await masterAdminVEBooksService.deleteSubject(selectedClassId, s.subjectId);
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
                                  })
                                }
                              >
                                <Trash2 className="w-4 h-4" /> Delete book
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Merge Books */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Merged Books</h3>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{mergeBooks.length}</span>
                    </div>

                    {filteredMergeBooks.length === 0 ? (
                      <div className="text-center py-10">
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No merged books found.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredMergeBooks.map((m) => (
                          <div
                            key={m.mergeBookId}
                            className={`p-4 rounded-xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                              isDarkMode ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="min-w-0">
                              <p className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{m.mergeBookName}</p>
                              <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Book ID: {m.mergeBookId}</p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              <button
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  isDarkMode ? 'bg-indigo-900/20 hover:bg-indigo-900/30 text-indigo-200' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                                }`}
                                onClick={() => setPdfPreview({ open: true, title: m.mergeBookName, url: m.pdfUrl })}
                              >
                                <Eye className="w-4 h-4" /> Preview PDF
                              </button>

                              <button
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-white hover:bg-gray-100 text-gray-800'
                                }`}
                                onClick={() => {
                                  setMergeModalMode('edit');
                                  setEditingMergeBook(m);
                                  setMergeModalOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" /> Edit
                              </button>

                              <button
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  isDarkMode ? 'bg-red-900/30 hover:bg-red-900/40 text-red-200' : 'bg-red-50 hover:bg-red-100 text-red-700'
                                }`}
                                onClick={() =>
                                  openDelete({
                                    title: 'Delete Book',
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
                                  })
                                }
                              >
                                <Trash2 className="w-4 h-4" /> Delete book
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
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

