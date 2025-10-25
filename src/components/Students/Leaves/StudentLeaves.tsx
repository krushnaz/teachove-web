import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { studentLeavesService, StudentLeave, CreateLeaveRequest } from '../../../services/studentLeavesService';
import { CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { toast } from 'react-toastify';

const StudentLeaves: React.FC = () => {
  const { user, schoolDetails } = useAuth();
  const { isDarkMode } = useDarkMode();
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

  useEffect(() => {
    fetchLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.studentId]);

  const fetchLeaves = async () => {
    if (!user?.studentId || !user?.schoolId || !schoolDetails?.currentAcademicYear) {
      setError('Missing required information');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await studentLeavesService.getLeavesByStudent(
        schoolDetails.currentAcademicYear,
        user.schoolId,
        user.studentId
      );
      setLeaves(data);
    } catch (error: any) {
      console.error('Error fetching leaves:', error);
      setError(error.message || 'Failed to load leaves');
      toast.error(error.message || 'Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

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

    // Validation
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
        await studentLeavesService.createLeave(
          user.schoolId,
          leaveData,
          selectedFile || undefined
        );
        toast.success('Leave request submitted successfully');
      }

      handleCloseDialog();
      fetchLeaves();
    } catch (error: any) {
      console.error('Error submitting leave:', error);
      toast.error(error.message || 'Failed to submit leave request');
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
    } catch (error: any) {
      console.error('Error deleting leave:', error);
      toast.error(error.message || 'Failed to delete leave request');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = (fromDate: string, toDate: string) => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        bg: isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100',
        text: isDarkMode ? 'text-yellow-300' : 'text-yellow-700',
        label: 'Pending'
      },
      approved: {
        bg: isDarkMode ? 'bg-green-900/30' : 'bg-green-100',
        text: isDarkMode ? 'text-green-300' : 'text-green-700',
        label: 'Approved'
      },
      rejected: {
        bg: isDarkMode ? 'bg-red-900/30' : 'bg-red-100',
        text: isDarkMode ? 'text-red-300' : 'text-red-700',
        label: 'Rejected'
      }
    };

    const statusLower = status.toLowerCase();
    const config = statusConfig[statusLower as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getLeaveTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sick':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'casual':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'emergency':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CircularProgress size={48} />
          <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading leave requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Error Loading Leaves</h3>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{error}</p>
          <button 
            onClick={fetchLeaves} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Leave Requests</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Manage your leave applications</p>
        </div>
        
        <button
          onClick={() => handleOpenDialog()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Apply Leave</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Requests</p>
          <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{leaves.length}</p>
        </div>
        <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Pending</p>
          <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
            {leaves.filter(l => l.status.toLowerCase() === 'pending').length}
          </p>
        </div>
        <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Approved</p>
          <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>
            {leaves.filter(l => l.status.toLowerCase() === 'approved').length}
          </p>
        </div>
        <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>Rejected</p>
          <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>
            {leaves.filter(l => l.status.toLowerCase() === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Leave List */}
      {leaves.length === 0 ? (
        <div className={`rounded-xl p-12 border text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <svg className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Leave Requests</h3>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>You haven't applied for any leaves yet.</p>
          <button
            onClick={() => handleOpenDialog()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Apply for Leave
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {leaves.map((leave) => (
            <div 
              key={leave.leaveId}
              className={`rounded-xl p-6 border transition-all hover:shadow-lg ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Left Section */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                    isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {getLeaveTypeIcon(leave.leaveType)}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {leave.leaveType} Leave
                      </h3>
                      {getStatusBadge(leave.status)}
                    </div>
                    
                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {leave.reason}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>From Date</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatDate(leave.fromDate)}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>To Date</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatDate(leave.toDate)}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Duration</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {calculateDuration(leave.fromDate, leave.toDate)} day(s)
                        </p>
                      </div>
                    </div>

                    {leave.fileUrl && (
                      <div className="mt-3">
                        <a
                          href={leave.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 text-sm ${
                            isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          View Attachment
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Section - Actions */}
                {leave.status.toLowerCase() === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenDialog(leave)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setLeaveToDelete(leave);
                        setDeleteDialogOpen(true);
                      }}
                      className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leave Application Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
          }
        }}
      >
        <DialogTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
          {isEditMode ? 'Edit Leave Request' : 'Apply for Leave'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Leave Type *
                </label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
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
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    From Date *
                  </label>
                  <input
                    type="date"
                    value={formData.fromDate}
                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    To Date *
                  </label>
                  <input
                    type="date"
                    value={formData.toDate}
                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Reason *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={4}
                  placeholder="Enter reason for leave..."
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Attachment (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  accept="image/*,.pdf,.doc,.docx"
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Supported formats: Images, PDF, Word documents
                </p>
              </div>
            </div>
          </DialogContent>
          <DialogActions className="px-6 pb-4">
            <button
              type="button"
              onClick={handleCloseDialog}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <CircularProgress size={16} className="text-white" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>{isEditMode ? 'Update' : 'Submit'}</span>
              )}
            </button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
          }
        }}
      >
        <DialogTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
            Are you sure you want to delete this leave request? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <button
            onClick={() => setDeleteDialogOpen(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
            Delete
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StudentLeaves;

