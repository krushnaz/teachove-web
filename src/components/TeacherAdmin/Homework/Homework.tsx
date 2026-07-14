import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { classroomService, Classroom, Subject } from '../../../services/classroomService';
import { homeworkService, HomeworkPayload } from '../../../services/homeworkService';
import { authService } from '../../../services/authService';
import { toast } from 'react-toastify';
import {
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  Pencil,
  Trash2,
  BookOpen,
  CalendarDays,
  Upload,
  X,
} from 'lucide-react';
import {
  TeacherPageShell,
  TeacherPageHeader,
  TeacherHeaderActions,
  TeacherStatsGrid,
  TeacherStatCard,
  TeacherButton,
  TeacherPanel,
  TeacherEmpty,
} from '../shared';

type HomeworkItem = {
  schoolId: string;
  classId: string;
  className?: string;
  title: string;
  subjectName: string;
  description: string;
  deadline: string; // ISO date
  file: string;
  homeworkId?: string;
  isActive?: boolean;
  createdAt?: string;
};

const rangeDays = (center: Date, days = 7) => {
  const start = new Date(center);
  start.setDate(center.getDate() - days);
  return Array.from({ length: days * 2 + 1 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

// Helper function to extract filename from URL
const getFileNameFromUrl = (url: string): string => {
  try {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    // Remove timestamp prefix if present (format: timestamp_filename)
    const parts = fileName.split('_');
    if (parts.length > 1 && !isNaN(Number(parts[0]))) {
      return parts.slice(1).join('_');
    }
    return fileName;
  } catch {
    return 'File';
  }
};

const inputClass =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

const Homework: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [days, setDays] = useState<Date[]>(rangeDays(new Date()));
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  // Class selection will be done inside dialog; list filters only by date
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<HomeworkItem | null>(null);
  const [editing, setEditing] = useState<HomeworkItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    classId: '',
    subjectName: '',
    title: '',
    description: '',
    deadline: new Date().toISOString().slice(0, 10),
  });

  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
  const [markedDates, setMarkedDates] = useState<string[]>([]);
  const [loadingHomework, setLoadingHomework] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.schoolId) return;
      try {
        setLoadingClasses(true);
        const cls = await classroomService.getClassesBySchoolId(user.schoolId);
        setClasses(cls);
        // Load homework dates for calendar indicators
        try {
          const teacherId = authService.getTeacherId();
          const dates = await homeworkService.getHomeworkDates(user.schoolId, teacherId || undefined);
          setMarkedDates(Array.isArray(dates) ? dates : []);
        } catch (error) {
          console.error('Error fetching homework dates:', error);
        }
      } finally {
        setLoadingClasses(false);
      }
    };
    load();
  }, [user?.schoolId]);

  // Update subjects when form.classId changes
  useEffect(() => {
    const cls = classes.find(c => c.classId === form.classId);
    setSubjects(cls ? (cls.subjects || []) : []);
  }, [form.classId, classes]);

  const dateKey = (d: Date) => d.toISOString().slice(0, 10);
  const selectedKey = dateKey(selectedDate);

  const filtered = useMemo(() => {
    // API returns homework for the selected date, so no need to filter by deadline
    return homeworks;
  }, [homeworks]);

  const stats = useMemo(() => {
    const total = homeworks.length;
    const withAttachments = homeworks.filter(h => !!h.file).length;
    const classesCount = new Set(homeworks.map(h => h.className).filter(Boolean)).size;
    return { total, withAttachments, classesCount };
  }, [homeworks]);

  // Load homework from API for selected date
  useEffect(() => {
    const run = async () => {
      if (!user?.schoolId) return;
      const schoolId = user.schoolId; // TypeScript now knows this is defined
      try {
        setLoadingHomework(true);
        const teacherId = authService.getTeacherId();
        const items = await homeworkService.getHomeworkByDate(schoolId, selectedKey, teacherId || undefined);

        // Normalize API items to local HomeworkItem shape
        const mapped: HomeworkItem[] = items.map(i => ({
          homeworkId: i.homeworkId || '',
          title: i.title,
          subjectName: i.subjectName,
          description: i.description,
          deadline: i.deadline,
          file: i.file || '',
          isActive: i.isActive,
          createdAt: i.createdAt,
          classId: i.classId || '',
          schoolId: schoolId,
          className: i.className || '', // Use className directly from API response
        }));

        // Replace homework items for the selected date
        setHomeworks(mapped);
      } catch (error) {
        console.error('Error fetching homework:', error);
      } finally {
        setLoadingHomework(false);
      }
    };
    run();
  }, [user?.schoolId, selectedKey]);

  const shiftDays = (delta: number) => {
    const newCenter = new Date(selectedDate);
    newCenter.setDate(newCenter.getDate() + delta);
    setSelectedDate(newCenter);
    setDays(rangeDays(newCenter));
  };

  const openAdd = () => {
    setEditing(null);
    setFile(null);
    setForm({
      classId: classes[0]?.classId || '',
      subjectName: '',
      title: '',
      description: '',
      deadline: selectedKey,
    });
    setOpen(true);
  };

  const openEdit = (item: HomeworkItem) => {
    setEditing(item);
    setFile(null);
    setForm({
      classId: item.classId,
      subjectName: item.subjectName,
      title: item.title,
      description: item.description,
      deadline: item.deadline,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!user?.schoolId) return;
    setSaving(true);
    try {
      const cls = classes.find(c => c.classId === form.classId);
      const selectedClassName = cls ? `${cls.className}-${cls.section}` : '';
      const teacherId = authService.getTeacherId();
      if (!teacherId) {
        toast.error('Teacher ID not found');
        return;
      }

      if (editing) {
        // Update existing homework
        const updatedItem = await homeworkService.updateHomework(user.schoolId, editing.homeworkId!, {
          title: form.title,
          subjectName: form.subjectName,
          description: form.description,
          deadline: form.deadline,
          classId: form.classId,
          className: selectedClassName,
          teacherId: teacherId,
          isActive: true,
          file: file || undefined, // Pass the file for upload
        });

        const newItem: HomeworkItem = {
          schoolId: user.schoolId,
          classId: form.classId,
          className: selectedClassName,
          title: form.title,
          subjectName: form.subjectName,
          description: form.description,
          deadline: form.deadline,
          file: updatedItem.file || '',
          homeworkId: updatedItem.homeworkId || editing.homeworkId,
          isActive: true,
          createdAt: new Date().toISOString(),
        };

        setHomeworks(prev => prev.map(h => h.homeworkId === editing.homeworkId ? newItem : h));
        toast.success('Homework updated successfully!');
      } else {
        // Create new homework
        const created = await homeworkService.createHomework(user.schoolId, {
          title: form.title,
          subjectName: form.subjectName,
          description: form.description,
          deadline: form.deadline,
          classId: form.classId,
          className: selectedClassName,
          teacherId: teacherId,
          file: file || undefined, // Pass the file for upload
        } as HomeworkPayload);

        const newItem: HomeworkItem = {
          schoolId: user.schoolId,
          classId: form.classId,
          className: selectedClassName,
          title: form.title,
          subjectName: form.subjectName,
          description: form.description,
          deadline: form.deadline,
          file: created.file || '',
          homeworkId: created.homeworkId || Math.random().toString(36).slice(2),
          isActive: true,
          createdAt: new Date().toISOString(),
        };

        setHomeworks(prev => [newItem, ...prev]);
        toast.success('Homework sent successfully!');
      }

      // Refresh homework dates for calendar indicators
      try {
        const teacherId = authService.getTeacherId();
        const dates = await homeworkService.getHomeworkDates(user.schoolId, teacherId || undefined);
        setMarkedDates(Array.isArray(dates) ? dates : []);
      } catch (error) {
        console.error('Error refreshing homework dates:', error);
      }

      setOpen(false);
    } catch (error) {
      toast.error(editing ? 'Failed to update homework' : 'Failed to send homework');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete || !user?.schoolId) return;
    setDeleting(true);
    try {
      await homeworkService.deleteHomework(user.schoolId, confirmDelete.homeworkId!);
      setHomeworks(prev => prev.filter(h => h.homeworkId !== confirmDelete.homeworkId));

      // Refresh homework dates for calendar indicators
      try {
        const teacherId = authService.getTeacherId();
        const dates = await homeworkService.getHomeworkDates(user.schoolId, teacherId || undefined);
        setMarkedDates(Array.isArray(dates) ? dates : []);
      } catch (error) {
        console.error('Error refreshing homework dates:', error);
      }

      toast.success('Homework deleted successfully!');
      setConfirmDelete(null);
    } catch (error) {
      toast.error('Failed to delete homework');
    } finally {
      setDeleting(false);
    }
  };

  const monthLabel = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const handleRefresh = async () => {
    if (!user?.schoolId) return;
    const schoolId = user.schoolId; // TypeScript now knows this is defined
    setRefreshing(true);
    try {
      const teacherId = authService.getTeacherId();

      // Refresh homework dates for calendar indicators
      const dates = await homeworkService.getHomeworkDates(schoolId, teacherId || undefined);
      setMarkedDates(Array.isArray(dates) ? dates : []);

      // Refresh homework for selected date
      const items = await homeworkService.getHomeworkByDate(schoolId, selectedKey, teacherId || undefined);

      // Normalize API items to local HomeworkItem shape
      const mapped: HomeworkItem[] = items.map(i => ({
        homeworkId: i.homeworkId || '',
        title: i.title,
        subjectName: i.subjectName,
        description: i.description,
        deadline: i.deadline,
        file: i.file || '',
        isActive: i.isActive,
        createdAt: i.createdAt,
        classId: i.classId || '',
        schoolId: schoolId,
        className: i.className || '',
      }));

      setHomeworks(mapped);
      toast.success('Data refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const isLoadingList = loadingClasses || loadingHomework;

  return (
    <TeacherPageShell>
      <TeacherPageHeader
        title="Homework"
        description="Send daily homework to your class and track it by date."
        action={
          <TeacherHeaderActions>
            <TeacherButton
              variant="secondary"
              compact
              onClick={handleRefresh}
              loading={refreshing}
              icon={RefreshCw}
              aria-label="Refresh"
            >
              <span className="hidden sm:inline">Refresh</span>
            </TeacherButton>
            <TeacherButton icon={Plus} compact onClick={openAdd} disabled={loadingClasses}>
              Send Homework
            </TeacherButton>
          </TeacherHeaderActions>
        }
      />

      <TeacherStatsGrid cols={3}>
        <TeacherStatCard title="Homework Today" value={stats.total} icon={BookOpen} color="indigo" />
        <TeacherStatCard title="With Attachments" value={stats.withAttachments} icon={Paperclip} color="emerald" />
        <TeacherStatCard title="Classes" value={stats.classesCount} icon={CalendarDays} color="violet" />
      </TeacherStatsGrid>

      {/* Calendar */}
      <TeacherPanel>
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
          <button
            onClick={() => shiftDays(-7)}
            aria-label="Previous week"
            className="p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
            <CalendarDays size={15} />
            {monthLabel}
          </span>
          <button
            onClick={() => shiftDays(7)}
            aria-label="Next week"
            className="p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex overflow-x-auto gap-2 sm:gap-3 pb-2">
          {days.map(d => {
            const key = dateKey(d);
            const isSel = key === selectedKey;
            const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dateNum = d.getDate();
            const hasHomework = markedDates.includes(key);
            return (
              <button
                key={key}
                onClick={() => setSelectedDate(d)}
                className={`rounded-xl border px-3 sm:px-4 py-2 min-w-[72px] sm:min-w-[84px] text-center cursor-pointer transition-all ${
                  isSel
                    ? 'bg-indigo-600 text-white border-transparent shadow-sm shadow-indigo-600/20'
                    : 'bg-white dark:bg-gray-900/40 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider">{weekday}</div>
                <div className="text-lg sm:text-xl font-bold">{dateNum}</div>
                {loadingHomework && isSel ? (
                  <div className="mt-1 w-2 h-2 rounded-full mx-auto animate-pulse bg-white/60" />
                ) : hasHomework && !isSel ? (
                  <div className="mt-1 w-2 h-2 rounded-full mx-auto bg-indigo-500 dark:bg-indigo-400" />
                ) : (
                  <div className="mt-1 w-2 h-2 mx-auto" />
                )}
              </button>
            );
          })}
        </div>
      </TeacherPanel>

      {/* Homework Table */}
      <TeacherPanel title="Homework for Selected Date" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: '720px' }}>
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                {['Title', 'Class', 'Subject', 'Deadline', 'File', 'Actions'].map((h, idx) => (
                  <th
                    key={h}
                    className={`px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap ${
                      idx === 5 ? 'text-right' : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoadingList ? (
                [...Array(5)].map((_, i) => (
                  <tr key={`shimmer-${i}`}>
                    <td colSpan={6} className="px-4 sm:px-6 py-3">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <TeacherEmpty
                      icon={BookOpen}
                      title="No homework for this date"
                      description='Click "Send Homework" to assign homework for the selected date.'
                    />
                  </td>
                </tr>
              ) : (
                filtered.map(h => (
                  <tr key={h.homeworkId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900 dark:text-white">{h.title}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600 dark:text-gray-300">{h.className || '-'}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600 dark:text-gray-300">{h.subjectName}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{h.deadline}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm">
                      {h.file ? (
                        <button
                          onClick={() => window.open(h.file, '_blank')}
                          title={`View: ${getFileNameFromUrl(h.file)}`}
                          className="inline-flex items-center gap-1.5 max-w-[180px] px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Paperclip size={13} className="flex-shrink-0" />
                          <span className="truncate">{getFileNameFromUrl(h.file)}</span>
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEdit(h)}
                          title="Edit"
                          className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(h)}
                          title="Delete"
                          className="p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TeacherPanel>

      {/* Add/Edit Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editing ? 'Edit Homework' : 'Send Homework'}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Class</label>
                  <select
                    value={form.classId}
                    onChange={(e) => setForm({ ...form, classId: e.target.value })}
                    className={inputClass}
                  >
                    {classes.map(c => (
                      <option key={c.classId} value={c.classId}>{`${c.className}-${c.section}`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Subject</label>
                  <select
                    value={form.subjectName}
                    onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
                    className={inputClass}
                  >
                    {subjects.length === 0 ? (
                      <option value="" disabled>Select class first</option>
                    ) : (
                      <>
                        <option value="">Select subject</option>
                        {subjects.map(s => (
                          <option key={s.subjectName} value={s.subjectName}>{s.subjectName}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter homework title"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter homework details..."
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Deadline</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Attachment</label>
                  <label className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <Upload size={16} />
                    <span className="text-sm truncate">{file ? file.name : 'Upload File'}</span>
                    <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <TeacherButton variant="secondary" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </TeacherButton>
              <TeacherButton onClick={handleSave} loading={saving}>
                {editing ? 'Update' : 'Send'}
              </TeacherButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Homework</h3>
            </div>
            <div className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{confirmDelete.title}"</span>? This action cannot be undone.
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <TeacherButton variant="secondary" onClick={() => setConfirmDelete(null)} disabled={deleting}>
                Cancel
              </TeacherButton>
              <TeacherButton variant="danger" onClick={handleDelete} loading={deleting}>
                Delete
              </TeacherButton>
            </div>
          </div>
        </div>
      )}
    </TeacherPageShell>
  );
};

export default Homework;
