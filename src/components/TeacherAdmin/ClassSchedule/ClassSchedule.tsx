import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { classroomService, Classroom } from '../../../services/classroomService';
import { classScheduleService, CreateScheduleRequest, UpdateScheduleRequest } from '../../../services/classScheduleService';
import { Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Chip, Tooltip, CircularProgress, Select, FormControl, Menu } from '@mui/material';
import { Add, Edit, Delete, Refresh, Schedule, AccessTime, Person, Subject, MoreVert, Visibility } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import { authService } from '../../../services/authService';
import 'react-toastify/dist/ReactToastify.css';

// Types
interface TimeSlot {
  scheduleId?: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  teacherName: string;
  isBreakPeriod: boolean;
  breakType?: 'Lunch' | 'Short Break' | 'Assembly' | 'Free Period' | null;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
}

interface ClassTimetable {
  classId: string;
  className: string;
  slots: TimeSlot[];
}

// Shimmer Loading Components
const ShimmerCard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-300 dark:bg-gray-700 rounded-xl h-full"></div>
  </div>
);

const ShimmerTableRow: React.FC = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-center">
      <div className="flex space-x-2">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </td>
  </tr>
);

// Add/Edit Slot Modal
const SlotModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  slot: TimeSlot | null;
  mode: 'add' | 'edit';
  onSave: (slot: TimeSlot) => void;
  isLoading: boolean;
  isDarkMode: boolean;
  selectedClass: Classroom | null;
  availableSubjects: string[];
}> = ({ isOpen, onClose, slot, mode, onSave, isLoading, isDarkMode, selectedClass, availableSubjects }) => {
  const [formData, setFormData] = useState<TimeSlot>({
    startTime: '',
    endTime: '',
    subjectName: '',
    teacherName: '',
    isBreakPeriod: false,
    breakType: 'Short Break',
    dayOfWeek: 'Monday'
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && slot) {
        setFormData(slot);
      } else {
        setFormData({
          startTime: '',
          endTime: '',
          subjectName: '',
          teacherName: '',
          isBreakPeriod: false,
          breakType: 'Short Break',
          dayOfWeek: 'Monday'
        });
      }
    }
  }, [isOpen, mode, slot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startTime || !formData.endTime) {
      toast.error('Please fill in start and end times');
      return;
    }

    if (!formData.isBreakPeriod && !formData.subjectName) {
      toast.error('Please fill in subject name');
      return;
    }

    if (!formData.isBreakPeriod && !formData.teacherName) {
      toast.error('Please fill in teacher name');
      return;
    }

    onSave(formData);
  };

  const handleSubjectChange = (subjectName: string) => {
    setFormData(prev => ({
      ...prev,
      subjectName,
      teacherName: '' // Reset teacher name when subject changes
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {mode === 'add' ? 'Add Time Slot' : 'Edit Time Slot'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedClass ? `${selectedClass.className}-${selectedClass.section}` : 'Class Schedule'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Day Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Day of Week *
            </label>
            <FormControl fullWidth>
              <Select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData(prev => ({ ...prev, dayOfWeek: e.target.value as TimeSlot['dayOfWeek'] }))}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                      color: isDarkMode ? '#E5E7EB' : '#111827',
                      '& .MuiMenuItem-root': {
                        color: isDarkMode ? '#E5E7EB' : '#111827',
                        backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#4B5563' : '#F3F4F6',
                        },
                      },
                    },
                  },
                }}
                sx={{
                  color: isDarkMode ? '#E5E7EB' : '#111827',
                  backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? '#374151' : '#D1D5DB',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? '#4B5563' : '#9CA3AF',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3B82F6',
                  },
                  '& .MuiSelect-icon': {
                    color: isDarkMode ? '#E5E7EB' : '#111827',
                  },
                }}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <MenuItem 
                    key={day} 
                    value={day}
                    sx={{
                      color: isDarkMode ? '#E5E7EB' : '#111827',
                      backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                      '&:hover': {
                        backgroundColor: isDarkMode ? '#4B5563' : '#F3F4F6',
                      },
                    }}
                  >
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Time *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
                required
              />
            </div>
          </div>

          {/* Break Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isBreakPeriod"
              checked={formData.isBreakPeriod}
              onChange={(e) => setFormData(prev => ({ ...prev, isBreakPeriod: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isBreakPeriod" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              This is a break period
            </label>
          </div>

          {/* Break Type (if break is selected) */}
          {formData.isBreakPeriod && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Break Type *
              </label>
              <FormControl fullWidth>
                <Select
                  value={formData.breakType}
                  onChange={(e) => setFormData(prev => ({ ...prev, breakType: e.target.value as TimeSlot['breakType'] }))}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                        color: isDarkMode ? '#E5E7EB' : '#111827',
                        '& .MuiMenuItem-root': {
                          color: isDarkMode ? '#E5E7EB' : '#111827',
                          backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                          '&:hover': {
                            backgroundColor: isDarkMode ? '#4B5563' : '#F3F4F6',
                          },
                        },
                      },
                    },
                  }}
                  sx={{
                    color: isDarkMode ? '#E5E7EB' : '#111827',
                    backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? '#374151' : '#D1D5DB',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? '#4B5563' : '#9CA3AF',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3B82F6',
                    },
                    '& .MuiSelect-icon': {
                      color: isDarkMode ? '#E5E7EB' : '#111827',
                    },
                  }}
                >
                  {['Lunch', 'Short Break', 'Assembly', 'Free Period'].map(type => (
                    <MenuItem 
                      key={type} 
                      value={type}
                      sx={{
                        color: isDarkMode ? '#E5E7EB' : '#111827',
                        backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#4B5563' : '#F3F4F6',
                        },
                      }}
                    >
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          )}

          {/* Subject Selection (if not break) */}
          {!formData.isBreakPeriod && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject *
              </label>
              <FormControl fullWidth>
                <Select
                  value={formData.subjectName}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                        color: isDarkMode ? '#E5E7EB' : '#111827',
                        '& .MuiMenuItem-root': {
                          color: isDarkMode ? '#E5E7EB' : '#111827',
                          backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                          '&:hover': {
                            backgroundColor: isDarkMode ? '#4B5563' : '#F3F4F6',
                          },
                        },
                      },
                    },
                  }}
                  sx={{
                    color: isDarkMode ? '#E5E7EB' : '#111827',
                    backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? '#374151' : '#D1D5DB',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? '#4B5563' : '#9CA3AF',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3B82F6',
                    },
                    '& .MuiSelect-icon': {
                      color: isDarkMode ? '#E5E7EB' : '#111827',
                    },
                  }}
                >
                  <MenuItem 
                    value=""
                    sx={{
                      color: isDarkMode ? '#E5E7EB' : '#111827',
                      backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                      '&:hover': {
                        backgroundColor: isDarkMode ? '#4B5563' : '#F3F4F6',
                      },
                    }}
                  >
                    Select Subject
                  </MenuItem>
                  {availableSubjects.map(subject => (
                    <MenuItem 
                      key={subject} 
                      value={subject}
                      sx={{
                        color: isDarkMode ? '#E5E7EB' : '#111827',
                        backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#4B5563' : '#F3F4F6',
                        },
                      }}
                    >
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          )}

          {/* Teacher Name (if not break) */}
          {!formData.isBreakPeriod && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teacher Name *
              </label>
              <input
                type="text"
                value={formData.teacherName}
                onChange={(e) => setFormData(prev => ({ ...prev, teacherName: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
                placeholder="Enter teacher name"
                required={!formData.isBreakPeriod}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  {mode === 'add' ? 'Adding...' : 'Updating...'}
                </>
              ) : (
                mode === 'add' ? 'Add Slot' : 'Update Slot'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ClassSchedule: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
  const [timetable, setTimetable] = useState<ClassTimetable | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<TimeSlot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [teacherDefaultClassId, setTeacherDefaultClassId] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [menuSlot, setMenuSlot] = useState<TimeSlot | null>(null);
  const [viewSlot, setViewSlot] = useState<TimeSlot | null>(null);
  const [nowTs, setNowTs] = useState<number>(Date.now());

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Calendar rendering constants
  const DAY_START_MINUTES = 7 * 60; // 07:00
  const DAY_END_MINUTES = 19 * 60; // 19:00
  const TOTAL_DAY_MINUTES = DAY_END_MINUTES - DAY_START_MINUTES; // 12 hours
  const DAY_COLUMN_HEIGHT_PX = 1920; // taller column so 15-min slot ≈ 40px

  const parseTimeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Keep current time updated (minute resolution)
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const nowDate = new Date(nowTs);
  const jsDay = nowDate.getDay(); // 0 Sun - 6 Sat
  const currentDayName = jsDay >= 1 && jsDay <= 6 ? (daysOfWeek[jsDay - 1] as ClassTimetable['slots'][number]['dayOfWeek']) : null;
  const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();
  const nowTopPercent = ((Math.min(DAY_END_MINUTES, Math.max(DAY_START_MINUTES, nowMinutes)) - DAY_START_MINUTES) / TOTAL_DAY_MINUTES) * 100;

  type PositionedSlot = {
    slot: TimeSlot;
    topPercent: number;
    heightPercent: number;
    leftPercent: number;
    widthPercent: number;
  };

  // Compute layout like Google Calendar: stack overlapping slots into columns
  const computeDayPositionedSlots = (day: string): PositionedSlot[] => {
    if (!timetable) return [];
    const slots = timetable.slots
      .filter(s => s.dayOfWeek === day)
      .map(s => ({
        ...s,
        _start: parseTimeToMinutes(s.startTime),
        _end: parseTimeToMinutes(s.endTime)
      }))
      .filter(s => s._end > s._start) // guard
      .sort((a, b) => a._start - b._start || a._end - b._end);

    // Group overlapping slots
    const groups: typeof slots[] = [];
    let current: typeof slots = [] as any;
    let currentMaxEnd = -1;
    for (const s of slots) {
      if (current.length === 0 || s._start < currentMaxEnd) {
        current.push(s);
        currentMaxEnd = Math.max(currentMaxEnd, s._end);
      } else {
        groups.push(current);
        current = [s] as any;
        currentMaxEnd = s._end;
      }
    }
    if (current.length) groups.push(current);

    const positioned: PositionedSlot[] = [];

    for (const group of groups) {
      // Assign columns within this group
      const columnEndTimes: number[] = []; // end time per column
      const columnIndexBySlot = new Map<string, number>();

      for (const s of group) {
        let assignedColumn = -1;
        for (let i = 0; i < columnEndTimes.length; i++) {
          if (columnEndTimes[i] <= s._start) {
            assignedColumn = i;
            break;
          }
        }
        if (assignedColumn === -1) {
          assignedColumn = columnEndTimes.length;
          columnEndTimes.push(s._end);
        } else {
          columnEndTimes[assignedColumn] = s._end;
        }
        columnIndexBySlot.set(s.scheduleId || `${s.subjectName}-${s.startTime}-${s.endTime}-${Math.random()}`, assignedColumn);
      }

      const numColumns = Math.max(1, columnEndTimes.length);

      for (const s of group) {
        const startFromDay = Math.max(DAY_START_MINUTES, s._start) - DAY_START_MINUTES;
        const endFromDay = Math.min(DAY_END_MINUTES, s._end) - DAY_START_MINUTES;
        const topPercent = (startFromDay / TOTAL_DAY_MINUTES) * 100;
        const heightPercent = ((endFromDay - startFromDay) / TOTAL_DAY_MINUTES) * 100;
        const colIndex = columnIndexBySlot.get(s.scheduleId || `${s.subjectName}-${s.startTime}-${s.endTime}`) || 0;
        const widthPercent = 100 / numColumns;
        const leftPercent = colIndex * widthPercent;

        positioned.push({
          slot: s,
          topPercent,
          heightPercent,
          leftPercent,
          widthPercent
        });
      }
    }

    return positioned;
  };

  // Load timetable for selected class
  const loadTimetable = useCallback(async (classItem: Classroom) => {
    if (!user?.schoolId) return;
    
    try {
      const schedules = await classScheduleService.getClassSchedules(user.schoolId, classItem.classId);
      
      // Convert API schedules to local TimeSlot format
      const slots: TimeSlot[] = schedules.map(schedule => ({
        scheduleId: schedule.scheduleId,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        subjectName: schedule.subjectName || '',
        teacherName: schedule.teacherName || '',
        isBreakPeriod: schedule.isBreakPeriod,
        breakType: schedule.breakType,
        dayOfWeek: schedule.dayOfWeek
      }));
      
      const timetable: ClassTimetable = {
        classId: classItem.classId,
        className: classItem.className,
        slots: slots
      };
      
      setTimetable(timetable);
    } catch (error) {
      console.error('Error loading timetable:', error);
      toast.error('Failed to load timetable');
    }
  }, [user?.schoolId]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.schoolId) return;
      try {
        setLoading(true);
        const cls = await classroomService.getClassesBySchoolId(user.schoolId);
        setClasses(cls);
        
        if (cls.length > 0) {
          let defaultClass: Classroom | undefined;
          if (user.role === 'teacher') {
            const teacherId = authService.getTeacherId();
            if (teacherId) {
              defaultClass = cls.find(c => c.classTeacherId === teacherId) ||
                             cls.find(c => Array.isArray(c.subjects) && c.subjects.some(s => s.teacherId === teacherId));
              if (defaultClass) {
                setTeacherDefaultClassId(defaultClass.classId);
              }
            }
          }
          const first = defaultClass || cls[0];
          setSelectedClass(first);
          await loadTimetable(first);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user?.schoolId, loadTimetable]);

  // Handle class change
  const handleClassChange = async (classItem: Classroom) => {
    setSelectedClass(classItem);
    await loadTimetable(classItem);
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (!selectedClass) return;
    setRefreshing(true);
    try {
      await loadTimetable(selectedClass);
      toast.success('Timetable refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing timetable:', error);
      toast.error('Failed to refresh timetable');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle add slot
  const handleAddSlot = () => {
    setEditingSlot(null);
    setModalMode('add');
    setShowSlotModal(true);
  };

  // Handle edit slot
  const handleEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setModalMode('edit');
    setShowSlotModal(true);
  };

  // Handle save slot
  const handleSaveSlot = async (slotData: TimeSlot) => {
    if (!timetable || !user?.schoolId || !selectedClass) return;
    
    setIsModalLoading(true);
    try {
      if (modalMode === 'add') {
        // Create new schedule
        const createRequest: CreateScheduleRequest = {
          dayOfWeek: slotData.dayOfWeek,
          startTime: slotData.startTime,
          endTime: slotData.endTime,
          isBreakPeriod: slotData.isBreakPeriod,
          breakType: slotData.isBreakPeriod ? (slotData.breakType ?? undefined) : undefined,
          teacherName: slotData.isBreakPeriod ? undefined : slotData.teacherName,
          subjectName: slotData.isBreakPeriod ? undefined : slotData.subjectName
        };
        
        const createdSchedule = await classScheduleService.createSchedule(
          user.schoolId, 
          selectedClass.classId, 
          createRequest
        );
        
        const newSlot: TimeSlot = {
          scheduleId: createdSchedule.scheduleId,
          startTime: createdSchedule.startTime,
          endTime: createdSchedule.endTime,
          subjectName: createdSchedule.subjectName || '',
          teacherName: createdSchedule.teacherName || '',
          isBreakPeriod: createdSchedule.isBreakPeriod,
          breakType: createdSchedule.breakType,
          dayOfWeek: createdSchedule.dayOfWeek
        };
        
        setTimetable(prev => prev ? {
          ...prev,
          slots: [...prev.slots, newSlot]
        } : null);
        
        toast.success('Time slot added successfully!');
      } else {
        // Update existing schedule
        if (!editingSlot?.scheduleId) {
          toast.error('Schedule ID not found');
          return;
        }
        
        const updateRequest: UpdateScheduleRequest = {
          dayOfWeek: slotData.dayOfWeek,
          startTime: slotData.startTime,
          endTime: slotData.endTime,
          isBreakPeriod: slotData.isBreakPeriod,
          breakType: slotData.isBreakPeriod ? slotData.breakType : null,
          teacherName: slotData.isBreakPeriod ? undefined : slotData.teacherName,
          subjectName: slotData.isBreakPeriod ? undefined : slotData.subjectName
        };
        
        await classScheduleService.updateSchedule(
          user.schoolId,
          selectedClass.classId,
          editingSlot.scheduleId,
          updateRequest
        );
        
        // Build the updated slot locally (API returns only a message)
        const updatedSlot: TimeSlot = {
          scheduleId: editingSlot.scheduleId,
          startTime: slotData.startTime,
          endTime: slotData.endTime,
          subjectName: slotData.isBreakPeriod ? '' : (slotData.subjectName || ''),
          teacherName: slotData.isBreakPeriod ? '' : (slotData.teacherName || ''),
          isBreakPeriod: slotData.isBreakPeriod,
          breakType: slotData.isBreakPeriod ? (slotData.breakType ?? null) : null,
          dayOfWeek: slotData.dayOfWeek
        };
        
        setTimetable(prev => prev ? {
          ...prev,
          slots: prev.slots.map(slot => 
            slot.scheduleId === editingSlot.scheduleId ? updatedSlot : slot
          )
        } : null);
        
        toast.success('Time slot updated successfully!');
      }
      
      setShowSlotModal(false);
    } catch (error) {
      console.error('Error saving slot:', error);
      toast.error('Failed to save time slot');
    } finally {
      setIsModalLoading(false);
    }
  };

  // Handle delete slot
  const handleDeleteSlot = async () => {
    if (!confirmDelete || !timetable || !user?.schoolId || !selectedClass) return;
    
    setIsDeleting(true);
    try {
      if (!confirmDelete.scheduleId) {
        toast.error('Schedule ID not found');
        return;
      }
      
      await classScheduleService.deleteSchedule(
        user.schoolId,
        selectedClass.classId,
        confirmDelete.scheduleId
      );
      
      setTimetable(prev => prev ? {
        ...prev,
        slots: prev.slots.filter(slot => slot.scheduleId !== confirmDelete.scheduleId)
      } : null);
      
      toast.success('Time slot deleted successfully!');
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('Failed to delete time slot');
    } finally {
      setIsDeleting(false);
    }
  };

  // Get slots for a specific day
  const getSlotsForDay = (day: string) => {
    if (!timetable) return [];
    return timetable.slots
      .filter(slot => slot.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Helper function to check if a time slot should be displayed at a specific time
  const shouldShowSlotAtTime = (slot: TimeSlot, timeString: string) => {
    const slotStart = slot.startTime;
    const slotEnd = slot.endTime;
    
    // Convert time strings to minutes for easier comparison
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const slotStartMinutes = timeToMinutes(slotStart);
    const slotEndMinutes = timeToMinutes(slotEnd);
    const currentTimeMinutes = timeToMinutes(timeString);
    
    // Show slot if current time is within the slot's time range
    return currentTimeMinutes >= slotStartMinutes && currentTimeMinutes < slotEndMinutes;
  };

  // Get available subjects from selected class
  const getAvailableSubjects = (): string[] => {
    if (!selectedClass) return [];
    return selectedClass.subjects?.map(s => s.subjectName) || [];
  };

  // Open Add Slot prefilled for a given day and start minute offset from midnight
  const openAddSlotPreset = (day: TimeSlot['dayOfWeek'], startMinutes: number, endMinutes?: number) => {
    const clamp = (m: number) => Math.max(DAY_START_MINUTES, Math.min(DAY_END_MINUTES, m));
    const start = clamp(startMinutes);
    let end = endMinutes !== undefined ? clamp(endMinutes) : clamp(start + 30);
    if (end <= start) end = clamp(start + 15);

    const toStr = (m: number) => `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;

    const preset: TimeSlot = {
      startTime: toStr(start),
      endTime: toStr(end),
      subjectName: '',
      teacherName: '',
      isBreakPeriod: false,
      breakType: 'Short Break',
      dayOfWeek: day,
    };

    setEditingSlot(preset);
    setModalMode('add');
    setShowSlotModal(true);
  };

  const handleDayDoubleClick = (e: React.MouseEvent<HTMLDivElement>, day: TimeSlot['dayOfWeek']) => {
    if (!timetable) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percent = Math.max(0, Math.min(1, y / rect.height));
    const minutesFromStart = Math.round((percent * TOTAL_DAY_MINUTES) / 15) * 15; // snap to 15
    const absoluteMinutes = DAY_START_MINUTES + minutesFromStart;

    // if any slot overlaps, do nothing
    const overlaps = getSlotsForDay(day).some(s => {
      const sStart = parseTimeToMinutes(s.startTime);
      const sEnd = parseTimeToMinutes(s.endTime);
      return absoluteMinutes >= sStart && absoluteMinutes < sEnd;
    });
    if (overlaps) return;

    openAddSlotPreset(day, absoluteMinutes);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Shimmer */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg w-36 animate-pulse"></div>
          </div>
        </div>

        {/* Class Selector Shimmer */}
        <ShimmerCard className="h-16" />

        {/* Timetable Shimmer */}
        <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monday</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tuesday</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Wednesday</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thursday</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Friday</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Saturday</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(8)].map((_, index) => (
                  <ShimmerTableRow key={index} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Class Schedule</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage weekly class timetables</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Tooltip title="Refresh Timetable">
            <IconButton 
              onClick={handleRefresh} 
              disabled={refreshing}
              sx={{ color: isDarkMode ? '#E5E7EB' : undefined }}
            >
              {refreshing ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Refresh />
              )}
            </IconButton>
          </Tooltip>
          <Button 
            startIcon={<Add sx={{ color: isDarkMode ? '#E5E7EB' : undefined }} />} 
            variant="contained" 
            onClick={handleAddSlot}
          >
            Add Time Slot
          </Button>
        </div>
      </div>

      {/* Class Selector moved into header above - removed this block */}

      {/* Timetable */}
      <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Weekly Timetable - {selectedClass ? `${selectedClass.className}-${selectedClass.section}` : 'Select Class'}
              </h3>
              {teacherDefaultClassId && selectedClass?.classId === teacherDefaultClassId && (
                <Chip size="small" color="primary" label="Your class timetable" />
              )}
            </div>
            <div className="w-56">
              <FormControl fullWidth>
                <Select
                  value={selectedClass?.classId || ''}
                  onChange={(e) => {
                    const classItem = classes.find(c => c.classId === e.target.value);
                    if (classItem) handleClassChange(classItem);
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                        color: isDarkMode ? '#E5E7EB' : '#111827',
                        '& .MuiMenuItem-root': {
                          color: isDarkMode ? '#E5E7EB' : '#111827',
                          backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                          '&:hover': {
                            backgroundColor: isDarkMode ? '#4B5563' : '#F3F4F6',
                          },
                        },
                      },
                    },
                  }}
                  sx={{
                    color: isDarkMode ? '#E5E7EB' : '#111827',
                    backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? '#374151' : '#D1D5DB',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? '#4B5563' : '#9CA3AF',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3B82F6',
                    },
                    '& .MuiSelect-icon': {
                      color: isDarkMode ? '#E5E7EB' : '#111827',
                    },
                  }}
                >
                  {classes.map(cls => (
                    <MenuItem 
                      key={cls.classId} 
                      value={cls.classId}
                      sx={{
                        color: isDarkMode ? '#E5E7EB' : '#111827',
                        backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#4B5563' : '#F3F4F6',
                        },
                      }}
                    >
                      {`${cls.className}-${cls.section}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        </div>
        <div className="p-6 overflow-x-auto">
          {/* Header row */}
          <div className="grid" style={{ gridTemplateColumns: `80px repeat(${daysOfWeek.length}, minmax(220px, 1fr))`, gap: '12px' }}>
            <div />
            {daysOfWeek.map(day => (
              <div
                key={day}
                className={`text-xs font-medium ${
                  currentDayName === day ? 'text-blue-500' : (isDarkMode ? 'text-gray-300' : 'text-gray-600')
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Body grid: time axis + day columns */}
          <div className="grid mt-2" style={{ gridTemplateColumns: `80px repeat(${daysOfWeek.length}, minmax(220px, 1fr))`, gap: '12px' }}>
            {/* Time axis (15-min increments) */}
            <div className="relative" style={{ height: DAY_COLUMN_HEIGHT_PX }}>
              {Array.from({ length: (TOTAL_DAY_MINUTES / 15) + 1 }, (_, i) => {
                const minutesFromStart = i * 15;
                const absMinutes = DAY_START_MINUTES + minutesFromStart;
                const hour = Math.floor(absMinutes / 60);
                const minute = absMinutes % 60;
                const top = (minutesFromStart / TOTAL_DAY_MINUTES) * 100;
                const label = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const isCurrentTick = Math.floor((nowMinutes - DAY_START_MINUTES) / 15) === i && nowMinutes >= DAY_START_MINUTES && nowMinutes <= DAY_END_MINUTES;
                return (
                  <div key={i} className="absolute w-full" style={{ top: `${top}%` }}>
                    <div className={`text-xs ${isCurrentTick ? 'text-blue-500 font-semibold' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>{label}</div>
                  </div>
                );
              })}
              {nowMinutes >= DAY_START_MINUTES && nowMinutes <= DAY_END_MINUTES && (
                <div className="absolute left-0 right-0" style={{ top: `${nowTopPercent}%` }}>
                  <div className="h-0.5 bg-blue-500/70" />
                </div>
              )}
            </div>

            {/* Day columns */}
            {daysOfWeek.map(day => {
              const positioned = computeDayPositionedSlots(day);
              return (
                <div key={day} className={`relative rounded-lg ${
                  isDarkMode ? (currentDayName === day ? 'bg-gray-900/30 ring-1 ring-blue-500/40' : 'bg-gray-900/20') : (currentDayName === day ? 'bg-blue-50/40 ring-1 ring-blue-300' : 'bg-gray-50')
                }`} style={{ height: DAY_COLUMN_HEIGHT_PX }} onDoubleClick={(e) => handleDayDoubleClick(e, day as TimeSlot['dayOfWeek'])}>
                  {/* 15-min grid lines (hour lines emphasized) */}
                  {Array.from({ length: (TOTAL_DAY_MINUTES / 15) + 1 }, (_, i) => {
                    const top = (i * 15 / TOTAL_DAY_MINUTES) * 100;
                    const isHourLine = i % 4 === 0;
                    return (
                      <div
                        key={i}
                        className={`absolute left-0 right-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                        style={{ top: `${top}%`, borderTopWidth: isHourLine ? 2 : 1, opacity: isHourLine ? 1 : 0.6 }}
                      />
                    );
                  })}

                  {/* current time indicator inside day column */}
                  {currentDayName === day && nowMinutes >= DAY_START_MINUTES && nowMinutes <= DAY_END_MINUTES && (
                    <div className="absolute left-0 right-0" style={{ top: `${nowTopPercent}%` }}>
                      <div className="h-0.5 bg-blue-500" />
                    </div>
                  )}

                  {/* Slots */}
                  {positioned.map(({ slot, topPercent, heightPercent, leftPercent, widthPercent }, idx) => (
                    <div
                      key={(slot.scheduleId || `${slot.subjectName}-${slot.startTime}-${slot.endTime}`) + '-' + idx}
                      className={`absolute p-2 rounded-md border shadow-sm flex flex-col justify-between ${
                        slot.isBreakPeriod
                          ? isDarkMode
                            ? 'bg-orange-900/20 border-orange-800'
                            : 'bg-orange-50 border-orange-200'
                          : isDarkMode
                            ? 'bg-blue-900/20 border-blue-800'
                            : 'bg-blue-50 border-blue-200'
                      }`}
                      style={{
                        top: `${topPercent}%`,
                        height: `${heightPercent}%`,
                        left: `calc(${leftPercent}% + 2px)`,
                        width: `calc(${widthPercent}% - 4px)`,
                        overflow: 'hidden',
                        zIndex: 1
                      }}
                      onClick={() => setViewSlot(slot)}
                    >
                      {(() => {
                        const slotPixelHeight = (heightPercent / 100) * DAY_COLUMN_HEIGHT_PX;
                        const isCompact = slotPixelHeight < 64;
                        const durationMinutes = parseTimeToMinutes(slot.endTime) - parseTimeToMinutes(slot.startTime);
                        const isUltraShort = durationMinutes < 15;
                        const isOngoing = currentDayName === day && nowMinutes >= parseTimeToMinutes(slot.startTime) && nowMinutes < parseTimeToMinutes(slot.endTime);
                        return (
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              {isOngoing && (
                                <div className="mb-1">
                                  <Chip size="small" color="success" label="Ongoing" />
                                </div>
                              )}
                              {isUltraShort ? (
                                <div className="flex items-center gap-2">
                                  <AccessTime sx={{ fontSize: 12, color: isDarkMode ? '#9CA3AF' : '#6B7280' }} />
                                  <span className={`text-[11px] ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} truncate`}>
                                    {slot.startTime} - {slot.endTime} • {slot.isBreakPeriod ? slot.breakType : slot.subjectName}
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <div className={`flex items-center gap-2 ${isCompact ? 'mb-0' : 'mb-1'}`}>
                                    <AccessTime sx={{ fontSize: isCompact ? 12 : 14, color: isDarkMode ? '#9CA3AF' : '#6B7280' }} />
                                    <span className={`${isCompact ? 'text-[10px]' : 'text-xs'} ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {slot.startTime} - {slot.endTime}
                                    </span>
                                  </div>
                                  {slot.isBreakPeriod ? (
                                    <div className="flex items-center gap-2">
                                      <Chip size="small" label={slot.breakType} color="warning" sx={{ fontSize: isCompact ? '0.65rem' : '0.75rem' }} />
                                    </div>
                                  ) : (
                                    <>
                                      <div className={`flex items-center gap-2 ${isCompact ? '' : 'mb-1'}`}>
                                        <Subject sx={{ fontSize: isCompact ? 12 : 14, color: isDarkMode ? '#9CA3AF' : '#6B7280' }} />
                                        <span className={`${isCompact ? 'text-[11px]' : 'text-sm'} font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                                          {slot.subjectName}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Person sx={{ fontSize: isCompact ? 12 : 14, color: isDarkMode ? '#9CA3AF' : '#6B7280' }} />
                                        <span className={`${isCompact ? 'text-[10px]' : 'text-xs'} ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                                          {slot.teacherName}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="ml-1 shrink-0">
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchorEl(e.currentTarget); setMenuSlot(slot); }} sx={{ color: isDarkMode ? '#E5E7EB' : undefined, padding: isCompact ? '2px' : undefined }}>
                                <MoreVert fontSize={isCompact ? 'inherit' : 'small'} sx={{ fontSize: isCompact ? 16 : undefined }} />
                              </IconButton>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Slot menu */}
      <Menu anchorEl={menuAnchorEl} open={!!menuAnchorEl} onClose={() => { setMenuAnchorEl(null); setMenuSlot(null); }}
        PaperProps={{ sx: isDarkMode ? { backgroundColor: '#111827', color: '#E5E7EB' } : undefined }}
      >
        <MenuItem onClick={() => { if (menuSlot) setViewSlot(menuSlot); setMenuAnchorEl(null); }}>
          <Visibility sx={{ fontSize: 18, mr: 1 }} /> View
        </MenuItem>
        <MenuItem onClick={() => { if (menuSlot) handleEditSlot(menuSlot); setMenuAnchorEl(null); }}>
          <Edit sx={{ fontSize: 18, mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => { if (menuSlot) setConfirmDelete(menuSlot); setMenuAnchorEl(null); }}>
          <Delete sx={{ fontSize: 18, mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Slot Modal */}
      <SlotModal
        isOpen={showSlotModal}
        onClose={() => setShowSlotModal(false)}
        slot={editingSlot}
        mode={modalMode}
        onSave={handleSaveSlot}
        isLoading={isModalLoading}
        isDarkMode={isDarkMode}
        selectedClass={selectedClass}
        availableSubjects={getAvailableSubjects()}
      />

      {/* Delete Confirmation Modal */}
      <Dialog 
        open={!!confirmDelete} 
        onClose={() => setConfirmDelete(null)} 
        PaperProps={{ sx: isDarkMode ? { backgroundColor: '#111827', color: '#E5E7EB' } : undefined }}
      >
        <DialogTitle sx={isDarkMode ? { color: '#FFFFFF' } : undefined}>Delete Time Slot</DialogTitle>
        <DialogContent sx={isDarkMode ? { color: '#E5E7EB' } : undefined}>
          Are you sure you want to delete this time slot?
          {confirmDelete && (
            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm">
                <strong>Time:</strong> {confirmDelete.startTime} - {confirmDelete.endTime}
              </p>
              {confirmDelete.isBreakPeriod ? (
                <p className="text-sm">
                  <strong>Break Type:</strong> {confirmDelete.breakType}
                </p>
              ) : (
                <>
                  <p className="text-sm">
                    <strong>Subject:</strong> {confirmDelete.subjectName}
                  </p>
                  <p className="text-sm">
                    <strong>Teacher:</strong> {confirmDelete.teacherName}
                  </p>
                </>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            color="error" 
            variant="contained" 
            onClick={handleDeleteSlot} 
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Slot Dialog */}
      <Dialog 
        open={!!viewSlot}
        onClose={() => setViewSlot(null)}
        PaperProps={{ sx: isDarkMode ? { backgroundColor: '#111827', color: '#E5E7EB' } : undefined }}
      >
        <DialogTitle sx={isDarkMode ? { color: '#FFFFFF' } : undefined}>Time Slot Details</DialogTitle>
        <DialogContent sx={isDarkMode ? { color: '#E5E7EB' } : undefined}>
          {viewSlot && (
            <div className="space-y-2">
              <div className="flex items-center gap-2"><AccessTime sx={{ fontSize: 18 }} />
                <span>{viewSlot.startTime} - {viewSlot.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                {viewSlot.isBreakPeriod ? (
                  <Chip size="small" color="warning" label={viewSlot.breakType} />
                ) : (
                  <>
                    <Subject sx={{ fontSize: 18 }} />
                    <span className="font-medium">{viewSlot.subjectName}</span>
                  </>
                )}
              </div>
              {!viewSlot.isBreakPeriod && (
                <div className="flex items-center gap-2"><Person sx={{ fontSize: 18 }} />
                  <span>{viewSlot.teacherName}</span>
                </div>
              )}
              <div>Day: <span className="font-medium">{viewSlot.dayOfWeek}</span></div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          {viewSlot && (
            <>
              <Button onClick={() => { handleEditSlot(viewSlot); setViewSlot(null); }} startIcon={<Edit />}>
                Edit
              </Button>
              <Button color="error" onClick={() => { setConfirmDelete(viewSlot); setViewSlot(null); }} startIcon={<Delete />}>
                Delete
              </Button>
            </>
          )}
          <Button onClick={() => setViewSlot(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Toast Container */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? 'dark' : 'light'}
      />
    </div>
  );
};

export default ClassSchedule;
