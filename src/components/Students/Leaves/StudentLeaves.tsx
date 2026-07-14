import React, { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, Plus, XCircle, FileText, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import { studentLeavesService, StudentLeave, CreateLeaveRequest } from '../../../services/studentLeavesService';
import { toast } from 'react-toastify';
import {
  TeacherPageShell,
  TeacherPageHeader,
  TeacherHeaderActions,
  TeacherStatsGrid,
  TeacherStatCard,
  TeacherCardGrid,
  TeacherItemCard,
  TeacherButton,
  TeacherLoading,
  TeacherError,
  TeacherPanel,
  TeacherEmpty,
} from '../shared';

const StudentLeaves: React.FC = () => {
  const { user, schoolDetails } = useAuth();
  const [leaves, setLeaves] = useState<StudentLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<StudentLeave | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<StudentLeave | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateLeaveRequest>({
    studentId: user?.studentId || '',
    classId: user?.classId || '',
    yearId: schoolDetails?.currentAcademicYear || '',
    reason: '',
    fromDate: '',
    toDate: '',
    leaveType: 'Casual',
    status: 'pending',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchLeaves = async () => {
    if (!user?.studentId || !user?.schoolId) {
      setError('Missing required information');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await studentLeavesService.getLeavesByStudent(user.schoolId, user.studentId);
      setLeaves(data);
    } catch (fetchError: any) {
      console.error('Error fetching leaves:', fetchError);
      setError(fetchError.message || 'Failed to load leaves');
      toast.error(fetchError.message || 'Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.studentId]);

  const handleOpenDialog = (leave?: StudentLeave) => {
    if (leave) {
      setIsEditMode(true);
      setSelectedLeave(leave);
      setFormData({
        studentId: leave.studentId,
        classId: leave.classId,
        yearId: leave.yearId,
        reason: leave.reason,
        fromDate: leave.fromDate.split('T')[0],
        toDate: leave.toDate.split('T')[0],
        leaveType: leave.leaveType,
        status: leave.status,
      });
    } else {
      setIsEditMode(false);
      setSelectedLeave(null);
      setFormData({
        studentId: user?.studentId || '',
        classId: user?.classId || '',
        yearId: schoolDetails?.currentAcademicYear || '',
        reason: '',
        fromDate: '',
        toDate: '',
        leaveType: 'Casual',
        status: 'pending',
      });
    }
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setSelectedLeave(null);
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.schoolId) {
      toast.error('School ID not found');
      return;
    }
    if (!formData.reason || !formData.fromDate || !formData.toDate) {
      toast.error('Please fill all required fields');
      return;
    }
    if (new Date(formData.toDate) < new Date(formData.fromDate)) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      setSubmitting(true);
      const leaveData = {
        ...formData,
        fromDate: new Date(formData.fromDate).toISOString(),
        toDate: new Date(formData.toDate).toISOString(),
      };

      if (isEditMode && selectedLeave) {
        await studentLeavesService.updateLeave(
          user.schoolId,
          selectedLeave.leaveId,
          leaveData,
          selectedFile || undefined
        );
        toast.success('Leave request updated successfully');
      } else {
        await studentLeavesService.createLeave(user.schoolId, leaveData, selectedFile || undefined);
        toast.success('Leave request submitted successfully');
      }

      handleCloseDialog();
      fetchLeaves();
    } catch (submitError: any) {
      console.error('Error submitting leave:', submitError);
      toast.error(submitError.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!leaveToDelete || !user?.schoolId) return;
    try {
      await studentLeavesService.deleteLeave(user.schoolId, leaveToDelete.leaveId);
      toast.success('Leave request deleted successfully');
      setDeleteDialogOpen(false);
      setLeaveToDelete(null);
      fetchLeaves();
    } catch (deleteError: any) {
      console.error('Error deleting leave:', deleteError);
      toast.error(deleteError.message || 'Failed to delete leave request');
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const calculateDuration = (fromDate: string, toDate: string) => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const statusBadgeClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved') {
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    }
    if (statusLower === 'rejected') {
      return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
    }
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  };

  if (loading) return <TeacherLoading message="Loading leave requests..." />;
  if (error) return <TeacherError title="Error Loading Leaves" message={error} onRetry={fetchLeaves} />;

  return (
    <TeacherPageShell>
      <TeacherPageHeader
        title="Leave Requests"
        description="Manage your leave applications."
        action={
          <TeacherHeaderActions>
            <TeacherButton compact icon={Plus} onClick={() => handleOpenDialog()}>
              Apply Leave
            </TeacherButton>
          </TeacherHeaderActions>
        }
      />

      <TeacherStatsGrid cols={4}>
        <TeacherStatCard title="Total Requests" value={leaves.length} icon={CalendarDays} color="indigo" />
        <TeacherStatCard
          title="Pending"
          value={leaves.filter((l) => l.status.toLowerCase() === 'pending').length}
          icon={Clock3}
          color="amber"
        />
        <TeacherStatCard
          title="Approved"
          value={leaves.filter((l) => l.status.toLowerCase() === 'approved').length}
          icon={CheckCircle2}
          color="emerald"
        />
        <TeacherStatCard
          title="Rejected"
          value={leaves.filter((l) => l.status.toLowerCase() === 'rejected').length}
          icon={XCircle}
          color="rose"
        />
      </TeacherStatsGrid>

      {leaves.length === 0 ? (
        <TeacherPanel>
          <TeacherEmpty
            icon={CalendarDays}
            title="No Leave Requests"
            description="You haven't applied for any leaves yet."
          />
        </TeacherPanel>
      ) : (
        <TeacherCardGrid cols={1}>
          {leaves.map((leave) => (
            <TeacherItemCard key={leave.leaveId}>
              <div className="p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        {leave.leaveType} Leave
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadgeClass(leave.status)}`}>
                        {leave.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{leave.reason}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">From Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(leave.fromDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">To Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(leave.toDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Duration</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {calculateDuration(leave.fromDate, leave.toDate)} day(s)
                        </p>
                      </div>
                    </div>
                    {leave.fileUrl && (
                      <a
                        href={leave.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex mt-3 items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400"
                      >
                        <FileText size={14} />
                        View Attachment
                      </a>
                    )}
                  </div>

                  {leave.status.toLowerCase() === 'pending' && (
                    <div className="flex items-center gap-2">
                      <TeacherButton compact variant="secondary" icon={Pencil} onClick={() => handleOpenDialog(leave)}>
                        Edit
                      </TeacherButton>
                      <TeacherButton
                        compact
                        variant="danger"
                        icon={Trash2}
                        onClick={() => {
                          setLeaveToDelete(leave);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        Delete
                      </TeacherButton>
                    </div>
                  )}
                </div>
              </div>
            </TeacherItemCard>
          ))}
        </TeacherCardGrid>
      )}

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Leave Request' : 'Apply for Leave'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Leave Type *</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  required
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Emergency">Emergency Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">From Date *</label>
                  <input
                    type="date"
                    value={formData.fromDate}
                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">To Date *</label>
                  <input
                    type="date"
                    value={formData.toDate}
                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Reason *</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Attachment (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  accept="image/*,.pdf,.doc,.docx"
                />
              </div>
            </div>
          </DialogContent>
          <DialogActions className="px-6 pb-4">
            <TeacherButton variant="secondary" type="button" onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </TeacherButton>
            <TeacherButton type="submit" loading={submitting}>
              {isEditMode ? 'Update' : 'Submit'}
            </TeacherButton>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this leave request? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <TeacherButton variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </TeacherButton>
          <TeacherButton variant="danger" onClick={handleDelete}>
            Delete
          </TeacherButton>
        </DialogActions>
      </Dialog>
    </TeacherPageShell>
  );
};

export default StudentLeaves;

