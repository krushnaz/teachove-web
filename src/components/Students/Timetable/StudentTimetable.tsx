import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { classScheduleService } from '../../../services/classScheduleService';
import { Chip, Tooltip } from '@mui/material';
import { AccessTime, Subject, Person } from '@mui/icons-material';
import { RefreshCcw, CalendarDays, Clock3 } from 'lucide-react';
import {
  TeacherPageShell,
  TeacherPageHeader,
  TeacherHeaderActions,
  TeacherStatsGrid,
  TeacherStatCard,
  TeacherButton,
  TeacherLoading,
} from '../shared';

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

const StudentTimetable: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<ClassTimetable | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  // Load timetable for student's class
  const loadTimetable = async () => {
    if (!user?.schoolId || !user?.classId) return;
    
    try {
      setLoading(true);
      const schedules = await classScheduleService.getClassSchedules(user.schoolId, user.classId);
      
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
        classId: user.classId,
        className: `${user.classId}`, // You can modify this to show actual class name
        slots: slots
      };
      
      setTimetable(timetable);
    } catch (error) {
      console.error('Error loading timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadTimetable();
  }, [user?.schoolId, user?.classId]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadTimetable();
    } catch (error) {
      console.error('Error refreshing timetable:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const totalSlots = timetable?.slots.length ?? 0;
  const breakSlots = timetable?.slots.filter((slot) => slot.isBreakPeriod).length ?? 0;
  const teachingSlots = totalSlots - breakSlots;

  if (loading) {
    return <TeacherLoading message="Loading timetable..." />;
  }

  return (
    <TeacherPageShell>
      <TeacherPageHeader
        title="Your Timetable"
        description="View your weekly class schedule."
        action={
          <TeacherHeaderActions>
            <Tooltip title="Refresh Timetable">
              <span>
                <TeacherButton
                  compact
                  variant="secondary"
                  icon={RefreshCcw}
                  onClick={handleRefresh}
                  loading={refreshing}
                >
                  Refresh
                </TeacherButton>
              </span>
            </Tooltip>
          </TeacherHeaderActions>
        }
      />

      <TeacherStatsGrid cols={3}>
        <TeacherStatCard title="Total Slots" value={totalSlots} icon={CalendarDays} color="indigo" />
        <TeacherStatCard title="Class Periods" value={teachingSlots} icon={Clock3} color="blue" />
        <TeacherStatCard title="Break Periods" value={breakSlots} icon={CalendarDays} color="amber" />
      </TeacherStatsGrid>

      <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Weekly Timetable
          </h3>
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
                }`} style={{ height: DAY_COLUMN_HEIGHT_PX }}>
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
    </TeacherPageShell>
  );
};

export default StudentTimetable;

