import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { StudentLeave } from '../../../services/leaveManagementService';
import { 
  Calendar, 
  User, 
  FileText, 
  Eye,
  Search,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

const StudentLeaves: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const [leaves, setLeaves] = useState<StudentLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeave, setSelectedLeave] = useState<StudentLeave | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    const loadLeaves = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLeaves([
          {
            leaveId: '1',
            schoolId: 'school1',
            studentId: 'student1',
            studentName: 'Alice Johnson',
            teacherId: 'teacher1',
            teacherName: 'John Smith',
            classId: 'class1',
            className: 'Grade 10A',
            startDate: new Date('2024-01-15'),
            endDate: new Date('2024-01-16'),
            reason: 'Medical appointment - dental checkup',
            status: 'approved',
            fileUrl: '/uploads/medical-certificate.pdf',
            createdAt: new Date('2024-01-12')
          },
          {
            leaveId: '2',
            schoolId: 'school1',
            studentId: 'student2',
            studentName: 'Bob Wilson',
            teacherId: 'teacher2',
            teacherName: 'Sarah Johnson',
            classId: 'class2',
            className: 'Grade 9B',
            startDate: new Date('2024-01-18'),
            endDate: new Date('2024-01-20'),
            reason: 'Family function - sister wedding',
            status: 'pending',
            fileUrl: '/uploads/wedding-invitation.pdf',
            createdAt: new Date('2024-01-15')
          },
          {
            leaveId: '3',
            schoolId: 'school1',
            studentId: 'student3',
            studentName: 'Carol Davis',
            teacherId: 'teacher3',
            teacherName: 'Mike Wilson',
            classId: 'class1',
            className: 'Grade 10A',
            startDate: new Date('2024-01-22'),
            endDate: new Date('2024-01-24'),
            reason: 'Sports competition - state level',
            status: 'approved',
            fileUrl: '/uploads/sports-certificate.pdf',
            createdAt: new Date('2024-01-18')
          },
          {
            leaveId: '4',
            schoolId: 'school1',
            studentId: 'student4',
            studentName: 'David Brown',
            teacherId: 'teacher1',
            teacherName: 'John Smith',
            classId: 'class3',
            className: 'Grade 11C',
            startDate: new Date('2024-01-25'),
            endDate: new Date('2024-01-25'),
            reason: 'Personal work - passport renewal',
            status: 'rejected',
            fileUrl: '/uploads/passport-appointment.pdf',
            createdAt: new Date('2024-01-20')
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    loadLeaves();
  }, []);

  const filteredLeaves = leaves.filter(leave => {
    const matchesFilter = filter === 'all' || leave.status === filter;
    const matchesSearch = (leave.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (leave.teacherName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (leave.className || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
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
                <div className={`h-8 w-24 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} shimmer`}></div>
              </div>
            </div>
          ))}
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
            Student Leave Records
          </h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            View student leave applications and their status
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search students, teachers, or classes..."
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
            <GraduationCap className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              No student leave records found
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {filter === 'all' ? 'No student leave records available.' : `No ${filter} student leave records found.`}
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
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg`}>
                    {(leave.studentName || 'S').charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {leave.studentName || 'Unknown Student'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getStatusColor(leave.status)}`}>
                        {getStatusIcon(leave.status)}
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6 mb-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {leave.className || 'Unknown Class'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Teacher: {leave.teacherName || 'Unknown Teacher'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {Math.ceil((leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                        </span>
                      </div>
                    </div>
                    
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                      {leave.reason}
                    </p>
                    
                    <div className="flex items-center gap-4">
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

                {/* View Button */}
                <button
                  onClick={() => {
                    setSelectedLeave(leave);
                    setShowModal(true);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                    isDarkMode 
                      ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 border border-blue-700/30' 
                      : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedLeave.studentName || 'Unknown Student'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Class
                    </label>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedLeave.className || 'Unknown Class'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Teacher
                    </label>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedLeave.teacherName || 'Unknown Teacher'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 w-fit ${getStatusColor(selectedLeave.status)}`}>
                      {getStatusIcon(selectedLeave.status)}
                      {selectedLeave.status.charAt(0).toUpperCase() + selectedLeave.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Start Date
                    </label>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(selectedLeave.startDate)}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      End Date
                    </label>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(selectedLeave.endDate)}</p>
                  </div>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLeaves;
