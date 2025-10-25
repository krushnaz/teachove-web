import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { studentLeavesService, StudentLeave } from '../../../services/studentLeavesService';
import {
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Article, CheckCircle, Cancel } from '@mui/icons-material';
import { toast } from 'react-toastify';

const StudentLeavesTab: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [leaves, setLeaves] = useState<StudentLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<StudentLeave | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.schoolId, user?.classId]);

  const fetchLeaves = async () => {
    if (!user?.schoolId || !user?.classId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { leaves: data } = await studentLeavesService.getLeavesByClass(
        user.schoolId,
        user.classId
      );
      setLeaves(data);
    } catch (error: any) {
      console.error('Error fetching student leaves:', error);
      toast.error('Failed to load student leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId: string) => {
    if (!user?.schoolId) return;

    try {
      setActionLoading(leaveId);
      await studentLeavesService.approveLeave(user.schoolId, leaveId);
      
      // Update local state
      setLeaves((prev) =>
        prev.map((leave) =>
          leave.leaveId === leaveId ? { ...leave, status: 'approved' as const } : leave
        )
      );
      
      toast.success('Leave request approved successfully');
    } catch (error: any) {
      console.error('Error approving leave:', error);
      toast.error('Failed to approve leave');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (leaveId: string) => {
    if (!user?.schoolId) return;

    try {
      setActionLoading(leaveId);
      await studentLeavesService.rejectLeave(user.schoolId, leaveId);
      
      // Update local state
      setLeaves((prev) =>
        prev.map((leave) =>
          leave.leaveId === leaveId ? { ...leave, status: 'rejected' as const } : leave
        )
      );
      
      toast.success('Leave request rejected');
    } catch (error: any) {
      console.error('Error rejecting leave:', error);
      toast.error('Failed to reject leave');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (leave: StudentLeave) => {
    setSelectedLeave(leave);
    setViewDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDuration = (fromDate: string, toDate: string) => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved') return 'success';
    if (statusLower === 'rejected') return 'error';
    if (statusLower === 'pending') return 'warning';
    return 'default';
  };

  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status.toLowerCase() === 'pending').length,
    approved: leaves.filter((l) => l.status.toLowerCase() === 'approved').length,
    rejected: leaves.filter((l) => l.status.toLowerCase() === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton variant="rounded" width={100} height={32} />
          <Skeleton variant="rounded" width={120} height={32} />
          <Skeleton variant="rounded" width={120} height={32} />
          <Skeleton variant="rounded" width={120} height={32} />
        </div>
        <Skeleton variant="rounded" height={42} />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={48} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Chip
          label={`Total: ${stats.total}`}
          variant={isDarkMode ? 'filled' : 'outlined'}
          sx={isDarkMode ? { backgroundColor: '#374151', color: '#E5E7EB' } : undefined}
        />
        <Chip
          label={`Pending: ${stats.pending}`}
          color={isDarkMode ? undefined : 'warning'}
          variant={isDarkMode ? 'filled' : 'outlined'}
          sx={isDarkMode ? { backgroundColor: '#92400E', color: '#FEF3C7' } : undefined}
        />
        <Chip
          label={`Approved: ${stats.approved}`}
          color={isDarkMode ? undefined : 'success'}
          variant={isDarkMode ? 'filled' : 'outlined'}
          sx={isDarkMode ? { backgroundColor: '#065F46', color: '#ECFDF5' } : undefined}
        />
        <Chip
          label={`Rejected: ${stats.rejected}`}
          color={isDarkMode ? undefined : 'error'}
          variant={isDarkMode ? 'filled' : 'outlined'}
          sx={isDarkMode ? { backgroundColor: '#7F1D1D', color: '#FEE2E2' } : undefined}
        />
      </div>

      {/* Table */}
      {leaves.length === 0 ? (
        <div
          className={`p-12 text-center rounded-xl ${
            isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'
          }`}
        >
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            No student leave requests found.
          </p>
        </div>
      ) : (
        <TableContainer
          component={Paper}
          className="dark:bg-gray-800 dark:border dark:border-gray-700"
          sx={{ boxShadow: 'none', borderRadius: '12px' }}
        >
          <Table
            size="small"
            sx={{
              '& td, & th': { borderColor: isDarkMode ? '#374151' : '#E5E7EB' },
            }}
          >
            <TableHead>
              <TableRow sx={{ backgroundColor: isDarkMode ? '#111827' : '#F9FAFB' }}>
                <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#374151', fontWeight: 600 }}>
                  Student Name
                </TableCell>
                <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#374151', fontWeight: 600 }}>
                  Roll No
                </TableCell>
                <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#374151', fontWeight: 600 }}>
                  Leave Type
                </TableCell>
                <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#374151', fontWeight: 600 }}>
                  From Date
                </TableCell>
                <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#374151', fontWeight: 600 }}>
                  To Date
                </TableCell>
                <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#374151', fontWeight: 600 }}>
                  Duration
                </TableCell>
                <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#374151', fontWeight: 600 }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#374151', fontWeight: 600 }}>
                  Attachment
                </TableCell>
                <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : '#374151', fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow
                  key={leave.leaveId}
                  hover
                  sx={{ backgroundColor: isDarkMode ? '#0B1220' : undefined, cursor: 'pointer' }}
                  onClick={() => handleViewDetails(leave)}
                >
                  <TableCell sx={{ color: isDarkMode ? '#E5E7EB' : undefined }}>
                    <div className="flex items-center gap-2">
                      {leave.student?.profilePic && (
                        <img
                          src={leave.student.profilePic}
                          alt={leave.student.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <span>{leave.student?.name || leave.studentId}</span>
                    </div>
                  </TableCell>
                  <TableCell sx={{ color: isDarkMode ? '#D1D5DB' : undefined }}>
                    {leave.student?.rollNo || '-'}
                  </TableCell>
                  <TableCell sx={{ color: isDarkMode ? '#D1D5DB' : undefined }}>
                    {leave.leaveType}
                  </TableCell>
                  <TableCell sx={{ color: isDarkMode ? '#D1D5DB' : undefined }}>
                    {formatDate(leave.fromDate)}
                  </TableCell>
                  <TableCell sx={{ color: isDarkMode ? '#D1D5DB' : undefined }}>
                    {formatDate(leave.toDate)}
                  </TableCell>
                  <TableCell sx={{ color: isDarkMode ? '#D1D5DB' : undefined }}>
                    {calculateDuration(leave.fromDate, leave.toDate)} day(s)
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={leave.status}
                      color={getStatusColor(leave.status)}
                      variant={isDarkMode ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    {leave.fileUrl ? (
                      <Tooltip title="Open attachment">
                        <IconButton
                          size="small"
                          component="a"
                          href={leave.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          sx={{ color: isDarkMode ? '#93C5FD' : undefined }}
                        >
                          <Article fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <span style={{ color: isDarkMode ? '#9CA3AF' : undefined }}>-</span>
                    )}
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    {leave.status.toLowerCase() === 'pending' && (
                      <div className="flex items-center gap-1 justify-end">
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            onClick={() => handleApprove(leave.leaveId)}
                            disabled={actionLoading === leave.leaveId}
                            sx={{ color: isDarkMode ? '#10B981' : '#059669' }}
                          >
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            onClick={() => handleReject(leave.leaveId)}
                            disabled={actionLoading === leave.leaveId}
                            sx={{ color: isDarkMode ? '#EF4444' : '#DC2626' }}
                          >
                            <Cancel fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* View Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: isDarkMode ? { backgroundColor: '#111827', color: '#E5E7EB' } : undefined,
        }}
      >
        <DialogTitle sx={isDarkMode ? { color: '#FFFFFF' } : undefined}>
          Leave Request Details
        </DialogTitle>
        <DialogContent dividers sx={isDarkMode ? { borderColor: '#374151' } : undefined}>
          {selectedLeave && (
            <div className="space-y-4">
              {/* Student Info */}
              <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: isDarkMode ? '#374151' : '#E5E7EB' }}>
                {selectedLeave.student?.profilePic && (
                  <img
                    src={selectedLeave.student.profilePic}
                    alt={selectedLeave.student.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedLeave.student?.name || selectedLeave.studentId}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Roll No: {selectedLeave.student?.rollNo || '-'}
                  </p>
                </div>
              </div>

              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Leave Type
                </p>
                <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {selectedLeave.leaveType}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    From Date
                  </p>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {formatDate(selectedLeave.fromDate)}
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    To Date
                  </p>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {formatDate(selectedLeave.toDate)}
                  </p>
                </div>
              </div>

              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Duration
                </p>
                <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {calculateDuration(selectedLeave.fromDate, selectedLeave.toDate)} day(s)
                </p>
              </div>

              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Reason
                </p>
                <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedLeave.reason}</p>
              </div>

              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Status
                </p>
                <Chip
                  size="small"
                  label={selectedLeave.status}
                  color={getStatusColor(selectedLeave.status)}
                  variant={isDarkMode ? 'filled' : 'outlined'}
                  sx={{ mt: 1 }}
                />
              </div>

              {selectedLeave.fileUrl && (
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Attachment
                  </p>
                  <Button
                    component="a"
                    href={selectedLeave.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<Article />}
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    View Attachment
                  </Button>
                </div>
              )}

              {selectedLeave.status.toLowerCase() === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => {
                      handleApprove(selectedLeave.leaveId);
                      setViewDialogOpen(false);
                    }}
                    disabled={actionLoading === selectedLeave.leaveId}
                    fullWidth
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => {
                      handleReject(selectedLeave.leaveId);
                      setViewDialogOpen(false);
                    }}
                    disabled={actionLoading === selectedLeave.leaveId}
                    fullWidth
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StudentLeavesTab;

