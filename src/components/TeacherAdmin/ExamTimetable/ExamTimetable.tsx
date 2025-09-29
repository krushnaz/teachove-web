import React, { useState, useEffect } from 'react';
import { examTimetableService } from '../../../services/examTimetableService';
import { useAuth } from '../../../contexts/AuthContext';
import { ExamTimetable as ExamTimetableType } from '../../../models/examTimetable';
import { toast } from 'react-toastify';

const ExamTimetable: React.FC = () => {
  const { user } = useAuth();
  const [timetables, setTimetables] = useState<ExamTimetableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('');

  // Fetch exam timetables for teacher's class
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading exam timetables...</p>
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Timetables</h3>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
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
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Exams</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{timetables.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Subjects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {timetables.reduce((total, timetable) => total + timetable.subjects.length, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">My Class</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{user?.className || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
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
                  placeholder="Search exams or classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="sm:w-64">
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
        {filteredTimetables.map((timetable) => (
          <div key={timetable.timetableId} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Timetable Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{timetable.examName}</h3>
                  <p className="text-blue-100 mt-1">
                    {timetable.className} • {formatDate(timetable.examStartDate)} - {formatDate(timetable.examEndDate)}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {timetable.subjects.length} Subject{timetable.subjects.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Subjects Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      End Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {timetable.subjects.map((subject, index) => {
                    // Calculate duration
                    const startTime = subject.startTime;
                    const endTime = subject.endTime;
                    const duration = `${startTime} - ${endTime}`;
                    
                    return (
                      <tr key={`${subject.subjectId}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-blue-600 dark:text-blue-300 font-semibold text-sm">
                                {subject.subjectName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {subject.subjectName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(subject.examDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatTime(subject.startTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatTime(subject.endTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {duration}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTimetables.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No exam timetables found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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

export default ExamTimetable;
