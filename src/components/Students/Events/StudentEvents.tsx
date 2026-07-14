import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock3, Eye, FileText, History, Link2, X } from 'lucide-react';
import { eventService } from '../../../services/eventService';
import { useAuth } from '../../../contexts/AuthContext';
import { Event } from '../../../services/eventService';
import { toast } from 'react-toastify';
import {
  TeacherPageShell,
  TeacherPageHeader,
  TeacherStatsGrid,
  TeacherStatCard,
  TeacherFilterBar,
  TeacherSearchInput,
  TeacherSelect,
  TeacherPanel,
  TeacherCardGrid,
  TeacherItemCard,
  TeacherButton,
  TeacherLoading,
  TeacherError,
  TeacherEmpty,
} from '../shared';

const StudentEvents: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'past'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      if (user?.schoolId) {
        const response = await eventService.getEvents(user.schoolId);
        setEvents(response.events || []);
      } else {
        setError('School ID not found');
      }
    } catch (fetchError) {
      console.error('Error fetching events:', fetchError);
      setError('Failed to load events');
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.schoolId) {
      fetchEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.schoolId]);

  // Filter and sort events
  const filteredAndSortedEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let matchesFilter = true;
      if (filterType === 'upcoming') {
        matchesFilter = eventDate >= today;
      } else if (filterType === 'past') {
        matchesFilter = eventDate < today;
      }
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const isAUpcoming = dateA >= today;
        const isBUpcoming = dateB >= today;
        
        if (isAUpcoming && !isBUpcoming) return -1;
        if (!isAUpcoming && isBUpcoming) return 1;
        
        if (isAUpcoming && isBUpcoming) {
          return dateA.getTime() - dateB.getTime();
        }
        
        if (!isAUpcoming && !isBUpcoming) {
          return dateB.getTime() - dateA.getTime();
        }
        
        return dateA.getTime() - dateB.getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format created date for display
  const formatCreatedDate = (createdDate: any) => {
    if (!createdDate) return 'N/A';
    
    if (createdDate._seconds) {
      const date = new Date(createdDate._seconds * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    if (typeof createdDate === 'string') {
      const date = new Date(createdDate);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    return 'N/A';
  };

  // Handle view details click
  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  // Handle attachment click
  const handleAttachmentClick = (filePath: string) => {
    setAttachmentUrl(filePath);
    setShowAttachmentDialog(true);
  };

  // Close dialogs
  const closeEventDialog = () => {
    setShowEventDialog(false);
    setSelectedEvent(null);
  };

  const closeAttachmentDialog = () => {
    setShowAttachmentDialog(false);
    setAttachmentUrl('');
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Check if event is upcoming
  const isUpcoming = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  };

  // Get event status
  const getEventStatus = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'past', text: 'Past Event', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    if (diffDays === 0) return { status: 'today', text: 'Today', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
    if (diffDays <= 7) return { status: 'upcoming', text: 'This Week', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' };
    return { status: 'upcoming', text: 'Upcoming', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
  };

  if (loading) return <TeacherLoading message="Loading events..." />;
  if (error) return <TeacherError title="Error Loading Events" message={error} onRetry={fetchEvents} />;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingEvents = filteredAndSortedEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today;
  });
  
  const pastEvents = filteredAndSortedEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate < today;
  });

  return (
    <TeacherPageShell>
      <TeacherPageHeader title="School Events" description="Stay updated with upcoming school activities." />

      <TeacherStatsGrid cols={4}>
        <TeacherStatCard title="Total Events" value={events.length} icon={CalendarDays} color="indigo" />
        <TeacherStatCard
          title="Upcoming"
          value={events.filter((event) => isUpcoming(event.date)).length}
          icon={Clock3}
          color="emerald"
        />
        <TeacherStatCard
          title="This Week"
          value={
            events.filter((event) => {
              const eventDate = new Date(event.date);
              const diffTime = eventDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays >= 0 && diffDays <= 7;
            }).length
          }
          icon={CalendarDays}
          color="amber"
        />
        <TeacherStatCard
          title="Past Events"
          value={events.filter((event) => !isUpcoming(event.date)).length}
          icon={History}
          color="violet"
        />
      </TeacherStatsGrid>

      <TeacherFilterBar>
        <TeacherSearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search events..." />
        <TeacherSelect
          value={filterType}
          onChange={(value) => setFilterType(value as 'all' | 'upcoming' | 'past')}
          options={[
            { value: 'all', label: 'All Events' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'past', label: 'Past Events' },
          ]}
          className="sm:w-44"
        />
        <TeacherSelect
          value={sortBy}
          onChange={(value) => setSortBy(value as 'date' | 'title')}
          options={[
            { value: 'date', label: 'Sort by Date' },
            { value: 'title', label: 'Sort by Title' },
          ]}
          className="sm:w-44"
        />
      </TeacherFilterBar>

      {filteredAndSortedEvents.length === 0 ? (
        <TeacherPanel>
          <TeacherEmpty
            icon={CalendarDays}
            title="No events found"
            description={
              events.length === 0
                ? 'No events have been created yet.'
                : 'Try adjusting your search criteria or filters.'
            }
          />
        </TeacherPanel>
      ) : (
        <div className="space-y-6">
          {upcomingEvents.length > 0 && (
            <TeacherPanel title={`Upcoming Events (${upcomingEvents.length})`}>
              <TeacherCardGrid cols={3}>
                {upcomingEvents.map((event) => {
                  const eventStatus = getEventStatus(event.date);
                  return (
                    <TeacherItemCard key={event.eventId}>
                      <div className="p-4 sm:p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {event.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                            {eventStatus.text}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                          {event.description}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          <div>{formatDate(event.date)}</div>
                          <div>{formatTime(event.time)}</div>
                          <div>Created {formatCreatedDate(event.createdDate)}</div>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <TeacherButton compact variant="secondary" icon={Eye} onClick={() => handleViewDetails(event)}>
                            Details
                          </TeacherButton>
                          {event.filePath && (
                            <TeacherButton
                              compact
                              variant="ghost"
                              icon={Link2}
                              onClick={() => handleAttachmentClick(event.filePath!)}
                            >
                              Attachment
                            </TeacherButton>
                          )}
                        </div>
                      </div>
                    </TeacherItemCard>
                  );
                })}
              </TeacherCardGrid>
            </TeacherPanel>
          )}

          {pastEvents.length > 0 && (
            <TeacherPanel title={`Past Events (${pastEvents.length})`}>
              <TeacherCardGrid cols={3}>
                {pastEvents.map((event) => (
                  <TeacherItemCard key={event.eventId} className="opacity-80">
                    <div className="p-4 sm:p-5 space-y-3">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                        {event.description}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <div>{formatDate(event.date)}</div>
                        <div>{formatTime(event.time)}</div>
                        <div>Created {formatCreatedDate(event.createdDate)}</div>
                      </div>
                      <TeacherButton compact variant="secondary" icon={Eye} onClick={() => handleViewDetails(event)}>
                        Details
                      </TeacherButton>
                    </div>
                  </TeacherItemCard>
                ))}
              </TeacherCardGrid>
            </TeacherPanel>
          )}
        </div>
      )}

      {/* Event Details Dialog */}
      {showEventDialog && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{selectedEvent.title}</h3>
              <button onClick={closeEventDialog} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Date & Time</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {formatDate(selectedEvent.date)} at {formatTime(selectedEvent.time)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Description</p>
                <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">{selectedEvent.description}</p>
              </div>
              {selectedEvent.filePath && (
                <TeacherButton compact variant="secondary" icon={Link2} onClick={() => handleAttachmentClick(selectedEvent.filePath!)}>
                  View Attachment
                </TeacherButton>
              )}
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Created</p>
                <p className="text-gray-900 dark:text-gray-100">{formatCreatedDate(selectedEvent.createdDate)}</p>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <TeacherButton variant="secondary" onClick={closeEventDialog}>
                Close
              </TeacherButton>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Preview Dialog */}
      {showAttachmentDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-xl shadow-xl max-w-xl w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attachment Preview</h3>
              <button onClick={closeAttachmentDialog} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 text-center">
              <FileText className="mx-auto mb-3 text-gray-400" size={36} />
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Open this attachment in a new tab.</p>
              <a href={attachmentUrl} target="_blank" rel="noopener noreferrer">
                <TeacherButton icon={Link2}>Open Attachment</TeacherButton>
              </a>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <TeacherButton variant="secondary" onClick={closeAttachmentDialog}>
                Close
              </TeacherButton>
            </div>
          </div>
        </div>
      )}
    </TeacherPageShell>
  );
};

export default StudentEvents;

