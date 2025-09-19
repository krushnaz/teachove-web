import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useTeacherProfile } from '../../../contexts/TeacherProfileContext';
import { classroomService } from '../../../services/classroomService';

// Shimmer Loading Component
const ShimmerCard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-300 dark:bg-gray-700 rounded-2xl h-full"></div>
  </div>
);

// Shimmer for welcome section
const ShimmerWelcome: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => (
  <div className={`rounded-2xl p-8 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50'} border ${isDarkMode ? 'border-gray-600' : 'border-blue-100'}`}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded-lg w-80 mb-4"></div>
          <div className="space-y-2 mb-4">
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-64"></div>
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-56"></div>
          </div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-72"></div>
        </div>
      </div>
      <div className="hidden md:block ml-6">
        <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Shimmer for stats cards
const ShimmerStats: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, index) => (
      <ShimmerCard key={index} className="h-32" />
    ))}
  </div>
);

// Shimmer for quick actions
const ShimmerQuickActions: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {[...Array(6)].map((_, index) => (
      <ShimmerCard key={index} className="h-40" />
    ))}
  </div>
);

// Shimmer for recent activities
const ShimmerRecentActivities: React.FC = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="flex items-start space-x-3 p-3">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 animate-pulse"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

// Shimmer for today's schedule
const ShimmerSchedule: React.FC = () => (
  <div className="space-y-4">
    {[...Array(4)].map((_, index) => (
      <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gray-300 dark:bg-gray-600 rounded-xl animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

const TeacherAdminDashboard: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { teacherProfile, isLoading, error } = useTeacherProfile();
  const [classDetails, setClassDetails] = useState<{ className: string; section: string } | null>(null);
  const [classLoading, setClassLoading] = useState(false);

  // Fetch class details when component mounts
  useEffect(() => {
    const fetchClassDetails = async () => {
      if (user?.classId && user?.schoolId) {
        setClassLoading(true);
        try {
          const classData = await classroomService.getClassById(user.schoolId, user.classId);
          setClassDetails({
            className: classData.className,
            section: classData.section
          });
        } catch (error) {
          console.error('Error fetching class details:', error);
          // Fallback to teacher profile data if available
          if (teacherProfile?.classes && teacherProfile.classes.length > 0) {
            const firstClass = teacherProfile.classes[0];
            setClassDetails({
              className: firstClass.className,
              section: firstClass.section
            });
          }
        } finally {
          setClassLoading(false);
        }
      }
    };

    fetchClassDetails();
  }, [user?.classId, user?.schoolId, teacherProfile?.classes]);

  // Add debugging
  useEffect(() => {
    console.log('=== DASHBOARD DEBUG INFO ===');
    console.log('User data:', user);
    console.log('Teacher profile data:', teacherProfile);
    console.log('Class details:', classDetails);
    console.log('Is loading:', isLoading);
    console.log('Error:', error);
    console.log('=== END DEBUG INFO ===');
  }, [user, teacherProfile, classDetails, isLoading, error]);

  // Get teacher and school information
  const teacherName = teacherProfile?.teacher?.teacherName || user?.email?.split('@')[0] || 'Teacher';
  const teacherEmail = teacherProfile?.teacher?.email || user?.email || '';
  const schoolName = teacherProfile?.school?.schoolName || 'School';
  const schoolLogo = teacherProfile?.school?.logo;
  
  // Get classes taught by this teacher - fix the display format
  const teacherClasses = teacherProfile?.classes?.filter(classData => 
    classData.subjects?.some(subject => subject.teacherId === teacherProfile?.teacher?.teacherId)
  ) || [];

  // Format class names properly (e.g., "2nd A" instead of "2ndA, 2ndA")
  const uniqueClasses = teacherClasses.map(cls => `${cls.className} ${cls.section}`).filter((value, index, self) => self.indexOf(value) === index);

  // Get the current class name for display
  const currentClassName = classDetails 
    ? `${classDetails.className} ${classDetails.section}`.trim()
    : uniqueClasses.length > 0 
      ? uniqueClasses[0] 
      : 'My Class';

  const stats = [
    { 
      title: 'My Students', 
      value: '45', 
      change: '+3 this week', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    { 
      title: 'Classes Today', 
      value: '4', 
      change: '2 completed', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    { 
      title: 'Homework Pending', 
      value: '12', 
      change: 'Due today', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    { 
      title: 'Attendance Rate', 
      value: '96.8%', 
      change: '+1.2%', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
  ];

  const quickActions = [
    { 
      title: 'Mark Attendance', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600', 
      link: '/teacher-admin/student-attendance',
      description: 'Mark student attendance'
    },
    { 
      title: 'Assign Homework', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'from-green-500 to-green-600', 
      link: '/teacher-admin/homework',
      description: 'Create new assignments'
    },
    { 
      title: 'Grade Assignments', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'from-yellow-500 to-yellow-600', 
      link: '/teacher-admin/result',
      description: 'Review and grade work'
    },
    { 
      title: 'View Schedule', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600', 
      link: '/teacher-admin/class-schedule',
      description: 'Check your timetable'
    },
    { 
      title: 'Student Reports', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-red-500 to-red-600', 
      link: '/teacher-admin/students',
      description: 'View student progress'
    },
    { 
      title: 'Send Message', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'from-indigo-500 to-indigo-600', 
      link: '/teacher-admin/announcements',
      description: 'Communicate with students'
    },
  ];

  const recentActivities = [
    { 
      action: 'Marked attendance for Class 10A', 
      time: '2 minutes ago', 
      type: 'attendance', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      status: 'completed'
    },
    { 
      action: 'Assigned homework to Class 9B', 
      time: '15 minutes ago', 
      type: 'homework', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      status: 'completed'
    },
    { 
      action: 'Graded Science test papers', 
      time: '1 hour ago', 
      type: 'grading', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      status: 'completed'
    },
    { 
      action: 'Updated student progress report', 
      time: '2 hours ago', 
      type: 'report', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      status: 'completed'
    },
    { 
      action: 'Scheduled parent meeting', 
      time: '3 hours ago', 
      type: 'meeting', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      status: 'pending'
    },
  ];

  const todaySchedule = [
    { 
      time: '8:00 AM', 
      subject: 'Mathematics', 
      class: 'Class 10A', 
      room: 'Room 101',
      status: 'completed',
      color: 'bg-green-500'
    },
    { 
      time: '9:30 AM', 
      subject: 'Science', 
      class: 'Class 9B', 
      room: 'Room 102',
      status: 'completed',
      color: 'bg-green-500'
    },
    { 
      time: '11:00 AM', 
      subject: 'English', 
      class: 'Class 10B', 
      room: 'Room 103',
      status: 'current',
      color: 'bg-blue-500'
    },
    { 
      time: '2:00 PM', 
      subject: 'Mathematics', 
      class: 'Class 9A', 
      room: 'Room 101',
      status: 'upcoming',
      color: 'bg-gray-400'
    },
  ];

  // Show loading state with shimmer effects
  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Welcome Section Shimmer */}
        <ShimmerWelcome isDarkMode={isDarkMode} />
        
        {/* Stats Cards Shimmer */}
        <ShimmerStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions Shimmer */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
              <div className="flex items-center justify-between mb-6">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
              </div>
              <ShimmerQuickActions />
            </div>
          </div>

          {/* Recent Activities Shimmer */}
          <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-40 animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
            </div>
            <ShimmerRecentActivities />
          </div>
        </div>

        {/* Today's Schedule Shimmer */}
        <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-36 animate-pulse"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
          </div>
          <ShimmerSchedule />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className={`rounded-2xl p-8 ${isDarkMode ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-200'} border`}>
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-2`}>
              Error Loading Profile
            </h3>
            <p className={`${isDarkMode ? 'text-red-300' : 'text-red-500'} mb-4`}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section with Teacher Info and School Logo */}
      <div className={`rounded-2xl p-8 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50'} border ${isDarkMode ? 'border-gray-600' : 'border-blue-100'} shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Welcome back, {teacherName}!
            </h1>
            <div className="space-y-1 mb-4">
              {teacherEmail && (
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center`}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {teacherEmail}
                </p>
              )}
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {schoolName}
              </p>
              {currentClassName && (
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center`}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Teaching: {classLoading ? 'Loading...' : currentClassName}
                </p>
              )}
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Here's what's happening in your classes today
            </p>
          </div>
          <div className="hidden md:block ml-6">
            {schoolLogo ? (
              <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-white dark:border-gray-600">
                <img 
                  src={schoolLogo} 
                  alt={schoolName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">${schoolName.charAt(0)}</div>`;
                    }
                  }}
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {schoolName.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm hover:shadow-lg transition-all duration-300 group`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <div className={`text-sm font-medium ${stat.textColor}`}>
                {stat.change}
              </div>
            </div>
            <div>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                {stat.value}
              </p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h3>
              <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className={`group p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105 ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {action.icon}
                  </div>
                  <h4 className={`font-semibold mb-2 mt-4 ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-900 group-hover:text-blue-600'} transition-colors duration-300`}>
                    {action.title}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {action.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Recent Activities
            </h3>
            <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-500'}`}></div>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activity.status === 'completed' 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} truncate`}>
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Today's Schedule
          </h3>
          <Link 
            to="/teacher-admin/class-schedule"
            className={`text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors duration-200`}
          >
            View All →
          </Link>
        </div>
        <div className="space-y-4">
          {todaySchedule.map((classItem, index) => (
            <div key={index} className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
              isDarkMode 
                ? `border-gray-700 ${classItem.status === 'current' ? 'bg-blue-900/20 border-blue-600' : 'bg-gray-700'}`
                : `border-gray-200 ${classItem.status === 'current' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`
            }`}>
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg ${classItem.color}`}>
                  {classItem.time.split(':')[0]}
                </div>
                <div>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {classItem.subject}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {classItem.class} • {classItem.room}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {classItem.time}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  classItem.status === 'completed' 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    : classItem.status === 'current'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {classItem.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Overview */}
      <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
        <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Class Performance Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">85%</div>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Average Score
            </div>
            <div className="text-xs text-green-500 mt-1">+5% from last month</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">42</div>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Students Present
            </div>
            <div className="text-xs text-blue-500 mt-1">96.8% attendance</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-600 mb-2">8</div>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Assignments Due
            </div>
            <div className="text-xs text-yellow-500 mt-1">3 due today</div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Overall Class Performance
            </span>
            <span className="text-sm font-bold text-green-600">Excellent</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full shadow-sm" style={{ width: '85%' }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAdminDashboard;
