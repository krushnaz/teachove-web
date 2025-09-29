import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { classroomService, Classroom, Subject } from '../../../services/classroomService';
import { Card, CardHeader, CardContent, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Skeleton, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Tooltip, CircularProgress } from '@mui/material';
import { Add, Edit, Delete, CloudUpload, ChevronLeft, ChevronRight, Today, Assignment } from '@mui/icons-material';

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
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    classId: '',
    subjectName: '',
    title: '',
    description: '',
    deadline: new Date().toISOString().slice(0, 10),
  });

  // Local data store for demo; replace with API when available
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.schoolId) return;
      try {
        setLoadingClasses(true);
        const cls = await classroomService.getClassesBySchoolId(user.schoolId);
        setClasses(cls);
        // Seed 3 dummy records for visual consistency if none exist
        if (homeworks.length === 0 && cls && cls.length > 0) {
          const baseClass = cls[0];
          const baseClassName = `${baseClass.className}-${baseClass.section}`;
          const today = new Date();
          const todayKey = today.toISOString().slice(0, 10);
          const tomorrowKey = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString().slice(0, 10);
          const yesterdayKey = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString().slice(0, 10);
          setHomeworks([
            { schoolId: user.schoolId, classId: baseClass.classId, className: baseClassName, title: 'Math Practice', subjectName: baseClass.subjects?.[0]?.subjectName || 'Mathematics', description: 'Complete exercises 5 to 10 from Chapter 3.', deadline: todayKey, file: '', isActive: true, createdAt: new Date().toISOString(), homeworkId: 'd1' },
            { schoolId: user.schoolId, classId: baseClass.classId, className: baseClassName, title: 'Science Reading', subjectName: baseClass.subjects?.[1]?.subjectName || 'Science', description: 'Read the section on Photosynthesis.', deadline: tomorrowKey, file: '', isActive: true, createdAt: new Date().toISOString(), homeworkId: 'd2' },
            { schoolId: user.schoolId, classId: baseClass.classId, className: baseClassName, title: 'English Essay', subjectName: baseClass.subjects?.[2]?.subjectName || 'English', description: 'Write a short essay on My Favorite Season.', deadline: yesterdayKey, file: '', isActive: true, createdAt: new Date().toISOString(), homeworkId: 'd3' },
          ]);
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
    return homeworks.filter(h => h.deadline === selectedKey);
  }, [homeworks, selectedKey]);

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
      const newItem: HomeworkItem = {
        schoolId: user.schoolId,
        classId: form.classId,
        className: cls ? `${cls.className}-${cls.section}` : undefined,
        title: form.title,
        subjectName: form.subjectName,
        description: form.description,
        deadline: form.deadline,
        file: file ? file.name : '',
        homeworkId: editing?.homeworkId || Math.random().toString(36).slice(2),
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      if (editing) {
        setHomeworks(prev => prev.map(h => h.homeworkId === editing.homeworkId ? newItem : h));
      } else {
        setHomeworks(prev => [newItem, ...prev]);
      }
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    setHomeworks(prev => prev.filter(h => h.homeworkId !== confirmDelete.homeworkId));
    setConfirmDelete(null);
  };

  const monthLabel = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div>
      <Card className="mb-6 dark:bg-gray-800 dark:border dark:border-gray-700">
        <CardHeader
          title="Homework"
          subheader="Send daily homework to selected class"
          sx={{ '& .MuiCardHeader-title': { color: isDarkMode ? '#ffffff' : '#111827' }, '& .MuiCardHeader-subheader': { color: isDarkMode ? '#9CA3AF' : '#6B7280' } }}
          action={<Button startIcon={<Add />} variant="contained" onClick={openAdd}>Send Homework</Button>}
        />
        <CardContent>
          {/* Horizontal Calendar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <IconButton onClick={() => shiftDays(-7)} aria-label="Prev week"><ChevronLeft /></IconButton>
              <Chip icon={<Today />} label={monthLabel} color="primary" />
              <IconButton onClick={() => shiftDays(7)} aria-label="Next week"><ChevronRight /></IconButton>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-3 pb-2">
            {days.map(d => {
              const key = dateKey(d);
              const isSel = key === selectedKey;
              const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
              const dateNum = d.getDate();
              return (
                <div key={key} className={`rounded-xl border px-4 py-2 min-w-[84px] text-center cursor-pointer transition-all ${isSel ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow' : (isDarkMode ? 'bg-gray-900/40 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50')}`}
                  onClick={() => setSelectedDate(d)}
                >
                  <div className="text-[10px] uppercase tracking-wider">{weekday}</div>
                  <div className="text-xl font-bold">{dateNum}</div>
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
                {loadingClasses ? (
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
                      <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} /> No homework for this date
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(h => (
                    <TableRow key={h.homeworkId} hover>
                      <TableCell>{h.title}</TableCell>
                      <TableCell>{h.className || classes.find(c => c.classId === h.classId)?.className}</TableCell>
                      <TableCell>{h.subjectName}</TableCell>
                      <TableCell>{h.deadline}</TableCell>
                      <TableCell>{h.file ? <Chip size="small" label={h.file} /> : '-'}</TableCell>
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
            <Button variant={isDarkMode ? 'contained' : 'outlined'} component="label" startIcon={<CloudUpload />} sx={isDarkMode ? { backgroundColor: '#1F2937', color: '#E5E7EB', '&:hover': { backgroundColor: '#374151' } } : undefined}>
              {file ? file.name : 'Upload File'}
              <input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}>{editing ? 'Update' : 'Send'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Delete Homework</DialogTitle>
        <DialogContent>Are you sure you want to delete "{confirmDelete?.title}"?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Homework;


