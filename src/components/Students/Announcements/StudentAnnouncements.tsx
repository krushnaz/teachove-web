import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { announcementService } from '../../../services';
import type { Announcement } from '../../../services/announcementService';
import { toast } from 'react-toastify';
import { Megaphone, Paperclip, Clock, Users, X } from 'lucide-react';
import {
  TeacherPageShell,
  TeacherPageHeader,
  TeacherStatsGrid,
  TeacherStatCard,
  TeacherFilterBar,
  TeacherSearchInput,
  TeacherSelect,
  TeacherLoading,
  TeacherError,
  TeacherCardGrid,
  TeacherItemCard,
  TeacherEmpty,
  TeacherButton,
  TeacherPanel,
} from '../shared';

const StudentAnnouncements: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
        const data = await announcementService.getAnnouncementsByClassOrTeacher(user.schoolId, classId, 'all');
        setAnnouncements(data || []);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('Failed to load announcements');
        toast.error('Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };
    if (user?.schoolId) fetchAnnouncements();
  }, [user?.schoolId, user?.classId]);

  const filtered = useMemo(() => {
    const normalized = (s: string | null | undefined) => (s || '').toLowerCase();
    return announcements
      .filter(a =>
        normalized(a.title).includes(searchTerm.toLowerCase()) ||
        normalized(a.message).includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      });
  }, [announcements, searchTerm, sortBy]);

  const stats = useMemo(() => {
    const withAttachments = announcements.filter(a => !!a.file).length;
    const last7Days = announcements.filter(a => {
      const created = new Date(a.createdDate).getTime();
      return Date.now() - created <= 7 * 24 * 60 * 60 * 1000;
    }).length;
    return { total: announcements.length, withAttachments, last7Days };
  }, [announcements]);

  const formatCreatedDate = (createdDate: any) => {
    if (!createdDate) return 'N/A';
    if (createdDate._seconds) {
      return new Date(createdDate._seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    }
    const date = new Date(createdDate);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) return <TeacherLoading message="Loading announcements..." />;
  if (error) return <TeacherError title="Error Loading Announcements" message={error} onRetry={() => window.location.reload()} />;

  return (
    <TeacherPageShell>
      <TeacherPageHeader title="Announcements" description="Stay updated with school announcements." />

      <TeacherStatsGrid cols={3}>
        <TeacherStatCard title="Total" value={stats.total} icon={Megaphone} color="indigo" />
        <TeacherStatCard title="With Attachments" value={stats.withAttachments} icon={Paperclip} color="emerald" />
        <TeacherStatCard title="Last 7 Days" value={stats.last7Days} icon={Clock} color="amber" />
      </TeacherStatsGrid>

      <TeacherFilterBar>
        <TeacherSearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search announcements..." />
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
          <TeacherEmpty icon={Megaphone} title="No announcements found" description="Try adjusting your search or filters." />
        </TeacherPanel>
      ) : (
        <TeacherCardGrid cols={3}>
          {filtered.map(a => (
            <TeacherItemCard key={a.announcementId} onClick={() => { setSelectedAnnouncement(a); setShowDialog(true); }}>
              <div className="px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-indigo-50/50 dark:bg-indigo-900/10">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white line-clamp-2">{a.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatCreatedDate(a.createdDate)}</p>
                  </div>
                  {a.file && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 flex-shrink-0">
                      Attachment
                    </span>
                  )}
                </div>
              </div>
              <div className="px-4 sm:px-5 py-4">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3">{a.message}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <Users size={13} />
                  <span className="capitalize">{a.selectedAudience === 'all' ? 'All Users' : a.selectedAudience}</span>
                </div>
              </div>
            </TeacherItemCard>
          ))}
        </TeacherCardGrid>
      )}

      {showDialog && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedAnnouncement.title}</h3>
              <button onClick={() => setShowDialog(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Created</p>
                <p className="text-gray-900 dark:text-white">{formatCreatedDate(selectedAnnouncement.createdDate)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Message</p>
                <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{selectedAnnouncement.message}</p>
              </div>
              {selectedAnnouncement.file && (
                <TeacherButton variant="secondary" onClick={() => { setAttachmentUrl(selectedAnnouncement.file as string); setShowAttachmentDialog(true); }}>
                  View Attachment
                </TeacherButton>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <TeacherButton variant="secondary" onClick={() => setShowDialog(false)}>Close</TeacherButton>
            </div>
          </div>
        </div>
      )}

      {showAttachmentDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 text-center">
            <Paperclip size={32} className="mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Open the attachment in a new tab.</p>
            <div className="flex justify-center gap-3">
              <a href={attachmentUrl} target="_blank" rel="noopener noreferrer">
                <TeacherButton>Open Attachment</TeacherButton>
              </a>
              <TeacherButton variant="secondary" onClick={() => setShowAttachmentDialog(false)}>Close</TeacherButton>
            </div>
          </div>
        </div>
      )}
    </TeacherPageShell>
  );
};

export default StudentAnnouncements;
