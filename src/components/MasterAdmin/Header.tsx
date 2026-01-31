import React, { useState, useEffect, useRef } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, Sun, Moon, Bell, Search, LogOut, 
  User, Settings, ChevronDown 
} from 'lucide-react';

interface MasterAdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  title?: string;
  subtitle?: string;
}

const MasterAdminHeader: React.FC<MasterAdminHeaderProps> = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  title = "Dashboard",
  subtitle
}) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/master-admin');
  };

  return (
    <header className={`sticky top-0 z-30 w-full transition-all duration-300 ${isDarkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-100'} backdrop-blur-xl border-b`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          
          {/* Left: Mobile Toggle & Title */}
          <div className="flex items-center gap-4 min-w-max">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`lg:hidden p-2 rounded-xl transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Menu size={24} />
            </button>
            
            <div className="hidden md:block">
               <h2 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h2>
               {subtitle && <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>}
            </div>
          </div>

          {/* Center: Enhanced Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-auto">
             <div className="relative w-full group">
               <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400 group-hover:text-indigo-500'}`}>
                 <Search size={18} />
               </div>
               <input 
                 type="text" 
                 className={`block w-full py-2.5 pl-10 pr-12 text-sm rounded-2xl border transition-all duration-200 outline-none 
                   ${isDarkMode 
                     ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                     : 'bg-gray-50 border-gray-200/60 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 shadow-inner focus:shadow-lg'
                   }`} 
                 placeholder="Search (Cmd + K)" 
               />
               <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                 <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-white border-gray-200 text-gray-400'}`}>
                    ⌘K
                 </span>
               </div>
             </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-xl transition-all duration-200 border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 shadow-sm'}`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-xl transition-all duration-200 border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 shadow-sm'}`}
              >
                <Bell size={20} />
                <span className="absolute top-2.5 right-3 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
              </button>
              
              {showNotifications && (
                 <div className={`absolute right-0 mt-4 w-80 rounded-2xl shadow-2xl border p-0 z-50 transform transition-all overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-50'}`}>
                      <div className="flex justify-between items-center">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                        <span className="text-xs font-medium text-indigo-500 cursor-pointer hover:text-indigo-600">Mark all read</span>
                      </div>
                    </div>
                    <div className={`p-8 flex flex-col items-center text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                       <div className={`p-3 rounded-full mb-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <Bell size={24} className="opacity-50" />
                       </div>
                       <p className="text-sm">No new notifications</p>
                    </div>
                 </div>
              )}
            </div>

            <div className={`h-8 w-[1px] mx-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className={`flex items-center gap-3 pl-1 pr-2 py-1 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent ${showProfile ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-200 dark:shadow-none">
                  {user?.email?.charAt(0).toUpperCase() || 'M'}
                </div>
                <div className="hidden xl:block text-left">
                  <p className={`text-sm font-bold leading-tight ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Master Admin</p>
                  <p className={`text-[10px] font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Administrator</p>
                </div>
                <ChevronDown size={16} className={`hidden xl:block transition-transform duration-200 ${showProfile ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </button>

              {showProfile && (
                <div className={`absolute right-0 mt-4 w-64 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border z-50 overflow-hidden transform transition-all duration-200 origin-top-right animate-in fade-in zoom-in-95 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                }`}>
                  <div className="p-2">
                     <div className={`p-3 rounded-xl mb-1 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider mb-1`}>
                          Signed in as
                        </p>
                        <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {user?.email || 'admin@master.com'}
                        </p>
                     </div>
                    <Link to="/master-admin/dashboard" className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'}`}>
                      <User size={18} />
                      <span>My Profile</span>
                    </Link>
                    <Link to="/master-admin/dashboard" className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'}`}>
                      <Settings size={18} />
                      <span>Account Settings</span>
                    </Link>
                    <div className={`my-1 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}></div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                      <LogOut size={18} />
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

export default MasterAdminHeader;
