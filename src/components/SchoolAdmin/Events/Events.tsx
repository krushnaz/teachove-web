import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { eventService, Event, CreateEventRequest, UpdateEventRequest } from '../../../services/eventService';
import { 
  Calendar, 
  Clock, 
  Megaphone, 
  FileText, 
  GraduationCap, 
  Search, 
  Edit3, 
  X, 
  ArrowUpRight,
  Upload,
  AlertCircle,
  Eye,
  Trash2,
  Download,
  ChevronRight,
  Plus
} from 'lucide-react';

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
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-[#F8FAFC]'} p-0 sm:p-2 lg:p-4 transition-colors duration-200`}>
        <div className="w-full mx-auto space-y-4 sm:space-y-6 animate-pulse">
          {/* Header Skeleton */}
          <div className={`h-32 sm:h-40 rounded-none sm:rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b sm:border border-gray-200 dark:border-gray-800`} />

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 px-2 sm:px-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-20 sm:h-24 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-800`} />
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className={`h-14 mx-4 sm:mx-0 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-800`} />

          {/* Events Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 px-4 sm:px-0">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`h-48 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-800`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F8FAFC] text-gray-900'} transition-colors duration-200`}>
      <div className="w-full mx-auto p-0 sm:p-2 lg:p-4 space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className={`relative overflow-hidden rounded-none sm:rounded-md p-6 sm:p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b sm:border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-center`}>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-3 border border-indigo-100 dark:border-indigo-800/30">
                <Calendar size={13} />
                Events Management
              </div>
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Events Hub
              </h1>
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Plan, organize, and celebrate school moments with ease.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleTemplatesClick}
                className={`px-4 py-2.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="p-1 px-1.5 rounded bg-indigo-50 dark:bg-indigo-900/30">
                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span>Templates</span>
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Event</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 px-2 sm:px-0">
          {[
            { 
              label: 'Total Events', 
              value: events.length, 
              icon: Megaphone,
              color: 'text-indigo-600 dark:text-indigo-400',
              bg: 'bg-indigo-50 dark:bg-indigo-900/20'
            },
            { 
              label: 'Templates', 
              value: templates.length, 
              icon: FileText,
              color: 'text-gray-600 dark:text-gray-400',
              bg: 'bg-gray-50 dark:bg-gray-800'
            },
            { 
              label: 'This Month', 
              value: events.filter(e => e && e.date && new Date(e.date).getMonth() === new Date().getMonth()).length, 
              icon: Calendar,
              color: 'text-indigo-600 dark:text-indigo-400',
              bg: 'bg-indigo-50 dark:bg-indigo-900/20'
            },
            { 
              label: 'Upcoming', 
              value: events.filter(e => e && e.date && new Date(e.date) > new Date()).length, 
              icon: GraduationCap,
              color: 'text-indigo-600 dark:text-indigo-400',
              bg: 'bg-indigo-50 dark:bg-indigo-900/20'
            },
          ].map((stat, idx) => (
            <div key={idx} className={`p-2.5 sm:p-5 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm flex flex-col justify-between h-full`}>
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <div className={`p-1.5 sm:p-2 rounded-md ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{stat.value}</h3>
                <p className="text-[10px] sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5 truncate">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className={`mx-4 sm:mx-0 p-3 sm:p-4 rounded-md shadow-sm ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search size={18} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
              </div>
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-sm rounded-md border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white'
                } outline-none`}
              />
            </div>
            <div className="md:w-64">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className={`w-full px-3 py-2 text-sm rounded-md border appearance-none transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-900 border-gray-700 text-white focus:border-indigo-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:bg-white'
                } outline-none cursor-pointer`}
              >
                <option value="all">All Entries</option>
                <option value="events">Events Only</option>
                <option value="templates">Templates Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 sm:px-0">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Events & Schedule ({filteredEvents.length})
            </h2>
          </div>

          {filteredEvents.length === 0 ? (
            <div className={`flex flex-col items-center justify-center p-12 rounded-md border border-dashed text-center ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <div className={`mb-4 p-4 rounded-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} border border-gray-100 dark:border-gray-800`}>
                <Calendar size={32} className="text-gray-400" />
              </div>
              <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                No events found
              </h3>
              <p className={`text-sm max-w-xs mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchTerm ? 'Try adjusting your search terms.' : 'Create a new event or use a template to get started.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAddEvent}
                  className="mt-6 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Create First Event
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredEvents.map((event) => (
                <div 
                  key={event.eventId} 
                  className={`group flex flex-col p-5 rounded-md border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-md text-center min-w-[60px] border ${
                      isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-indigo-50 border-indigo-100 text-indigo-700'
                    }`}>
                      <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="block text-xl font-bold leading-none mt-0.5">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    {event.isTemplate && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isDarkMode ? 'bg-indigo-900/30 text-indigo-300 border border-indigo-800' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      }`}>
                        Template
                      </span>
                    )}
                  </div>

                  <h3 className={`font-bold mb-1.5 ${isDarkMode ? 'text-white' : 'text-gray-900'} group-hover:text-indigo-600 transition-colors`}>
                    {event.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 mb-4 text-xs font-medium">
                    <div className={`flex items-center gap-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Clock size={14} className="text-gray-400" />
                      {formatTime(event.time)}
                    </div>
                  </div>

                  <p className={`text-sm mb-6 flex-grow line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {event.description}
                  </p>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                    <button
                      onClick={() => handleViewEvent(event)}
                      className={`flex-1 py-1.5 px-3 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-indigo-600 hover:text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-indigo-600 hover:text-white'
                      }`}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleEditEvent(event)}
                      className={`p-1.5 rounded transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                          : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                      }`}
                      title="Edit"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event)}
                      className={`p-1.5 rounded transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' 
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title="Delete"
                    >
                      <X size={18} />
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
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {filteredTemplates.map((template) => (
                    <div 
                      key={template.eventId} 
                      className={`p-4 rounded-md border transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="mb-3">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {template.title}
                          </h3>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            Template
                          </span>
                        </div>
                        <p className={`text-xs line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {template.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4 text-[10px] font-bold uppercase tracking-tight opacity-70">
                         <div className={`flex items-center gap-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Calendar size={12} />
                          <span>{formatDate(template.date)}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Clock size={12} />
                          <span>{formatTime(template.time)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleAddFromTemplate(template);
                            setIsTemplatesSidebarOpen(false);
                          }}
                          disabled={isAddingFromTemplate}
                          className="flex-1 py-1.5 px-3 rounded text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          {isAddingFromTemplate ? 'Adding...' : 'Use Template'}
                        </button>
                        <button
                          onClick={() => {
                            handleViewEvent(template);
                            setIsTemplatesSidebarOpen(false);
                          }}
                          className={`p-1.5 rounded transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                        >
                          <ArrowUpRight size={18} />
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
                        className={`w-full px-3 py-2 text-sm rounded-md border transition-colors outline-none ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white'
                        }`}
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
                        className={`w-full px-3 py-2 text-sm rounded-md border transition-colors outline-none ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white'
                        }`}
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
                      <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border border-dashed rounded-md ${
                        isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-300 bg-gray-50'
                      }`}>
                        <div className="space-y-1 text-center">
                          <svg className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className={`flex text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <label htmlFor="file" className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
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
                      className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEvent}
                      disabled={isAddingEvent || isUpdatingEvent}
                      className="flex-[2] px-4 py-2 text-xs font-bold uppercase tracking-wider rounded text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {(isAddingEvent || isUpdatingEvent) ? 'Processing...' : (selectedEvent ? 'Update Event' : 'Create Event')}
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
                        className={`w-full px-3 py-2 text-sm rounded-md border transition-colors outline-none ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white'
                        }`}
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
                        className={`w-full px-3 py-2 text-sm rounded-md border transition-colors outline-none ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white'
                        }`}
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
                      <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border border-dashed rounded-md ${
                        isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-300 bg-gray-50'
                      }`}>
                        <div className="space-y-1 text-center">
                          <svg className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className={`flex text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <label htmlFor="editFile" className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
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

                <div className={`p-6 border-t ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditSidebarOpen(false)}
                      className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEvent}
                      className="flex-[2] px-4 py-2 text-xs font-bold uppercase tracking-wider rounded text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-gray-900/60 transition-opacity" onClick={() => setIsViewDialogOpen(false)} />
            <div className={`relative w-full h-full sm:h-auto sm:max-w-2xl transform overflow-hidden sm:rounded-md border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              
              {/* Header */}
              <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedEvent.title}
                  </h2>
                </div>
                <button
                  onClick={() => setIsViewDialogOpen(false)}
                  className={`p-2 rounded transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Description
                      </h3>
                      <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedEvent.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'} space-y-3`}>
                      <div>
                        <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          Schedule
                        </h3>
                         <div className={`flex items-center gap-2 mb-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                           <Calendar size={14} className="text-indigo-600 dark:text-indigo-400" />
                          <span className="font-medium">{formatDate(selectedEvent.date)}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                           <Clock size={14} className="text-indigo-600 dark:text-indigo-400" />
                          <span className="font-medium">{formatTime(selectedEvent.time)}</span>
                        </div>
                      </div>

                      {selectedEvent.filePath && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => {
                              setIsViewDialogOpen(false);
                              handleAttachmentPreview(selectedEvent);
                            }}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors"
                          >
                            <FileText size={14} />
                            View Attachment
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={`px-6 py-4 flex justify-end gap-3 border-t ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50'}`}>
                <button
                  onClick={() => setIsViewDialogOpen(false)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors ${
                    isDarkMode ? 'bg-gray-800 text-gray-300 hover:text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEditEvent(selectedEvent);
                  }}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Edit3 size={14} />
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Event Dialog */}
        {isDeleteDialogOpen && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-gray-900/60 transition-opacity" onClick={() => setIsDeleteDialogOpen(false)} />
            <div className={`relative w-full max-w-md transform overflow-hidden rounded-md border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="p-6 text-center">
                 <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4 ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                  <Trash2 size={24} className="text-red-500" />
                </div>
                <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Delete Event?
                </h3>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Permanently delete <span className="font-semibold text-current">"{selectedEvent.title}"</span>?
                </p>
                
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={isDeletingEvent}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors ${
                      isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={isDeletingEvent}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded bg-red-600 hover:bg-red-500 text-white transition-colors"
                  >
                    {isDeletingEvent ? 'Deleting...' : 'Delete Event'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attachment Preview Dialog */}
        {isAttachmentPreviewOpen && selectedEvent && selectedEvent.filePath && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-gray-900/95 transition-opacity" onClick={() => setIsAttachmentPreviewOpen(false)} />
            <div className={`relative w-full h-full sm:h-[85vh] sm:max-w-5xl sm:rounded-md border flex flex-col overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              
              {/* Header */}
              <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                   <div className={`p-2 rounded ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <h2 className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedEvent.title}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedEvent.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Download size={14} />
                    Download
                  </a>
                  <button
                    onClick={() => {
                      setIsAttachmentPreviewOpen(false);
                      setAttachmentLoadError(false);
                    }}
                    className={`p-2 rounded transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className={`flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                {attachmentLoadError ? (
                  <div className="text-center max-w-md">
                    <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                      <AlertCircle size={24} className="text-red-500" />
                    </div>
                    <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Preview Unavailable
                    </h3>
                    <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Please download the file to view its content.
                    </p>
                    <a
                      href={selectedEvent.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 rounded text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                      Download File
                    </a>
                  </div>
                ) : selectedEvent.filePath.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                  <img
                    src={selectedEvent.filePath}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain rounded-md"
                    onError={() => setAttachmentLoadError(true)}
                  />
                ) : selectedEvent.filePath.toLowerCase().match(/\.(pdf)$/i) ? (
                  <iframe
                    src={selectedEvent.filePath}
                    className="w-full h-full rounded-md border border-gray-200 dark:border-gray-800"
                    title="PDF Preview"
                    onError={() => setAttachmentLoadError(true)}
                  />
                ) : (
                   <div className="text-center max-w-md">
                    <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-md mb-4 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      <FileText size={32} className="text-indigo-600" />
                    </div>
                    <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Not Supported
                    </h3>
                    <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      This file format cannot be previewed.
                    </p>
                    <a
                      href={selectedEvent.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 rounded text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
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
