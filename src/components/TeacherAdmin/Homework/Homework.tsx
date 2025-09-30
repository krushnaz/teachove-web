import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { classroomService, Classroom, Subject } from '../../../services/classroomService';
import { homeworkService, HomeworkPayload, UpdateHomeworkRequest } from '../../../services/homeworkService';
import { Card, CardHeader, CardContent, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Skeleton, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Tooltip, CircularProgress } from '@mui/material';
import { Add, Edit, Delete, CloudUpload, ChevronLeft, ChevronRight, Today, Assignment, AttachFile } from '@mui/icons-material';
import { toast } from 'react-toastify';

// Shimmer Loading Components
const ShimmerTableRow: React.FC = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-center">
      <div className="flex space-x-2">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </td>
  </tr>
);

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

const Homework: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
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

  useEffect(() => {
    const load = async () => {
      if (!user?.schoolId) return;
      try {
        setLoadingClasses(true);
        const cls = await classroomService.getClassesBySchoolId(user.schoolId);
        setClasses(cls);
        // Load homework dates for calendar indicators
        try {
          const dates = await homeworkService.getHomeworkDates(user.schoolId);
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

  // Load homework from API for selected date
  useEffect(() => {
    const run = async () => {
      if (!user?.schoolId) return;
      try {
        setLoadingHomework(true);
        const items = await homeworkService.getHomeworkByDate(user.schoolId, selectedKey);
        
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
          schoolId: user.schoolId,
          className: classes.find(c => c.classId === (i.classId || ''))?.className,
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
      const className = cls ? `${cls.className}-${cls.section}` : '';
      
      if (editing) {
        // Update existing homework
        const updatedItem = await homeworkService.updateHomework(user.schoolId, editing.homeworkId!, {
          title: form.title,
          subjectName: form.subjectName,
          description: form.description,
          deadline: form.deadline,
          classId: form.classId,
          className: className,
          isActive: true,
          file: file || undefined, // Pass the file for upload
        });
        
        const newItem: HomeworkItem = {
          schoolId: user.schoolId,
          classId: form.classId,
          className: className,
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
          className: className,
          file: file || undefined, // Pass the file for upload
        } as HomeworkPayload);
        
        const newItem: HomeworkItem = {
          schoolId: user.schoolId,
          classId: form.classId,
          className: className,
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
        const dates = await homeworkService.getHomeworkDates(user.schoolId);
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
        const dates = await homeworkService.getHomeworkDates(user.schoolId);
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

  return (
    <div>
      <Card className="mb-6 dark:bg-gray-800 dark:border dark:border-gray-700">
        <CardHeader
          title="Homework"
          subheader="Send daily homework to selected class"
          sx={{ '& .MuiCardHeader-title': { color: isDarkMode ? '#ffffff' : '#111827' }, '& .MuiCardHeader-subheader': { color: isDarkMode ? '#9CA3AF' : '#6B7280' } }}
          action={<Button startIcon={<Add sx={{ color: isDarkMode ? '#E5E7EB' : undefined }} />} variant="contained" onClick={openAdd}>Send Homework</Button>}
        />
        <CardContent>
          {/* Horizontal Calendar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <IconButton onClick={() => shiftDays(-7)} aria-label="Prev week" sx={{ color: isDarkMode ? '#E5E7EB' : undefined }}><ChevronLeft /></IconButton>
              <Chip icon={<Today sx={{ color: isDarkMode ? '#E5E7EB' : undefined }} />} label={monthLabel} color="primary" />
              <IconButton onClick={() => shiftDays(7)} aria-label="Next week" sx={{ color: isDarkMode ? '#E5E7EB' : undefined }}><ChevronRight /></IconButton>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-3 pb-2">
            {days.map(d => {
              const key = dateKey(d);
              const isSel = key === selectedKey;
              const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
              const dateNum = d.getDate();
              const hasHomework = markedDates.includes(key);
              return (
                <div key={key} className={`rounded-xl border px-4 py-2 min-w-[84px] text-center cursor-pointer transition-all ${isSel ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow' : (isDarkMode ? 'bg-gray-900/40 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50')}`}
                  onClick={() => setSelectedDate(d)}
                >
                  <div className="text-[10px] uppercase tracking-wider">{weekday}</div>
                  <div className="text-xl font-bold">{dateNum}</div>
                  {loadingHomework && isSel ? (
                    <div className="mt-1 w-2 h-2 rounded-full mx-auto animate-pulse bg-white/60" />
                  ) : hasHomework && !isSel ? (
                    <div className="mt-1 w-2 h-2 rounded-full mx-auto" style={{ backgroundColor: isDarkMode ? '#60A5FA' : '#3B82F6' }} />
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Homework Table */}
          <TableContainer component={Paper} className="mt-4 dark:bg-gray-800 dark:border dark:border-gray-700" sx={{ boxShadow: 'none', borderRadius: '12px' }}>
            <Table size="small" sx={{ '& td, & th': { borderColor: isDarkMode ? '#374151' : '#E5E7EB' } }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: isDarkMode ? '#111827' : '#F9FAFB' }}>
                  <TableCell sx={{ fontWeight: 600, color: isDarkMode ? '#E5E7EB' : '#111827' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: isDarkMode ? '#E5E7EB' : '#111827' }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: isDarkMode ? '#E5E7EB' : '#111827' }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: isDarkMode ? '#E5E7EB' : '#111827' }}>Deadline</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: isDarkMode ? '#E5E7EB' : '#111827' }}>File</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: isDarkMode ? '#E5E7EB' : '#111827' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingClasses || loadingHomework ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={`shimmer-${i}`}>
                      <TableCell colSpan={6}>
                        <Skeleton variant="rounded" height={28} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: isDarkMode ? '#9CA3AF' : undefined }}>
                      <Assignment sx={{ mr: 1, verticalAlign: 'middle', color: isDarkMode ? '#9CA3AF' : undefined }} /> No homework for this date
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(h => (
                    <TableRow key={h.homeworkId} hover>
                      <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#111827' }}>{h.title}</TableCell>
                      <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#111827' }}>{h.className || classes.find(c => c.classId === h.classId)?.className}</TableCell>
                      <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#111827' }}>{h.subjectName}</TableCell>
                      <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#111827' }}>{h.deadline}</TableCell>
                      <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#111827' }}>{h.file ? (
                        <Tooltip title={`Click to view: ${getFileNameFromUrl(h.file)}`}>
                          <Chip 
                            size="small" 
                            icon={<AttachFile sx={{ color: isDarkMode ? '#E5E7EB' : '#111827' }} />}
                            label={getFileNameFromUrl(h.file)}
                            onClick={() => window.open(h.file, '_blank')}
                            sx={{ 
                              cursor: 'pointer',
                              color: isDarkMode ? '#E5E7EB' : '#111827',
                              backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                              '&:hover': {
                                backgroundColor: isDarkMode ? '#4B5563' : '#E5E7EB'
                              }
                            }}
                          />
                        </Tooltip>
                      ) : '-'}</TableCell>
                       <TableCell align="right">
                         <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(h)} sx={{ color: isDarkMode ? '#E5E7EB' : undefined }}><Edit fontSize="small" /></IconButton></Tooltip>
                         <Tooltip title="Delete"><IconButton size="small" onClick={() => setConfirmDelete(h)} sx={{ color: isDarkMode ? '#E5E7EB' : undefined }}><Delete fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: isDarkMode ? { backgroundColor: '#111827', color: '#E5E7EB' } : undefined }}>
        <DialogTitle sx={isDarkMode ? { color: '#FFFFFF' } : undefined}>{editing ? 'Edit Homework' : 'Send Homework'}</DialogTitle>
        <DialogContent dividers sx={isDarkMode ? { borderColor: '#374151' } : undefined}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField select label="Class" fullWidth value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}
              InputLabelProps={{ sx: isDarkMode ? { color: '#9CA3AF' } : undefined }} InputProps={{ sx: isDarkMode ? { color: '#E5E7EB' } : undefined }}
              sx={isDarkMode ? { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' }, '&:hover fieldset': { borderColor: '#4B5563' } } } : undefined}
            >
              {classes.map(c => (<MenuItem key={c.classId} value={c.classId}>{`${c.className}-${c.section}`}</MenuItem>))}
            </TextField>
            <TextField select label="Subject" fullWidth value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
              InputLabelProps={{ sx: isDarkMode ? { color: '#9CA3AF' } : undefined }} InputProps={{ sx: isDarkMode ? { color: '#E5E7EB' } : undefined }}
              sx={isDarkMode ? { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' }, '&:hover fieldset': { borderColor: '#4B5563' } } } : undefined}
            >
              {subjects.length === 0 ? (<MenuItem value="" disabled>Select class first</MenuItem>) : subjects.map(s => (<MenuItem key={s.subjectName} value={s.subjectName}>{s.subjectName}</MenuItem>))}
            </TextField>
            <TextField label="Title" fullWidth value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              InputLabelProps={{ sx: isDarkMode ? { color: '#9CA3AF' } : undefined }} InputProps={{ sx: isDarkMode ? { color: '#E5E7EB' } : undefined }}
              className="md:col-span-2" sx={isDarkMode ? { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' }, '&:hover fieldset': { borderColor: '#4B5563' } } } : undefined}
            />
            <TextField label="Description" fullWidth multiline minRows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              InputLabelProps={{ sx: isDarkMode ? { color: '#9CA3AF' } : undefined }} InputProps={{ sx: isDarkMode ? { color: '#E5E7EB' } : undefined }}
              className="md:col-span-2" sx={isDarkMode ? { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' }, '&:hover fieldset': { borderColor: '#4B5563' } } } : undefined}
            />
            <TextField label="Deadline" type="date" fullWidth InputLabelProps={{ shrink: true, sx: isDarkMode ? { color: '#9CA3AF' } : undefined }} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              InputProps={{ sx: isDarkMode ? { color: '#E5E7EB' } : undefined }} sx={isDarkMode ? { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' }, '&:hover fieldset': { borderColor: '#4B5563' } } } : undefined}
            />
            <Button variant={isDarkMode ? 'contained' : 'outlined'} component="label" startIcon={<CloudUpload sx={{ color: isDarkMode ? '#E5E7EB' : undefined }} />} sx={isDarkMode ? { backgroundColor: '#1F2937', color: '#E5E7EB', '&:hover': { backgroundColor: '#374151' } } : undefined}>
              {file ? file.name : 'Upload File'}
              <input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}>
            {editing ? 'Update' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} PaperProps={{ sx: isDarkMode ? { backgroundColor: '#111827', color: '#E5E7EB' } : undefined }}>
        <DialogTitle sx={isDarkMode ? { color: '#FFFFFF' } : undefined}>Delete Homework</DialogTitle>
        <DialogContent sx={isDarkMode ? { color: '#E5E7EB' } : undefined}>
          Are you sure you want to delete "{confirmDelete?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting} startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : undefined}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Homework;


