import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { schoolService, announcementService, eventService, teacherAttendanceService, studentFeesService } from '../../../services';
import { 
  GraduationCap, 
  Calendar, 
  Megaphone, 
  Presentation, 
  Users, 
  BookOpen, 
  Clock, 
  CreditCard, 
  UserCheck, 
  FileText,
  ChevronRight,
  AlertCircle,
  MoreHorizontal,
  ArrowUpRight,
  School,
  FileSpreadsheet,
  FileQuestion,
  Crown,
  Settings
} from 'lucide-react';

// --- Types ---
interface QuickAction {
  title: string;
  icon: React.ElementType;
  bgLight?: string;
  text?: string;
  description: string;
  path: string;
}

// --- Components ---

const StatCard = ({ title, value, icon: Icon, colorClass, loading }: any) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 animate-pulse h-32 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
        <div>
          <div className="mt-4 h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className={`p-2.5 rounded-lg ${colorClass.bgLight || 'bg-indigo-50 dark:bg-indigo-900/20'} ${colorClass.text || 'text-indigo-600 dark:text-indigo-400'}`}>
          <Icon size={20} />
        </div>
      </div>
      
      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{value}</h3>
        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5 truncate">{title}</p>
      </div>
    </div>
  );
};

const QuickActionCard = ({ action }: { action: QuickAction }) => (
  <Link 
    to={action.path}
    className="flex items-start p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition-all duration-200 w-full text-left group hover:scale-[1.02]"
  >
    <div className={`p-2.5 rounded-lg mr-3 flex-shrink-0 ${action.bgLight || 'bg-indigo-50 dark:bg-indigo-900/20'} ${action.text || 'text-indigo-600 dark:text-indigo-400'}`}>
      <action.icon size={20} />
    </div>
    
    <div className="w-full flex justify-between items-center overflow-hidden">
      <div className="min-w-0 pr-2">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
          {action.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
          {action.description}
        </p>
      </div>
      <ChevronRight size={16} className="text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
    </div>
  </Link>
);

const FeedSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 animate-pulse">
        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-700 rounded" />
          <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-700 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// --- Main Component ---

const SchoolAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [schoolStats, setSchoolStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'announcements'>('events');
  const [staffPresentPct, setStaffPresentPct] = useState<string>('--');
  const [pendingFees, setPendingFees] = useState<number>(0);

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);

  // --- Data Fetching (Kept same as your logic) ---
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.schoolId) return;
      setLoadingStats(true);
      try {
        // Fetch base stats (studentCount, teacherCount, schoolName)
        const data = await schoolService.getSchoolStats(user.schoolId);
        setSchoolStats(data);

        // Fetch staff attendance summary
        try {
          const attendanceSummary = await teacherAttendanceService.getTeacherAttendanceSummary(user.schoolId);
          if (attendanceSummary?.presentPercentage) {
            setStaffPresentPct(attendanceSummary.presentPercentage);
          } else {
            setStaffPresentPct('100%'); // Fallback if no records today
          }
        } catch (e) {
          console.error("Error fetching staff attendance stats:", e);
          setStaffPresentPct('100%'); // Fallback to 100%
        }

        // Fetch pending student fees
        try {
          const feesSummary = await studentFeesService.getSummaryBySchool(user.schoolId, '');
          if (feesSummary && typeof feesSummary.remainingAmount === 'number') {
            setPendingFees(feesSummary.remainingAmount);
          }
        } catch (e) {
          console.error("Error fetching student fees stats:", e);
          setPendingFees(0);
        }

      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [user?.schoolId]);

  useEffect(() => {
    const loadFeeds = async () => {
      if (!user?.schoolId) return;
      setLoadingFeeds(true);
      setFeedError(null);
      try {
        const [ann, ev] = await Promise.all([
          announcementService.getAnnouncementsBySchool(user.schoolId),
          eventService.getEvents(user.schoolId),
        ]);

        const sortedAnnouncements = [...ann]
          .sort((a, b) => new Date(b.createdDate || 0).getTime() - new Date(a.createdDate || 0).getTime())
          .slice(0, 5);

        const eventsArray = Array.isArray(ev?.events) ? ev.events : Array.isArray(ev) ? ev : [];
        const sortedEvents = [...eventsArray]
          .sort((a: any, b: any) => {
            const aDate = new Date(a.date || a.createdDate || 0).getTime();
            const bDate = new Date(b.date || b.createdDate || 0).getTime();
            return bDate - aDate;
          })
          .slice(0, 5);

        setAnnouncements(sortedAnnouncements);
        setEvents(sortedEvents);
      } catch (error: any) {
        setFeedError('Failed to load latest updates');
      } finally {
        setLoadingFeeds(false);
      }
    };

    loadFeeds();
  }, [user?.schoolId]);

  // --- Configuration ---

  const quickActions: QuickAction[] = [
    { title: 'Students', icon: GraduationCap, bgLight: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', description: 'Manage student records & promotions', path: '/school-admin/students' },
    { title: 'Teachers', icon: Users, bgLight: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', description: 'Manage teacher profiles & roles', path: '/school-admin/teachers' },
    { title: 'Attendance', icon: UserCheck, bgLight: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', description: 'Track & mark daily attendance', path: '/school-admin/attendance' },
    { title: 'Leave Requests', icon: FileText, bgLight: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', description: 'Approve teacher leave requests', path: '/school-admin/leaves' },
    { title: 'Student Fees', icon: CreditCard, bgLight: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', description: 'Collect fees & track pending payments', path: '/school-admin/fees' },
    { title: 'Classrooms', icon: School, bgLight: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', description: 'Setup classes & sections', path: '/school-admin/classroom' },
    { title: 'Exams', icon: FileSpreadsheet, bgLight: 'bg-fuchsia-50 dark:bg-fuchsia-900/20', text: 'text-fuchsia-600 dark:text-fuchsia-400', description: 'Timetables & report cards', path: '/school-admin/exams' },
    { title: 'Question Papers', icon: FileQuestion, bgLight: 'bg-sky-50 dark:bg-sky-900/20', text: 'text-sky-600 dark:text-sky-400', description: 'Question banks & exam papers', path: '/school-admin/question-papers' },
    { title: 'Announcements', icon: Megaphone, bgLight: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600 dark:text-teal-400', description: 'Broadcast notices & alerts', path: '/school-admin/announcements' },
    { title: 'Events', icon: Calendar, bgLight: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600 dark:text-cyan-400', description: 'Manage school events calendar', path: '/school-admin/events' },
    { title: 'Alumni', icon: Users, bgLight: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', description: 'Graduate directory & outreach', path: '/school-admin/alumni' },
    { title: 'Subscription', icon: Crown, bgLight: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', description: 'Manage TeachoVE license & billing', path: '/school-admin/subscription-request' },
  ];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900 p-0 sm:p-2 lg:p-4 space-y-3 sm:space-y-6 font-sans">
      
      {/* --- Hero Header Section --- */}
      <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-xl p-4 sm:p-6 border-b sm:border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center">
        <div className="w-full">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-3 border border-indigo-100 dark:border-indigo-800/30">
            <Calendar size={13} />
            {todayDate}
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1.5">
            {schoolStats?.schoolName || 'Administrator'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Here is your daily overview. Stay updated with the latest alerts and management tasks.
          </p>
        </div>
      </div>

      {/* --- Stats Grid --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-3 sm:px-0">
        <StatCard 
          title="Total Students" 
          value={schoolStats?.studentCount ?? 0} 
          icon={GraduationCap} 
          colorClass={{ bgLight: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400' }} 
          loading={loadingStats} 
        />
        <StatCard 
          title="Teaching Staff" 
          value={schoolStats?.teacherCount ?? 0} 
          icon={Presentation} 
          colorClass={{ bgLight: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' }} 
          loading={loadingStats} 
        />
        <StatCard 
          title="Staff Present" 
          value={schoolStats ? staffPresentPct : "--"} 
          icon={UserCheck} 
          colorClass={{ bgLight: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400' }} 
          loading={loadingStats} 
        />
        <StatCard 
          title="Pending Fees" 
          value={schoolStats ? `₹${pendingFees.toLocaleString('en-IN')}` : "--"} 
          icon={AlertCircle} 
          colorClass={{ bgLight: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' }} 
          loading={loadingStats} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 px-3 sm:px-0 pb-6 sm:pb-0">
        
        {/* --- Quick Actions Grid --- */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Quick Actions
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {quickActions.map((action, idx) => (
              <QuickActionCard key={idx} action={action} />
            ))}
          </div>
        </div>

        {/* --- Interactive Feed --- */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
            
            {/* Feed Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                 <h3 className="font-bold text-base text-gray-900 dark:text-white">Updates</h3>
              </div>
              
              {/* Pill Tabs */}
              <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <button
                  onClick={() => setActiveTab('events')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activeTab === 'events'
                      ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200 dark:border-gray-700/50'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-transparent'
                  }`}
                >
                  Events
                </button>
                <button
                  onClick={() => setActiveTab('announcements')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activeTab === 'announcements'
                      ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200 dark:border-gray-700/50'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-transparent'
                  }`}
                >
                  Notice Board
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-3 sm:p-4 flex-1 overflow-y-auto max-h-[500px] sm:max-h-[600px] custom-scrollbar">
              {loadingFeeds ? (
                <FeedSkeleton />
              ) : feedError ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
                  <AlertCircle size={24} className="mb-2 opacity-50" />
                  <span className="text-sm">{feedError}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeTab === 'events' ? (
                    events.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">No upcoming events</div>
                    ) : (
                      events.map((evt, idx) => (
                        <div key={idx} className="flex gap-3 items-start p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex flex-col items-center justify-center w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                            <span className="text-[9px] font-bold uppercase tracking-wider">{new Date(evt.date || evt.createdDate).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-lg font-bold leading-none">{new Date(evt.date || evt.createdDate).getDate()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{evt.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{evt.description}</p>
                            <div className="mt-1.5 flex items-center text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                <Clock size={10} className="mr-1" />
                                {evt.time || 'All Day'}
                            </div>
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    // Announcements Tab
                    announcements.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">No notices posted</div>
                    ) : (
                      announcements.map((ann, idx) => (
                        <div key={idx} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex justify-between items-start mb-1.5">
                             <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 pr-2">{ann.title}</h4>
                             <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">{formatDate(ann.createdDate)}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {ann.message}
                          </p>
                        </div>
                      ))
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;