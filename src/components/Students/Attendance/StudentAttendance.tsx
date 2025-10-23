import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { studentAttendanceService, AttendanceByMonthResponse } from '../../../services/studentAttendanceService';

const StudentAttendance: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [attendanceData, setAttendanceData] = useState<AttendanceByMonthResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    if (user?.studentId && user?.schoolId) {
      fetchAttendance();
    }
  }, [currentMonth, currentYear, user?.studentId, user?.schoolId]);

  const fetchAttendance = async () => {
    if (!user?.studentId || !user?.schoolId) {
      console.log('Missing required IDs:', { studentId: user?.studentId, schoolId: user?.schoolId });
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching attendance with:', { 
        schoolId: user.schoolId, 
        studentId: user.studentId, 
        month: currentMonth, 
        year: currentYear 
      });
      const response = await studentAttendanceService.getAttendanceByMonth(
        user.schoolId,
        user.studentId,
        currentMonth,
        currentYear
      );
      console.log('Attendance data received:', response);
      setAttendanceData(response);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const getAttendanceStatus = (day: number) => {
    if (!attendanceData) return 'not-marked';
    
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = attendanceData.attendance.find(att => att.date === dateStr);
    
    if (!record) return 'not-marked';
    if (record.leaveId) return 'on-leave';
    return record.isPresent ? 'present' : 'absent';
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];
    const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7;

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentYear, currentMonth - 1, day);
      const dayOfWeek = currentDate.getDay();
      const isSunday = dayOfWeek === 0;
      const status = getAttendanceStatus(day);
      const isToday = day === new Date().getDate() && 
                      currentMonth === new Date().getMonth() + 1 && 
                      currentYear === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all border ${
            isToday 
              ? 'ring-2 ring-blue-500 ring-offset-1' 
              : ''
          } ${
            isSunday
              ? isDarkMode
                ? 'bg-gray-900 border-gray-800 text-gray-600'
                : 'bg-gray-100 border-gray-300 text-gray-400'
              : status === 'present'
              ? isDarkMode
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : 'bg-green-50 border-green-400 text-green-700'
              : status === 'absent'
              ? isDarkMode
                ? 'bg-red-500/20 border-red-500 text-red-400'
                : 'bg-red-50 border-red-400 text-red-700'
              : status === 'on-leave'
              ? isDarkMode
                ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                : 'bg-yellow-50 border-yellow-400 text-yellow-700'
              : isDarkMode
              ? 'bg-gray-800 border-gray-700 text-gray-400'
              : 'bg-gray-50 border-gray-200 text-gray-500'
          }`}
        >
          <div className="flex flex-col items-center">
            <span className="text-xs">{day}</span>
            {!isSunday && status !== 'not-marked' && (
              <div className={`w-1 h-1 rounded-full mt-0.5 ${
                status === 'present'
                  ? 'bg-green-500'
                  : status === 'absent'
                  ? 'bg-red-500'
                  : 'bg-yellow-500'
              }`} />
            )}
          </div>
        </div>
      );
    }

    // Fill remaining cells
    while (days.length < totalCells) {
      days.push(
        <div key={`fill-${days.length}`} className="aspect-square" />
      );
    }

    return days;
  };

  const ShimmerBox = () => (
    <div className="animate-pulse">
      <div className={`h-12 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
      <div className="grid grid-cols-7 gap-2 mb-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className={`h-10 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {[...Array(35)].map((_, i) => (
          <div key={i} className={`aspect-square rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Your Attendance
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Track your attendance record
            </p>
          </div>
          <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content - Calendar and Stats Side by Side on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar - Takes 2 columns on desktop, centered */}
        <div className={`lg:col-span-2 rounded-xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="max-w-2xl mx-auto">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePreviousMonth}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {monthNames[currentMonth - 1]} {currentYear}
            </h2>

            <button
              onClick={handleNextMonth}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {loading ? (
            <ShimmerBox />
          ) : (
            <>
              {/* Days of week */}
              <div className="grid grid-cols-7 gap-2 mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div
                    key={day}
                    className={`text-center text-xs font-semibold py-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid - Compact size */}
              <div className="grid grid-cols-7 gap-2">
                {renderCalendar()}
              </div>
            </>
          )}
          </div>
        </div>

        {/* Stats - Takes 1 column on desktop */}
        <div className="space-y-4">
          {!loading && attendanceData && (
            <>
              {/* Total Days */}
              <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Days</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {attendanceData.totalDays}
                    </p>
                  </div>
                </div>
              </div>

              {/* Present Days */}
              <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Present</p>
                    <p className="text-2xl font-bold text-green-500">
                      {attendanceData.presentDays}
                    </p>
                  </div>
                </div>
              </div>

              {/* Absent Days */}
              <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Absent</p>
                    <p className="text-2xl font-bold text-red-500">
                      {attendanceData.absentDays}
                    </p>
                  </div>
                </div>
              </div>

              {/* On Leave Days */}
              <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>On Leave</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {attendanceData.onLeaveDays}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className={`rounded-xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Legend
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded border ${isDarkMode ? 'bg-green-500/20 border-green-500' : 'bg-green-50 border-green-400'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Present</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded border ${isDarkMode ? 'bg-red-500/20 border-red-500' : 'bg-red-50 border-red-400'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Absent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded border ${isDarkMode ? 'bg-yellow-500/20 border-yellow-500' : 'bg-yellow-50 border-yellow-400'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>On Leave</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-300'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sunday / Holiday</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Not Marked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;

