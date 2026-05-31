import React, { useState, useEffect, useRef } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { schoolProfileService, type SchoolProfile } from '../../services/schoolProfileService';
import { 
  Menu, Sun, Moon, Bell, LogOut, 
  User, Settings, ChevronDown, School
} from 'lucide-react';

interface SchoolAdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  title?: string;
  subtitle?: string; // <--- Added this back to fix the error
}

const SchoolAdminHeader: React.FC<SchoolAdminHeaderProps> = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  title = "Dashboard",
  subtitle // We accept it, but we don't necessarily have to display it if we want a clean look
}) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // ... (Keep the rest of the useEffect and handler logic exactly the same) ...
  
  useEffect(() => {
    const schoolId = user?.schoolId;
    if (schoolId) {
      schoolProfileService.getSchoolProfile(schoolId).then((profile) => {
         setSchoolProfile(profile);
      }).catch(console.error);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user?.schoolId]);

  return (
    <header className={`sticky top-0 z-30 w-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
          
          {/* Left: Mobile Toggle & Title */}
          <div className="flex items-center gap-4 min-w-max">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`lg:hidden p-2 rounded-md transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center gap-3">
              <img 
                src="/icon.png" 
                alt="TeachoVE Logo" 
                className="h-12 w-auto object-contain flex-shrink-0"
              />
              <span className={`text-xl sm:text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                TeachoVE
              </span>
            </div>
          </div>

          {/* ... (Keep the Search Bar, Actions, Theme Toggle, etc. exactly the same) ... */}
          


          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-md transition-colors border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-indigo-600'}`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-md transition-colors border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-indigo-600'}`}
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
              </button>
              
              {showNotifications && (
                 <div className={`absolute right-0 mt-2 w-80 rounded-md shadow-lg border p-0 z-50 overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className="flex justify-between items-center">
                        <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                        <span className="text-xs font-semibold text-indigo-600 cursor-pointer hover:underline">Mark all read</span>
                      </div>
                    </div>
                    <div className={`p-8 flex flex-col items-center text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                       <div className={`p-3 rounded-full mb-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <Bell size={20} className="opacity-50" />
                       </div>
                       <p className="text-sm">No new notifications</p>
                    </div>
                 </div>
              )}
            </div>

            <div className={`h-6 w-px mx-1 hidden sm:block ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className={`flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-full transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent ${showProfile ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'}`}>
                  {schoolProfile?.logo ? (
                     <img src={schoolProfile.logo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                     <User size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                  )}
                </div>
                <div className="hidden xl:block text-left mr-1">
                  <p className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{schoolProfile?.schoolName || 'Admin User'}</p>
                  <p className={`text-[10px] font-medium uppercase tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Administrator</p>
                </div>
                <ChevronDown size={14} className={`hidden xl:block transition-transform duration-200 ${showProfile ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </button>

              {showProfile && (
                <div className={`absolute right-0 mt-2 w-64 rounded-md shadow-lg border z-50 overflow-hidden ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="p-1">
                     <div className={`p-3 rounded mb-1 ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                             {schoolProfile?.logo ? (
                                <img src={schoolProfile.logo} alt="Profile" className="w-full h-full object-cover" />
                             ) : (
                                <School size={20} className={isDarkMode ? 'text-gray-400' : 'text-indigo-600'} />
                             )}
                           </div>
                           <div className="min-w-0">
                               <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                 {schoolProfile?.schoolName || 'Teachove Admin'}
                               </p>
                               <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                 {user?.email || 'admin@school.com'}
                               </p>
                           </div>
                        </div>
                     </div>
                    <Link to="/school-admin/profile" className={`flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'}`}>
                      <User size={16} />
                      <span className="font-medium">My Profile</span>
                    </Link>
                    <Link to="/school-admin/settings" className={`flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'}`}>
                      <Settings size={16} />
                      <span className="font-medium">Account Settings</span>
                    </Link>
                    <div className={`my-1 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
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

export default SchoolAdminHeader;