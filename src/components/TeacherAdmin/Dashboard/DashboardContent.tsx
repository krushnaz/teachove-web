import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useTeacherProfile } from '../../../contexts/TeacherProfileContext';
import { classroomService } from '../../../services/classroomService';
import {
  Users,
  Building2,
  FileText,
  BarChart3,
  CalendarCheck,
  BookOpen,
  PenLine,
  Calendar,
  MessageSquare,
  ChevronRight,
  CalendarDays,
} from 'lucide-react';

// Shimmer Loading Component
const ShimmerCard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-300 dark:bg-gray-700 rounded-2xl h-full"></div>
  </div>
);

// Shimmer for welcome section (avatar + school)
const ShimmerWelcome: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => (
  <div className={`rounded-2xl overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-blue-100'}`}>
    <div className={`${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50'} h-28`} />
    <div className="p-6 pt-0 -mt-10">
      <div className="flex items-end justify-between animate-pulse">
        <div className="flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gray-300 dark:bg-gray-600 ring-4 ring-white dark:ring-gray-800" />
          <div className="space-y-3">
            <div className="h-6 w-64 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="h-4 w-48 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="h-4 w-40 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-28 bg-gray-300 dark:bg-gray-600 rounded-xl" />
          <div className="hidden md:block w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

// Shimmer for stats cards
const ShimmerStats: React.FC = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    {[...Array(4)].map((_, index) => (
      <ShimmerCard key={index} className="h-28 sm:h-32" />
    ))}
  </div>
);

// Shimmer for quick actions
const ShimmerQuickActions: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
    {[...Array(6)].map((_, index) => (
      <ShimmerCard key={index} className="h-20 sm:h-24" />
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

  // Remove noisy debug logs in production

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
      icon: Users,
      bgLight: 'bg-indigo-50 dark:bg-indigo-900/20',
      textColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'Classes Today',
      value: '4',
      change: '2 completed',
      icon: Building2,
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Homework Pending',
      value: '12',
      change: 'Due today',
      icon: FileText,
      bgLight: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Attendance Rate',
      value: '96.8%',
      change: '+1.2%',
      icon: BarChart3,
      bgLight: 'bg-violet-50 dark:bg-violet-900/20',
      textColor: 'text-violet-600 dark:text-violet-400',
    },
  ];

  const quickActions = [
    {
      title: 'Mark Attendance',
      icon: CalendarCheck,
      bgLight: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      link: '/teacher-admin/student-attendance',
      description: 'Mark student attendance',
    },
    {
      title: 'Assign Homework',
      icon: BookOpen,
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      link: '/teacher-admin/homework',
      description: 'Create new assignments',
    },
    {
      title: 'Grade Assignments',
      icon: PenLine,
      bgLight: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-600 dark:text-amber-400',
      link: '/teacher-admin/student-results',
      description: 'Review and grade work',
    },
    {
      title: 'View Schedule',
      icon: Calendar,
      bgLight: 'bg-violet-50 dark:bg-violet-900/20',
      text: 'text-violet-600 dark:text-violet-400',
      link: '/teacher-admin/class-schedule',
      description: 'Check your timetable',
    },
    {
      title: 'Student Reports',
      icon: BarChart3,
      bgLight: 'bg-rose-50 dark:bg-rose-900/20',
      text: 'text-rose-600 dark:text-rose-400',
      link: '/teacher-admin/students',
      description: 'View student progress',
    },
    {
      title: 'Send Message',
      icon: MessageSquare,
      bgLight: 'bg-sky-50 dark:bg-sky-900/20',
      text: 'text-sky-600 dark:text-sky-400',
      link: '/teacher-admin/announcements',
      description: 'Communicate with students',
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
      <div className="space-y-3 sm:space-y-6 -m-2 sm:-m-4 lg:-m-8 p-2 sm:p-4 lg:p-8">
        <ShimmerWelcome isDarkMode={isDarkMode} />
        <ShimmerStats />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <div className="xl:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
              <ShimmerQuickActions />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
            <ShimmerRecentActivities />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
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

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-3 sm:space-y-6 font-sans">
      {/* Hero Header */}
      <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-xl p-4 sm:p-6 border-b sm:border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-3 border border-indigo-100 dark:border-indigo-800/30">
          <CalendarDays size={13} />
          {todayDate}
        </div>

        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-md flex-shrink-0">
              {teacherProfile?.teacher?.profilePic ? (
                <img
                  src={teacherProfile.teacher.profilePic}
                  alt={teacherName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold">
                  {teacherName.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  Welcome, {teacherName}
                </h1>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold">
                  Teacher
                </span>
              </div>
              {teacherEmail && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {teacherEmail}
                </p>
              )}
              <span className="inline-block mt-2 text-[10px] sm:text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                Teaching: {classLoading ? 'Loading…' : currentClassName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 self-start">
            {schoolLogo ? (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
                <img src={schoolLogo} alt={schoolName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {schoolName.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{schoolName}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                Academic Year: {teacherProfile?.school?.currentAcademicYear || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-full"
            >
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <div className={`p-2 sm:p-2.5 rounded-lg ${stat.bgLight} ${stat.textColor}`}>
                  <Icon size={18} className="sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[10px] sm:text-xs font-medium ${stat.textColor} text-right leading-tight`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {stat.value}
                </h3>
                <p className="text-[10px] sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {stat.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 pb-4 sm:pb-0">
        {/* Quick Actions */}
        <div className="xl:col-span-2 space-y-3 sm:space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white px-1">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.link}
                  className="flex items-start p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition-all duration-200 w-full text-left group"
                >
                  <div
                    className={`p-2 sm:p-2.5 rounded-lg mr-3 flex-shrink-0 ${action.bgLight} ${action.text}`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="w-full flex justify-between items-center overflow-hidden min-w-0">
                    <div className="min-w-0 pr-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {action.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex-shrink-0 transition-colors"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-base text-gray-900 dark:text-white">Recent Activities</h3>
          </div>
          <div className="p-3 sm:p-4 flex-1 space-y-2 sm:space-y-3">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-2.5 sm:p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activity.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                  }`}
                >
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                    {activity.action}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{activity.time}</p>
                </div>
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                    activity.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            Today&apos;s Schedule
          </h3>
          <Link
            to="/teacher-admin/class-schedule"
            className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors whitespace-nowrap"
          >
            View All →
          </Link>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {todaySchedule.map((classItem, index) => (
            <div
              key={index}
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-xl border transition-all duration-200 ${
                isDarkMode
                  ? `border-gray-700 ${classItem.status === 'current' ? 'bg-indigo-900/20 border-indigo-600' : 'bg-gray-800/50'}`
                  : `border-gray-200 ${classItem.status === 'current' ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50'}`
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-sm flex-shrink-0 ${classItem.color}`}
                >
                  {classItem.time.split(':')[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                    {classItem.subject}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {classItem.class} • {classItem.room}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-2 pl-[60px] sm:pl-0">
                <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                  {classItem.time}
                </div>
                <div
                  className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full capitalize ${
                    classItem.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                      : classItem.status === 'current'
                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {classItem.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
          Class Performance Overview
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-4 sm:mb-6">
          <div className="text-center">
            <div className="text-xl sm:text-4xl font-bold text-emerald-600 mb-0.5 sm:mb-2">85%</div>
            <div className="text-[10px] sm:text-sm font-medium text-gray-600 dark:text-gray-300">
              Avg Score
            </div>
            <div className="text-[9px] sm:text-xs text-emerald-500 mt-0.5 hidden sm:block">+5% from last month</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-4xl font-bold text-indigo-600 mb-0.5 sm:mb-2">42</div>
            <div className="text-[10px] sm:text-sm font-medium text-gray-600 dark:text-gray-300">
              Present
            </div>
            <div className="text-[9px] sm:text-xs text-indigo-500 mt-0.5 hidden sm:block">96.8% attendance</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-4xl font-bold text-amber-600 mb-0.5 sm:mb-2">8</div>
            <div className="text-[10px] sm:text-sm font-medium text-gray-600 dark:text-gray-300">
              Due
            </div>
            <div className="text-[9px] sm:text-xs text-amber-500 mt-0.5 hidden sm:block">3 due today</div>
          </div>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
              Overall Class Performance
            </span>
            <span className="text-xs sm:text-sm font-bold text-emerald-600">Excellent</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3">
            <div
              className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 sm:h-3 rounded-full"
              style={{ width: '85%' }}
            />
          </div>
          <div className="flex justify-between text-[10px] sm:text-xs text-gray-500">
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
