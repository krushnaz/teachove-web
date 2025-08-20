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
        setTeachersList(
          response.teachers.map((t: any, idx: number) => ({
            ...t,
            id: idx + 1,
            status: 'not-marked',
          }))
        );
      } catch {
        setTeachersList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, [user?.schoolId]);

  useEffect(() => {
    const fetchStatuses = async () => {
      if (!user?.schoolId || !teachersList.length) return;
      setDateLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      try {
        const attendanceData = await teacherAttendanceService.getTeacherAttendanceByDate(user.schoolId, dateStr);
        
        // Create a map of teacherId to attendance status
        const statusMap: Record<string, string> = {};
        attendanceData.forEach((attendance: any) => {
          // Convert isPresent string to status
          const status = attendance.isPresent === 'true' ? 'present' : 'absent';
          statusMap[attendance.teacherId] = status;
        });
        
        setAttendanceStatusMap(statusMap);
      } catch (error) {
        console.error('Failed to fetch attendance status:', error);
        // Set all teachers as not-marked if API fails
      const statusMap: Record<string, string> = {};
        teachersList.forEach(teacher => {
            statusMap[teacher.teacherId] = 'not-marked';
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
    const dayName = format(selectedDate, 'EEEE'); // Gets day name like "Monday"
    
    try {
      const attendanceList = Object.entries(pendingChanges)
        .map(([teacherId, status]) => {
          const teacher = teachersList.find(t => t.teacherId === teacherId);
          if (!teacher) return null;
          
          return {
            name: teacher.name,
            day: dayName,
            date: dateStr,
            schoolId: user.schoolId,
            teacherId: teacherId,
            attendanceId: `ATT_${teacherId}_${dateStr.replace(/-/g, '')}`,
            leaveId: null,
            isPresent: status === 'present' ? 'true' : 'false',
            dayType: 'full-day'
          };
        })
        .filter((item): item is {
          name: string;
          day: string;
          date: string;
          schoolId: string;
          teacherId: string;
          attendanceId: string;
          leaveId: null;
          isPresent: string;
          dayType: string;
        } => item !== null);

      const bulkData = {
        schoolId: user.schoolId,
        date: dateStr,
        attendanceList: attendanceList
      };

      await teacherAttendanceService.markBulkAttendance(bulkData);
      
      // Clear pending changes after successful submission
      setPendingChanges({});
      setHasPendingChanges(false);
      
      toast.success('Attendance marked successfully!');
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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setSelectedDate(previousWeek)}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(weekStart, 'MMM dd')} - {format(addDays(weekStart, 6), 'MMM dd, yyyy')}
          </h3>
          
          <button
            onClick={() => setSelectedDate(nextWeek)}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="flex space-x-4 justify-center">
        {Array.from({ length: 7 }).map((_, i) => {
          const day = addDays(weekStart, i);
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(day)}
              className={`flex flex-col items-center px-4 py-2 rounded-full text-sm font-medium focus:outline-none transition-colors duration-200 shadow-sm
                ${isSameDay(day, selectedDate)
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-primary-100 dark:hover:bg-primary-700'}`}
              style={{ minWidth: 48 }}
            >
              <div>{format(day, 'EEE')}</div>
              <div className="font-bold text-lg">{format(day, 'dd')}</div>
            </button>
          );
        })}
        </div>
      </div>
    );
  };

  const renderAttendanceList = (list: any[], type: 'teachers' | 'non-teaching') => {
    const attendanceData = getAttendanceData(list, type);
    
    return (
      <div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          {loading ? (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Present</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{attendanceData.present}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Absent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{attendanceData.absent}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{attendanceData.total}</p>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
        
        {/* Calendar Strip */}
        {type === 'teachers' && (loading ? (
          <ShimmerCalendarStrip />
        ) : renderCalendarStrip())}
        
        {/* Bulk Mark Attendance Buttons - Only for Teachers */}
        {type === 'teachers' && !loading && hasPendingChanges && (
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      You have {Object.keys(pendingChanges).length} pending attendance change{Object.keys(pendingChanges).length !== 1 ? 's' : ''}. Click "Mark Attendance" to save.
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleBulkMarkAttendance}
                disabled={bulkMarking}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkMarking ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Marking Attendance...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Mark Attendance
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Attendance List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SR No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Teacher Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {Array.from({ length: 6 }).map((_, i) => (
                      <ShimmerTableRow key={i} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SR No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Teacher Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {dateLoading ? (
                    Array.from({ length: list.length }).map((_, i) => (
                      <ShimmerTableRow key={i} />
                    ))
                  ) : (
                    list.map((teacher, index) => (
                    <tr key={teacher.teacherId || teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
                            {teacher.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{teacher.name}</div>
                          </div>
                        </div>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{teacher.email || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          {type === 'teachers' ? (
                            <button
                              onClick={() => handleStatusToggle(teacher.teacherId, attendanceStatusMap[teacher.teacherId] || 'not-marked', 'teachers')}
                              className={getStatusButtonProps(attendanceStatusMap[teacher.teacherId] || 'not-marked').className}
                            >
                              {getStatusButtonProps(attendanceStatusMap[teacher.teacherId] || 'not-marked').text}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusToggle(teacher.id.toString(), teacher.status, 'non-teaching')}
                              className={getStatusButtonProps(teacher.status).className}
                            >
                              {getStatusButtonProps(teacher.status).text}
                            </button>
                          )}
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
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