import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { teacherLeaveService } from '../../../services/teacherLeaveService';
import { authService } from '../../../services/authService';
import { Card, CardHeader, CardContent, Button, Tabs, Tab, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Tooltip, Skeleton, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper } from '@mui/material';
import { Add, Edit, CloudUpload, Article } from '@mui/icons-material';

type TabKey = 'teacher' | 'student';

const TeacherLeave: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [tab, setTab] = useState<TabKey>('teacher');
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<any | null>(null);

  const [form, setForm] = useState({
    reason: '',
    fromDate: '',
    toDate: '',
    leaveType: 'casual'
  });

  const leaveTypes = [
    { value: 'casual', label: 'Casual Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'earned', label: 'Earned Leave' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        if (!user?.schoolId) return;
        const teacherId = authService.getTeacherId();
        if (!teacherId) return;
        const resp = await teacherLeaveService.getTeacherLeavesByTeacher(user.schoolId, teacherId);
        setLeaves(resp.leaves || []);
      } finally {
        setLoading(false);
      }
    };
    if (tab === 'teacher' && user?.schoolId) fetch();
  }, [tab, user?.schoolId]);

  const stats = useMemo(() => {
    const total = leaves.length;
    const pending = leaves.filter(l => l.status === 'pending').length;
    const approved = leaves.filter(l => l.status === 'approved').length;
    const rejected = leaves.filter(l => l.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [leaves]);

  const openApply = () => {
    setEditing(null);
    setForm({ reason: '', fromDate: '', toDate: '', leaveType: 'casual' });
    setFile(null);
    setOpen(true);
  };

  const openEdit = (leave: any) => {
    setEditing(leave);
    setForm({
      reason: leave.reason || '',
      fromDate: leave.startDate ? new Date(leave.startDate).toISOString().slice(0, 10) : '',
      toDate: leave.endDate ? new Date(leave.endDate).toISOString().slice(0, 10) : '',
      leaveType: leave.leaveType || 'casual'
    });
    setFile(null);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!user?.schoolId) return;
    const teacherId = authService.getTeacherId();
    if (!teacherId) return;
    setSubmitting(true);
    try {
      if (editing?.leaveId) {
        await teacherLeaveService.updateTeacherLeave(user.schoolId, editing.leaveId, {
          startDate: form.fromDate,
          endDate: form.toDate,
          reason: form.reason,
          file: file || undefined,
        });
      } else {
        await teacherLeaveService.createTeacherLeave({
          schoolId: user.schoolId,
          teacherId,
          startDate: form.fromDate,
          endDate: form.toDate,
          reason: form.reason,
          file: file || undefined,
        });
      }
      // Refresh
      const resp = await teacherLeaveService.getTeacherLeavesByTeacher(user.schoolId, teacherId);
      setLeaves(resp.leaves || []);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Card className="mb-6 dark:bg-gray-800 dark:border dark:border-gray-700">
        <CardHeader
          title="Leaves"
          subheader="Apply for leave and track status"
          sx={{
            '& .MuiCardHeader-title': { color: isDarkMode ? '#ffffff' : '#111827' },
            '& .MuiCardHeader-subheader': { color: isDarkMode ? '#9CA3AF' : '#6B7280' }
          }}
          action={
            <Tabs value={tab} onChange={(_, v) => setTab(v)}
              textColor="primary" indicatorColor="primary"
              sx={{
                minHeight: 48,
                '& .MuiTabs-flexContainer': { justifyContent: 'center' },
                '& .MuiTab-root': { color: isDarkMode ? '#E5E7EB' : undefined, minHeight: 48 }
              }}
            >
              <Tab value="teacher" label="Teacher" />
              <Tab value="student" label="Student" />
            </Tabs>
          }
        />
        <CardContent className="dark:text-gray-100">
          {tab === 'teacher' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Chip label={`Total: ${stats.total}`} variant={isDarkMode ? 'filled' : 'outlined'} sx={isDarkMode ? { backgroundColor: '#374151', color: '#E5E7EB' } : undefined} />
                <Chip label={`Pending: ${stats.pending}`} color={isDarkMode ? undefined : 'warning'} variant={isDarkMode ? 'filled' : 'outlined'} sx={isDarkMode ? { backgroundColor: '#92400E', color: '#FEF3C7' } : undefined} />
                <Chip label={`Approved: ${stats.approved}`} color={isDarkMode ? undefined : 'success'} variant={isDarkMode ? 'filled' : 'outlined'} sx={isDarkMode ? { backgroundColor: '#065F46', color: '#ECFDF5' } : undefined} />
                <Chip label={`Rejected: ${stats.rejected}`} color={isDarkMode ? undefined : 'error'} variant={isDarkMode ? 'filled' : 'outlined'} sx={isDarkMode ? { backgroundColor: '#7F1D1D', color: '#FEE2E2' } : undefined} />
                <div className="ml-auto">
                  <Button startIcon={<Add />} variant="contained" onClick={openApply}>Apply Leave</Button>
                </div>
              </div>

              {loading ? (
                <div className="space-y-3">
                  <Skeleton variant="rounded" height={42} />
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} variant="rounded" height={48} />
                  ))}
                </div>
              ) : (
                <TableContainer
                  component={Paper}
                  className="dark:bg-gray-800 dark:border dark:border-gray-700"
                  sx={{ boxShadow: 'none', borderRadius: '12px' }}
                >
                  <Table size="small" sx={{
                    '& td, & th': { borderColor: isDarkMode ? '#374151' : '#E5E7EB' }
                  }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: isDarkMode ? '#111827' : '#F9FAFB' }}>
                        <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#374151', fontWeight: 600 }}>Reason</TableCell>
                        <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#374151', fontWeight: 600 }}>From</TableCell>
                        <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#374151', fontWeight: 600 }}>To</TableCell>
                        <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#374151', fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#374151', fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#374151', fontWeight: 600 }}>Attachment</TableCell>
                        <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#374151', fontWeight: 600 }} align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaves.map(leave => (
                        <TableRow key={leave.leaveId} hover sx={{ backgroundColor: isDarkMode ? '#0B1220' : undefined }}>
                          <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : undefined }}>{leave.reason || '-'}</TableCell>
                          <TableCell sx={{ color: isDarkMode ? '#D1D5DB' : undefined }}>{new Date(leave.startDate || leave.fromDate).toLocaleDateString()}</TableCell>
                          <TableCell sx={{ color: isDarkMode ? '#D1D5DB' : undefined }}>{new Date(leave.endDate || leave.toDate).toLocaleDateString()}</TableCell>
                          <TableCell sx={{ color: isDarkMode ? '#D1D5DB' : undefined }}>{leave.leaveType || '-'}</TableCell>
                          <TableCell>
                            <Chip size="small" label={leave.status || 'Pending'} color={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'error' : 'warning'} variant={isDarkMode ? 'filled' : 'outlined'} />
                          </TableCell>
                          <TableCell>
                            {leave.filePath ? (
                              <Tooltip title="Open attachment">
                                <IconButton size="small" component="a" href={leave.filePath} target="_blank" rel="noopener noreferrer" sx={{ color: isDarkMode ? '#93C5FD' : undefined }}>
                                  <Article fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : <span style={{ color: isDarkMode ? '#9CA3AF' : undefined }}>-</span>}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => openEdit(leave)} sx={{ color: isDarkMode ? '#E5E7EB' : undefined }}><Edit fontSize="small" /></IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </div>
          )}

          {tab === 'student' && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p>Student leave requests will appear here.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} variant="outlined" className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader title={`Student ${i + 1}`} subheader="Reason: Family event" />
                    <CardContent>From: 2025-09-12 • To: 2025-09-13 • Status: Pending</CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: isDarkMode ? { backgroundColor: '#111827', color: '#E5E7EB' } : undefined
        }}
      >
        <DialogTitle sx={isDarkMode ? { color: '#FFFFFF' } : undefined}>{editing ? 'Edit Leave' : 'Apply Leave'}</DialogTitle>
        <DialogContent dividers sx={isDarkMode ? { borderColor: '#374151' } : undefined}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField 
              label="Reason" 
              fullWidth 
              value={form.reason} 
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="md:col-span-2"
              InputLabelProps={{ sx: isDarkMode ? { color: '#9CA3AF' } : undefined }}
              InputProps={{ sx: isDarkMode ? { color: '#E5E7EB' } : undefined }}
              sx={isDarkMode ? { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' }, '&:hover fieldset': { borderColor: '#4B5563' } } } : undefined}
            />
            <TextField 
              label="From Date" 
              type="date" 
              fullWidth 
              InputLabelProps={{ shrink: true, sx: isDarkMode ? { color: '#9CA3AF' } : undefined }} 
              value={form.fromDate} 
              onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
              InputProps={{ sx: isDarkMode ? { color: '#E5E7EB' } : undefined }}
              sx={isDarkMode ? { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' }, '&:hover fieldset': { borderColor: '#4B5563' } } } : undefined}
            />
            <TextField 
              label="To Date" 
              type="date" 
              fullWidth 
              InputLabelProps={{ shrink: true, sx: isDarkMode ? { color: '#9CA3AF' } : undefined }} 
              value={form.toDate} 
              onChange={(e) => setForm({ ...form, toDate: e.target.value })}
              InputProps={{ sx: isDarkMode ? { color: '#E5E7EB' } : undefined }}
              sx={isDarkMode ? { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' }, '&:hover fieldset': { borderColor: '#4B5563' } } } : undefined}
            />
            <TextField 
              select 
              label="Leave Type" 
              fullWidth 
              value={form.leaveType} 
              onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
              InputLabelProps={{ sx: isDarkMode ? { color: '#9CA3AF' } : undefined }}
              InputProps={{ sx: isDarkMode ? { color: '#E5E7EB' } : undefined }}
              sx={isDarkMode ? { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' }, '&:hover fieldset': { borderColor: '#4B5563' } }, '& .MuiMenu-paper': { backgroundColor: '#111827' } } : undefined}
            >
              {leaveTypes.map(t => (
                <MenuItem key={t.value} value={t.value} sx={isDarkMode ? { backgroundColor: '#111827', color: '#E5E7EB', '&:hover': { backgroundColor: '#1F2937' } } : undefined}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>
            <Button 
              variant={isDarkMode ? 'contained' : 'outlined'} 
              component="label" 
              startIcon={<CloudUpload />} 
              sx={isDarkMode ? { backgroundColor: '#1F2937', color: '#E5E7EB', '&:hover': { backgroundColor: '#374151' } } : undefined}
            >
              {file ? file.name : 'Upload File'}
              <input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}>
            {editing ? 'Update' : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TeacherLeave;


