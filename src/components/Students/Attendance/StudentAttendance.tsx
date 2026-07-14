import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { studentAttendanceService, AttendanceByMonthResponse } from '../../../services/studentAttendanceService';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  TeacherPageShell,
  TeacherPageHeader,
  TeacherStatsGrid,
  TeacherStatCard,
  TeacherPanel,
} from '../shared';

const StudentAttendance: React.FC = () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, currentYear, user?.studentId, user?.schoolId]);

  const fetchAttendance = async () => {
    if (!user?.studentId || !user?.schoolId) {
      return;
    }

    setLoading(true);
    try {
      const response = await studentAttendanceService.getAttendanceByMonth(
        user.schoolId,
        user.studentId,
        currentMonth,
        currentYear
      );
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

  const getDaysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month - 1, 1).getDay();

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

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentYear, currentMonth - 1, day);
      const isSunday = currentDate.getDay() === 0;
      const status = getAttendanceStatus(day);
      const isToday =
        day === new Date().getDate() &&
        currentMonth === new Date().getMonth() + 1 &&
        currentYear === new Date().getFullYear();

      const statusClass = isSunday
        ? 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-600'
        : status === 'present'
          ? 'bg-emerald-50 border-emerald-400 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500 dark:text-emerald-400'
          : status === 'absent'
            ? 'bg-rose-50 border-rose-400 text-rose-700 dark:bg-rose-500/20 dark:border-rose-500 dark:text-rose-400'
            : status === 'on-leave'
              ? 'bg-amber-50 border-amber-400 text-amber-700 dark:bg-amber-500/20 dark:border-amber-500 dark:text-amber-400'
              : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400';

      days.push(
        <div
          key={day}
          className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all border ${
            isToday ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-800' : ''
          } ${statusClass}`}
        >
          <div className="flex flex-col items-center">
            <span className="text-xs">{day}</span>
            {!isSunday && status !== 'not-marked' && (
              <div
                className={`w-1 h-1 rounded-full mt-0.5 ${
                  status === 'present' ? 'bg-emerald-500' : status === 'absent' ? 'bg-rose-500' : 'bg-amber-500'
                }`}
              />
            )}
          </div>
        </div>
      );
    }

    while (days.length < totalCells) {
      days.push(<div key={`fill-${days.length}`} className="aspect-square" />);
    }

    return days;
  };

  const ShimmerBox = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-7 gap-2 mb-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-8 rounded bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    </div>
  );

  const legend = [
    { label: 'Present', cls: 'bg-emerald-50 border-emerald-400 dark:bg-emerald-500/20 dark:border-emerald-500' },
    { label: 'Absent', cls: 'bg-rose-50 border-rose-400 dark:bg-rose-500/20 dark:border-rose-500' },
    { label: 'On Leave', cls: 'bg-amber-50 border-amber-400 dark:bg-amber-500/20 dark:border-amber-500' },
    { label: 'Sunday / Holiday', cls: 'bg-gray-100 border-gray-300 dark:bg-gray-900 dark:border-gray-800' },
    { label: 'Not Marked', cls: 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700' },
  ];

  return (
    <TeacherPageShell>
      <TeacherPageHeader title="Your Attendance" description="Track your monthly attendance record." />

      <TeacherStatsGrid>
        <TeacherStatCard title="Total Days" value={attendanceData?.totalDays ?? 0} icon={Calendar} color="indigo" />
        <TeacherStatCard title="Present" value={attendanceData?.presentDays ?? 0} icon={CheckCircle} color="emerald" />
        <TeacherStatCard title="Absent" value={attendanceData?.absentDays ?? 0} icon={XCircle} color="rose" />
        <TeacherStatCard title="On Leave" value={attendanceData?.onLeaveDays ?? 0} icon={Clock} color="amber" />
      </TeacherStatsGrid>

      <TeacherPanel
        title={`${monthNames[currentMonth - 1]} ${currentYear}`}
        headerAction={
          <div className="flex items-center gap-1">
            <button
              onClick={handlePreviousMonth}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        }
      >
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <ShimmerBox />
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-[10px] sm:text-xs font-semibold py-1 text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">{renderCalendar()}</div>
            </>
          )}
        </div>
      </TeacherPanel>

      <TeacherPanel title="Legend">
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {legend.map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded border ${l.cls}`} />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{l.label}</span>
            </div>
          ))}
        </div>
      </TeacherPanel>
    </TeacherPageShell>
  );
};

export default StudentAttendance;
