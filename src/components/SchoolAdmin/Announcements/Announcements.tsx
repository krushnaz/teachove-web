import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { announcementService, Announcement } from '../../../services/announcementService';
import { teacherService } from '../../../services/teacherService';
import { classroomService } from '../../../services/classroomService';

// --- Types ---
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
  teacherName?: string;
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

// --- Helper Components ---

const ShimmerBlock = ({ className }: { className: string }) => (
  <div className={`relative overflow-hidden bg-gray-200 dark:bg-gray-700/50 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-gray-600/40 to-transparent" />
  </div>
);

const StatusBadge = ({ type, text }: { type: string; text: string }) => {
  const colors: Record<string, string> = {
    all: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
    teachers: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    classes: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
  };
  const colorClass = colors[type.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';

  return (
    <span className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-bold rounded-full border ${colorClass}`}>
      {text}
    </span>
  );
};

const Announcements: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  
  // State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isPostSidebarOpen, setIsPostSidebarOpen] = useState(false);
  const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  
  // Data Selection State
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

  const audienceOptions = ['all', 'teachers', 'classes'];

  // --- Effects ---
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
        
        const sortedAnnouncements = announcementsData.sort((a, b) => 
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        );
        
        setAnnouncements(sortedAnnouncements);
        setTeachers(teachersData.teachers || []);
        setClassrooms(classroomsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setAnnouncements([]);
        setTeachers([]);
        setClassrooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.schoolId]);

  // --- Logic Helpers ---
  const showToast = (message: string, type: 'success' | 'error' | 'loading' = 'success') => {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-blue-600';
    toast.className = `fixed top-6 right-6 z-[100] px-6 py-4 rounded-lg border shadow-lg text-white font-medium flex items-center gap-3 transition-all duration-500 transform translate-x-full ${bgColor}`;
    
    let icon = '';
    if (type === 'loading') icon = '<div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>';
    
    toast.innerHTML = `${icon}<span>${message}</span>`;
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => toast.classList.remove('translate-x-full'));
    
    setTimeout(() => {
      toast.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => document.body.contains(toast) && document.body.removeChild(toast), 500);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileNameFromUrl = (fileUrl: string): string => {
    try {
      const url = new URL(fileUrl);
      return decodeURIComponent(url.pathname.split('/').pop() || 'file');
    } catch {
      return 'file';
    }
  };

  const getFileExtension = (fileName: string): string => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const isImageFile = (fileName: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes(getFileExtension(fileName));
  };

  const isPdfFile = (fileName: string): boolean => {
    return getFileExtension(fileName) === 'pdf';
  };

  const getRecipientDisplayName = (recipientId: string, audience: string) => {
    if (!recipientId) return 'Unknown';
    if (audience === 'teachers') {
      const t = teachers.find(x => x.teacherId === recipientId);
      return t ? (t.teacherName || t.name) : recipientId;
    } 
    if (audience === 'classes') {
      const c = classrooms.find(x => x.classId === recipientId);
      return c ? `${c.className} ${c.section}` : recipientId;
    }
    return recipientId;
  };

  // --- Handlers ---
  const handlePostAnnouncement = () => {
    setIsPostSidebarOpen(true);
    setFormData({ title: '', selectedAudience: '', selectedRecipients: [], message: '', file: undefined });
  };

  const handleEditAnnouncement = (ann: Announcement) => {
    setSelectedAnnouncement(ann);
    setFormData({
      title: ann.title,
      selectedAudience: ann.selectedAudience,
      selectedRecipients: Array.isArray(ann.selectedRecipients) ? ann.selectedRecipients : [],
      message: ann.message,
      file: undefined
    });
    setIsEditSidebarOpen(true);
  };

  // Missing Handler 1: Delete
  const handleDeleteAnnouncement = (ann: Announcement) => {
    setSelectedAnnouncement(ann);
    setIsDeleteDialogOpen(true);
  };

  // Missing Handler 2: View
  const handleViewAnnouncement = (ann: Announcement) => {
    setSelectedAnnouncement(ann);
    setIsViewDialogOpen(true);
  };

  // Missing Handler 3: File Preview
  const handleFilePreview = (fileUrl: string) => {
    setSelectedFile(fileUrl);
    setIsFilePreviewOpen(true);
  };

  const handleSaveAnnouncement = async () => {
    if (!formData.title || !formData.message || !user?.schoolId) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    let finalAudience = formData.selectedAudience;
    let finalRecipients = Array.isArray(formData.selectedRecipients) ? formData.selectedRecipients : [];

    if (!formData.selectedAudience || (formData.selectedAudience !== 'all' && finalRecipients.length === 0)) {
      finalAudience = 'all';
      finalRecipients = [];
    }

    try {
        showToast('Saving announcement...', 'loading');
        
        if (selectedAnnouncement) {
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
             setAnnouncements(prev => {
                const updated = prev.map(ann => 
                  ann.announcementId === selectedAnnouncement.announcementId 
                    ? {
                        ...ann,
                        title: formData.title,
                        selectedAudience: finalAudience,
                        selectedRecipients: finalRecipients,
                        message: formData.message,
                        file: formData.file ? 'updated' : ann.file,
                        createdDate: new Date().toISOString()
                      }
                    : ann
                );
                return updated.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
              });
            showToast('Updated successfully', 'success');
        } else {
             const newAnnouncement = await announcementService.createAnnouncement({
                title: formData.title,
                selectedAudience: finalAudience,
                selectedRecipients: finalRecipients,
                message: formData.message,
                file: formData.file,
                schoolId: user.schoolId,
                createdBy: 'SchoolAdmin'
              });
              setAnnouncements(prev => [newAnnouncement, ...prev]);
              showToast('Posted successfully', 'success');
        }
        setIsPostSidebarOpen(false);
        setIsEditSidebarOpen(false);
        setSelectedAnnouncement(null);
    } catch(e) {
        console.error(e);
        showToast('Error saving', 'error');
    }
  };
  
  const confirmDelete = async () => {
    if (!selectedAnnouncement || !user?.schoolId) return;
    try {
        showToast('Deleting...', 'loading');
        await announcementService.deleteAnnouncement(user.schoolId, selectedAnnouncement.announcementId!);
        setAnnouncements(prev => prev.filter(ann => ann.announcementId !== selectedAnnouncement.announcementId));
        setIsDeleteDialogOpen(false);
        setSelectedAnnouncement(null);
        showToast('Deleted successfully', 'success');
    } catch (e) {
        showToast('Error deleting', 'error');
    }
  };

  const handleFileDownload = (url: string, name: string) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleRecipientToggle = (id: string) => {
    setFormData(prev => ({
        ...prev,
        selectedRecipients: prev.selectedRecipients.includes(id) 
            ? prev.selectedRecipients.filter(x => x !== id) 
            : [...prev.selectedRecipients, id]
    }));
  };

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className={`min-h-screen p-2 sm:p-4 lg:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-[#F8FAFC]'}`}>
        <div className="mx-auto space-y-4 sm:space-y-6">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
               <ShimmerBlock className="h-8 w-48 rounded-md" />
               <ShimmerBlock className="h-4 w-64 rounded-md" />
            </div>
            <ShimmerBlock className="h-10 w-32 rounded-md" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className={`h-24 sm:h-32 rounded-md border p-4 sm:p-6 ${isDarkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                 <div className="flex justify-between">
                    <div className="space-y-3 w-full">
                        <ShimmerBlock className="h-3 w-16 rounded" />
                        <ShimmerBlock className="h-6 w-10 rounded" />
                    </div>
                 </div>
               </div>
            ))}
          </div>

          <div className="space-y-3 sm:space-y-4">
             {[1, 2, 3, 4].map(i => (
                 <div key={i} className={`h-32 rounded-md border p-4 sm:p-6 ${isDarkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-4">
                            <div className="flex gap-3">
                                <ShimmerBlock className="h-5 w-1/3 rounded-md" />
                            </div>
                            <ShimmerBlock className="h-3 w-3/4 rounded" />
                            <ShimmerBlock className="h-3 w-1/2 rounded" />
                        </div>
                    </div>
                 </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#F8FAFC] text-gray-900'}`}>
      <div className="p-0 sm:p-2 lg:p-4 space-y-4 sm:space-y-6">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-md p-4 sm:p-6 border-b sm:border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 text-gray-900 dark:text-white">
              Notice Board
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Broadcast updates to your school community.
            </p>
          </div>
          <button
            onClick={handlePostAnnouncement}
            className="w-full md:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-md transition-colors flex justify-center items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Create New
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-3 sm:px-0">
          {[
            { label: 'Total Posted', value: announcements.length, icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
            { label: 'This Month', value: announcements.filter(a => new Date(a.createdDate).getMonth() === new Date().getMonth()).length, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
            { label: 'To Students', value: announcements.filter(a => ['all', 'classes'].includes(a.selectedAudience)).length, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
            { label: 'To Teachers', value: announcements.filter(a => a.selectedAudience === 'teachers').length, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          ].map((stat, idx) => (
            <div key={idx} className={`p-4 sm:p-5 rounded-md border shadow-sm transition-all duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
                  <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                </div>
                <div className={`p-2 sm:p-2.5 rounded-lg ${stat.bg}`}>
                  <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className={`mx-3 sm:mx-0 p-2 rounded-md border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border-none bg-transparent focus:ring-2 focus:ring-blue-500 placeholder-gray-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              />
            </div>
            <div className={`w-px h-8 self-center hidden sm:block ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className={`sm:w-48 px-4 py-3 rounded-xl border-none bg-transparent focus:ring-2 focus:ring-blue-500 cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              <option value="all">All Audiences</option>
              {audienceOptions.map(opt => (
                <option key={opt} value={opt} className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
                  {opt === 'all' ? 'All' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content List */}
        <div className="space-y-3 sm:space-y-4 px-3 sm:px-0">
          {filteredAnnouncements.length === 0 ? (
            <div className={`rounded-md border border-dashed p-10 text-center ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'}`}>
               <div className="w-12 h-12 mx-auto mb-3 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
               </div>
               <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No announcements found</h3>
               <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Try clearing your filters or post a new one.</p>
            </div>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <div 
                key={announcement.announcementId} 
                className={`group relative rounded-md border p-4 sm:p-5 transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-800/80' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Icon/Avatar Area */}
                  <div className="hidden sm:flex flex-col items-center gap-2">
                     <div className={`w-10 h-10 rounded-md flex items-center justify-center border ${
                        announcement.selectedAudience === 'teachers' 
                        ? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                        : 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800'
                     }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                     </div>
                     <div className={`text-[10px] font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(announcement.createdDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                     </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className={`text-lg font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {announcement.title}
                        </h3>
                        <StatusBadge type={announcement.selectedAudience} text={announcement.selectedAudience} />
                      </div>
                      
                      {/* Action Menu */}
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                         <button onClick={() => handleEditAnnouncement(announcement)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`} title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                         </button>
                         <button onClick={() => handleDeleteAnnouncement(announcement)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-red-900/30 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-500 hover:text-red-600'}`} title="Delete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>
                    </div>

                    <p className={`text-sm leading-relaxed mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {announcement.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            {announcement.createdBy}
                        </div>

                        {announcement.file && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleFilePreview(announcement.file!);
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    isDarkMode 
                                    ? 'bg-gray-700 hover:bg-gray-600 text-blue-300' 
                                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                                }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                <span>Attachment</span>
                            </button>
                        )}

                        <button 
                            onClick={() => handleViewAnnouncement(announcement)}
                            className="ml-auto text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            View Details &rarr;
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- Modals & Sidebars --- */}
        
        {/* Edit/Create Sidebar */}
        {(isPostSidebarOpen || isEditSidebarOpen) && (
            <div className="fixed inset-0 z-50 overflow-hidden">
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => { setIsPostSidebarOpen(false); setIsEditSidebarOpen(false); }} />
                <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
                    <div className={`w-screen max-w-md transform transition-transform duration-300 ease-in-out ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-2xl flex flex-col`}>
                        <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {isEditSidebarOpen ? 'Edit Announcement' : 'New Announcement'}
                            </h2>
                            <button onClick={() => { setIsPostSidebarOpen(false); setIsEditSidebarOpen(false); }} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Title */}
                            <div>
                                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Title</label>
                                <input 
                                    type="text" 
                                    value={formData.title} 
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className={`w-full px-3 py-2.5 rounded-md border outline-none transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`}
                                    placeholder="e.g., Annual Sports Day"
                                />
                            </div>
                            
                            {/* Audience */}
                            <div>
                                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Target Audience</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {audienceOptions.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setFormData({...formData, selectedAudience: opt, selectedRecipients: []})}
                                            className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                                                formData.selectedAudience === opt 
                                                ? 'bg-indigo-600 text-white border-indigo-600' 
                                                : isDarkMode 
                                                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' 
                                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {opt === 'all' ? 'Everyone' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Conditional Recipients Logic */}
                            {(formData.selectedAudience === 'teachers' || formData.selectedAudience === 'classes') && (
                                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Select {formData.selectedAudience}</p>
                                    <div className="max-h-48 overflow-y-auto grid grid-cols-1 gap-2 custom-scrollbar">
                                        {(formData.selectedAudience === 'teachers' ? teachers : classrooms).map((item: any) => {
                                            const id = item.teacherId || item.classId;
                                            const label = item.name || item.teacherName || `${item.className} ${item.section}`;
                                            const isSelected = formData.selectedRecipients.includes(id);
                                            return (
                                                <button 
                                                    key={id} 
                                                    onClick={() => handleRecipientToggle(id)}
                                                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                                        isSelected 
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' 
                                                        : 'hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300'
                                                    }`}
                                                >
                                                    <span>{label}</span>
                                                    {isSelected && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Message */}
                            <div>
                                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Message</label>
                                <textarea 
                                    rows={6}
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    className={`w-full px-3 py-2.5 rounded-md border outline-none transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`}
                                    placeholder="Write your announcement here..."
                                />
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Attachment</label>
                                <label className={`flex flex-col items-center justify-center w-full h-20 border border-dashed rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-5 h-5 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                        <p className="text-xs text-gray-500 font-medium">Click to upload</p>
                                    </div>
                                    <input type="file" className="hidden" onChange={(e) => setFormData({...formData, file: e.target.files?.[0]})} />
                                </label>
                                {(formData.file || (isEditSidebarOpen && selectedAnnouncement?.file)) && (
                                    <div className="mt-2 flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {formData.file ? formData.file.name : 'Existing file attached'}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={`p-4 sm:p-6 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                            <button 
                                onClick={handleSaveAnnouncement}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-md transition-colors"
                            >
                                {isEditSidebarOpen ? 'Save Changes' : 'Post Announcement'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* View Dialog */}
        {isViewDialogOpen && selectedAnnouncement && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
                <div className="absolute inset-0 bg-gray-900/50 transition-opacity" onClick={() => setIsViewDialogOpen(false)} />
                <div className={`relative w-full max-w-2xl rounded-md border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex flex-col max-h-[90vh]`}>
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAnnouncement.title}</h2>
                                <div className="flex gap-2 items-center">
                                    <StatusBadge type={selectedAnnouncement.selectedAudience} text={selectedAnnouncement.selectedAudience} />
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>• {formatDate(selectedAnnouncement.createdDate)}</span>
                                </div>
                            </div>
                            <button onClick={() => setIsViewDialogOpen(false)} className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                <svg className="w-5 h-5 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className={`prose max-w-none mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{selectedAnnouncement.message}</p>
                        </div>
                        {selectedAnnouncement.file && (
                            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-md border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <div className="text-sm min-w-0">
                                        <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Attached File</p>
                                        <p className="text-gray-500 truncate">{getFileNameFromUrl(selectedAnnouncement.file)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleFilePreview(selectedAnnouncement.file!)} className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/50 rounded hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition-colors">Preview</button>
                                    <button onClick={() => handleFileDownload(selectedAnnouncement.file!, 'download')} className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-200/50 rounded hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">Download</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
             </div>
        )}

        {/* Delete Dialog */}
        {isDeleteDialogOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-gray-900/50" onClick={() => setIsDeleteDialogOpen(false)} />
                <div className={`relative w-full max-w-sm p-6 rounded-md border text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="w-12 h-12 mx-auto mb-4 rounded-md bg-red-50 text-red-600 flex items-center justify-center dark:bg-red-900/20 dark:text-red-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Confirm Deletion</h3>
                    <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Are you sure you want to delete this? This action cannot be undone.</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => setIsDeleteDialogOpen(false)} className="px-4 py-2 font-semibold text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
                        <button onClick={confirmDelete} className="px-4 py-2 font-semibold text-sm rounded-md bg-red-600 text-white hover:bg-red-700">Delete</button>
                    </div>
                </div>
            </div>
        )}

        {/* File Preview Dialog */}
        {isFilePreviewOpen && selectedFile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                 <div className="absolute inset-0 bg-gray-900/80 transition-opacity" onClick={() => setIsFilePreviewOpen(false)} />
                 <div className={`relative w-full max-w-4xl h-[85vh] rounded-md border overflow-hidden flex flex-col ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate mr-4`}>{getFileNameFromUrl(selectedFile)}</h3>
                        <button onClick={() => setIsFilePreviewOpen(false)} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="flex-1 bg-gray-100 dark:bg-black/50 p-2 sm:p-4 overflow-auto flex items-center justify-center">
                        {isImageFile(getFileNameFromUrl(selectedFile)) ? (
                            <img src={selectedFile} alt="Preview" className="max-w-full max-h-full object-contain rounded border border-gray-200 dark:border-gray-700 shadow-sm" />
                        ) : isPdfFile(getFileNameFromUrl(selectedFile)) ? (
                            <iframe src={selectedFile} className="w-full h-full rounded border border-gray-200 dark:border-gray-700 bg-white" title="PDF Preview" />
                        ) : (
                            <div className="text-center p-6">
                                <div className="mb-4 p-3 bg-gray-200 dark:bg-gray-800 rounded-md inline-block">
                                     <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <p className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Preview not available</p>
                                <button onClick={() => handleFileDownload(selectedFile, getFileNameFromUrl(selectedFile))} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700">Download File</button>
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

export default Announcements;