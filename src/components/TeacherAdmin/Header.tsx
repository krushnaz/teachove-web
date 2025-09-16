import React, { useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTeacherProfile } from '../../contexts/TeacherProfileContext';
import { Link } from 'react-router-dom';

interface TeacherAdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  title?: string;
  subtitle?: string;
}

const TeacherAdminHeader: React.FC<TeacherAdminHeaderProps> = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  title = "Dashboard",
  subtitle = "Welcome back, Teacher"
}) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, logout } = useAuth();
  const { teacherProfile } = useTeacherProfile();
  const [showProfile, setShowProfile] = useState(false);

  // Close profile dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfile && !(event.target as Element).closest('.profile-dropdown')) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile]);

  // Get teacher name and email from profile
  const teacherName = teacherProfile?.teacher?.teacherName || user?.email?.split('@')[0] || 'Teacher';
  const teacherEmail = teacherProfile?.teacher?.email || user?.email || '';
  const profilePic = teacherProfile?.teacher?.profilePic;

  React.useEffect(() => {
    console.log('=== HEADER DEBUG INFO ===');
    console.log('User data:', user);
    console.log('Teacher profile data:', teacherProfile);
    console.log('Teacher name:', teacherName);
    console.log('Teacher email:', teacherEmail);
    console.log('Profile pic:', profilePic);
    console.log('=== END HEADER DEBUG INFO ===');
  }, [user, teacherProfile, teacherName, teacherEmail, profilePic]);

  return (
    <>
      {/* Mobile Header */}
      <div className={`lg:hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-primary-600'}`}>Teacher Admin</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link to="/" className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className={`hidden lg:block ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{subtitle}</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className={`p-3 rounded-lg transition-all duration-200 ${isDarkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600 hover:scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'}`}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {/* Profile */}
            <div className="relative profile-dropdown">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {profilePic ? (
                  <img 
                    src={profilePic} 
                    alt={teacherName}
                    className="w-10 h-10 rounded-full object-cover shadow-lg"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">${teacherName.charAt(0).toUpperCase()}</div>`;
                      }
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                    {teacherName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {teacherName}
                  </p>
                  {teacherEmail && (
                    <p className="text-xs text-gray-500">{teacherEmail}</p>
                  )}
                </div>
                <svg className={`w-4 h-4 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showProfile && (
                <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-xl border z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center space-x-3">
                      {profilePic ? (
                        <img 
                          src={profilePic} 
                          alt={teacherName}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">${teacherName.charAt(0).toUpperCase()}</div>`;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {teacherName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {teacherName}
                        </p>
                        <p className="text-xs text-gray-500">{teacherEmail || 'teacher@school.com'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link to="/teacher-admin/profile" className={`flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                      isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile Settings
                    </Link>
                    <button 
                      onClick={logout}
                      className={`flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                        isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherAdminHeader;
