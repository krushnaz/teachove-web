import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { authService, announcementService } from '../../../services';
import type { Announcement } from '../../../services/announcementService';
import { toast } from 'react-toastify';
import { Megaphone, Paperclip, Clock, Users } from 'lucide-react';
import {
  TeacherPageShell,
  TeacherPageHeader,
  TeacherStatsGrid,
  TeacherStatCard,
  TeacherFilterBar,
  TeacherSearchInput,
  TeacherSelect,
  TeacherCardGrid,
  TeacherItemCard,
  TeacherButton,
  TeacherLoading,
  TeacherError,
  TeacherEmpty,
  TeacherPanel,
} from '../shared';

const TeacherAnnouncements: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAudience, setFilterAudience] = useState<'all' | 'classes' | 'teachers' | 'allUsers'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState('');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!user?.schoolId) {
          setError('School ID not found');
          return;
        }
        const classId = user.classId || 'all';
        const teacherId = authService.getTeacherId() || 'all';
        const data = await announcementService.getAnnouncementsByClassOrTeacher(
          user.schoolId,
          classId,
          teacherId
        );
        setAnnouncements(data || []);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('Failed to load announcements');
        toast.error('Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };

    if (user?.schoolId) {
      fetchAnnouncements();
    }
  }, [user?.schoolId, user?.classId]);

  const filtered = useMemo(() => {
    const normalized = (s: string | null | undefined) => (s || '').toLowerCase();
    return announcements
      .filter(a => {
        const matchesSearch =
          normalized(a.title).includes(searchTerm.toLowerCase()) ||
          normalized(a.message).includes(searchTerm.toLowerCase());
        const matchesAudience =
          filterAudience === 'all' ? true : a.selectedAudience === (filterAudience === 'allUsers' ? 'all' : filterAudience);
        return matchesSearch && matchesAudience;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        const da = new Date(a.createdDate).getTime();
        const db = new Date(b.createdDate).getTime();
        return db - da; // newest first
      });
  }, [announcements, searchTerm, filterAudience, sortBy]);

  const stats = useMemo(() => {
    const withAttachments = announcements.filter(a => !!a.file).length;
    const last7Days = announcements.filter(a => {
      const created = new Date(a.createdDate).getTime();
      const now = Date.now();
      return now - created <= 7 * 24 * 60 * 60 * 1000;
    }).length;
    const classesCount = announcements.filter(a => a.selectedAudience === 'classes').length;
    return { total: announcements.length, withAttachments, last7Days, classesCount };
  }, [announcements]);

  const formatCreatedDate = (createdDate: any) => {
    if (!createdDate) return 'N/A';
    if (createdDate._seconds) {
      const date = new Date(createdDate._seconds * 1000);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    const date = new Date(createdDate);
    return isNaN(date.getTime())
      ? 'N/A'
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const openDetails = (a: Announcement) => {
    setSelectedAnnouncement(a);
    setShowDialog(true);
  };

  const closeDetails = () => {
    setShowDialog(false);
    setSelectedAnnouncement(null);
  };

  const openAttachment = (url: string) => {
    setAttachmentUrl(url);
    setShowAttachmentDialog(true);
  };

  const closeAttachment = () => {
    setShowAttachmentDialog(false);
    setAttachmentUrl('');
  };

  if (loading) {
    return <TeacherLoading message="Loading announcements..." />;
  }

  if (error) {
    return (
      <TeacherError
        title="Error Loading Announcements"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <TeacherPageShell>
      <TeacherPageHeader
        title="Announcements"
        description="View school notices and updates relevant to your class."
      />

      <TeacherStatsGrid>
        <TeacherStatCard title="Total" value={stats.total} icon={Megaphone} color="indigo" />
        <TeacherStatCard title="With Attachments" value={stats.withAttachments} icon={Paperclip} color="emerald" />
        <TeacherStatCard title="Last 7 Days" value={stats.last7Days} icon={Clock} color="amber" />
        <TeacherStatCard title="Class-targeted" value={stats.classesCount} icon={Users} color="violet" />
      </TeacherStatsGrid>

      <TeacherFilterBar>
        <TeacherSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search announcements..."
        />
        <TeacherSelect
          value={filterAudience}
          onChange={(v) => setFilterAudience(v as typeof filterAudience)}
          className="sm:w-44"
          options={[
            { value: 'all', label: 'All audiences' },
            { value: 'allUsers', label: 'All users' },
            { value: 'classes', label: 'Classes' },
            { value: 'teachers', label: 'Teachers' },
          ]}
        />
        <TeacherSelect
          value={sortBy}
          onChange={(v) => setSortBy(v as typeof sortBy)}
          className="sm:w-40"
          options={[
            { value: 'date', label: 'Sort by Date' },
            { value: 'title', label: 'Sort by Title' },
          ]}
        />
      </TeacherFilterBar>

      {filtered.length === 0 ? (
        <TeacherPanel>
          <TeacherEmpty
            icon={Megaphone}
            title="No announcements found"
            description="Try adjusting your search or filters."
          />
        </TeacherPanel>
      ) : (
        <TeacherCardGrid cols={3}>
          {filtered.map((a) => (
            <TeacherItemCard key={a.announcementId} onClick={() => openDetails(a)}>
              <div className="px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-indigo-50/50 dark:bg-indigo-900/10">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatCreatedDate(a.createdDate)}
                    </p>
                  </div>
                  {a.file && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 flex-shrink-0">
                      File
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3">
                  {a.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  Audience: {a.selectedAudience}
                </p>
              </div>

              <div className="px-4 sm:px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 truncate max-w-[50%]">ID: {a.announcementId}</span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">View Details</span>
              </div>
            </TeacherItemCard>
          ))}
        </TeacherCardGrid>
      )}

      {showDialog && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">{selectedAnnouncement.title}</h3>
                <button onClick={closeDetails} className="text-white hover:text-gray-200 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created</h4>
                  <p className="text-gray-900 dark:text-white">{formatCreatedDate(selectedAnnouncement.createdDate)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Audience</h4>
                  <p className="text-gray-900 dark:text-white capitalize">{selectedAnnouncement.selectedAudience}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Message</h4>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedAnnouncement.message}</p>
                </div>
                {selectedAnnouncement.file && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Attachment</h4>
                    <button onClick={() => openAttachment(selectedAnnouncement.file as string)} className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586A4 4 0 0010 4L3.586 10.414a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      View Attachment
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg flex justify-end">
              <TeacherButton variant="secondary" onClick={closeDetails}>
                Close
              </TeacherButton>
            </div>
          </div>
        </div>
      )}

      {showAttachmentDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Attachment Preview</h3>
              <TeacherButton variant="ghost" onClick={closeAttachment} className="px-2">
                ✕
              </TeacherButton>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Open the attachment in a new tab to view it.
              </p>
              <a href={attachmentUrl} target="_blank" rel="noopener noreferrer">
                <TeacherButton>Open Attachment</TeacherButton>
              </a>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <TeacherButton variant="secondary" onClick={closeAttachment}>
                Close
              </TeacherButton>
            </div>
          </div>
        </div>
      )}
    </TeacherPageShell>
  );
};

export default TeacherAnnouncements;


