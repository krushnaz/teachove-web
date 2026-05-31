import React, { useMemo, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscriptionService, CurrentSubscriptionDetails } from '../../services/subscriptionService';
import { schoolProfileService, type SchoolProfile } from '../../services/schoolProfileService';
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
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);

  useEffect(() => {
    const schoolId = user?.schoolId;
    if (!schoolId) return;
    
    subscriptionService.getCurrentSubscriptionDetails(schoolId).then((details) => {
      setCurrentSubscription(details ?? null);
    }).catch(console.error);

    schoolProfileService.getSchoolProfile(schoolId).then((profile) => {
       setSchoolProfile(profile);
    }).catch(console.error);
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
        { path: '/school-admin/alumni', label: 'Alumni', icon: Users },
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
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 sm:w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out flex flex-col h-full lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo Area (Mobile only close button banner) */}
        <div className="h-16 sm:h-20 flex items-center px-4 sm:px-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 lg:hidden">
          <div className="flex items-center gap-3 w-full">
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
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
                        ${active 
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-600 dark:border-indigo-400' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200 border-l-4 border-transparent'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon 
                          size={18} 
                          className={`${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}
                          strokeWidth={active ? 2.5 : 2}
                        />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Card - Active plan details & expiry */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
          <div className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 flex flex-col">
             <div className="flex items-center gap-2.5 mb-2.5">
               <div className="w-7 h-7 rounded bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Crown size={14} className="text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
               </div>
               <div className="min-w-0 flex-1">
                 <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                   {currentSubscription?.isActive && (currentSubscription.planName || currentSubscription.totalSeats)
                     ? (currentSubscription.planName || 'Active Plan')
                     : 'Subscription'}
                 </p>
                 <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
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
               </div>
             </div>
             <Link
               to="/school-admin/subscription-request"
               onClick={() => setSidebarOpen(false)}
               className="block w-full py-1.5 text-center text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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