import React, { useState, useEffect, useRef } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';

interface StudentHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  title?: string;
  subtitle?: string;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, classDetails, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const studentName = user?.name || user?.email?.split('@')[0] || 'Student';
  const studentEmail = user?.email || '';
  const studentRollNo = user?.rollNo || '';
  const className = classDetails ? `${classDetails.className} - ${classDetails.section}` : '';
  const profilePic = user?.profilePic;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ProfileAvatar = ({ size = 'sm' }: { size?: 'sm' | 'md' }) => {
    const dim = size === 'md' ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm';
    if (profilePic) {
      return (
        <img
          src={profilePic}
          alt={studentName}
          className={`${dim} rounded-full object-cover border border-gray-200 dark:border-gray-700`}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }
    return (
      <div
        className={`${dim} rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold border border-indigo-500/30`}
      >
        {studentName.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <header
      className={`sticky top-0 z-30 w-full transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      } border-b`}
    >
      <div className="px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 lg:h-20 items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`lg:hidden p-2 rounded-md transition-colors flex-shrink-0 ${
                isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img
                src="/icon.png"
                alt="TeachoVE Logo"
                className="h-8 sm:h-10 lg:h-12 w-auto object-contain flex-shrink-0"
              />
              <span
                className={`text-lg sm:text-xl lg:text-2xl font-bold tracking-tight truncate ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                TeachoVE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-md transition-colors border ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className={`h-6 w-px hidden sm:block ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className={`flex items-center gap-1.5 sm:gap-2 pl-1 pr-1.5 py-1 rounded-full transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent ${
                  showProfile ? 'bg-gray-50 dark:bg-gray-800' : ''
                }`}
              >
                <ProfileAvatar />
                <div className="hidden md:block text-left mr-0.5 max-w-[120px] lg:max-w-[160px]">
                  <p
                    className={`text-xs font-bold leading-tight truncate ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}
                  >
                    {studentName}
                  </p>
                  <p
                    className={`text-[10px] font-medium uppercase tracking-wide truncate ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    {studentRollNo ? `Roll No: ${studentRollNo}` : 'Student'}
                  </p>
                </div>
                <ChevronDown
                  size={14}
                  className={`hidden md:block transition-transform duration-200 ${
                    showProfile ? 'rotate-180' : ''
                  } ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                />
              </button>

              {showProfile && (
                <div
                  className={`absolute right-0 mt-2 w-64 rounded-md shadow-lg border z-50 overflow-hidden ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="p-1">
                    <div
                      className={`p-3 rounded mb-1 ${
                        isDarkMode
                          ? 'bg-gray-900 border border-gray-700'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ProfileAvatar size="md" />
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-bold truncate ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {studentName}
                          </p>
                          <p
                            className={`text-xs truncate ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {studentEmail || 'student@school.com'}
                          </p>
                          {className && (
                            <p
                              className={`text-[11px] truncate ${
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                              }`}
                            >
                              Class: {className}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/student-dashboard/profile"
                      onClick={() => setShowProfile(false)}
                      className={`flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors ${
                        isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
                      }`}
                    >
                      <User size={16} />
                      <span className="font-medium">My Profile</span>
                    </Link>
                    <div
                      className={`my-1 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    />
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;
