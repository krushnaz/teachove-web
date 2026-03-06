import React, { useState, useEffect, useCallback } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { studentLeavesService, StudentLeave } from '../../../services/studentLeavesService';
import { classroomService, Classroom } from '../../../services/classroomService';
import { 
  Calendar, 
  User, 
  FileText, 
  Search,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const StudentLeaves: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<StudentLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalLeaves, setTotalLeaves] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  // Classes for filter dropdown
  const [classes, setClasses] = useState<Classroom[]>([]);

  // Modal
  const [selectedLeave, setSelectedLeave] = useState<StudentLeave | null>(null);
  const [showModal, setShowModal] = useState(false);

  const schoolId = user?.schoolId || '';

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, classFilter, searchDebounced]);

  // Load classes for filter dropdown
  useEffect(() => {
    if (!schoolId) return;
    const loadClasses = async () => {
      try {
        const classList = await classroomService.getClassesBySchoolId(schoolId);
        setClasses(classList);
      } catch (err) {
        console.error('Error loading classes:', err);
      }
    };
    loadClasses();
  }, [schoolId]);

  // Fetch leaves
  const fetchLeaves = useCallback(async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      if (statusFilter !== 'all') {
        // Backend expects capitalized status
        params.status = statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
      }
      if (classFilter !== 'all') {
        params.classId = classFilter;
      }
      if (searchDebounced.trim()) {
        params.search = searchDebounced.trim();
      }

      const response = await studentLeavesService.getAllLeavesBySchool(schoolId, params);
      setLeaves(response.leaves || []);
      setTotalPages(response.totalPages || 0);
      setTotalLeaves(response.total || 0);
    } catch (err: any) {
      console.error('Error loading student leaves:', err);
      setError('Failed to load student leaves. Please try again.');
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, [schoolId, currentPage, statusFilter, classFilter, searchDebounced]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Approve / Reject
  const handleApprove = async (leaveId: string) => {
    try {
      await studentLeavesService.approveLeave(schoolId, leaveId);
      setLeaves(prev => prev.map(l => l.leaveId === leaveId ? { ...l, status: 'approved' as const } : l));
      showToast('Leave request approved successfully!', 'success');
    } catch {
      showToast('Failed to approve leave. Please try again.', 'error');
    }
  };

  const handleReject = async (leaveId: string) => {
    try {
      await studentLeavesService.rejectLeave(schoolId, leaveId);
      setLeaves(prev => prev.map(l => l.leaveId === leaveId ? { ...l, status: 'rejected' as const } : l));
      showToast('Leave request rejected.', 'error');
    } catch {
      showToast('Failed to reject leave. Please try again.', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg ${
      type === 'success'
        ? isDarkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-50 text-green-700 border-green-200'
        : isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'
    } border z-50`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'pending':
        return isDarkMode ? 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30' : 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'approved':
        return isDarkMode ? 'text-green-400 bg-green-900/20 border-green-700/30' : 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return isDarkMode ? 'text-red-400 bg-red-900/20 border-red-700/30' : 'text-red-600 bg-red-50 border-red-200';
      default:
        return isDarkMode ? 'text-gray-400 bg-gray-700/20 border-gray-600/30' : 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date | string | any) => {
    if (!date) return 'N/A';
    // Handle Firestore Timestamp objects
    if (date._seconds) {
      return new Date(date._seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    }
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'N/A';
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getDayCount = (from: string | any, to: string | any) => {
    try {
      const fromTs = from?._seconds ? from._seconds * 1000 : new Date(from).getTime();
      const toTs = to?._seconds ? to._seconds * 1000 : new Date(to).getTime();
      if (isNaN(fromTs) || isNaN(toTs)) return '?';
      return Math.max(1, Math.ceil((toTs - fromTs) / (1000 * 60 * 60 * 24)) + 1);
    } catch {
      return '?';
    }
  };

  // Loading skeleton
  if (loading && leaves.length === 0) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} shimmer`}></div>
                  <div className="flex-1">
                    <div className={`h-5 w-48 rounded mb-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} shimmer`}></div>
                    <div className={`h-4 w-32 rounded mb-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} shimmer`}></div>
                    <div className={`h-4 w-64 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} shimmer`}></div>
                  </div>
                </div>
                <div className={`h-8 w-24 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} shimmer`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className={`p-12 text-center rounded-xl ${isDarkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
          <XCircle className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-red-300' : 'text-red-900'}`}>
            Error Loading Student Leaves
          </h3>
          <p className={`${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-4`}>{error}</p>
          <button
            onClick={() => fetchLeaves()}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
              Student Leave Records
            </h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {totalLeaves} total leave record{totalLeaves !== 1 ? 's' : ''} found
            </p>
          </div>

          <button
            onClick={() => fetchLeaves()}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              isDarkMode
                ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 border border-blue-700/30'
                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search by student name or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>

          {/* Class Filter */}
          <div className="relative">
            <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className={`pl-10 pr-8 py-2 rounded-lg border appearance-none ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.classId} value={cls.classId}>
                  {cls.className}{cls.section ? ` - ${cls.section}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Loading overlay for subsequent loads */}
      {loading && leaves.length > 0 && (
        <div className="flex items-center justify-center py-4 mb-4">
          <RefreshCw className={`w-5 h-5 animate-spin ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mr-2`} />
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Updating...</span>
        </div>
      )}

      {/* Leaves List */}
      <div className="space-y-4">
        {leaves.length === 0 ? (
          <div className={`p-12 text-center rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
            <GraduationCap className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              No student leave records found
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {statusFilter !== 'all' || classFilter !== 'all' || searchDebounced
                ? 'No records match your filters. Try adjusting your search criteria.'
                : 'No student leave records available for this school.'}
            </p>
          </div>
        ) : (
          leaves.map((leave) => (
            <div
              key={leave.leaveId}
              className={`p-6 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                isDarkMode ? 'bg-gray-700/50 border border-gray-600 hover:border-gray-500' : 'bg-white border border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                    {((leave as any).studentName || 'S').charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {(leave as any).studentName || 'Unknown Student'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getStatusColor(leave.status)}`}>
                        {getStatusIcon(leave.status)}
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6 mb-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <GraduationCap className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {(leave as any).className || 'Unknown Class'}
                          {(leave as any).classSection ? ` - ${(leave as any).classSection}` : ''}
                        </span>
                      </div>
                      {(leave as any).studentRollNo && (
                        <div className="flex items-center gap-2">
                          <User className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Roll No: {(leave as any).studentRollNo}
                          </span>
                        </div>
                      )}
                      {leave.leaveType && (
                        <div className="flex items-center gap-2">
                          <FileText className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {leave.leaveType}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 mb-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {getDayCount(leave.fromDate, leave.toDate)} day{getDayCount(leave.fromDate, leave.toDate) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                      {leave.reason}
                    </p>
                    
                    <div className="flex items-center gap-4 flex-wrap">
                      {leave.fileUrl && (
                        <button
                          onClick={() => window.open(leave.fileUrl, '_blank')}
                          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                            isDarkMode 
                              ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                              : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                          View Document
                        </button>
                      )}
                      {leave.createdAt && (
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          Applied on {formatDate(leave.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => {
                      setSelectedLeave(leave);
                      setShowModal(true);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isDarkMode 
                        ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 border border-blue-700/30' 
                        : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    View
                  </button>
                  {leave.status.toLowerCase() === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(leave.leaveId)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(leave.leaveId)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalLeaves)} of {totalLeaves} records
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                currentPage === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-700'
              } border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                currentPage === totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-700'
              } border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Leave Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Student Name
                    </label>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {(selectedLeave as any).studentName || 'Unknown Student'}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Class
                    </label>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {(selectedLeave as any).className || 'Unknown Class'}
                      {(selectedLeave as any).classSection ? ` - ${(selectedLeave as any).classSection}` : ''}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Leave Type
                    </label>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedLeave.leaveType || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 w-fit ${getStatusColor(selectedLeave.status)}`}>
                      {getStatusIcon(selectedLeave.status)}
                      {selectedLeave.status.charAt(0).toUpperCase() + selectedLeave.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      From Date
                    </label>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(selectedLeave.fromDate)}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      To Date
                    </label>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(selectedLeave.toDate)}</p>
                  </div>
                  {(selectedLeave as any).studentRollNo && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Roll No
                      </label>
                      <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{(selectedLeave as any).studentRollNo}</p>
                    </div>
                  )}
                  {(selectedLeave as any).studentPhone && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Phone
                      </label>
                      <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{(selectedLeave as any).studentPhone}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Reason
                  </label>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedLeave.reason}</p>
                </div>

                {selectedLeave.fileUrl && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Attached Document
                    </label>
                    <button
                      onClick={() => window.open(selectedLeave.fileUrl, '_blank')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isDarkMode 
                          ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                          : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      View Document
                    </button>
                  </div>
                )}

                {/* Modal action buttons for pending leaves */}
                {selectedLeave.status.toLowerCase() === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        handleApprove(selectedLeave.leaveId);
                        setShowModal(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedLeave.leaveId);
                        setShowModal(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLeaves;
