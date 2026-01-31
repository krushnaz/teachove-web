import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { eventService, Event, CreateEventRequest, UpdateEventRequest } from '../../../services/eventService';

interface EventForm {
  title: string;
  description: string;
  date: string;
  time: string;
  file?: File;
  isTemplate: boolean;
}

const Events: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [templates, setTemplates] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'events' | 'templates'>('all');
  const [isAddSidebarOpen, setIsAddSidebarOpen] = useState(false);
  const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
  const [isTemplatesSidebarOpen, setIsTemplatesSidebarOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAttachmentPreviewOpen, setIsAttachmentPreviewOpen] = useState(false);
  // Add loading states for operations
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [isAddingFromTemplate, setIsAddingFromTemplate] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventForm>({
    title: '',
    description: '',
    date: '',
    time: '',
    file: undefined,
    isTemplate: false
  });
  // Add state for attachment loading error
  const [attachmentLoadError, setAttachmentLoadError] = useState(false);

  // Predefined templates
  const predefinedTemplates = [
    {
      eventId: 'template-1',
      schoolId: user?.schoolId || '',
      title: 'Annual Sports Day',
      description: 'Annual sports competition with various athletic events, games, and awards ceremony.',
      date: '2025-03-15',
      time: '09:00',
      filePath: '',
      createdDate: new Date().toISOString(),
      isTemplate: true
    },
    {
      eventId: 'template-2',
      schoolId: user?.schoolId || '',
      title: 'Science Exhibition',
      description: 'Student science projects showcase with interactive demonstrations and competitions.',
      date: '2025-04-20',
      time: '10:00',
      filePath: '',
      createdDate: new Date().toISOString(),
      isTemplate: true
    },
    {
      eventId: 'template-3',
      schoolId: user?.schoolId || '',
      title: 'Cultural Festival',
      description: 'Traditional dance, music, drama performances celebrating cultural diversity.',
      date: '2025-05-10',
      time: '18:00',
      filePath: '',
      createdDate: new Date().toISOString(),
      isTemplate: true
    },
    {
      eventId: 'template-4',
      schoolId: user?.schoolId || '',
      title: 'Parent-Teacher Meeting',
      description: 'Scheduled meeting between parents and teachers to discuss student progress.',
      date: '2025-06-15',
      time: '14:00',
      filePath: '',
      createdDate: new Date().toISOString(),
      isTemplate: true
    },
    {
      eventId: 'template-5',
      schoolId: user?.schoolId || '',
      title: 'Graduation Ceremony',
      description: 'Annual graduation ceremony for outgoing students with awards and certificates.',
      date: '2025-07-25',
      time: '16:00',
      filePath: '',
      createdDate: new Date().toISOString(),
      isTemplate: true
    }
  ];

  // Load events from API
  useEffect(() => {
    const loadEvents = async () => {
      if (!user?.schoolId) return;
      
      try {
        setLoading(true);
        const response = await eventService.getEvents(user.schoolId);
        
        // Filter out any invalid events that don't have required properties
        const validEvents = (response.events || []).filter(event => 
          event && 
          event.title && 
          event.description && 
          event.date && 
          event.time &&
          event.eventId
        );
        
        setEvents(validEvents);
    setTemplates(predefinedTemplates);
      } catch (error) {
        console.error('Error loading events:', error);
        // Show error toast
        const errorToast = document.createElement('div');
        errorToast.className = `${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
        errorToast.textContent = 'Failed to load events';
        document.body.appendChild(errorToast);
        setTimeout(() => errorToast.remove(), 3000);
        
        // Set empty arrays on error to prevent undefined errors
        setEvents([]);
        setTemplates(predefinedTemplates);
      } finally {
    setLoading(false);
      }
    };

    loadEvents();
  }, [user?.schoolId]);

  const filteredEvents = events.filter(event => {
    // Add null/undefined checks for all required properties
    if (!event || !event.title || !event.description || !event.date || !event.time) {
      return false;
    }
    
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'events' && !event.isTemplate) ||
                         (filterType === 'templates' && event.isTemplate);
    return matchesSearch && matchesFilter;
  });

  const filteredTemplates = templates.filter(template => {
    // Add null/undefined checks for all required properties
    if (!template || !template.title || !template.description || !template.date || !template.time) {
      return false;
    }
    
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      file: undefined,
      isTemplate: false
    });
    setIsAddSidebarOpen(true);
  };

  const handleTemplatesClick = () => {
    setIsTemplatesSidebarOpen(true);
  };

  const handleAddFromTemplate = async (template: Event) => {
    if (!user?.schoolId) return;

    try {
      setIsAddingFromTemplate(true);
      const eventData: CreateEventRequest = {
        schoolId: user.schoolId,
        title: template.title,
        description: template.description,
        date: template.date,
        time: template.time,
        file: null
      };

      const response = await eventService.createEvent(eventData);
      setEvents(prev => [response.event, ...prev]);
    
    // Show success toast
    const successToast = document.createElement('div');
    successToast.className = `${isDarkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-50 text-green-700 border-green-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
    successToast.textContent = 'Event added successfully!';
    document.body.appendChild(successToast);
    setTimeout(() => successToast.remove(), 3000);
    } catch (error) {
      console.error('Error adding event from template:', error);
      // Show error toast
      const errorToast = document.createElement('div');
      errorToast.className = `${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
      errorToast.textContent = 'Failed to add event';
      document.body.appendChild(errorToast);
      setTimeout(() => errorToast.remove(), 3000);
    } finally {
      setIsAddingFromTemplate(false);
    }
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      file: undefined,
      isTemplate: event.isTemplate || false
    });
    setIsEditSidebarOpen(true);
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const handleDeleteEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!formData.title || !formData.description || !formData.date || !formData.time || !user?.schoolId) {
      const errorToast = document.createElement('div');
      errorToast.className = `${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
      
      // More specific error messages
      let errorMessage = 'Please fill in all required fields';
      if (!formData.title) errorMessage = 'Title is required';
      else if (!formData.description) errorMessage = 'Description is required';
      else if (!formData.date) errorMessage = 'Date is required';
      else if (!formData.time) errorMessage = 'Time is required';
      
      errorToast.textContent = errorMessage;
      document.body.appendChild(errorToast);
      setTimeout(() => errorToast.remove(), 3000);
      return;
    }

    try {
      if (selectedEvent) {
        setIsUpdatingEvent(true);
        // Update existing event
        const updateData: UpdateEventRequest = {
          schoolId: user.schoolId,
          eventId: selectedEvent.eventId!,
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
          file: formData.file || null
    };

        const response = await eventService.updateEvent(updateData);
        setEvents(prev => prev.map(e => e.eventId === selectedEvent.eventId ? response.event : e));
    } else {
        setIsAddingEvent(true);
        // Create new event
        const createData: CreateEventRequest = {
          schoolId: user.schoolId,
          title: formData.title,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          file: formData.file || null
        };

        const response = await eventService.createEvent(createData);
        setEvents(prev => [response.event, ...prev]);
    }

    setIsAddSidebarOpen(false);
    setIsEditSidebarOpen(false);
    setSelectedEvent(null);

    const successToast = document.createElement('div');
    successToast.className = `${isDarkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-50 text-green-700 border-green-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
    successToast.textContent = selectedEvent ? 'Event updated successfully!' : 'Event added successfully!';
    document.body.appendChild(successToast);
    setTimeout(() => successToast.remove(), 3000);
    } catch (error) {
      console.error('Error saving event:', error);
      // Show error toast
      const errorToast = document.createElement('div');
      errorToast.className = `${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
      errorToast.textContent = 'Failed to save event';
      document.body.appendChild(errorToast);
      setTimeout(() => errorToast.remove(), 3000);
    } finally {
      setIsAddingEvent(false);
      setIsUpdatingEvent(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedEvent || !user?.schoolId) return;

    try {
      setIsDeletingEvent(true);
      await eventService.deleteEvent(user.schoolId, selectedEvent.eventId!);
        setEvents(prev => prev.filter(e => e.eventId !== selectedEvent.eventId));
      
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);

      const successToast = document.createElement('div');
      successToast.className = `${isDarkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-50 text-green-700 border-green-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
      successToast.textContent = 'Event deleted successfully!';
      document.body.appendChild(successToast);
      setTimeout(() => successToast.remove(), 3000);
    } catch (error) {
      console.error('Error deleting event:', error);
      // Show error toast
      const errorToast = document.createElement('div');
      errorToast.className = `${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
      errorToast.textContent = 'Failed to delete event';
      document.body.appendChild(errorToast);
      setTimeout(() => errorToast.remove(), 3000);
    } finally {
      setIsDeletingEvent(false);
    }
  };

  const handleAttachmentPreview = (event: Event) => {
    setSelectedEvent(event);
    setAttachmentLoadError(false);
    setIsAttachmentPreviewOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6 transition-colors duration-300`}>
        <div className="w-full mx-auto space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-3">
              <div className={`h-10 w-64 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
              <div className={`h-5 w-96 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
            </div>
            <div className="flex gap-3">
              <div className={`h-12 w-32 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
              <div className={`h-12 w-40 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-32 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className={`h-16 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />

          {/* Events Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`h-64 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <div className="w-full mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className={`relative overflow-hidden rounded-xl p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-2">
                Events Hub
              </h1>
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Plan, organize, and celebrate school moments
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleTemplatesClick}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                } hover:bg-gray-100 active:scale-95`}
              >
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Templates</span>
              </button>
              <button
                onClick={handleAddEvent}
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:translate-y-0 transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Event</span>
              </button>
            </div>
          </div>
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-gradient-to-tr from-pink-500/10 to-orange-500/10 rounded-full blur-3xl" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              label: 'Total Events', 
              value: events.length, 
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              ),
              color: 'text-blue-600',
              bg: 'bg-blue-500/10',
              border: 'border-blue-200/50'
            },
            { 
              label: 'Templates', 
              value: templates.length, 
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              ),
              color: 'text-green-600',
              bg: 'bg-green-500/10',
              border: 'border-green-200/50'
            },
            { 
              label: 'This Month', 
              value: events.filter(e => e && e.date && new Date(e.date).getMonth() === new Date().getMonth()).length, 
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              ),
              color: 'text-purple-600',
              bg: 'bg-purple-500/10',
              border: 'border-purple-200/50'
            },
            { 
              label: 'Upcoming', 
              value: events.filter(e => e && e.date && new Date(e.date) > new Date()).length, 
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              ),
              color: 'text-orange-600',
              bg: 'bg-orange-500/10',
              border: 'border-orange-200/50'
            },
          ].map((stat, idx) => (
            <div key={idx} className={`group p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white ' + stat.border} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{stat.label}</p>
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                </div>
                <div className={`p-3.5 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-105 transition-transform duration-300`}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {stat.icon}
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex flex-col md:flex-row gap-4 p-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search events by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-xl border-0 ring-1 ring-inset ${
                  isDarkMode 
                    ? 'bg-gray-900/50 ring-gray-700 text-white placeholder-gray-500 focus:ring-blue-500' 
                    : 'bg-gray-50 ring-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:bg-white'
                } focus:ring-2 focus:ring-inset transition-all`}
              />
            </div>
            <div className="md:w-64">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className={`w-full pl-11 pr-10 py-3 rounded-xl border-0 ring-1 ring-inset appearance-none ${
                    isDarkMode 
                      ? 'bg-gray-900/50 ring-gray-700 text-white focus:ring-blue-500' 
                      : 'bg-gray-50 ring-gray-200 text-gray-900 focus:ring-blue-500 focus:bg-white'
                  } focus:ring-2 focus:ring-inset transition-all cursor-pointer`}
                >
                  <option value="all">All Entries</option>
                  <option value="events">Events Only</option>
                  <option value="templates">Templates Only</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Events & Schedule ({filteredEvents.length})
            </h2>
          </div>

          {filteredEvents.length === 0 ? (
            <div className={`flex flex-col items-center justify-center p-16 rounded-xl border border-dashed text-center ${isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-gray-50/50'}`}>
              <div className={`mb-6 p-6 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border border-gray-100`}>
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                No events found
              </h3>
              <p className={`max-w-md mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchTerm ? 'Try adjusting your search terms to find what you are looking for.' : 'Get started by creating a new event or choosing from our templates.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAddEvent}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                >
                  Create First Event
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div 
                  key={event.eventId} 
                  className={`group relative flex flex-col p-6 rounded-xl border transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-500' 
                      : 'bg-white border-gray-200 hover:border-blue-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-lg text-center min-w-[70px] ${
                      isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-blue-50 text-blue-700'
                    }`}>
                      <span className="block text-xs font-bold uppercase tracking-wider opacity-70">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="block text-2xl font-extrabold leading-none mt-1">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    {event.isTemplate && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isDarkMode ? 'bg-purple-900/50 text-purple-200 border border-purple-700' : 'bg-purple-100 text-purple-700 border border-purple-200'
                      }`}>
                        Template
                      </span>
                    )}
                  </div>

                  <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'} group-hover:text-blue-600 transition-colors`}>
                    {event.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm opacity-80">
                    <div className={`flex items-center gap-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatTime(event.time)}
                    </div>
                  </div>

                  <p className={`text-sm mb-6 flex-grow line-clamp-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {event.description}
                  </p>

                  <div className="flex items-center gap-2 pt-4 border-t border-dashed mt-auto ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}">
                    <button
                      onClick={() => handleViewEvent(event)}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors ${
                        isDarkMode 
                          ? 'bg-blue-600/10 text-blue-300 hover:bg-blue-600 hover:text-white' 
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleEditEvent(event)}
                      className={`p-2.5 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                          : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event)}
                      className={`p-2.5 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-red-300 hover:bg-red-900/30' 
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Templates Sidebar */}
        {isTemplatesSidebarOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" onClick={() => setIsTemplatesSidebarOpen(false)} />
            <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10 pointer-events-none">
              <div className={`w-screen max-w-md transform transition-transform duration-500 ease-in-out pointer-events-auto h-full flex flex-col ${isDarkMode ? 'bg-gray-900 border-l border-gray-800' : 'bg-white shadow-2xl'}`}>
                
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Event Templates
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      Quickly create events from presets
                    </p>
                  </div>
                  <button
                    onClick={() => setIsTemplatesSidebarOpen(false)}
                    className={`p-2 rounded-full transition-colors ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Templates List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {filteredTemplates.map((template) => (
                    <div 
                      key={template.eventId} 
                      className={`group p-5 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800' 
                          : 'bg-white border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      <div className="mb-3">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {template.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-600'
                          }`}>
                            Template
                          </span>
                        </div>
                        <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {template.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4 text-xs font-medium opacity-70">
                         <div className={`flex items-center gap-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(template.date)}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatTime(template.time)}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            handleAddFromTemplate(template);
                            setIsTemplatesSidebarOpen(false);
                          }}
                          disabled={isAddingFromTemplate}
                          className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none ${
                            isDarkMode 
                              ? 'bg-blue-600 hover:bg-blue-500' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {isAddingFromTemplate ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Adding...
                            </span>
                          ) : (
                            'Use Template'
                          )}
                        </button>
                        <button
                          onClick={() => {
                            handleViewEvent(template);
                            setIsTemplatesSidebarOpen(false);
                          }}
                          className={`px-3 py-2 rounded-xl transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Event Sidebar */}
        {isAddSidebarOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" onClick={() => setIsAddSidebarOpen(false)} />
            <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10 pointer-events-none">
              <div className={`w-screen max-w-md transform transition-transform duration-500 ease-in-out pointer-events-auto h-full flex flex-col ${isDarkMode ? 'bg-gray-900 border-l border-gray-800' : 'bg-white border-l border-gray-200'}`}>
                
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedEvent ? 'Edit Event' : 'New Event'}
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {selectedEvent ? 'Update event details' : 'Fill in the details below'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddSidebarOpen(false)}
                    className={`p-2 rounded-full transition-colors ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="title" className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Event Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset transition-all ${
                          isDarkMode 
                            ? 'bg-gray-800 ring-gray-700 text-white placeholder-gray-500 focus:ring-blue-500' 
                            : 'bg-gray-50 ring-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:bg-white'
                        } focus:ring-2 focus:ring-inset`}
                        placeholder="e.g., Annual Sports Day"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        className={`w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset transition-all ${
                          isDarkMode 
                            ? 'bg-gray-800 ring-gray-700 text-white placeholder-gray-500 focus:ring-blue-500' 
                            : 'bg-gray-50 ring-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:bg-white'
                        } focus:ring-2 focus:ring-inset`}
                        placeholder="Describe the event..."
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="date" className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="date"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          className={`w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset transition-all ${
                            isDarkMode 
                              ? 'bg-gray-800 ring-gray-700 text-white placeholder-gray-500 focus:ring-blue-500' 
                              : 'bg-gray-50 ring-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:bg-white'
                          } focus:ring-2 focus:ring-inset`}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="time" className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          id="time"
                          value={formData.time}
                          onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                          className={`w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset transition-all ${
                            isDarkMode 
                              ? 'bg-gray-800 ring-gray-700 text-white placeholder-gray-500 focus:ring-blue-500' 
                              : 'bg-gray-50 ring-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:bg-white'
                          } focus:ring-2 focus:ring-inset`}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="file" className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Attachment (Optional)
                      </label>
                      <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl ${
                        isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        <div className="space-y-1 text-center">
                          <svg className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className={`flex text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <label htmlFor="file" className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                              <span>Upload a file</span>
                              <input id="file" name="file" type="file" className="sr-only" onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files?.[0] }))} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            PDF, PNG, JPG up to 10MB
                          </p>
                          {formData.file && (
                            <p className="text-sm text-green-500 font-medium mt-2">
                              Selected: {formData.file.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className={`p-6 border-t ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsAddSidebarOpen(false)}
                      disabled={isAddingEvent || isUpdatingEvent}
                      className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white' 
                          : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEvent}
                      disabled={isAddingEvent || isUpdatingEvent}
                      className={`flex-[2] px-4 py-3 text-sm font-semibold rounded-xl text-white shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none ${
                        isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-500' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {(isAddingEvent || isUpdatingEvent) ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        selectedEvent ? 'Update Event' : 'Create Event'
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Edit Event Sidebar */}
        {isEditSidebarOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" onClick={() => setIsEditSidebarOpen(false)} />
            <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10 pointer-events-none">
              <div className={`w-screen max-w-md transform transition-transform duration-500 ease-in-out pointer-events-auto h-full flex flex-col ${isDarkMode ? 'bg-gray-900 border-l border-gray-800' : 'bg-white border-l border-gray-200'}`}>
                
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Edit Event
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      Update event details
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditSidebarOpen(false)}
                    className={`p-2 rounded-full transition-colors ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="editTitle" className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Event Title
                      </label>
                      <input
                        type="text"
                        id="editTitle"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset transition-all ${
                          isDarkMode 
                            ? 'bg-gray-800 ring-gray-700 text-white placeholder-gray-500 focus:ring-blue-500' 
                            : 'bg-gray-50 ring-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:bg-white'
                        } focus:ring-2 focus:ring-inset`}
                      />
                    </div>
                    <div>
                      <label htmlFor="editDescription" className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Description
                      </label>
                      <textarea
                        id="editDescription"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        className={`w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset transition-all ${
                          isDarkMode 
                            ? 'bg-gray-800 ring-gray-700 text-white placeholder-gray-500 focus:ring-blue-500' 
                            : 'bg-gray-50 ring-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:bg-white'
                        } focus:ring-2 focus:ring-inset`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="editDate" className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Date
                        </label>
                        <input
                          type="date"
                          id="editDate"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          className={`w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset transition-all ${
                            isDarkMode 
                              ? 'bg-gray-800 ring-gray-700 text-white placeholder-gray-500 focus:ring-blue-500' 
                              : 'bg-gray-50 ring-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:bg-white'
                          } focus:ring-2 focus:ring-inset`}
                        />
                      </div>
                      <div>
                        <label htmlFor="editTime" className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Time
                        </label>
                        <input
                          type="time"
                          id="editTime"
                          value={formData.time}
                          onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                          className={`w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset transition-all ${
                            isDarkMode 
                              ? 'bg-gray-800 ring-gray-700 text-white placeholder-gray-500 focus:ring-blue-500' 
                              : 'bg-gray-50 ring-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:bg-white'
                          } focus:ring-2 focus:ring-inset`}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="editFile" className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Attachment (Optional)
                      </label>
                      <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl ${
                        isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        <div className="space-y-1 text-center">
                          <svg className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className={`flex text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <label htmlFor="editFile" className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                              <span>Change file</span>
                              <input id="editFile" name="editFile" type="file" className="sr-only" onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files?.[0] }))} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            PDF, PNG, JPG up to 10MB
                          </p>
                          {formData.file && (
                            <p className="text-sm text-green-500 font-medium mt-2">
                              Selected: {formData.file.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className={`p-6 border-t ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditSidebarOpen(false)}
                      className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white' 
                          : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEvent}
                      className={`flex-[2] px-4 py-3 text-sm font-semibold rounded-xl text-white shadow-lg shadow-blue-500/25 transition-all active:scale-95 ${
                        isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-500' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* View Event Dialog */}
        {isViewDialogOpen && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" onClick={() => setIsViewDialogOpen(false)} />
            <div className={`relative w-full max-w-2xl transform overflow-hidden rounded-xl border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              
              {/* Header */}
              <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedEvent.title}
                    </h2>
                    {selectedEvent.isTemplate && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        isDarkMode 
                          ? 'bg-blue-900/30 text-blue-300 border-blue-800' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        Template
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsViewDialogOpen(false)}
                  className={`p-2 rounded-full transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Description
                      </h3>
                      <p className={`text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedEvent.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                     <div className={`p-5 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} space-y-4`}>
                      <div>
                        <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Date & Time
                        </h3>
                         <div className={`flex items-center gap-2 mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                           <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">{formatDate(selectedEvent.date)}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                           <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">{formatTime(selectedEvent.time)}</span>
                        </div>
                      </div>

                      {selectedEvent.filePath && (
                        <div>
                          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Attachment
                          </h3>
                          <button
                            onClick={() => {
                              setIsViewDialogOpen(false);
                              handleAttachmentPreview(selectedEvent);
                            }}
                            className="flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors group"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span className="group-hover:underline">View File</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={`px-6 py-4 flex justify-end gap-3 border-t ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-gray-50'}`}>
                <button
                  onClick={() => setIsViewDialogOpen(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Close
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleEditEvent(selectedEvent);
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                      isDarkMode 
                        ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Delete Event Dialog */}
        {isDeleteDialogOpen && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" onClick={() => setIsDeleteDialogOpen(false)} />
            <div className={`relative w-full max-w-md transform overflow-hidden rounded-xl border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              
              <div className="p-8 text-center">
                 <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-6 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                  <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Delete Event?
                </h3>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Are you sure you want to delete <span className="font-semibold text-current">"{selectedEvent.title}"</span>? This action cannot be undone.
                </p>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={isDeletingEvent}
                    className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={isDeletingEvent}
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/25 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
                  >
                    {isDeletingEvent ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      'Delete Event'
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Attachment Preview Dialog */}
        {isAttachmentPreviewOpen && selectedEvent && selectedEvent.filePath && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-md transition-opacity" onClick={() => setIsAttachmentPreviewOpen(false)} />
            <div className={`relative w-full max-w-5xl h-[85vh] rounded-xl border flex flex-col overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              
              {/* Header */}
              <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                   <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedEvent.title}
                    </h2>
                     <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Previewing attachment
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedEvent.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 text-sm font-semibold rounded-xl text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2 ${
                      isDarkMode 
                        ? 'bg-blue-600 hover:bg-blue-500' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                  <button
                    onClick={() => {
                      setIsAttachmentPreviewOpen(false);
                      setAttachmentLoadError(false);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className={`flex-1 overflow-auto flex items-center justify-center p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                {attachmentLoadError ? (
                  <div className="text-center max-w-md">
                    <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full mb-6 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                      <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Preview Unavailable
                    </h3>
                    <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      We couldn't preview this file directly. Please download it to view the content.
                    </p>
                    <a
                      href={selectedEvent.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-500/20"
                    >
                      Download File
                    </a>
                  </div>
                ) : selectedEvent.filePath.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                  <img
                    src={selectedEvent.filePath}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                    onError={() => setAttachmentLoadError(true)}
                    onLoad={() => setAttachmentLoadError(false)}
                  />
                ) : selectedEvent.filePath.toLowerCase().match(/\.(pdf)$/i) ? (
                  <iframe
                    src={selectedEvent.filePath}
                    className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700"
                    title="PDF Preview"
                    onError={() => setAttachmentLoadError(true)}
                    onLoad={() => setAttachmentLoadError(false)}
                  />
                ) : (
                   <div className="text-center max-w-md">
                    <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-xl mb-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      <svg className="h-12 w-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      File Type Not Supported
                    </h3>
                    <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      This file format cannot be previewed in the browser.
                    </p>
                    <a
                      href={selectedEvent.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-500/20"
                    >
                      Download to View
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
