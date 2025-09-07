import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';

interface Event {
  eventId: string;
  schoolId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  filePath?: string;
  createdDate: string;
  isTemplate: boolean;
}

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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventForm>({
    title: '',
    description: '',
    date: '',
    time: '',
    file: undefined,
    isTemplate: false
  });

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

  useEffect(() => {
    // Initialize with templates
    setTemplates(predefinedTemplates);
    setLoading(false);
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'events' && !event.isTemplate) ||
                         (filterType === 'templates' && event.isTemplate);
    return matchesSearch && matchesFilter;
  });

  const filteredTemplates = templates.filter(template => {
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

  const handleAddFromTemplate = (template: Event) => {
    const newEvent: Event = {
      ...template,
      eventId: `event-${Date.now()}`,
      isTemplate: false,
      createdDate: new Date().toISOString()
    };
    setEvents(prev => [newEvent, ...prev]);
    
    // Show success toast
    const successToast = document.createElement('div');
    successToast.className = `${isDarkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-50 text-green-700 border-green-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
    successToast.textContent = 'Event added successfully!';
    document.body.appendChild(successToast);
    setTimeout(() => successToast.remove(), 3000);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      file: undefined,
      isTemplate: event.isTemplate
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

  const handleSaveEvent = () => {
    if (!formData.title || !formData.description || !formData.date || !formData.time) {
      const errorToast = document.createElement('div');
      errorToast.className = `${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
      errorToast.textContent = 'Please fill in all required fields';
      document.body.appendChild(errorToast);
      setTimeout(() => errorToast.remove(), 3000);
      return;
    }

    const eventData: Event = {
      eventId: selectedEvent?.eventId || `event-${Date.now()}`,
      schoolId: user?.schoolId || '',
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      filePath: formData.file ? URL.createObjectURL(formData.file) : selectedEvent?.filePath || '',
      createdDate: selectedEvent?.createdDate || new Date().toISOString(),
      isTemplate: formData.isTemplate
    };

    if (selectedEvent) {
      // Edit existing event
      setEvents(prev => prev.map(e => e.eventId === selectedEvent.eventId ? eventData : e));
    } else {
      // Add new event
      setEvents(prev => [eventData, ...prev]);
    }

    setIsAddSidebarOpen(false);
    setIsEditSidebarOpen(false);
    setSelectedEvent(null);

    const successToast = document.createElement('div');
    successToast.className = `${isDarkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-50 text-green-700 border-green-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
    successToast.textContent = selectedEvent ? 'Event updated successfully!' : 'Event added successfully!';
    document.body.appendChild(successToast);
    setTimeout(() => successToast.remove(), 3000);
  };

  const handleConfirmDelete = () => {
    if (selectedEvent) {
      if (selectedEvent.isTemplate) {
        setTemplates(prev => prev.filter(t => t.eventId !== selectedEvent.eventId));
      } else {
        setEvents(prev => prev.filter(e => e.eventId !== selectedEvent.eventId));
      }
      
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);

      const successToast = document.createElement('div');
      successToast.className = `${isDarkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-50 text-green-700 border-green-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
      successToast.textContent = 'Event deleted successfully!';
      document.body.appendChild(successToast);
      setTimeout(() => successToast.remove(), 3000);
    }
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
        <div className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-lg">Loading events...</p>
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
          <button
            onClick={handleAddEvent}
            className={`mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Event
          </button>
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
                  {events.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).length}
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
                  {events.filter(e => new Date(e.date) > new Date()).length}
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
                <option value="templates">Templates Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Templates Section */}
        {filterType === 'all' || filterType === 'templates' ? (
          <div className="mb-8">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Event Templates ({filteredTemplates.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <div key={template.eventId} className={`p-6 rounded-xl shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-xl transition-all duration-200`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                        {template.title}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-3`}>
                        {template.description}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>
                      Template
                    </span>
                  </div>
                  
                  <div className={`flex items-center gap-2 mb-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(template.date)}
                  </div>
                  
                  <div className={`flex items-center gap-2 mb-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(template.time)}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddFromTemplate(template)}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      Add Event
                    </button>
                    <button
                      onClick={() => handleViewEvent(template)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
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
        ) : null}

        {/* Events Section */}
        {filterType === 'all' || filterType === 'events' ? (
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
                      <div className={`flex items-center gap-2 mb-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        Attachment
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
        ) : null}
      </div>
    </div>
  );
};

export default Events;
