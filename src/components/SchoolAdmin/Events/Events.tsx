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
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <style>
          {`
            @keyframes shimmer {
              0% { background-position: -200px 0; }
              100% { background-position: calc(200px + 100%) 0; }
            }
            .shimmer {
              background: linear-gradient(90deg, 
                transparent, 
                ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}, 
                transparent
              );
              background-size: 200px 100%;
              animation: shimmer 1.5s infinite ease-in-out;
            }
          `}
        </style>
        <div className="p-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <div className={`h-8 w-64 rounded-lg mb-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
              <div className={`h-5 w-96 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <div className={`h-12 w-32 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
              <div className={`h-12 w-32 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`h-4 w-20 rounded mb-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                    <div className={`h-8 w-8 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                  </div>
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer w-12 h-12`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className={`p-6 rounded-xl shadow-lg mb-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className={`h-10 w-full rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
              </div>
              <div className="sm:w-48">
                <div className={`h-10 w-full rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
              </div>
            </div>
          </div>

          {/* Events Grid Skeleton */}
          <div className="mb-4">
            <div className={`h-6 w-48 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`p-6 rounded-xl shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className={`h-6 w-3/4 rounded mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                      <div className={`h-4 w-full rounded mb-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                      <div className={`h-4 w-2/3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className={`h-4 w-24 rounded mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                  </div>
                  
                  <div className="mb-4">
                    <div className={`h-4 w-20 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                  </div>

                  <div className="flex gap-2">
                    <div className={`h-10 w-20 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                    <div className={`h-10 w-10 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                    <div className={`h-10 w-10 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Events Management
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Create, manage, and organize school events and templates
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <button
              onClick={handleTemplatesClick}
              className={`px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Templates
            </button>
          <button
            onClick={handleAddEvent}
              className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Event
          </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Events
                </p>
                <p className="text-2xl font-bold text-blue-600">{events.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Templates
                </p>
                <p className="text-2xl font-bold text-green-600">{templates.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  This Month
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {events.filter(e => e && e.date && new Date(e.date).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Upcoming
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {events.filter(e => e && e.date && new Date(e.date) > new Date()).length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-6 rounded-xl shadow-lg mb-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div className="sm:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="all">All Events</option>
                <option value="events">Events Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Section */}
          <div>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              School Events ({filteredEvents.length})
            </h2>
            {filteredEvents.length === 0 ? (
              <div className={`p-12 text-center rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  No events found
                </h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first event or using a template'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <div key={event.eventId} className={`p-6 rounded-xl shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-xl transition-all duration-200`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                          {event.title}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-3`}>
                          {event.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-2 mb-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                      {formatDate(event.date)}
                  </div>
                  
                  <div className={`flex items-center gap-2 mb-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                      {formatTime(event.time)}
                  </div>

                    {event.filePath && (
                      <div 
                        className={`flex items-center gap-2 mb-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} cursor-pointer hover:text-blue-500 transition-colors`}
                        onClick={() => handleAttachmentPreview(event)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="underline">Attachment</span>
                      </div>
                    )}

                  <div className="flex gap-2">
                    <button
                        onClick={() => handleViewEvent(event)}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                        View
                    </button>
                    <button
                        onClick={() => handleEditEvent(event)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                            : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                            : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsTemplatesSidebarOpen(false)}></div>
            <div className={`absolute right-0 top-0 h-full w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Event Templates
            </h2>
                  <button
                    onClick={() => setIsTemplatesSidebarOpen(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  </button>
                </div>

                {/* Templates List */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    {filteredTemplates.map((template) => (
                      <div key={template.eventId} className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                              {template.title}
                        </h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                              {template.description}
                        </p>
                      </div>
                    </div>
                    
                        <div className={`flex items-center gap-2 mb-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                          {formatDate(template.date)}
                    </div>
                    
                        <div className={`flex items-center gap-2 mb-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                          {formatTime(template.time)}
                    </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              handleAddFromTemplate(template);
                              setIsTemplatesSidebarOpen(false);
                            }}
                            disabled={isAddingFromTemplate}
                            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                              isDarkMode 
                                ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white' 
                                : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white'
                            } disabled:cursor-not-allowed`}
                          >
                            {isAddingFromTemplate ? (
                              <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adding...
                              </>
                            ) : (
                              'Add Event'
                            )}
                          </button>
                          <button
                            onClick={() => {
                              handleViewEvent(template);
                              setIsTemplatesSidebarOpen(false);
                            }}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              isDarkMode 
                                ? 'text-gray-400 hover:text-white hover:bg-gray-600' 
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      </div>
                    )}

        {/* Add Event Sidebar */}
        {isAddSidebarOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsAddSidebarOpen(false)}></div>
            <div className={`absolute right-0 top-0 h-full w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedEvent ? 'Edit Event' : 'Add New Event'}
                  </h2>
                      <button
                    onClick={() => setIsAddSidebarOpen(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="date" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="time" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        id="time"
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="file" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Attachment (Optional)
                      </label>
                      <input
                        type="file"
                        id="file"
                        onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files?.[0] }))}
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsAddSidebarOpen(false)}
                        disabled={isAddingEvent || isUpdatingEvent}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-900'
                        } disabled:cursor-not-allowed`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEvent}
                        disabled={isAddingEvent || isUpdatingEvent}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                          isDarkMode 
                            ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white' 
                            : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white'
                        } disabled:cursor-not-allowed`}
                      >
                        {(isAddingEvent || isUpdatingEvent) && (
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        {selectedEvent ? (isUpdatingEvent ? 'Updating...' : 'Update Event') : (isAddingEvent ? 'Adding...' : 'Save Event')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Event Sidebar */}
        {isEditSidebarOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsEditSidebarOpen(false)}></div>
            <div className={`absolute right-0 top-0 h-full w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Edit Event
                  </h2>
                  <button
                    onClick={() => setIsEditSidebarOpen(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="editTitle" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Title
                      </label>
                      <input
                        type="text"
                        id="editTitle"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>
                    <div>
                      <label htmlFor="editDescription" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Description
                      </label>
                      <textarea
                        id="editDescription"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>
                    <div>
                      <label htmlFor="editDate" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Date
                      </label>
                      <input
                        type="date"
                        id="editDate"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>
                    <div>
                      <label htmlFor="editTime" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Time
                      </label>
                      <input
                        type="time"
                        id="editTime"
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>
                    <div>
                      <label htmlFor="editFile" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Attachment (Optional)
                      </label>
                      <input
                        type="file"
                        id="editFile"
                        onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files?.[0] }))}
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditSidebarOpen(false)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEvent}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        Save Event
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Event Dialog */}
        {isViewDialogOpen && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsViewDialogOpen(false)}></div>
            <div className={`relative w-full max-w-lg mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-h-[90vh] overflow-hidden`}>
              <div className="flex flex-col">
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedEvent.title}
                  </h2>
                      <button
                    onClick={() => setIsViewDialogOpen(false)}
                    className={`p-2 rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                        Description
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {selectedEvent.description}
                      </p>
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                        Date & Time
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatDate(selectedEvent.date)} at {formatTime(selectedEvent.time)}
                      </p>
                    </div>
                    {selectedEvent.filePath && (
                      <div>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                          Attachment
                        </h3>
                      <button
                          onClick={() => {
                            setIsViewDialogOpen(false);
                            handleAttachmentPreview(selectedEvent);
                          }}
                          className={`text-sm underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                        >
                          View Attachment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Event Dialog */}
        {isDeleteDialogOpen && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsDeleteDialogOpen(false)}></div>
            <div className={`relative w-full max-w-md mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl`}>
              <div className="flex flex-col">
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Confirm Deletion
                  </h2>
                  <button
                    onClick={() => setIsDeleteDialogOpen(false)}
                    className={`p-2 rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-4">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Are you sure you want to delete the event "{selectedEvent.title}"? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsDeleteDialogOpen(false)}
                        disabled={isDeletingEvent}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-900'
                        } disabled:cursor-not-allowed`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmDelete}
                        disabled={isDeletingEvent}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                          isDarkMode 
                            ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white' 
                            : 'bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white'
                        } disabled:cursor-not-allowed`}
                      >
                        {isDeletingEvent && (
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        {isDeletingEvent ? 'Deleting...' : 'Delete Event'}
                      </button>
                  </div>
                  </div>
                </div>
              </div>
            </div>
              </div>
            )}

        {/* Attachment Preview Dialog */}
        {isAttachmentPreviewOpen && selectedEvent && selectedEvent.filePath && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-75" onClick={() => setIsAttachmentPreviewOpen(false)}></div>
            <div className={`relative w-full max-w-4xl mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-h-[90vh] overflow-hidden`}>
              <div className="flex flex-col">
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Attachment Preview - {selectedEvent.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <a
                      href={selectedEvent.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      Download
                    </a>
                    <button
                      onClick={() => {
                        setIsAttachmentPreviewOpen(false);
                        setAttachmentLoadError(false);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
          </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                  {attachmentLoadError ? (
                    // Error state
                    <div className="p-6 flex items-center justify-center min-h-0">
                      <div className="text-center">
                        <svg className="w-24 h-24 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Failed to Load Attachment
                        </p>
                        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          The attachment could not be loaded. Please try downloading it instead.
                        </p>
                        <a
                          href={selectedEvent.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download File
                        </a>
                      </div>
                    </div>
                  ) : selectedEvent.filePath.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                    // Image preview
                    <div className="p-6 flex items-center justify-center min-h-0">
                      <img
                        src={selectedEvent.filePath}
                        alt="Attachment Preview"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        onError={() => {
                          setAttachmentLoadError(true);
                        }}
                        onLoad={() => {
                          setAttachmentLoadError(false);
                        }}
                      />
                    </div>
                  ) : selectedEvent.filePath.toLowerCase().match(/\.(pdf)$/i) ? (
                    // PDF preview (iframe)
                    <div className="p-6 min-h-0">
                      <iframe
                        src={selectedEvent.filePath}
                        className="w-full h-[600px] border rounded-lg"
                        title="PDF Preview"
                        onError={() => {
                          setAttachmentLoadError(true);
                        }}
                        onLoad={() => {
                          setAttachmentLoadError(false);
                        }}
                      />
                    </div>
                  ) : (
                    // Generic file preview
                    <div className="p-6 flex items-center justify-center min-h-0">
                      <div className="text-center">
                        <svg className="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          File Preview Not Available
                        </p>
                        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          This file type cannot be previewed in the browser.
                        </p>
                        <a
                          href={selectedEvent.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Open File
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
