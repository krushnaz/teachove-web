import React, { useState, useEffect } from 'react';
import { eventService } from '../../../services/eventService';
import { useAuth } from '../../../contexts/AuthContext';
import { Event } from '../../../services/eventService';
import { toast } from 'react-toastify';
import { Calendar, Clock, CalendarDays, History } from 'lucide-react';
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
  TeacherPanel,
  TeacherEmpty,
  TeacherCardGrid,
} from '../shared';

const Events: React.FC = () => {
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

  // Fetch events for the school
  useEffect(() => {
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
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events');
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    if (user?.schoolId) {
      fetchEvents();
    }
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
        
        // Check if events are upcoming or past
        const isAUpcoming = dateA >= today;
        const isBUpcoming = dateB >= today;
        
        // If one is upcoming and one is past, upcoming comes first
        if (isAUpcoming && !isBUpcoming) return -1;
        if (!isAUpcoming && isBUpcoming) return 1;
        
        // If both are upcoming, sort by date ascending (earliest first)
        if (isAUpcoming && isBUpcoming) {
          return dateA.getTime() - dateB.getTime();
        }
        
        // If both are past, sort by date descending (most recent first)
        if (!isAUpcoming && !isBUpcoming) {
          return dateB.getTime() - dateA.getTime();
        }
        
        // Fallback to date ascending
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
    
    // Handle Firebase timestamp format
    if (createdDate._seconds) {
      const date = new Date(createdDate._seconds * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    // Handle regular date string
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

  if (loading) {
    return <TeacherLoading message="Loading events..." />;
  }

  if (error) {
    return (
      <TeacherError
        title="Error Loading Events"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const thisWeekCount = events.filter((event) => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  return (
    <TeacherPageShell>
      <TeacherPageHeader title="Events" description="Browse upcoming and past school events." />

      <TeacherStatsGrid>
        <TeacherStatCard title="Total Events" value={events.length} icon={Calendar} color="indigo" />
        <TeacherStatCard
          title="Upcoming"
          value={events.filter((event) => isUpcoming(event.date)).length}
          icon={Clock}
          color="emerald"
        />
        <TeacherStatCard title="This Week" value={thisWeekCount} icon={CalendarDays} color="amber" />
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
          onChange={(v) => setFilterType(v as typeof filterType)}
          className="sm:w-44"
          options={[
            { value: 'all', label: 'All Events' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'past', label: 'Past Events' },
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

      {/* Events Grid */}
      <div className="space-y-8">
        {(() => {
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
            <>
              {/* Upcoming Events Section */}
              {upcomingEvents.length > 0 && (
                <div>
                  <div className="flex items-center mb-6">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Events</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {upcomingEvents.length} event{upcomingEvents.length !== 1 ? 's' : ''} scheduled
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <TeacherCardGrid cols={3}>
                    {upcomingEvents.map((event) => {
                      const eventStatus = getEventStatus(event.date);
                      return (
                        <div key={event.eventId} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
                          {/* Event Header */}
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white line-clamp-2">{event.title}</h3>
                                <p className="text-blue-100 text-sm mt-1">
                                  {formatDate(event.date)} • {formatTime(event.time)}
                                </p>
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${eventStatus.color}`}>
                                {eventStatus.text}
                              </span>
                            </div>
                          </div>

                          {/* Event Content */}
                          <div className="p-6">
                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                              {event.description}
                            </p>
                            
                            {/* Event Details */}
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(event.date)}
                              </div>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatTime(event.time)}
                              </div>
                              {event.filePath && (
                                <button 
                                  onClick={() => handleAttachmentClick(event.filePath!)}
                                  className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                  View Attachment
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Event Footer */}
                          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Created {formatCreatedDate(event.createdDate)}
                              </span>
                              <button 
                                onClick={() => handleViewDetails(event)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </TeacherCardGrid>
                </div>
              )}

              {/* Past Events Section */}
              {pastEvents.length > 0 && (
                <div>
                  <div className="flex items-center mb-6">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Past Events</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {pastEvents.length} event{pastEvents.length !== 1 ? 's' : ''} completed
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <TeacherCardGrid cols={3}>
                    {pastEvents.map((event) => {
                      const eventStatus = getEventStatus(event.date);
                      return (
                        <div key={event.eventId} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200 opacity-75">
                          {/* Event Header */}
                          <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white line-clamp-2">{event.title}</h3>
                                <p className="text-gray-200 text-sm mt-1">
                                  {formatDate(event.date)} • {formatTime(event.time)}
                                </p>
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${eventStatus.color}`}>
                                {eventStatus.text}
                              </span>
                            </div>
                          </div>

                          {/* Event Content */}
                          <div className="p-6">
                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                              {event.description}
                            </p>
                            
                            {/* Event Details */}
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(event.date)}
                              </div>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatTime(event.time)}
                              </div>
                              {event.filePath && (
                                <button 
                                  onClick={() => handleAttachmentClick(event.filePath!)}
                                  className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                  View Attachment
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Event Footer */}
                          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Created {formatCreatedDate(event.createdDate)}
                              </span>
                              <button 
                                onClick={() => handleViewDetails(event)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </TeacherCardGrid>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Empty State */}
      {filteredAndSortedEvents.length === 0 && !loading && (
        <TeacherPanel>
          <TeacherEmpty
            icon={Calendar}
            title="No events found"
            description={
              events.length === 0
                ? 'No events have been created yet.'
                : 'Try adjusting your search criteria or filters.'
            }
          />
        </TeacherPanel>
      )}

      {/* Event Details Dialog */}
      {showEventDialog && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">{selectedEvent.title}</h3>
                <button
                  onClick={closeEventDialog}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date & Time</h4>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(selectedEvent.date)} at {formatTime(selectedEvent.time)}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h4>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {selectedEvent.description}
                  </p>
                </div>
                
                {selectedEvent.filePath && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Attachment</h4>
                    <button
                      onClick={() => handleAttachmentClick(selectedEvent.filePath!)}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      View Attachment
                    </button>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created</h4>
                  <p className="text-gray-900 dark:text-white">
                    {formatCreatedDate(selectedEvent.createdDate)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg flex justify-end">
              <button
                onClick={closeEventDialog}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Preview Dialog */}
      {showAttachmentDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attachment Preview</h3>
                <button
                  onClick={closeAttachmentDialog}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Attachment Preview</h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Click the button below to open the attachment in a new tab.
                </p>
                <a
                  href={attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open Attachment
                </a>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg flex justify-end">
              <button
                onClick={closeAttachmentDialog}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherPageShell>
  );
};

export default Events;
