import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { authService } from '../../../services/authService';
import { teacherAttendanceService } from '../../../services/teacherAttendanceService';
import { Card, CardContent, CardHeader, Skeleton, ToggleButton, ToggleButtonGroup, IconButton, Chip } from '@mui/material';
import { ArrowBack, ArrowForward, EventAvailable, EventBusy, Today } from '@mui/icons-material';

// Simple shimmer calendar skeleton
const CalendarShimmer: React.FC = () => (
  <div>
    <div className="mb-4 flex items-center justify-between">
      <Skeleton variant="rounded" width={160} height={36} />
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" width={36} height={36} />
        <Skeleton variant="rounded" width={120} height={36} />
        <Skeleton variant="circular" width={36} height={36} />
      </div>
    </div>
    <div className="grid grid-cols-7 gap-3">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={`wh-${i}`} variant="rounded" height={20} />
      ))}
      {Array.from({ length: 42 }).map((_, i) => (
        <Skeleton key={`d-${i}`} variant="rounded" height={82} />
      ))}
    </div>
  </div>
);

const YourAttendance: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [presentDates, setPresentDates] = useState<string[]>([]);
  const [absentDates, setAbsentDates] = useState<string[]>([]);
  const [totalPresent, setTotalPresent] = useState<number>(0);
  const [totalAbsent, setTotalAbsent] = useState<number>(0);
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [view, setView] = useState<'month' | 'year'>('month');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!user?.schoolId) {
          setError('School ID not found');
          return;
        }
        const teacherId = authService.getTeacherId();
        if (!teacherId) {
          setError('Teacher ID not found');
          return;
        }
        const data = await teacherAttendanceService.getTeacherAttendanceForTeacher(user.schoolId, teacherId);
        setPresentDates(data.presentDates || []);
        setAbsentDates(data.absentDates || []);
        setTotalPresent(data.totalPresent || 0);
        setTotalAbsent(data.totalAbsent || 0);
      } catch (e: any) {
        console.error(e);
        setError('Failed to load attendance');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.schoolId]);

  const monthMatrix = useMemo(() => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay(); // 0-6
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Array<{ date: Date | null; key: string }> = [];

    // Leading blanks
    for (let i = 0; i < startDay; i++) {
      days.push({ date: null, key: `b-${i}` });
    }
    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d);
      days.push({ date: dt, key: `d-${d}` });
    }
    // Trailing blanks to make 6 rows
    while (days.length % 7 !== 0) {
      days.push({ date: null, key: `t-${days.length}` });
    }
    while (days.length < 42) {
      days.push({ date: null, key: `t2-${days.length}` });
    }
    return days;
  }, [current]);

  const isoOf = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const isPresent = (d: Date | null) => {
    if (!d) return false;
    const iso = isoOf(d);
    return presentDates.includes(iso);
  };

  const isAbsent = (d: Date | null) => {
    if (!d) return false;
    const iso = isoOf(d);
    return absentDates.includes(iso);
  };

  const monthLabel = useMemo(() => current.toLocaleString('default', { month: 'long', year: 'numeric' }), [current]);

  const presentCountForCurrentMonth = useMemo(() => {
    const y = current.getFullYear();
    const m = current.getMonth() + 1;
    const prefix = `${y}-${String(m).padStart(2, '0')}-`;
    return presentDates.filter(d => d.startsWith(prefix)).length;
  }, [presentDates, current]);

  const daysInCurrentMonth = useMemo(() => new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate(), [current]);
  const absentCountForCurrentMonth = useMemo(() => {
    const y = current.getFullYear();
    const m = current.getMonth() + 1;
    const prefix = `${y}-${String(m).padStart(2, '0')}-`;
    return absentDates.filter(d => d.startsWith(prefix)).length;
  }, [absentDates, current]);
  const unmarkedCountForCurrentMonth = Math.max(0, daysInCurrentMonth - presentCountForCurrentMonth - absentCountForCurrentMonth);

  const yearGrid = useMemo(() => {
    const year = current.getFullYear();
    return Array.from({ length: 12 }).map((_, idx) => {
      const firstOfMonth = new Date(year, idx, 1);
      const daysInMonth = new Date(year, idx + 1, 0).getDate();
      const days = Array.from({ length: daysInMonth }).map((__, d) => new Date(year, idx, d + 1));
      return { monthIndex: idx, label: firstOfMonth.toLocaleString('default', { month: 'short' }), days };
    });
  }, [current]);

  if (loading) return <CalendarShimmer />;
  if (error) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="text-red-500 text-xl mb-2">⚠️</div>
        <p className="text-gray-700 dark:text-gray-300">{error}</p>
      </div>
    </div>
  );

  return (
    <div>
      <Card className="mb-6 dark:bg-gray-800 dark:border dark:border-gray-700">
        <CardHeader
          title="Your Attendance"
          subheader="Present and absent days marked on the calendar"
          sx={{
            '& .MuiCardHeader-title': { color: isDarkMode ? '#ffffff' : '#111827' },
            '& .MuiCardHeader-subheader': { color: isDarkMode ? '#9CA3AF' : '#6B7280' }
          }}
          action={
            <ToggleButtonGroup
              value={view}
              exclusive
              size="small"
              onChange={(_, v) => v && setView(v)}
              color="primary"
              sx={isDarkMode ? {
                '& .MuiToggleButtonGroup-grouped': {
                  borderColor: '#374151',
                  color: '#E5E7EB'
                },
                '& .Mui-selected': {
                  backgroundColor: '#2563EB',
                  color: '#fff',
                  borderColor: '#2563EB',
                  '&:hover': { backgroundColor: '#1D4ED8' }
                }
              } : undefined}
            >
              <ToggleButton value="month">Month</ToggleButton>
              <ToggleButton value="year">Year</ToggleButton>
            </ToggleButtonGroup>
          }
        />
        <CardContent className="dark:text-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Chip
                icon={<EventAvailable fontSize="small" />}
                label={`Present: ${presentCountForCurrentMonth}`}
                color={isDarkMode ? undefined : 'success'}
                variant={isDarkMode ? 'filled' : 'outlined'}
                sx={isDarkMode ? { backgroundColor: '#065F46', color: '#ECFDF5', '& .MuiChip-icon': { color: '#D1FAE5' } } : { '& .MuiChip-icon': { color: 'inherit' } }}
              />
              <Chip
                icon={<EventBusy fontSize="small" />}
                label={`Absent: ${absentCountForCurrentMonth}`}
                variant={isDarkMode ? 'filled' : 'outlined'}
                sx={isDarkMode ? { backgroundColor: '#7F1D1D', color: '#FEE2E2', '& .MuiChip-icon': { color: '#FECACA' } } : { '& .MuiChip-icon': { color: 'inherit' } }}
              />
              <Chip
                label={`Not marked: ${unmarkedCountForCurrentMonth}`}
                variant={isDarkMode ? 'filled' : 'outlined'}
                sx={isDarkMode ? { backgroundColor: '#374151', color: '#E5E7EB', '& .MuiChip-icon': { color: '#E5E7EB' } } : undefined}
              />
            </div>
            <div className="flex items-center gap-1">
              <IconButton onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1))} color={isDarkMode ? 'primary' : 'default'} sx={isDarkMode ? { color: '#E5E7EB' } : undefined}>
                <ArrowBack sx={isDarkMode ? { color: '#E5E7EB' } : undefined} />
              </IconButton>
              <Chip icon={<Today sx={isDarkMode ? { color: '#E5E7EB' } : undefined} />} label={monthLabel} color="primary" variant="filled" sx={isDarkMode ? { backgroundColor: '#1D4ED8' } : undefined} />
              <IconButton onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1))} color={isDarkMode ? 'primary' : 'default'} sx={isDarkMode ? { color: '#E5E7EB' } : undefined}>
                <ArrowForward sx={isDarkMode ? { color: '#E5E7EB' } : undefined} />
              </IconButton>
            </div>
          </div>

          {view === 'month' && (
            <>
              <div className="grid grid-cols-7 gap-3 mb-2 text-xs font-medium text-gray-500 dark:text-gray-200">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                  <div key={d} className="text-center uppercase">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-3">
                {monthMatrix.map(({ date, key }) => {
                  if (!date) return <div key={key} className="h-20 bg-transparent" />;
                  const present = isPresent(date);
                  const absent = isAbsent(date);
                  const status: 'present' | 'absent' | 'unmarked' = present ? 'present' : absent ? 'absent' : 'unmarked';
                  return (
                    <Card
                      key={key}
                      className={`${status === 'present' ? 'border-green-200' : status === 'absent' ? 'border-red-200' : 'border-gray-300'} dark:bg-gray-800 dark:border-gray-700`}
                      variant="outlined"
                    >
                      <CardContent className={`!p-2 h-20 ${status === 'present' ? 'bg-green-50 dark:bg-green-900/30' : status === 'absent' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-900/40'}`}>
                        <div className="flex items-center justify-between">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white/70 dark:bg-white/20 text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {date.getDate()}
                          </div>
                          {status === 'present' ? (
                            <EventAvailable className="text-green-400" fontSize="small" />
                          ) : status === 'absent' ? (
                            <EventBusy className="text-red-400" fontSize="small" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-500 inline-block" />
                          )}
                        </div>
                        <div className={`mt-2 text-xs ${status === 'present' ? 'text-green-700 dark:text-green-200' : status === 'absent' ? 'text-red-700 dark:text-red-200' : 'text-gray-700 dark:text-gray-200'}`}>
                          {status === 'present' ? 'Present' : status === 'absent' ? 'Absent' : 'Not marked'}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {view === 'year' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {yearGrid.map(({ monthIndex, label, days }) => (
                <Card key={label} variant="outlined" className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader title={label} className="!pb-0" sx={{ '& .MuiCardHeader-title': { color: isDarkMode ? '#E5E7EB' : undefined } }} />
                  <CardContent className="!pt-2">
                    <div className="grid grid-cols-7 gap-1 text-[10px] mb-1 text-gray-500 dark:text-gray-300">
                      {['S','M','T','W','T','F','S'].map((d, i) => <div key={`${d}-${i}`} className="text-center">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const firstDay = new Date(current.getFullYear(), monthIndex, 1).getDay();
                        const blanks = Array.from({ length: firstDay }).map((_, i) => <div key={`b-${i}`} />);
                        const cells = days.map((d) => {
                          const present = isPresent(d);
                          return (
                            <div key={d.toISOString()} className={`h-6 rounded ${present ? 'bg-green-500' : 'bg-red-300'} text-white text-[10px] flex items-center justify-center`}>
                              {d.getDate()}
                            </div>
                          );
                        });
                        return [...blanks, ...cells];
                      })()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default YourAttendance;


