import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { examTimetableService } from '../../../services/examTimetableService';
import { classroomService, Classroom } from '../../../services/classroomService';
import { ExamTimetable, CreateExamTimetableRequest } from '../../../models/examTimetable';

// Dialog Component
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'confirm';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const Dialog: React.FC<DialogProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type, 
  onConfirm, 
  confirmText = 'OK',
  cancelText = 'Cancel'
}) => {
  const { isDarkMode } = useDarkMode();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className={`relative w-96 max-w-full mx-4 rounded-lg shadow-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              type === 'success' ? 'bg-green-100 text-green-600' :
              type === 'error' ? 'bg-red-100 text-red-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {type === 'success' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {type === 'error' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {type === 'confirm' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h3>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            {type === 'confirm' && (
              <button
                onClick={onClose}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={type === 'confirm' ? onConfirm : onClose}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                type === 'success' 
                  ? 'bg-green-600 text-white hover:bg-green-700' :
                type === 'error' 
                  ? 'bg-red-600 text-white hover:bg-red-700' :
                  'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Shimmer Loading Component
const ShimmerCard: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className={`p-6 rounded-xl border ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } shadow-lg`}>
      {/* Timetable Header Shimmer */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
          <div className="h-6 bg-gray-300 rounded-full w-16 animate-pulse"></div>
        </div>
        
        <div className={`p-4 rounded-lg ${
          isDarkMode 
            ? 'bg-gray-700 border border-gray-600' 
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={`text-center p-2 rounded ${
              isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
            }`}>
              <div className="h-4 bg-gray-300 rounded w-16 mx-auto mb-1 animate-pulse"></div>
              <div className="h-3 bg-gray-300 rounded w-20 mx-auto animate-pulse"></div>
            </div>
            <div className={`text-center p-2 rounded ${
              isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
            }`}>
              <div className="h-4 bg-gray-300 rounded w-16 mx-auto mb-1 animate-pulse"></div>
              <div className="h-3 bg-gray-300 rounded w-20 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Shimmer */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
        </div>
        
        <div className="space-y-2">
          {/* Subject 1 */}
          <div className={`p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-300 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-300 rounded w-32 mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-300 rounded w-28 animate-pulse"></div>
              </div>
              <div className="ml-2 w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* Subject 2 */}
          <div className={`p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-300 rounded w-20 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-300 rounded w-28 mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-300 rounded w-24 animate-pulse"></div>
              </div>
              <div className="ml-2 w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Shimmer */}
      <div className="flex space-x-2">
        <div className="flex-1 h-9 bg-gray-300 rounded-lg animate-pulse"></div>
        <div className="w-9 h-9 bg-gray-300 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
};

// Shimmer Header
const ShimmerHeader: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <div className="h-8 bg-gray-300 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-64 animate-pulse"></div>
      </div>
      <div className="h-10 bg-gray-300 rounded-lg w-32 animate-pulse"></div>
    </div>
  );
};

// Shimmer Form Field
const ShimmerFormField: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
      <div className={`h-10 bg-gray-300 rounded-lg w-full animate-pulse`}></div>
    </div>
  );
};

// Shimmer Select Field
const ShimmerSelectField: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
      <div className={`h-10 bg-gray-300 rounded-lg w-full animate-pulse`}></div>
    </div>
  );
};

// Shimmer Sidebar
const ShimmerSidebar: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black bg-opacity-50" />
      <div className={`relative w-96 max-w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 bg-gray-300 rounded w-40 animate-pulse"></div>
            <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
          </div>

          <div className="space-y-4">
            <ShimmerFormField />
            <ShimmerSelectField />
            <ShimmerFormField />
            <ShimmerFormField />
            <div className="h-12 bg-gray-300 rounded-lg w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Shimmer Dialog
const ShimmerDialog: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" />
      <div className={`relative w-96 max-w-full mx-4 rounded-lg shadow-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
            <div className="ml-3">
              <div className="h-5 bg-gray-300 rounded w-32 animate-pulse"></div>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <div className="h-9 bg-gray-300 rounded-lg w-20 animate-pulse"></div>
            <div className="h-9 bg-gray-300 rounded-lg w-16 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExamTimetableComponent: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timetables, setTimetables] = useState<ExamTimetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Loading states for different operations
  const [addingTimetable, setAddingTimetable] = useState(false);
  const [deletingTimetables, setDeletingTimetables] = useState<Set<string>>(new Set());
  const [deletingSubjects, setDeletingSubjects] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'confirm';
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });
  
  // Form state for new timetable
  const [formData, setFormData] = useState({
    examName: '',
    className: '',
    classId: '',
    startDate: '',
    endDate: ''
  });

  // Embedded subjects for new timetable
  const [newSubjects, setNewSubjects] = useState<Array<{
    subjectId: string;
    subjectName: string;
    examDate: string; // YYYY-MM-DD from input
    startTime: string; // HH:MM from input
    endTime: string;   // HH:MM from input
  }>>([]);

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [classroomsLoading, setClassroomsLoading] = useState(true);

  // Get schoolId from authenticated user
  const schoolId = user?.schoolId;
  const academicYear = '2025-2026';

  useEffect(() => {
    if (!schoolId) return;
    fetchExamTimetables();
    fetchClassrooms();
  }, [schoolId]);

  const fetchExamTimetables = async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await examTimetableService.getExamTimetables(schoolId, academicYear);
      setTimetables(data);
    } catch (err) {
      setError('Failed to fetch exam timetables');
      console.error('Error fetching timetables:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassrooms = async () => {
    if (!schoolId) return;
    try {
      setClassroomsLoading(true);
      const data = await classroomService.getClassesBySchoolId(schoolId, academicYear);
      setClassrooms(data);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
    } finally {
      setClassroomsLoading(false);
    }
  };

  const showDialog = (title: string, message: string, type: 'success' | 'error' | 'confirm', onConfirm?: () => void, confirmText?: string, cancelText?: string) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText
    });
  };

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  const inputDateToApi = (inputDate: string) => {
    if (!inputDate) return '';
    const [yyyy, mm, dd] = inputDate.split('-');
    return `${dd}-${mm}-${yyyy}`;
  };

  const apiToInputDate = (apiDate: string) => {
    if (!apiDate) return '';
    const [dd, mm, yyyy] = apiDate.split('-');
    return `${yyyy}-${mm}-${dd}`;
  };


  const to12Hour = (timeValue: string) => {
    if (!timeValue) return '';
    const [hStr, mStr] = timeValue.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const to24Hour = (timeValue: string) => {
    if (!timeValue) return '';
    const match = timeValue.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return timeValue; // already HH:MM
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const generateSubjectIdFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 24) || `sub_${Date.now()}`;
  };

  const selectedClassroom: Classroom | undefined = classrooms.find(c => c.classId === formData.classId);
  const availableSubjects = selectedClassroom?.subjects || [];

  // Add modal subject handlers (for create flow)
  const handleAddSubjectRow = () => {
    setNewSubjects(prev => ([...prev, { subjectId: '', subjectName: '', examDate: '', startTime: '', endTime: '' }]));
  };

  const handleRemoveSubjectRow = (index: number) => {
    setNewSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubjectChange = (index: number, field: keyof (typeof newSubjects)[number], value: string) => {
    setNewSubjects(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const validateNewTimetable = (): string | null => {
    if (!formData.examName || !formData.className || !formData.classId || !formData.startDate || !formData.endDate) {
      return 'Please fill all timetable fields';
    }
    if (newSubjects.length === 0) {
      return 'Add at least one subject';
    }
    for (const s of newSubjects) {
      if (!s.subjectName || !s.examDate || !s.startTime || !s.endTime) {
        return 'Please fill all subject fields';
      }
    }
    return null;
  };

  const handleAddTimetable = async () => {
    if (!schoolId) return;

    const validationMsg = validateNewTimetable();
    if (validationMsg) {
      showDialog('Validation Error', validationMsg, 'error');
      return;
    }

    try {
      setAddingTimetable(true);
      
      const payload = {
        classId: formData.classId,
        className: formData.className,
        examName: formData.examName,
        examStartDate: inputDateToApi(formData.startDate),
        examEndDate: inputDateToApi(formData.endDate),
        subjects: newSubjects.map(s => ({
          subjectId: s.subjectId && s.subjectId.trim().length > 0 ? s.subjectId.trim() : generateSubjectIdFromName(s.subjectName),
          subjectName: s.subjectName,
          examDate: inputDateToApi(s.examDate),
          startTime: to12Hour(s.startTime),
          endTime: to12Hour(s.endTime),
        }))
      };

      const newTimetable = await examTimetableService.createExamTimetable(schoolId, academicYear, payload);

      setTimetables(prev => [...prev, newTimetable]);
      setFormData({ examName: '', className: '', classId: '', startDate: '', endDate: '' });
      setNewSubjects([]);
      setIsSidebarOpen(false);
      showDialog('Success', 'Timetable created successfully!', 'success');
    } catch (err) {
      showDialog('Error', 'Failed to create timetable', 'error');
      console.error('Error creating timetable:', err);
    } finally {
      setAddingTimetable(false);
    }
  };

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [updatingTimetable, setUpdatingTimetable] = useState(false);
  const [editFormData, setEditFormData] = useState({
    timetableId: '',
    examName: '',
    className: '',
    classId: '',
    startDate: '',
    endDate: ''
  });
  const [editSubjects, setEditSubjects] = useState<Array<{
    subjectId: string;
    subjectName: string;
    examDate: string; // DD/MM/YYYY in UI
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
  }>>([]);

  const selectedEditClassroom: Classroom | undefined = classrooms.find(c => c.classId === editFormData.classId);
  const availableEditSubjects = selectedEditClassroom?.subjects || [];

  const handleAddEditSubjectRow = () => {
    setEditSubjects(prev => ([...prev, { subjectId: '', subjectName: '', examDate: '', startTime: '', endTime: '' }]));
  };

  const handleRemoveEditSubjectRow = (index: number) => {
    setEditSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditSubjectChange = (index: number, field: keyof (typeof editSubjects)[number], value: string) => {
    setEditSubjects(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const validateEditTimetable = (): string | null => {
    if (!editFormData.examName || !editFormData.className || !editFormData.classId || !editFormData.startDate || !editFormData.endDate) {
      return 'Please fill all timetable fields';
    }
    if (editSubjects.length === 0) {
      return 'Add at least one subject';
    }
    for (const s of editSubjects) {
      if (!s.subjectName || !s.examDate || !s.startTime || !s.endTime) {
        return 'Please fill all subject fields';
      }
    }
    return null;
  };

  const openEditModal = (t: ExamTimetable) => {
    setEditFormData({
      timetableId: t.timetableId,
      examName: t.examName,
      className: t.className,
      classId: t.classId,
      startDate: apiToInputDate(t.examStartDate),
      endDate: apiToInputDate(t.examEndDate),
    });
    setEditSubjects((t.subjects || []).map(s => ({
      subjectId: s.subjectId || generateSubjectIdFromName(s.subjectName),
      subjectName: s.subjectName,
      examDate: apiToInputDate(s.examDate),
      startTime: to24Hour(s.startTime),
      endTime: to24Hour(s.endTime),
    })));
    setIsEditOpen(true);
  };

  const handleUpdateTimetable = async () => {
    if (!schoolId) return;

    const validationMsg = validateEditTimetable();
    if (validationMsg) {
      showDialog('Validation Error', validationMsg, 'error');
      return;
    }

    try {
      setUpdatingTimetable(true);
      const payload = {
        classId: editFormData.classId,
        className: editFormData.className,
        examName: editFormData.examName,
        examStartDate: inputDateToApi(editFormData.startDate),
        examEndDate: inputDateToApi(editFormData.endDate),
        subjects: editSubjects.map(s => ({
          subjectId: s.subjectId && s.subjectId.trim().length > 0 ? s.subjectId.trim() : generateSubjectIdFromName(s.subjectName),
          subjectName: s.subjectName,
          examDate: inputDateToApi(s.examDate),
          startTime: to12Hour(s.startTime),
          endTime: to12Hour(s.endTime),
        }))
      };

      const updated = await examTimetableService.updateExamTimetable(
        schoolId,
        academicYear,
        editFormData.timetableId,
        payload
      );

      setTimetables(prev => prev.map(tt => tt.timetableId === updated.timetableId ? updated : tt));
      setIsEditOpen(false);
      showDialog('Success', 'Timetable updated successfully!', 'success');
    } catch (err) {
      showDialog('Error', 'Failed to update timetable', 'error');
      console.error('Error updating timetable:', err);
    } finally {
      setUpdatingTimetable(false);
    }
  };

  const handleDeleteSubject = (timetableId: string, subjectId: string) => {
    if (!schoolId) return;
    showDialog(
      'Confirm Delete',
      'Are you sure you want to delete this subject?',
      'confirm',
      async () => {
        try {
          setDeletingSubjects(prev => new Set(prev).add(subjectId));
          await examTimetableService.deleteSubject(schoolId, academicYear, timetableId, subjectId);
          setTimetables(timetables.map(timetable => 
            timetable.timetableId === timetableId 
              ? { ...timetable, subjects: timetable.subjects.filter(subject => subject.subjectId !== subjectId) }
              : timetable
          ));
          showDialog('Success', 'Subject deleted successfully!', 'success');
        } catch (err) {
          showDialog('Error', 'Failed to delete subject', 'error');
          console.error('Error deleting subject:', err);
        } finally {
          setDeletingSubjects(prev => {
            const newSet = new Set(prev);
            newSet.delete(subjectId);
            return newSet;
          });
        }
      },
      'Delete',
      'Cancel'
    );
  };

  const handleDeleteTimetable = async (timetableId: string) => {
    if (!schoolId) return;
    showDialog(
      'Confirm Delete',
      'Are you sure you want to delete this timetable? This will also delete all associated subjects.',
      'confirm',
      async () => {
        try {
          setDeletingTimetables(prev => new Set(prev).add(timetableId));
          await examTimetableService.deleteExamTimetable(schoolId, academicYear, timetableId);
          setTimetables(timetables.filter(timetable => timetable.timetableId !== timetableId));
          showDialog('Success', 'Timetable deleted successfully!', 'success');
        } catch (err) {
          showDialog('Error', 'Failed to delete timetable', 'error');
          console.error('Error deleting timetable:', err);
        } finally {
          setDeletingTimetables(prev => {
            const newSet = new Set(prev);
            newSet.delete(timetableId);
            return newSet;
          });
        }
      },
      'Delete',
      'Cancel'
    );
  };

  const formatDate = (dateString: string) => {
    // Convert DD-MM-YYYY to readable format
    const [day, month, year] = dateString.split('-');
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatSubjectDate = (dateString: string) => {
    // Convert DD-MM-YYYY to readable format
    const [day, month, year] = dateString.split('-');
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!schoolId) {
    return (
      <div className="text-center py-12">
        <div className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>Loading user information...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <ShimmerHeader />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className={`text-lg text-red-500 mb-4`}>{error}</div>
        <button
          onClick={fetchExamTimetables}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isDarkMode 
              ? 'bg-primary-600 text-white hover:bg-primary-700' 
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Exam Timetable</h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your school's exam schedules
          </p>
        </div>
        <button
          onClick={() => {
            if (newSubjects.length === 0) {
              setNewSubjects([{ subjectId: '', subjectName: '', examDate: '', startTime: '', endTime: '' }]);
            }
            setIsSidebarOpen(true);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isDarkMode 
              ? 'bg-primary-600 text-white hover:bg-primary-700' 
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          Add Timetable
        </button>
      </div>

      {/* Timetables List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {timetables.map((timetable) => (
          <div
            key={timetable.timetableId}
            className={`p-6 rounded-xl border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600' 
                : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            } shadow-lg transition-all duration-300 hover:shadow-xl`}
          >
            {/* Timetable Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-primary-600 truncate">{timetable.examName}</h3>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  isDarkMode 
                    ? 'bg-green-900 text-green-300 border border-green-700' 
                    : 'bg-green-100 text-green-800 border border-green-200'
                }`}>
                  Active
                </span>
              </div>
              
              <div className={`p-4 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 border border-gray-600' 
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Class: {timetable.className}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className={`text-center p-2 rounded ${
                    isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                  }`}>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Start Date</p>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {formatDate(timetable.examStartDate)}
                    </p>
                  </div>
                  <div className={`text-center p-2 rounded ${
                    isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                  }`}>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>End Date</p>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {formatDate(timetable.examEndDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subjects ({timetable.subjects.length})
                </h4>
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {timetable.subjects.map((subject) => (
                  <div
                    key={subject.subjectId}
                    className={`p-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    } transition-colors duration-200`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {subject.subjectName}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatSubjectDate(subject.examDate)} • 
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {subject.startTime}-{subject.endTime}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteSubject(timetable.timetableId, subject.subjectId)}
                        className="ml-2 text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete subject"
                        disabled={deletingSubjects.has(subject.subjectId)}
                      >
                        {deletingSubjects.has(subject.subjectId) ? (
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                {timetable.subjects.length === 0 && (
                  <div className={`text-center py-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <svg className="mx-auto h-8 w-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-xs">No subjects added yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Bottom Row */}
            <div className="flex space-x-2">
              <button
                onClick={() => openEditModal(timetable)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                  isDarkMode 
                      ? 'border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-white hover:border-gray-500' 
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-primary-600 hover:border-primary-300'
                }`}
                title="Edit timetable"
              >
                Edit
              </button>
              <div className="flex-1" />
              <button
                onClick={() => handleDeleteTimetable(timetable.timetableId)}
                disabled={deletingTimetables.has(timetable.timetableId)}
                className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                  deletingTimetables.has(timetable.timetableId)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600 hover:shadow-md'
                }`}
                title="Delete timetable"
              >
                {deletingTimetables.has(timetable.timetableId) ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {timetables.length === 0 && !loading && (
        <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">No exam timetables created yet</p>
          <p className="text-sm">Click "Add Timetable" to create your first timetable.</p>
        </div>
      )}

      {/* Add Timetable Modal */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
          <div className={`relative w-full max-w-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl rounded-lg`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add New Timetable</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Exam Name</label>
                  <input
                    type="text"
                    value={formData.examName}
                    onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                    placeholder="Enter exam name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Class Name</label>
                    {classroomsLoading ? (
                      <div className="w-full h-10 bg-gray-300 rounded-lg animate-pulse"></div>
                    ) : (
                  <select
                    value={formData.classId}
                        onChange={(e) => {
                      const selectedClass = classrooms.find(c => c.classId === e.target.value);
                          setFormData({ 
                            ...formData, 
                        className: selectedClass?.className || '',
                            classId: selectedClass?.classId || ''
                          });
                        }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  >
                    <option value="" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Select Class</option>
                        {classrooms.map((classroom) => (
                      <option key={classroom.classId} value={classroom.classId} className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>
                        {`${classroom.className} ${classroom.section}`}
                      </option>
                    ))}
                  </select>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  />
                  </div>
                </div>

                {/* Subjects inline */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Subjects</label>
                    <button
                      type="button"
                      onClick={handleAddSubjectRow}
                      className={`px-2 py-1 text-xs rounded border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      + Add Subject
                    </button>
                  </div>

                  {newSubjects.length === 0 && (
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No subjects added yet.</p>
                  )}

                  <div className="space-y-3">
                    {newSubjects.map((s, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Subject</label>
                            {availableSubjects.length > 0 ? (
                              <select
                                value={s.subjectName}
                                onChange={(e) => {
                                  const selectedName = e.target.value;
                                  const autoId = generateSubjectIdFromName(selectedName);
                                  setNewSubjects(prev => prev.map((item, i) => i === idx ? { ...item, subjectName: selectedName, subjectId: autoId } : item));
                                }}
                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                              >
                                <option value="">Select Subject</option>
                                {availableSubjects.map((subj) => (
                                  <option key={`${subj.subjectName}-${subj.teacherId}`} value={subj.subjectName}>
                                    {subj.subjectName}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={s.subjectName}
                                onChange={(e) => handleSubjectChange(idx, 'subjectName', e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                placeholder="e.g., Mathematics"
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Exam Date</label>
                              <input
                                type="date"
                                value={s.examDate}
                                onChange={(e) => handleSubjectChange(idx, 'examDate', e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Start Time</label>
                                <input
                                  type="time"
                                  value={s.startTime}
                                  onChange={(e) => handleSubjectChange(idx, 'startTime', e.target.value)}
                                  className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                />
                              </div>
                              <div>
                                <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>End Time</label>
                                <input
                                  type="time"
                                  value={s.endTime}
                                  onChange={(e) => handleSubjectChange(idx, 'endTime', e.target.value)}
                                  className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveSubjectRow(idx)}
                              className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-red-900 text-red-200 hover:bg-red-800' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddTimetable}
                  disabled={addingTimetable || !!validateNewTimetable()}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    (addingTimetable || !!validateNewTimetable())
                      ? 'bg-gray-400 cursor-not-allowed'
                      : isDarkMode 
                        ? 'bg-primary-600 text-white hover:bg-primary-700' 
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                  }`}
                >
                  {addingTimetable ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    'Add Timetable'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Timetable Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsEditOpen(false)} />
          <div className={`relative w-full max-w-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl rounded-lg`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Timetable</h2>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Exam Name</label>
                  <input
                    type="text"
                    value={editFormData.examName}
                    onChange={(e) => setEditFormData({ ...editFormData, examName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                    placeholder="Enter exam name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Class Name</label>
                  {classroomsLoading ? (
                    <div className="w-full h-10 bg-gray-300 rounded-lg animate-pulse"></div>
                  ) : (
                                         <select
                    value={editFormData.classId}
                       onChange={(e) => {
                      const selectedClass = classrooms.find(c => c.classId === e.target.value);
                      setEditFormData({ 
                        ...editFormData, 
                        className: selectedClass?.className || '',
                        classId: selectedClass?.classId || ''
                         });
                       }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                           ? 'bg-gray-700 border-gray-600 text-white' 
                           : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                     >
                    <option value="" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Select Class</option>
                    {classrooms.map((classroom) => (
                      <option key={classroom.classId} value={classroom.classId} className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>
                        {`${classroom.className} ${classroom.section}`}
                           </option>
                    ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Start Date</label>
                  <input
                    type="date"
                      value={editFormData.startDate}
                      onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  />
                </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>End Date</label>
                    <input
                      type="date"
                      value={editFormData.endDate}
                      onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                    />
                  </div>
                </div>

                {/* Subjects inline */}
                  <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Subjects</label>
                    <button
                      type="button"
                      onClick={handleAddEditSubjectRow}
                      className={`px-2 py-1 text-xs rounded border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      + Add Subject
                    </button>
                  </div>

                  {editSubjects.length === 0 && (
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No subjects added yet.</p>
                  )}

                  <div className="space-y-3">
                    {editSubjects.map((s, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Subject</label>
                            {availableEditSubjects.length > 0 ? (
                              <select
                                value={s.subjectName}
                                onChange={(e) => {
                                  const selectedName = e.target.value;
                                  const autoId = generateSubjectIdFromName(selectedName);
                                  setEditSubjects(prev => prev.map((item, i) => i === idx ? { ...item, subjectName: selectedName, subjectId: autoId } : item));
                                }}
                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                              >
                                <option value="">Select Subject</option>
                                {availableEditSubjects.map((subj) => (
                                  <option key={`${subj.subjectName}-${subj.teacherId}`} value={subj.subjectName}>
                                    {subj.subjectName}
                                  </option>
                                ))}
                              </select>
                            ) : (
                    <input
                                type="text"
                                value={s.subjectName}
                                onChange={(e) => handleEditSubjectChange(idx, 'subjectName', e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                placeholder="e.g., Mathematics"
                              />
                            )}
                  </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Exam Date</label>
                              <input
                                type="date"
                                value={s.examDate}
                                onChange={(e) => handleEditSubjectChange(idx, 'examDate', e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                              />
                </div>
                            <div className="grid grid-cols-2 gap-3">
                <div>
                                <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Start Time</label>
                  <input
                                  type="time"
                                  value={s.startTime}
                                  onChange={(e) => handleEditSubjectChange(idx, 'startTime', e.target.value)}
                                  className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                />
                              </div>
                              <div>
                                <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>End Time</label>
                                <input
                                  type="time"
                                  value={s.endTime}
                                  onChange={(e) => handleEditSubjectChange(idx, 'endTime', e.target.value)}
                                  className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveEditSubjectRow(idx)}
                              className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-red-900 text-red-200 hover:bg-red-800' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleUpdateTimetable}
                  disabled={updatingTimetable || !!validateEditTimetable()}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    (updatingTimetable || !!validateEditTimetable())
                      ? 'bg-gray-400 cursor-not-allowed'
                      : isDarkMode 
                        ? 'bg-primary-600 text-white hover:bg-primary-700' 
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                  }`}
                >
                  {updatingTimetable ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Update Timetable'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Component */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
      />

      {/* Shimmer Dialog for loading states */}
      {(addingTimetable || updatingTimetable || deletingTimetables.size > 0 || deletingSubjects.size > 0) && (
        <ShimmerDialog />
      )}
    </div>
  );
};

export default ExamTimetableComponent;