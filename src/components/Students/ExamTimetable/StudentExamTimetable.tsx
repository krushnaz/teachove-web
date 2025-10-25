import React, { useState, useEffect } from 'react';
import { examTimetableService } from '../../../services/examTimetableService';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { ExamTimetable as ExamTimetableType } from '../../../models/examTimetable';
import { toast } from 'react-toastify';

const StudentExamTimetable: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [timetables, setTimetables] = useState<ExamTimetableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('');

  // Fetch exam timetables for student's class
  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (user?.schoolId && user?.classId) {
          const data = await examTimetableService.getExamTimetablesByClass(user.schoolId, user.classId);
          setTimetables(data);
        } else {
          setError('School ID or Class ID not found');
        }
      } catch (error) {
        console.error('Error fetching exam timetables:', error);
        setError('Failed to load exam timetables');
        toast.error('Failed to load exam timetables');
      } finally {
        setLoading(false);
      }
    };

    if (user?.schoolId && user?.classId) {
      fetchTimetables();
    }
  }, [user?.schoolId, user?.classId]);

  // Filter timetables based on search term and selected exam
  const filteredTimetables = timetables.filter(timetable => {
    const matchesSearch = timetable.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         timetable.className.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = selectedExam === '' || timetable.examName === selectedExam;
    return matchesSearch && matchesExam;
  });

  // Get unique exam names for filter
  const examNames = Array.from(new Set(timetables.map(t => t.examName)));

  // Format date for display
  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Calculate days until exam
  const getDaysUntilExam = (examDate: string) => {
    const [day, month, year] = examDate.split('-');
    const exam = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get exam status
  const getExamStatus = (examStartDate: string) => {
    const daysUntil = getDaysUntilExam(examStartDate);
    
    if (daysUntil < 0) return { text: 'Completed', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    if (daysUntil === 0) return { text: 'Today', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
    if (daysUntil <= 7) return { text: `${daysUntil} days left`, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' };
    if (daysUntil <= 14) return { text: `${daysUntil} days left`, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    return { text: `${daysUntil} days left`, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading exam timetables...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Error Loading Timetables</h3>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
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
      <div>
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Exam Timetable</h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>View your upcoming exam schedule</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Exams</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{timetables.length}</p>
            </div>
          </div>
        </div>
        
        <div className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Subjects</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {timetables.reduce((total, timetable) => total + timetable.subjects.length, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Upcoming</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {timetables.filter(t => getDaysUntilExam(t.examStartDate) >= 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
            
            <div className="sm:w-64">
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md leading-5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="">All Exams</option>
                {examNames.map((examName) => (
                  <option key={examName} value={examName}>
                    {examName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Timetables */}
      <div className="space-y-6">
        {filteredTimetables.map((timetable) => {
          const status = getExamStatus(timetable.examStartDate);
          return (
            <div key={timetable.timetableId} className={`rounded-lg shadow-sm border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              {/* Timetable Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{timetable.examName}</h3>
                    <p className="text-blue-100 mt-1">
                      {timetable.className} • {formatDate(timetable.examStartDate)} - {formatDate(timetable.examEndDate)}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                      {status.text}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-blue-600">
                      {timetable.subjects.length} Subject{timetable.subjects.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subjects Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Subject
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Date
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Start Time
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        End Time
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                    {timetable.subjects.map((subject, index) => {
                      // Calculate duration
                      const startTime = subject.startTime;
                      const endTime = subject.endTime;
                      const duration = `${startTime} - ${endTime}`;
                      const subjectStatus = getExamStatus(subject.examDate);
                      
                      return (
                        <tr key={`${subject.subjectId}-${index}`} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                                isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
                              }`}>
                                <span className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                                  {subject.subjectName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {subject.subjectName}
                                </div>
                                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {subjectStatus.text}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatDate(subject.examDate)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatTime(subject.startTime)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatTime(subject.endTime)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            {duration}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Quick Info Footer */}
              <div className={`px-6 py-4 border-t ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      Exam Period: {formatDate(timetable.examStartDate)} to {formatDate(timetable.examEndDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {timetable.subjects.length} subjects scheduled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTimetables.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No exam timetables found</h3>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {timetables.length === 0 
              ? "No exam timetables have been created for your class yet."
              : "Try adjusting your search criteria."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentExamTimetable;

