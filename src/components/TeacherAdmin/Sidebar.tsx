import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BarChart3,
  BookOpen,
  FileQuestion,
  Calendar,
  CalendarDays,
  Clock,
  FileText,
  Megaphone,
  UserCircle,
  X,
} from 'lucide-react';

interface TeacherAdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const TeacherAdminSidebar: React.FC<TeacherAdminSidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  const isActive = (itemPath: string) => {
    if (itemPath === '/teacher-admin') {
      return location.pathname === '/teacher-admin';
    }
    return location.pathname.startsWith(itemPath);
  };

  const menuGroups = useMemo(
    () => [
      {
        title: 'Overview',
        items: [
          { path: '/teacher-admin', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/teacher-admin/announcements', label: 'Announcements', icon: Megaphone },
          { path: '/teacher-admin/events', label: 'Events', icon: CalendarDays },
        ],
      },
      {
        title: 'Students & Academics',
        items: [
          { path: '/teacher-admin/students', label: 'Students', icon: Users },
          { path: '/teacher-admin/student-attendance', label: 'Student Attendance', icon: CalendarCheck },
          { path: '/teacher-admin/student-results', label: 'Student Results', icon: BarChart3 },
          { path: '/teacher-admin/homework', label: 'Homework', icon: BookOpen },
          { path: '/teacher-admin/question-papers', label: 'Question Papers', icon: FileQuestion },
          { path: '/teacher-admin/class-schedule', label: 'Class Schedule', icon: Calendar },
          { path: '/teacher-admin/exam-schedule', label: 'Exam Schedule', icon: FileText },
        ],
      },
      {
        title: 'Personal',
        items: [
          { path: '/teacher-admin/your-attendance', label: 'Your Attendance', icon: Clock },
          { path: '/teacher-admin/leave', label: 'Leave', icon: FileText },
          { path: '/teacher-admin/profile', label: 'Profile', icon: UserCircle },
        ],
      },
    ],
    []
  );

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 sm:w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out flex flex-col h-full lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 sm:h-20 flex items-center px-4 sm:px-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 lg:hidden">
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                T
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Teacher Panel</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">TeachoVE</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="mb-6">
              <h3 className="px-6 mb-2 text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {group.title}
              </h3>
              <div className="space-y-0.5 flex flex-col">
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`relative flex items-center justify-between px-5 sm:px-6 py-2.5 sm:py-3 transition-colors duration-150 font-medium text-sm
                        ${
                          active
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-600 dark:border-indigo-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200 border-l-4 border-transparent'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <item.icon
                          size={18}
                          className={`flex-shrink-0 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}
                          strokeWidth={active ? 2.5 : 2}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
          <div className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
            <p className="text-xs font-bold text-gray-900 dark:text-white">Teacher Admin</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Manage your class & students</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherAdminSidebar;
