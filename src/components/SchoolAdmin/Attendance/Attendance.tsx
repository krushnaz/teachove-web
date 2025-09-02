import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { teacherService } from '../../../services/teacherService';
import { teacherAttendanceService } from '../../../services/teacherAttendanceService';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

interface StaffMember {
  id: number;
  name: string;
  designation: string;
  avatar: string;
  status: 'present' | 'absent' | 'not-marked';
}

interface AttendanceData {
  present: number;
  absent: number;
  late: number;
  total: number;
}

// Shimmer Components
const ShimmerCard: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
    <div className="flex items-center">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="ml-4 flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
      </div>
    </div>
  </div>
);

const ShimmerTableRow: React.FC = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="ml-4 flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-24"></div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
    </td>
  </tr>
);

const ShimmerCalendarStrip: React.FC = () => (
  <div className="flex space-x-4 mb-6 justify-center animate-pulse">
    {Array.from({ length: 7 }).map((_, i) => (
      <div key={i} className="flex flex-col items-center px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700" style={{ minWidth: 48 }}>
        <div className="h-4 w-8 bg-gray-300 dark:bg-gray-800 rounded mb-1"></div>
        <div className="h-5 w-5 bg-gray-300 dark:bg-gray-800 rounded-full"></div>
      </div>
    ))}
  </div>
);

const Attendance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('teachers');
  const [selectedReportType, setSelectedReportType] = useState('teachers');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { user } = useAuth();
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateLoading, setDateLoading] = useState(false);
  const [markingAttendanceId, setMarkingAttendanceId] = useState<string | number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceStatusMap, setAttendanceStatusMap] = useState<Record<string, string>>({});
  const [bulkMarking, setBulkMarking] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [markedDates, setMarkedDates] = useState<string[]>([]);
  const [markedDatesLoading, setMarkedDatesLoading] = useState(true);

  const nonTeachingStaff: StaffMember[] = [
    { id: 1, name: 'Mr. Suresh Kumar', designation: 'Administrative Officer', avatar: 'SK', status: 'present' },
    { id: 2, name: 'Mrs. Geeta Sharma', designation: 'Accountant', avatar: 'GS', status: 'present' },
    { id: 3, name: 'Mr. Rajesh Verma', designation: 'Librarian', avatar: 'RV', status: 'absent' },
    { id: 4, name: 'Ms. Priya Singh', designation: 'Receptionist', avatar: 'PS', status: 'absent' },
    { id: 5, name: 'Mr. Amit Kumar', designation: 'IT Support', avatar: 'AK', status: 'present' },
    { id: 6, name: 'Mrs. Sunita Patel', designation: 'Clerk', avatar: 'SP', status: 'present' },
    { id: 7, name: 'Mr. Ramesh Singh', designation: 'Security Guard', avatar: 'RS', status: 'present' },
    { id: 8, name: 'Ms. Kavita Gupta', designation: 'Cleaner', avatar: 'KG', status: 'not-marked' }
  ];

  const [nonTeachingList, setNonTeachingList] = useState(nonTeachingStaff);

  useEffect(() => {
    const fetchTeachers = async () => {
      if (!user?.schoolId) return;
      setLoading(true);
      try {
        const response = await teacherService.getTeachersBySchool(user.schoolId);
        console.log('Teachers API response:', response);

        const mappedTeachers = response.teachers.map((t: any, idx: number) => {
          console.log('Teacher object:', t);
          return {
            ...t,
            id: idx + 1,
            status: 'not-marked',
            // Ensure we have a display name
            displayName: t.teacherName || t.name || 'Unknown Teacher'
          };
        });

        console.log('Mapped teachers:', mappedTeachers);
        setTeachersList(mappedTeachers);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        setTeachersList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, [user?.schoolId]);

  // Fetch marked dates
  useEffect(() => {
    const fetchMarkedDates = async () => {
      if (!user?.schoolId) return;
      setMarkedDatesLoading(true);
      try {
        const dates = await teacherAttendanceService.getMarkedDates(user.schoolId);
        console.log('Marked dates:', dates);
        setMarkedDates(dates);
      } catch (error) {
        console.error('Error fetching marked dates:', error);
        setMarkedDates([]);
      } finally {
        setMarkedDatesLoading(false);
      }
    };
    fetchMarkedDates();
  }, [user?.schoolId]);

  useEffect(() => {
    const fetchStatuses = async () => {
      if (!user?.schoolId || !teachersList.length) return;
      setDateLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      try {
        const attendanceData = await teacherAttendanceService.getTeacherAttendanceByDate(user.schoolId, dateStr);

        console.log('Fetched attendance data:', attendanceData);

        // Create a map of teacherId to attendance status
        const statusMap: Record<string, string> = {};

        // Process the attendance records from the API
        attendanceData.forEach((attendance: any) => {
          const status = attendance.isPresent ? 'present' : 'absent';
          statusMap[attendance.teacherId] = status;
        });

        // Set status for teachers who don't have attendance records yet
        teachersList.forEach(teacher => {
          if (!statusMap[teacher.teacherId]) {
            statusMap[teacher.teacherId] = 'not-marked';
          }
        });

        console.log('Attendance status map:', statusMap);
        setAttendanceStatusMap(statusMap);
      } catch (error) {
        console.error('Failed to fetch attendance status:', error);
        // Set all teachers as not-marked if API fails
        const statusMap: Record<string, string> = {};
        teachersList.forEach(teacher => {
          if (teacher.teacherId) {
            statusMap[teacher.teacherId] = 'not-marked';
          }
        });
        setAttendanceStatusMap(statusMap);
      } finally {
        setDateLoading(false);
      }
    };
    fetchStatuses();
  }, [user?.schoolId, teachersList, selectedDate]);

  const handleStatusToggle = async (teacherId: string, currentStatus: string, type: 'teachers' | 'non-teaching') => {
    if (type === 'teachers') {
      // For teachers, we'll track changes locally first
      const newStatus = currentStatus === 'present' ? 'absent' : currentStatus === 'absent' ? 'not-marked' : 'present';
      
      // Update pending changes
      const newPendingChanges = { ...pendingChanges, [teacherId]: newStatus };
      setPendingChanges(newPendingChanges);
      setHasPendingChanges(Object.keys(newPendingChanges).length > 0);
      
      // Update the display immediately
      setAttendanceStatusMap(prev => ({
        ...prev,
        [teacherId]: newStatus
      }));
    } else {
      // For non-teaching staff
      setNonTeachingList(prev => prev.map(staff =>
        staff.id === parseInt(teacherId) ? {
          ...staff,
          status: staff.status === 'present' ? 'absent' : staff.status === 'absent' ? 'not-marked' : 'present'
        } : staff
      ));
    }
  };

  const getStatusButtonProps = (status: string) => {
    switch (status) {
      case 'present':
        return {
          className: 'px-4 py-2 text-xs font-semibold rounded-full bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200',
          text: 'Present'
        };
      case 'absent':
        return {
          className: 'px-4 py-2 text-xs font-semibold rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200',
          text: 'Absent'
        };
      default:
        return {
          className: 'px-4 py-2 text-xs font-semibold rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200',
          text: 'Not Marked'
        };
    }
  };

  const handleBulkMarkAttendance = async () => {
    if (!user?.schoolId || !teachersList.length || !hasPendingChanges) return;

    setBulkMarking(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    try {
      const attendanceRecords = Object.entries(pendingChanges)
        .map(([teacherId, status]) => ({
          teacherId: teacherId,
          date: dateStr,
          isPresent: status === 'present',
          leaveId: status === 'absent' ? 'leave_default' : null
        }));

      const bulkData = {
        records: attendanceRecords
      };

      const response = await teacherAttendanceService.markBulkAttendance(user.schoolId, bulkData);

      if (response.message === 'Attendance batch processed') {
        // Clear pending changes after successful submission
        setPendingChanges({});
        setHasPendingChanges(false);

        // Show detailed success message with count
        const successCount = response.results?.filter((r: any) => r.status === 'success').length || 0;
        const totalCount = response.results?.length || attendanceRecords.length;

        // Try to refresh attendance status, but handle GET endpoint failure gracefully
        try {
          const attendanceData = await teacherAttendanceService.getTeacherAttendanceByDate(user.schoolId, dateStr);
          const statusMap: Record<string, string> = {};
          attendanceData.forEach((attendance: any) => {
            statusMap[attendance.teacherId] = attendance.isPresent ? 'present' : 'absent';
          });

          // Set all teachers who don't have attendance records as 'not-marked'
          teachersList.forEach(teacher => {
            if (!statusMap[teacher.teacherId]) {
              statusMap[teacher.teacherId] = 'not-marked';
            }
          });

          setAttendanceStatusMap(statusMap);
        } catch (refreshError) {
          console.warn('Failed to refresh attendance data after saving:', refreshError);
          // If GET endpoint fails, manually update the status map based on the successful save
          const statusMap: Record<string, string> = { ...attendanceStatusMap };

          // Update status map based on the records that were just saved
          attendanceRecords.forEach(record => {
            statusMap[record.teacherId] = record.isPresent ? 'present' : 'absent';
          });

          // Set all teachers who don't have attendance records as 'not-marked'
          teachersList.forEach(teacher => {
            if (!statusMap[teacher.teacherId]) {
              statusMap[teacher.teacherId] = 'not-marked';
            }
          });

          setAttendanceStatusMap(statusMap);
        }

        toast.success(`Attendance marked successfully! (${successCount}/${totalCount} records processed)`);
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      toast.error(`Failed to mark attendance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setBulkMarking(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!user?.schoolId || !fromDate || !toDate) {
      toast.error('Please select both from and to dates');
      return;
    }

    setDownloading(true);
    try {
      const blob = await teacherAttendanceService.downloadTeacherAttendanceReport(
        user.schoolId,
        fromDate,
        toDate
      );
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `teacher-attendance-report-${fromDate}-to-${toDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const getAttendanceData = (list: any[], type: 'teachers' | 'non-teaching'): AttendanceData => {
    if (type === 'teachers') {
      // For teachers, calculate based on attendanceStatusMap and pendingChanges
      let present = 0;
      let absent = 0;
      
      teachersList.forEach(teacher => {
        const currentStatus = attendanceStatusMap[teacher.teacherId] || 'not-marked';
        const pendingStatus = pendingChanges[teacher.teacherId];
        const finalStatus = pendingStatus || currentStatus;
        
        if (finalStatus === 'present') {
          present++;
        } else if (finalStatus === 'absent') {
          absent++;
        }
      });
      
      return { present, absent, late: 0, total: teachersList.length };
    } else {
      // For non-teaching staff, use the original logic
    const present = list.filter(item => item.status === 'present').length;
    const absent = list.filter(item => item.status === 'absent').length;
    const total = list.length;
    
    return { present, absent, late: 0, total };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      default:
        return 'Not Marked';
    }
  };

  const renderCalendarStrip = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const previousWeek = addDays(weekStart, -7);
    const nextWeek = addDays(weekStart, 7);

    return (
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6 backdrop-blur-sm">
        {/* Minimalist Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedDate(previousWeek)}
            className="group flex items-center justify-center w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
              {format(weekStart, 'MMMM yyyy')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
              {format(weekStart, 'MMM dd')} — {format(addDays(weekStart, 6), 'MMM dd')}
            </p>
          </div>

          <button
            onClick={() => setSelectedDate(nextWeek)}
            className="group flex items-center justify-center w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Sleek Day Grid */}
        <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => {
          const day = addDays(weekStart, i);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);
          const isWeekend = i === 0 || i === 6;
          const dateStr = format(day, 'yyyy-MM-dd');
          const isMarked = markedDates.includes(dateStr);

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(day)}
              className={`group relative flex flex-col items-center justify-center p-4 rounded-xl text-sm font-medium focus:outline-none transition-all duration-300 overflow-hidden
                ${isSelected
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 scale-105'
                  : isToday
                  ? 'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:scale-102'}`}
            >
              {/* Background pattern for selected state */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
              )}

              {/* Attendance Marked Indicator */}
              {isMarked && !isSelected && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
              )}

              {/* Day name */}
              <div className={`text-xs font-medium mb-1 transition-colors duration-200 ${
                isSelected ? 'text-white/90' : isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {format(day, 'EEE')}
              </div>

              {/* Day number */}
              <div className={`text-lg font-bold transition-all duration-200 ${
                isSelected ? 'text-white scale-110' : isToday ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'
              }`}>
                {format(day, 'dd')}
              </div>

              {/* Today indicator */}
              {isToday && !isSelected && (
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1 animate-pulse"></div>
              )}

              {/* Hover effect */}
              <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                isSelected
                  ? 'ring-2 ring-white/30'
                  : 'group-hover:ring-1 group-hover:ring-primary-300 dark:group-hover:ring-primary-600'
              }`}></div>
            </button>
          );
        })}
        </div>

        {/* Marked Dates Legend */}
        {markedDates.length > 0 && (
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Attendance Marked</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAttendanceList = (list: any[], type: 'teachers' | 'non-teaching') => {
    const attendanceData = getAttendanceData(list, type);

    return (
      <div className="space-y-6">
        {/* Compact Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {loading ? (
            <>
              <ShimmerCard />
              <ShimmerCard />
              <ShimmerCard />
              <ShimmerCard />
            </>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-600 dark:text-green-400">Present</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{attendanceData.present}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">Absent</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{attendanceData.absent}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Not Marked</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{attendanceData.total - attendanceData.present - attendanceData.absent}</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Total</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{attendanceData.total}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Calendar Strip */}
        {type === 'teachers' && (loading || markedDatesLoading ? (
          <ShimmerCalendarStrip />
        ) : renderCalendarStrip())}
        
        {/* Compact Bulk Actions - Only for Teachers */}
        {type === 'teachers' && !loading && hasPendingChanges && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {Object.keys(pendingChanges).length} changes ready
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Click save to confirm attendance
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setPendingChanges({});
                    setHasPendingChanges(false);
                    const statusMap: Record<string, string> = {};
                    teachersList.forEach(teacher => {
                      statusMap[teacher.teacherId] = attendanceStatusMap[teacher.teacherId] || 'not-marked';
                    });
                    setAttendanceStatusMap(statusMap);
                  }}
                  className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                >
                  Reset
                </button>
                <button
                  onClick={handleBulkMarkAttendance}
                  disabled={bulkMarking}
                  className="inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {bulkMarking ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Modern Attendance List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8">
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                        </div>
                      </div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {dateLoading ? (
                  <div className="p-8 space-y-4">
                    {Array.from({ length: list.length }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                          </div>
                        </div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
                      </div>
                    ))}
                  </div>
                ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {list.map((teacher, index) => {
                    const currentStatus = type === 'teachers'
                      ? attendanceStatusMap[teacher.teacherId] || 'not-marked'
                      : teacher.status;

                    return (
                      <tr key={teacher.teacherId || teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {teacher.profilePic ? (
                                <img
                                  className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                  src={teacher.profilePic}
                                  alt={teacher.displayName || teacher.teacherName || teacher.name || 'Teacher'}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow">
                                  {(teacher.displayName || teacher.teacherName || teacher.name || 'U').charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {teacher.displayName || teacher.teacherName || teacher.name || 'Unknown Teacher'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {teacher.email || 'No email provided'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            currentStatus === 'present'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : currentStatus === 'absent'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}>
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              currentStatus === 'present' ? 'bg-green-500' :
                              currentStatus === 'absent' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}></span>
                            {currentStatus === 'present' ? 'Present' :
                             currentStatus === 'absent' ? 'Absent' : 'Not Marked'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleStatusToggle(
                              type === 'teachers' ? teacher.teacherId : teacher.id.toString(),
                              currentStatus,
                              type
                            )}
                            className={`inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md ${
                              currentStatus === 'present'
                                ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500'
                                : currentStatus === 'absent'
                                ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:ring-yellow-500'
                                : 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
                          >
                            {currentStatus === 'present' ? 'Mark Absent' :
                             currentStatus === 'absent' ? 'Mark Not Marked' : 'Mark Present'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderReports = () => {
    const teachersData = getAttendanceData(teachersList, 'teachers');
    const nonTeachingData = getAttendanceData(nonTeachingList, 'non-teaching');
    const selectedData = selectedReportType === 'teachers' ? teachersData : nonTeachingData;
    
    const presentPercentage = selectedData.total > 0 ? (selectedData.present / selectedData.total) * 100 : 0;
    const absentPercentage = selectedData.total > 0 ? (selectedData.absent / selectedData.total) * 100 : 0;

    return (
      <div>
        {/* Report Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Staff Type</label>
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="teachers">Teachers</option>
                <option value="non-teaching">Non-Teaching Staff</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={handleDownloadReport}
                disabled={downloading || !fromDate || !toDate}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart Visualization */}
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray={`${presentPercentage}, 100`}
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeDasharray={`${absentPercentage}, 100`}
                    strokeDashoffset={`-${presentPercentage}`}
                  />

                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedData.total}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Present: {selectedData.present} ({presentPercentage.toFixed(1)}%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Absent: {selectedData.absent} ({absentPercentage.toFixed(1)}%)</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('teachers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'teachers'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Teacher Attendance
            </button>
            <button
              onClick={() => setActiveTab('non-teaching')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'non-teaching'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Non-Teaching Staff Attendance
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Reports
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'teachers' && loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading teachers...</p>
        </div>
      ) : activeTab === 'teachers' && renderAttendanceList(teachersList, 'teachers')}
      {activeTab === 'non-teaching' && renderAttendanceList(nonTeachingList, 'non-teaching')}
      {activeTab === 'reports' && renderReports()}
    </div>
  );
};

export default Attendance; 