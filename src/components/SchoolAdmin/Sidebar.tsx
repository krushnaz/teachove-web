import React, { useMemo, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscriptionService, CurrentSubscriptionDetails } from '../../services/subscriptionService';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  School, 
  FileSpreadsheet, 
  CreditCard, 
  Megaphone, 
  Crown, 
  Calendar, 
  FileQuestion, 
  FileText, 
  UserCircle, 
  Settings,
  X,
  ChevronRight
} from 'lucide-react';

interface SchoolAdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

function formatExpiry(expiryAt: CurrentSubscriptionDetails['expiryAt']): string | null {
  if (!expiryAt) return null;
  try {
    const date = typeof expiryAt === 'object' && expiryAt !== null && '_seconds' in expiryAt
      ? new Date((expiryAt as { _seconds: number })._seconds * 1000)
      : new Date(String(expiryAt));
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
}

const SchoolAdminSidebar: React.FC<SchoolAdminSidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscriptionDetails | null>(null);

  useEffect(() => {
    const schoolId = user?.schoolId;
    if (!schoolId) return;
    subscriptionService.getCurrentSubscriptionDetails(schoolId).then((details) => {
      setCurrentSubscription(details ?? null);
    });
  }, [user?.schoolId]);

  const isActive = (itemPath: string) => {
    if (itemPath === '/school-admin') {
      return location.pathname === '/school-admin';
    }
    return location.pathname.startsWith(itemPath);
  };

  const menuGroups = useMemo(() => [
    {
      title: "Overview",
      items: [
        { path: '/school-admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/school-admin/announcements', label: 'Announcements', icon: Megaphone },
        { path: '/school-admin/events', label: 'Events', icon: Calendar },
      ]
    },
    {
      title: "People",
      items: [
        { path: '/school-admin/students', label: 'Students', icon: GraduationCap },
        { path: '/school-admin/teachers', label: 'Teachers', icon: Users },
        { path: '/school-admin/attendance', label: 'Attendance', icon: CalendarCheck },
        { path: '/school-admin/leaves', label: 'Leave Requests', icon: FileText },
      ]
    },
    {
      title: "Academics",
      items: [
        { path: '/school-admin/classroom', label: 'Classrooms', icon: School },
        { path: '/school-admin/exams', label: 'Exams', icon: FileSpreadsheet },
        { path: '/school-admin/question-papers', label: 'Question Papers', icon: FileQuestion },
      ]
    },
    {
      title: "Finance",
      items: [
        { path: '/school-admin/fees', label: 'Student Fees', icon: CreditCard },
        { path: '/school-admin/subscription-request', label: 'Subscription', icon: Crown },
      ]
    },
    {
      title: "System",
      items: [
        { path: '/school-admin/profile', label: 'Profile', icon: UserCircle },
        { path: '/school-admin/settings', label: 'Settings', icon: Settings },
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <School size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Teachove</h1>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Admin
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
                      
                      {/* Subtle chevron for active/hover state */}
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

        {/* Footer Card - Active plan details & expiry */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 dark:from-indigo-900 dark:to-indigo-800 rounded-2xl p-4 text-white shadow-xl shadow-gray-200 dark:shadow-none">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-white opacity-10 rounded-full blur-xl" />
             <div className="flex items-center gap-3 relative z-10">
               <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Crown size={16} className="text-yellow-300" fill="currentColor" />
               </div>
               <div className="min-w-0 flex-1">
                 <p className="text-xs font-bold truncate">
                   {currentSubscription?.isActive && (currentSubscription.planName || currentSubscription.totalSeats)
                     ? (currentSubscription.planName || 'Active Plan')
                     : 'Subscription'}
                 </p>
                 <p className="text-[10px] text-gray-300">
                   {currentSubscription?.isActive
                     ? currentSubscription.remainingDays != null && currentSubscription.remainingDays >= 0
                       ? `${currentSubscription.remainingDays} days remaining`
                       : formatExpiry(currentSubscription.expiryAt)
                         ? `Expires ${formatExpiry(currentSubscription.expiryAt)}`
                         : 'Active'
                     : currentSubscription?.totalSeats
                       ? 'Expired'
                       : 'No active plan'}
                 </p>
                 {currentSubscription?.isActive && (currentSubscription.totalSeats ?? 0) > 0 && (
                   <p className="text-[10px] text-gray-400 mt-0.5">{currentSubscription.totalSeats} students</p>
                 )}
               </div>
             </div>
             <Link
               to="/school-admin/subscription-request"
               onClick={() => setSidebarOpen(false)}
               className="mt-3 block w-full py-1.5 text-center text-[10px] font-bold uppercase tracking-wide bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
             >
               {currentSubscription?.isActive ? 'Manage' : 'Subscribe'}
             </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default SchoolAdminSidebar;