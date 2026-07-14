// src/components/Students/StudentDashboard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  CalendarDays,
  GraduationCap,
  User,
  Hash,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  BarChart3,
  Megaphone,
  Wallet,
  ClipboardList,
  FileText,
  CalendarCheck,
} from 'lucide-react';
import { TeacherPageShell } from './shared';

const StudentDashboard: React.FC = () => {
  const { user, schoolDetails, classDetails, classTeacher } = useAuth();

  const studentName = user?.name || 'Student';
  const className = classDetails ? `${classDetails.className} - ${classDetails.section}` : null;

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const chips = [
    className ? { label: `Class ${className}`, icon: GraduationCap } : null,
    classTeacher ? { label: `Teacher: ${classTeacher}`, icon: User } : null,
    user?.rollNo ? { label: `Roll No: ${user.rollNo}`, icon: Hash } : null,
    user?.phoneNo ? { label: `${user.phoneNo}`, icon: Phone } : null,
  ].filter(Boolean) as { label: string; icon: typeof User }[];

  const quickActions = [
    { label: 'Attendance', to: '/student-dashboard/attendance', icon: CalendarCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Homework', to: '/student-dashboard/homework', icon: BookOpen, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Timetable', to: '/student-dashboard/timetable', icon: Calendar, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Results', to: '/student-dashboard/results', icon: BarChart3, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    { label: 'Exam Timetable', to: '/student-dashboard/exam-timetable', icon: FileText, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Fees', to: '/student-dashboard/fees', icon: Wallet, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Leaves', to: '/student-dashboard/leaves', icon: ClipboardList, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { label: 'Announcements', to: '/student-dashboard/announcements', icon: Megaphone, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ];

  return (
    <TeacherPageShell>
      {/* Hero Header */}
      <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-xl p-4 sm:p-6 border-b sm:border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-3 border border-indigo-100 dark:border-indigo-800/30">
          <CalendarDays size={13} />
          {todayDate}
        </div>

        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-md flex-shrink-0">
              {user?.profilePic ? (
                <img src={user.profilePic} alt={studentName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold">
                  {studentName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  Welcome, {studentName}
                </h1>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold">
                  Student
                </span>
              </div>
              {user?.email && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{user.email}</p>
              )}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2.5">
                {chips.map((chip) => (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium"
                  >
                    <chip.icon size={12} className="flex-shrink-0" />
                    <span className="truncate max-w-[160px]">{chip.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {schoolDetails && (
            <div className="hidden sm:flex items-center gap-3 sm:gap-4 flex-shrink-0 self-start">
              {schoolDetails.logo ? (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <img src={schoolDetails.logo} alt={schoolDetails.schoolName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {schoolDetails.schoolName?.charAt(0)}
                </div>
              )}
              <div className="min-w-0 text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[220px]">
                  {schoolDetails.schoolName}
                </p>
                {(schoolDetails.city || schoolDetails.state) && (
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-end">
                    <MapPin size={11} />
                    {[schoolDetails.city, schoolDetails.state].filter(Boolean).join(', ')}
                  </p>
                )}
                {schoolDetails.currentAcademicYear && (
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Academic Year: {schoolDetails.currentAcademicYear}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition-all duration-200 flex items-center gap-3"
            >
              <div className={`p-2 sm:p-2.5 rounded-lg ${action.bg} ${action.color} flex-shrink-0`}>
                <action.icon size={18} />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </TeacherPageShell>
  );
};

export default StudentDashboard;
