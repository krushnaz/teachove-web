import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { schoolService, announcementService, eventService } from '../../../services';
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
  ArrowUpRight
} from 'lucide-react';

// --- Types ---
interface QuickAction {
  title: string;
  icon: React.ElementType;
  color: string; 
  bg: string;
  description: string;
}

// --- Components ---

const StatCard = ({ title, value, icon: Icon, colorClass, loading }: any) => {
  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse h-32">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="mt-4 h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Decorative Background Blob */}
      <div className={`absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-[0.08] transition-transform duration-500 group-hover:scale-150 ${colorClass.bg}`} />
      
      <div className="relative flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${colorClass.bgLight} ${colorClass.text}`}>
            <Icon size={22} />
          </div>
          {/* Optional Trend Indicator */}
          <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
            <ArrowUpRight size={12} className="mr-1" />
            +2.4%
          </div>
        </div>
        
        <div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight font-sans">{value}</h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{title}</p>
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({ action }: { action: QuickAction }) => (
  <button className="group relative flex flex-col items-start p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-transparent dark:hover:border-gray-600 hover:-translate-y-1 w-full text-left overflow-hidden">
    {/* Hover Gradient Background */}
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${action.bg}`} />
    
    <div className={`p-3.5 rounded-2xl mb-4 transition-transform duration-300 group-hover:scale-110 ${action.bg} bg-opacity-10 dark:bg-opacity-20`}>
      <action.icon className={`w-6 h-6 ${action.color}`} />
    </div>
    
    <div className="relative z-10">
      <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {action.title}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
        {action.description}
      </p>
    </div>
    
    <div className="absolute right-4 top-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </div>
  </button>
);

const FeedSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 animate-pulse">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-700 shrink-0" />
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
        const data = await schoolService.getSchoolStats(user.schoolId);
        setSchoolStats(data);
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
    { title: 'Manage Staff', icon: Users, color: 'text-blue-600', bg: 'bg-blue-500', description: 'Non-teaching staff & roles' },
    { title: 'Curriculum', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-500', description: 'Classes & Subjects setup' },
    { title: 'Exam Planner', icon: Clock, color: 'text-violet-600', bg: 'bg-violet-500', description: 'Timetables & schedules' },
    { title: 'Fees & Finance', icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-500', description: 'Payments & reports' },
    { title: 'Attendance', icon: UserCheck, color: 'text-rose-600', bg: 'bg-rose-500', description: 'Track daily attendance' },
    { title: 'Leaves', icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-500', description: 'Approve teacher leaves' },
  ];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    // Added a subtle radial gradient background to make the white cards pop
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900 p-6 lg:p-8 space-y-8 font-sans">
      
      {/* --- Hero Header Section --- */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 p-8 lg:p-10 shadow-xl shadow-indigo-200 dark:shadow-none text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-indigo-50 mb-3">
              <Calendar size={12} />
              {todayDate}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              Welcome, {schoolStats?.schoolName || 'Administrator'}
            </h1>
            <p className="text-indigo-100 opacity-90 max-w-xl text-base leading-relaxed">
              You have <span className="font-bold text-white">3 pending</span> leave requests and <span className="font-bold text-white">2 unread</span> announcements requiring your attention today.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button className="bg-white text-indigo-600 hover:bg-indigo-50 px-5 py-3 rounded-xl font-bold shadow-lg shadow-black/5 transition-all text-sm flex items-center gap-2">
              <MoreHorizontal size={16} />
              Actions
            </button>
          </div>
        </div>
        
        {/* Elegant Background mesh */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-gradient-to-bl from-white to-transparent opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 rounded-full bg-indigo-400 opacity-20 blur-3xl"></div>
      </div>

      {/* --- Stats Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value={schoolStats?.studentCount ?? 0} 
          icon={GraduationCap} 
          colorClass={{ bg: 'bg-blue-500', bgLight: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' }} 
          loading={loadingStats} 
        />
        <StatCard 
          title="Teaching Staff" 
          value={schoolStats?.teacherCount ?? 0} 
          icon={Presentation} 
          colorClass={{ bg: 'bg-emerald-500', bgLight: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' }} 
          loading={loadingStats} 
        />
        <StatCard 
          title="Staff Present" 
          value={schoolStats ? "96%" : "--"} 
          icon={UserCheck} 
          colorClass={{ bg: 'bg-violet-500', bgLight: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400' }} 
          loading={loadingStats} 
        />
        <StatCard 
          title="Pending Fees" 
          value={schoolStats ? "$12k" : "--"} 
          icon={AlertCircle} 
          colorClass={{ bg: 'bg-amber-500', bgLight: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' }} 
          loading={loadingStats} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* --- Quick Actions Grid --- */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
              Management Console
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action, idx) => (
              <QuickActionCard key={idx} action={action} />
            ))}
          </div>

          {/* Optional Banner for secondary actions */}
          <div className="bg-indigo-50 dark:bg-gray-800 rounded-2xl p-6 border border-indigo-100 dark:border-gray-700 flex items-center justify-between relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="font-bold text-indigo-900 dark:text-white text-lg">Upcoming Exams</h3>
                <p className="text-indigo-700 dark:text-gray-400 text-sm mt-1">Check schedules and invigilator duties.</p>
             </div>
             <button className="relative z-10 px-4 py-2 bg-white dark:bg-gray-700 text-indigo-600 dark:text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow hover:-translate-y-0.5 transition-all">
                View Schedule
             </button>
             {/* Decoration */}
             <div className="absolute right-0 bottom-0 opacity-10">
                <Clock size={120} className="translate-x-10 translate-y-10" />
             </div>
          </div>
        </div>

        {/* --- Interactive Feed --- */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-[1.5rem] shadow-[0_2px_20px_-5px_rgba(0,0,0,0.07)] dark:shadow-none border border-gray-100 dark:border-gray-700 h-full overflow-hidden flex flex-col">
            
            {/* Feed Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-lg text-gray-800 dark:text-white">Updates</h3>
                 <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                    Live
                 </span>
              </div>
              
              {/* Pill Tabs */}
              <div className="flex p-1 bg-gray-100 dark:bg-gray-900/50 rounded-xl">
                <button
                  onClick={() => setActiveTab('events')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                    activeTab === 'events'
                      ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                  }`}
                >
                  Events
                </button>
                <button
                  onClick={() => setActiveTab('announcements')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                    activeTab === 'announcements'
                      ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                  }`}
                >
                  Notice Board
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
              {loadingFeeds ? (
                <FeedSkeleton />
              ) : feedError ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <AlertCircle className="mb-2" />
                  <span className="text-sm">{feedError}</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTab === 'events' ? (
                    events.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-sm">No upcoming events</div>
                    ) : (
                      events.map((evt, idx) => (
                        <div key={idx} className="flex gap-4 items-start p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                          <div className="flex flex-col items-center justify-center w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0 border border-indigo-100 dark:border-indigo-900/50 shadow-sm group-hover:scale-105 transition-transform">
                            <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(evt.date || evt.createdDate).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-xl font-extrabold leading-none">{new Date(evt.date || evt.createdDate).getDate()}</span>
                          </div>
                          <div className="flex-1 pt-1">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">{evt.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">{evt.description}</p>
                            <div className="mt-2 flex items-center text-[10px] font-medium text-gray-400 bg-gray-50 dark:bg-gray-900 inline-flex px-2 py-0.5 rounded-md">
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
                      <div className="text-center py-10 text-gray-400 text-sm">No notices posted</div>
                    ) : (
                      announcements.map((ann, idx) => (
                        <div key={idx} className="relative pl-6 pb-6 border-l border-indigo-100 dark:border-gray-700 last:border-0 last:pb-0">
                          <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-gray-800"></div>
                          
                          <div className="bg-amber-50/50 dark:bg-gray-800/50 border border-amber-100 dark:border-gray-700/50 rounded-xl p-4 -mt-2 hover:shadow-sm transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                               <h4 className="text-sm font-bold text-gray-900 dark:text-white">{ann.title}</h4>
                               <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{formatDate(ann.createdDate)}</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                              {ann.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>
              )}
            </div>
             <div className="p-4 border-t border-gray-100 dark:border-gray-700">
               <button className="w-full py-3 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors flex items-center justify-center gap-2">
                 View All {activeTab === 'events' ? 'Events' : 'Notices'}
                 <ChevronRight size={14} />
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;