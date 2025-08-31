import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { announcementService, Announcement } from '../../../services/announcementService';
import { teacherService } from '../../../services/teacherService';
import { classroomService } from '../../../services/classroomService';

interface AnnouncementForm {
  title: string;
  selectedAudience: string;
  selectedRecipients: string[];
  message: string;
  file?: File;
}

interface Teacher {
  teacherId: string;
  name: string;
  email: string;
  role: string;
  schoolId: string;
}

interface Classroom {
  classId: string;
  className: string;
  section: string;
  schoolId?: string;
}

const Announcements: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPostSidebarOpen, setIsPostSidebarOpen] = useState(false);
  const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [formData, setFormData] = useState<AnnouncementForm>({
    title: '',
    selectedAudience: '',
    selectedRecipients: [],
    message: '',
    file: undefined
  });

  const audienceOptions = [
    'all',
    'teachers',
    'classes'
  ];

  // Fetch announcements, teachers, and classrooms from API
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.schoolId) return;
      
      try {
        setLoading(true);
        const [announcementsData, teachersData, classroomsData] = await Promise.all([
          announcementService.getAnnouncementsBySchool(user.schoolId),
          teacherService.getTeachersBySchool(user.schoolId),
          classroomService.getClassesBySchoolId(user.schoolId)
        ]);
        
        // Sort announcements by date (latest first)
        const sortedAnnouncements = announcementsData.sort((a, b) => 
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        );
        
        setAnnouncements(sortedAnnouncements);
        setTeachers(teachersData.teachers || []);
        setClassrooms(classroomsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Keep empty arrays on error
        setAnnouncements([]);
        setTeachers([]);
        setClassrooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.schoolId]);

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error' | 'loading' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    
    if (type === 'loading') {
      toast.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span>${message}</span>
        </div>
      `;
    } else {
      toast.innerHTML = message;
    }
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.remove('translate-x-full'), 100);
    
    // Auto remove after 3 seconds (or 5 seconds for loading)
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, type === 'loading' ? 5000 : 3000);
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(announcement => {
      const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           announcement.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAudience = audienceFilter === 'all' || announcement.selectedAudience === audienceFilter;
      return matchesSearch && matchesAudience;
    });
  }, [announcements, searchTerm, audienceFilter]);

  const handlePostAnnouncement = () => {
    setIsPostSidebarOpen(true);
    setFormData({
      title: '',
      selectedAudience: '',
      selectedRecipients: [],
      message: '',
      file: undefined
    });
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      selectedAudience: announcement.selectedAudience,
      selectedRecipients: Array.isArray(announcement.selectedRecipients) ? announcement.selectedRecipients : [],
      message: announcement.message,
      file: undefined
    });
    setIsEditSidebarOpen(true);
  };

  const handleViewAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsViewDialogOpen(true);
  };

  const handleDeleteAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDeleteDialogOpen(true);
  };

  const handleFilePreview = (fileUrl: string) => {
    setSelectedFile(fileUrl);
    setIsFilePreviewOpen(true);
  };

  const handleFileDownload = (fileUrl: string, fileName?: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'announcement-file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRecipientToggle = (recipientId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedRecipients: Array.isArray(prev.selectedRecipients) 
        ? (prev.selectedRecipients.includes(recipientId)
            ? prev.selectedRecipients.filter(id => id !== recipientId)
            : [...prev.selectedRecipients, recipientId])
        : [recipientId]
    }));
  };

  const handleSaveAnnouncement = async () => {
    if (!formData.title || !formData.message || !user?.schoolId) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // If no audience is selected or no recipients for specific audience, treat as "all"
    let finalAudience = formData.selectedAudience;
    let finalRecipients = Array.isArray(formData.selectedRecipients) ? formData.selectedRecipients : [];

    if (!formData.selectedAudience || 
        (formData.selectedAudience !== 'all' && finalRecipients.length === 0)) {
      finalAudience = 'all';
      finalRecipients = [];
    }

    try {
      showToast('Saving announcement...', 'loading');
      
      if (selectedAnnouncement) {
        // Edit existing announcement
        await announcementService.updateAnnouncement(
          user.schoolId,
          selectedAnnouncement.announcementId!,
          {
            title: formData.title,
            selectedAudience: finalAudience,
            selectedRecipients: finalRecipients,
            message: formData.message,
            file: formData.file
          }
        );
        
        // Update the announcement in the local state
        setAnnouncements(prev => {
          const updated = prev.map(ann => 
            ann.announcementId === selectedAnnouncement.announcementId 
              ? {
                  ...ann,
                  title: formData.title,
                  selectedAudience: finalAudience,
                  selectedRecipients: finalRecipients,
                  message: formData.message,
                  // Update file if a new one was uploaded
                  file: formData.file ? 'updated' : ann.file,
                  createdDate: new Date().toISOString()
                }
              : ann
          );
          // Sort by date (latest first)
          return updated.sort((a, b) => 
            new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
          );
        });
        
        showToast('Announcement updated successfully!', 'success');
      } else {
        // Add new announcement
        const newAnnouncement = await announcementService.createAnnouncement({
          title: formData.title,
          selectedAudience: finalAudience,
          selectedRecipients: finalRecipients,
          message: formData.message,
          file: formData.file,
          schoolId: user.schoolId,
          createdBy: 'SchoolAdmin'
        });
        
        setAnnouncements(prev => {
          const updated = [newAnnouncement, ...prev];
          // Sort by date (latest first)
          return updated.sort((a, b) => 
            new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
          );
        });
        
        showToast('Announcement posted successfully!', 'success');
      }

      setIsPostSidebarOpen(false);
      setIsEditSidebarOpen(false);
      setSelectedAnnouncement(null);
      setFormData({
        title: '',
        selectedAudience: '',
        selectedRecipients: [],
        message: '',
        file: undefined
      });
    } catch (error) {
      console.error('Error saving announcement:', error);
      showToast('Failed to save announcement. Please try again.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!selectedAnnouncement || !user?.schoolId) return;
    
    try {
      showToast('Deleting announcement...', 'loading');
      
      await announcementService.deleteAnnouncement(user.schoolId, selectedAnnouncement.announcementId!);
      setAnnouncements(prev => prev.filter(ann => ann.announcementId !== selectedAnnouncement.announcementId));
      setIsDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
      
      showToast('Announcement deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      showToast('Failed to delete announcement. Please try again.', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAudienceColor = (audience: string) => {
    const colors = {
      'all': 'bg-blue-100 text-blue-800',
      'teachers': 'bg-purple-100 text-purple-800',
      'classes': 'bg-green-100 text-green-800',
      'students': 'bg-pink-100 text-pink-800',
      'staff': 'bg-gray-100 text-gray-800'
    };
    return colors[audience.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRecipientDisplayName = (recipientId: string, audience: string) => {
    if (!recipientId || !audience) return 'Unknown';
    
    if (audience.toLowerCase() === 'teachers') {
      const teacher = teachers.find(t => t.teacherId === recipientId);
      return teacher ? teacher.name : recipientId;
    } else if (audience.toLowerCase() === 'classes') {
      const classroom = classrooms.find(c => c.classId === recipientId);
              return classroom ? `${classroom.className} ${classroom.section}` : recipientId;
    }
    return recipientId;
  };

  // Helper function to safely get recipients array
  const getSafeRecipients = (announcement: Announcement | null): string[] => {
    if (!announcement || !announcement.selectedRecipients) return [];
    return Array.isArray(announcement.selectedRecipients) ? announcement.selectedRecipients : [];
  };

  // Helper function to get file name from URL
  const getFileNameFromUrl = (fileUrl: string): string => {
    try {
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      return decodeURIComponent(fileName);
    } catch {
      return 'announcement-file';
    }
  };

  // Helper function to get file extension
  const getFileExtension = (fileName: string): string => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  // Helper function to check if file is image
  const isImageFile = (fileName: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes(getFileExtension(fileName));
  };

  // Helper function to check if file is PDF
  const isPdfFile = (fileName: string): boolean => {
    return getFileExtension(fileName) === 'pdf';
  };

  // Show loading state when schoolId is not available
  if (!user?.schoolId) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="p-6">
          <div className="text-center">
            <p className="text-lg">Loading user information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="p-6">
          {/* Header Shimmer */}
          <div className="mb-8">
            <div className="h-10 bg-gray-300 rounded-lg w-1/3 mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2 animate-pulse"></div>
          </div>

          {/* Button Shimmer */}
          <div className="flex justify-end mb-8">
            <div className="h-12 w-48 bg-gray-300 rounded-lg animate-pulse"></div>
          </div>

          {/* Stats Cards Shimmer */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                    <div className="h-8 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters Shimmer */}
          <div className={`p-6 rounded-xl shadow-lg mb-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="h-10 bg-gray-300 rounded-lg animate-pulse"></div>
              </div>
              <div className="sm:w-48">
                <div className="h-10 bg-gray-300 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Table Shimmer */}
          <div className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            {/* Table Header Shimmer */}
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>
            </div>
            
            {/* Table Rows Shimmer */}
            <div className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Title and Badge Shimmer */}
                      <div className="flex items-center gap-3">
                        <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>
                        <div className="h-6 bg-gray-300 rounded-full w-24 animate-pulse"></div>
                      </div>
                      
                      {/* Message Shimmer */}
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                      </div>
                      
                      {/* Meta Info Shimmer */}
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons Shimmer */}
                    <div className="flex items-center gap-2 ml-4">
                      {[1, 2, 3].map(btn => (
                        <div key={btn} className="w-10 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
                      ))}
                    </div>
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
              Announcements
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage and share important information with your school community
            </p>
          </div>
          <button
            onClick={handlePostAnnouncement}
            className={`mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post Announcement
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Announcements
                </p>
                <p className="text-2xl font-bold text-blue-600">{announcements.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
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
                <p className="text-2xl font-bold text-green-600">
                  {announcements.filter(a => new Date(a.createdDate).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Students
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {announcements.filter(a => a.selectedAudience.toLowerCase() === 'all' || a.selectedAudience.toLowerCase() === 'classes').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Teachers
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {announcements.filter(a => a.selectedAudience.toLowerCase() === 'teachers').length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                placeholder="Search announcements..."
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
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="all">All Audiences</option>
                {audienceOptions.map(option => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Announcements List */}
        <div className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Recent Announcements ({filteredAnnouncements.length})
            </h2>
          </div>
          
          {filteredAnnouncements.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                No announcements found
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchTerm || audienceFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by posting your first announcement'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAnnouncements.map((announcement) => (
                <div key={announcement.announcementId} className={`p-6 hover:bg-gray-50 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {announcement.title}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getAudienceColor(announcement.selectedAudience)}`}>
                          {announcement.selectedAudience}
                        </span>
                      </div>
                      
                      <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                        {announcement.message}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(announcement.createdDate)}
                        </span>
                        
                        {announcement.file && (
                          <div className="flex items-center gap-2">
                            <div 
                              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                                isDarkMode 
                                  ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                              }`}
                              onClick={() => handleFilePreview(announcement.file!)}
                            >
                              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                {getFileNameFromUrl(announcement.file).substring(0, 20)}
                                {getFileNameFromUrl(announcement.file).length > 20 ? '...' : ''}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (announcement.file) {
                                  handleFileDownload(announcement.file, getFileNameFromUrl(announcement.file));
                                }
                              }}
                              className={`p-1 rounded transition-colors ${
                                isDarkMode 
                                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                              }`}
                              title="Download file"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                          </div>
                        )}
                        
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {announcement.createdBy}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleViewAnnouncement(announcement)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                            : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        title="View"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleEditAnnouncement(announcement)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                            : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                            : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post/Edit Announcement Sidebar */}
      {(isPostSidebarOpen || isEditSidebarOpen) && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
            <div className={`w-screen max-w-md ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <div className={`h-full flex flex-col py-6 shadow-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className={`px-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <h2 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {isEditSidebarOpen ? 'Edit Announcement' : 'Post New Announcement'}
                    </h2>
                    <button
                      onClick={() => {
                        setIsPostSidebarOpen(false);
                        setIsEditSidebarOpen(false);
                        setSelectedAnnouncement(null);
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

                <div className="flex-1 px-6 py-6 overflow-y-auto">
                  <form className="space-y-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="Enter announcement title"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Audience *
                      </label>
                      <select
                        value={formData.selectedAudience}
                        onChange={(e) => setFormData({...formData, selectedAudience: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        <option value="">Select audience</option>
                        {audienceOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    {(formData.selectedAudience === 'teachers' || formData.selectedAudience === 'classes') && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Recipients *
                        </label>
                        
                        {/* Selected Recipients Display */}
                        {formData.selectedRecipients.length > 0 && (
                          <div className="mb-3">
                            <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Selected Recipients:
                            </p>
                            <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                              {formData.selectedRecipients.map(recipientId => (
                                <span
                                  key={recipientId}
                                  className="flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                >
                                  {getRecipientDisplayName(recipientId, formData.selectedAudience)}
                                  <button
                                    type="button"
                                    onClick={() => handleRecipientToggle(recipientId)}
                                    className="ml-1 text-blue-800 dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-100"
                                    title="Remove recipient"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Available Recipients Selection */}
                        <div>
                          <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Available {formData.selectedAudience}:
                          </p>
                          <div className="max-h-32 overflow-y-auto p-2 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600">
                            {formData.selectedAudience === 'teachers' ? (
                              <div className="grid grid-cols-2 gap-2">
                                {teachers.map(teacher => (
                                  <button
                                    key={teacher.teacherId}
                                    type="button"
                                    onClick={() => handleRecipientToggle(teacher.teacherId)}
                                    className={`p-2 text-left rounded-lg border transition-colors ${
                                      formData.selectedRecipients.includes(teacher.teacherId)
                                        ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
                                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                  >
                                    <div className="text-xs font-medium">{teacher.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{teacher.email}</div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                {classrooms.map(classroom => (
                                  <button
                                    key={classroom.classId}
                                    type="button"
                                    onClick={() => handleRecipientToggle(classroom.classId)}
                                    className={`p-2 text-left rounded-lg border transition-colors ${
                                      formData.selectedRecipients.includes(classroom.classId)
                                        ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
                                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                  >
                                    <div className="text-xs font-medium">{classroom.className}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Section {classroom.section}</div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Click on {formData.selectedAudience.toLowerCase()} to select/deselect them
                        </p>
                      </div>
                    )}

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Message *
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        rows={6}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="Enter your announcement message"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Attachment {isEditSidebarOpen ? '(Optional - Leave empty to keep current file)' : '(Optional)'}
                      </label>
                      <input
                        type="file"
                        onChange={(e) => setFormData({...formData, file: e.target.files?.[0]})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                      {formData.file && (
                        <div className={`mt-2 p-3 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-600' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {formData.file.name}
                            </span>
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                        </div>
                      )}
                      {isEditSidebarOpen && selectedAnnouncement?.file && !formData.file && (
                        <div className={`mt-2 p-3 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Current file: {getFileNameFromUrl(selectedAnnouncement.file)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                </div>

                <div className={`px-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      onClick={() => {
                        setIsPostSidebarOpen(false);
                        setIsEditSidebarOpen(false);
                        setSelectedAnnouncement(null);
                      }}
                      className={`px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAnnouncement}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isEditSidebarOpen ? 'Update' : 'Post'} Announcement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Announcement Dialog */}
      {isViewDialogOpen && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
            
            <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Announcement Details
                  </h3>
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
              </div>

              <div className="px-6 py-6">
                <div className="space-y-4">
                  <div>
                    <h4 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedAnnouncement.title}
                    </h4>
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getAudienceColor(selectedAnnouncement.selectedAudience)}`}>
                      {selectedAnnouncement.selectedAudience}
                    </span>
                  </div>

                  <div>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                      {selectedAnnouncement.message}
                    </p>
                  </div>

                  {getSafeRecipients(selectedAnnouncement).length > 0 && (
                    <div>
                      <h5 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Recipients:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {getSafeRecipients(selectedAnnouncement).map((recipientId, index) => (
                          <span key={index} className={`px-2 py-1 text-xs rounded-full ${
                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {getRecipientDisplayName(recipientId, selectedAnnouncement.selectedAudience)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedAnnouncement.file && (
                    <div>
                      <h5 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Attachment:
                      </h5>
                      <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                        isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div 
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => handleFilePreview(selectedAnnouncement.file!)}
                        >
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {getFileNameFromUrl(selectedAnnouncement.file)}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            if (selectedAnnouncement.file) {
                              handleFileDownload(selectedAnnouncement.file, getFileNameFromUrl(selectedAnnouncement.file));
                            }
                          }}
                          className={`ml-auto p-2 rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                              : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                          title="Download file"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className={`pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Created:</span>
                        <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatDate(selectedAnnouncement.createdDate)}
                        </span>
                      </div>
                      <div>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>By:</span>
                        <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {selectedAnnouncement.createdBy}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsViewDialogOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
            
            <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Delete Announcement
                </h3>
              </div>

              <div className="px-6 py-6">
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Are you sure you want to delete "{selectedAnnouncement.title}"? This action cannot be undone.
                </p>
              </div>

              <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsDeleteDialogOpen(false)}
                    className={`px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Dialog */}
      {isFilePreviewOpen && selectedFile && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
            
            <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    File Preview: {getFileNameFromUrl(selectedFile)}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFileDownload(selectedFile, getFileNameFromUrl(selectedFile))}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                          : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title="Download file"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setIsFilePreviewOpen(false)}
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
              </div>

              <div className="px-6 py-6">
                <div className="w-full h-96 border rounded-lg overflow-hidden">
                  {isImageFile(getFileNameFromUrl(selectedFile)) ? (
                    <img 
                      src={selectedFile} 
                      alt="File preview" 
                      className="w-full h-full object-contain"
                    />
                  ) : isPdfFile(getFileNameFromUrl(selectedFile)) ? (
                    <iframe 
                      src={selectedFile} 
                      className="w-full h-full"
                      title="PDF preview"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          File Preview Not Available
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          This file type cannot be previewed. Click download to view the file.
                        </p>
                        <button
                          onClick={() => handleFileDownload(selectedFile, getFileNameFromUrl(selectedFile))}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Download File
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements; 