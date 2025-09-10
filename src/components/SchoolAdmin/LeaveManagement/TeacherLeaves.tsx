import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { teacherLeaveService, TeacherLeave } from '../../../services/teacherLeaveService';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  User, 
  FileText, 
  Search
} from 'lucide-react';

const TeacherLeaves: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<TeacherLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Get school ID from user context or use a default
  const schoolId = user?.schoolId || 'nvGVyZZCGqcIZU8rqJg9'; // Using the same school ID from profile

  // Load teacher leaves
  useEffect(() => {
    const loadLeaves = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await teacherLeaveService.getAllTeacherLeaves(schoolId);
        setLeaves(response.leaves || []);
      } catch (error: any) {
        console.error('Error loading teacher leaves:', error);
        setError('Failed to load teacher leaves. Please try again.');
        // Set empty array on error to show empty state
        setLeaves([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeaves();
  }, [schoolId]);

  const handleApprove = async (leaveId: string) => {
    try {
      await teacherLeaveService.approveLeave(schoolId, leaveId);
      
      // Update local state
      setLeaves(prev => prev.map(leave => 
        leave.leaveId === leaveId ? { ...leave, status: 'approved' as const } : leave
      ));
      
      // Show success toast
      const toast = document.createElement('div');
      toast.className = `fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg ${isDarkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-50 text-green-700 border-green-200'} border z-50`;
      toast.textContent = 'Leave request approved successfully!';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    } catch (error: any) {
      console.error('Error approving leave:', error);
      const toast = document.createElement('div');
      toast.className = `fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg ${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} border z-50`;
      toast.textContent = 'Failed to approve leave. Please try again.';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    }
  };

  const handleReject = async (leaveId: string) => {
    try {
      await teacherLeaveService.rejectLeave(schoolId, leaveId);
      
      // Update local state
      setLeaves(prev => prev.map(leave => 
        leave.leaveId === leaveId ? { ...leave, status: 'rejected' as const } : leave
      ));
      
      // Show success toast
      const toast = document.createElement('div');
      toast.className = `fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg ${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} border z-50`;
      toast.textContent = 'Leave request rejected.';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    } catch (error: any) {
      console.error('Error rejecting leave:', error);
      const toast = document.createElement('div');
      toast.className = `fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg ${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} border z-50`;
      toast.textContent = 'Failed to reject leave. Please try again.';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    const matchesFilter = filter === 'all' || leave.status === filter;
    const matchesSearch = (leave.teacherName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leave.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
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
    switch (status) {
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

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
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
                <div className="flex gap-2">
                  <div className={`h-8 w-20 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} shimmer`}></div>
                  <div className={`h-8 w-20 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} shimmer`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className={`p-12 text-center rounded-xl ${isDarkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
          <XCircle className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-red-300' : 'text-red-900'}`}>
            Error Loading Leaves
          </h3>
          <p className={`${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-4`}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Teacher Leave Requests
          </h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Review and manage teacher leave applications
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search teachers or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
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

      {/* Leaves List */}
      <div className="space-y-4">
        {filteredLeaves.length === 0 ? (
          <div className={`p-12 text-center rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
            <Calendar className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              No leave requests found
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {filter === 'all' ? 'No leave requests available.' : `No ${filter} leave requests found.`}
            </p>
          </div>
        ) : (
          filteredLeaves.map((leave) => (
            <div
              key={leave.leaveId}
              className={`p-6 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                isDarkMode ? 'bg-gray-700/50 border border-gray-600 hover:border-gray-500' : 'bg-white border border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg`}>
                    {(leave.teacherName || 'T').charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {leave.teacherName || 'Unknown Teacher'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getStatusColor(leave.status)}`}>
                        {getStatusIcon(leave.status)}
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                        </span>
                      </div>
                    </div>
                    
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                      {leave.reason}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      {leave.filePath && (
                        <button
                          onClick={() => window.open(leave.filePath, '_blank')}
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
                {leave.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(leave.leaveId!)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(leave.leaveId!)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherLeaves;
