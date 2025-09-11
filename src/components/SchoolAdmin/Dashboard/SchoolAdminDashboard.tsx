import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { schoolService, announcementService, eventService } from '../../../services';
import { GraduationCap, Calendar, Megaphone, Presentation } from 'lucide-react';

const SchoolAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [schoolStats, setSchoolStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'announcements'>('events');

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.schoolId) return;
      setLoadingStats(true);
      try {
        const data = await schoolService.getSchoolStats(user.schoolId);
        setSchoolStats(data);
      } catch (e) {
        setSchoolStats(null);
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
        setAnnouncements([]);
        setEvents([]);
      } finally {
        setLoadingFeeds(false);
      }
    };

    loadFeeds();
  }, [user?.schoolId]);

  const isLoading = loadingStats || loadingFeeds;

  const schoolName = useMemo(() => {
    return schoolStats?.schoolName || '';
  }, [schoolStats]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div>
        {/* Sleek shimmer for Welcome */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 mb-8 p-8">
          <div className="animate-pulse">
            <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
            <div className="h-4 w-1/4 bg-gray-100 dark:bg-gray-800 rounded"></div>
          </div>
          <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.15),transparent_35%)]" />
        </div>

        {/* Shimmer for Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[1, 2].map(i => (
            <div key={i} className="rounded-2xl shadow-sm border p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex items-center animate-pulse">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mr-4"></div>
              <div className="flex-1">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Shimmer for Tabs + Lists */}
        <div className="mb-8">
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 animate-pulse">
            <div className="h-9 w-36 bg-gray-200 dark:bg-gray-700 rounded mr-3"></div>
            <div className="h-9 w-40 bg-gray-100 dark:bg-gray-800 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 p-5 shadow-sm animate-pulse">
                <div className="h-5 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-1/3 bg-gray-100 dark:bg-gray-800 rounded mb-1"></div>
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 mb-8 p-8">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Welcome{schoolName ? `, ${schoolName}` : ''}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Here's your latest school overview.</p>
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.15),transparent_35%)]" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl shadow-sm border p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex items-center">
          <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center text-white text-2xl mr-4">
            <GraduationCap />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Students</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{schoolStats?.studentCount ?? '--'}</p>
          </div>
        </div>
        <div className="rounded-2xl shadow-sm border p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex items-center">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white text-2xl mr-4">
            <Presentation />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Teachers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{schoolStats?.teacherCount ?? '--'}</p>
          </div>
        </div>
      </div>

      {/* Tabs for Events and Announcements */}
      <div className="mb-8">
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
          <button
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none transition-colors duration-200 ${activeTab === 'events' ? 'border-b-2 border-primary-600 text-primary-700 dark:text-primary-400 bg-primary-50/70 dark:bg-gray-900' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            onClick={() => setActiveTab('events')}
          >
            <Calendar className="mr-2" /> Upcoming Events
          </button>
          <button
            className={`flex items-center ml-6 px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none transition-colors duration-200 ${activeTab === 'announcements' ? 'border-b-2 border-primary-600 text-primary-700 dark:text-primary-400 bg-primary-50/70 dark:bg-gray-900' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            onClick={() => setActiveTab('announcements')}
          >
            <Megaphone className="mr-2" /> Announcements
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {feedError && (
            <div className="mb-4 text-sm text-red-600 dark:text-red-400">{feedError}</div>
          )}

          {activeTab === 'events' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">No events found.</div>
              )}
              {events.map((eventItem: any, idx: number) => (
                <div key={idx} className="rounded-xl border border-primary-100 dark:border-primary-900 bg-primary-50/60 dark:bg-gray-900 p-5 shadow-sm flex flex-col">
                  <div className="flex items-center mb-2">
                    <Calendar className="text-primary-600 dark:text-primary-400 mr-2" />
                    <span className="text-base font-semibold text-gray-900 dark:text-white">{eventItem.title}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">
                    {formatDate(eventItem.date || eventItem.createdDate)}{eventItem.time ? ` • ${eventItem.time}` : ''}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-200 line-clamp-3">{eventItem.description}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {announcements.length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">No announcements found.</div>
              )}
              {announcements.map((announcement: any, idx: number) => (
                <div key={idx} className="rounded-xl border border-amber-100 dark:border-amber-900 bg-amber-50/60 dark:bg-gray-900 p-5 shadow-sm flex flex-col">
                  <div className="flex items-center mb-2">
                    <Megaphone className="text-amber-600 dark:text-amber-400 mr-2" />
                    <span className="text-base font-semibold text-gray-900 dark:text-white">{announcement.title}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">{formatDate(announcement.createdDate)}</div>
                  <div className="text-sm text-gray-700 dark:text-gray-200 line-clamp-3">{announcement.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;
