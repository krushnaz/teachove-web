import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { 
  LayoutDashboard, 
  Crown, 
  BookOpen, 
  FileQuestion, 
  Shield,
  X,
  Settings,
  Database,
  Calendar,
  DollarSign
} from 'lucide-react';

interface MasterAdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const MasterAdminSidebar: React.FC<MasterAdminSidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  const isActive = (itemPath: string) => {
    if (itemPath === '/master-admin/dashboard') {
      return location.pathname === '/master-admin/dashboard';
    }
    return location.pathname.startsWith(itemPath);
  };

  const menuGroups = useMemo(() => [
    {
      title: "Overview",
      items: [
        { path: '/master-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: "Quick Actions",
      items: [
        { path: '/master-admin/add-schools', label: 'Manage Schools', icon: Settings },
        { path: '/master-admin/subscription-request', label: 'Subscription Request', icon: Crown },
        { path: '/master-admin/subscription-plans', label: 'Subscription Plans', icon: DollarSign },
        { path: '/master-admin/vedant-books', label: 'Vedant Education Books', icon: BookOpen },
        { path: '/master-admin/question-papers', label: 'Question Papers', icon: FileQuestion },
        { path: '/master-admin/academic-years', label: 'Academic Years', icon: Calendar },
        { path: '/master-admin/migration', label: 'Manage Migration', icon: Database },
        { path: '/master-admin/admin-access', label: 'Admin Access', icon: Shield },
      ]
    }
  ], []);

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transform transition-transform duration-300 ease-out flex flex-col h-full shadow-2xl lg:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        {/* Logo Area */}
        <div className="h-24 flex items-center px-6">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Shield size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Teachove</h1>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Master Admin
              </span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-8 custom-scrollbar">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              <h3 className="px-4 mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`relative group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                        ${active 
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-white shadow-sm shadow-indigo-100 dark:shadow-none' 
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon 
                          size={20} 
                          className={`transition-colors duration-200 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}
                          strokeWidth={active ? 2.5 : 2}
                        />
                        <span>{item.label}</span>
                      </div>
                      
                      {/* Subtle indicator for active state */}
                      {active && (
                         <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Card */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 dark:from-indigo-900 dark:to-purple-800 rounded-2xl p-4 text-white shadow-xl shadow-gray-200 dark:shadow-none">
             {/* Decoration */}
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-white opacity-10 rounded-full blur-xl"></div>
             
             <div className="flex items-center gap-3 relative z-10">
               <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Shield size={16} className="text-yellow-300" fill="currentColor" />
               </div>
               <div>
                 <p className="text-xs font-bold">Master Admin</p>
                 <p className="text-[10px] text-gray-300">Full Access</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MasterAdminSidebar;
