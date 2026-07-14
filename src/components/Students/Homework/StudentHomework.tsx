import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { homeworkService, HomeworkItem } from '../../../services/homeworkService';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CalendarDays,
  Paperclip,
  Clock,
} from 'lucide-react';
import {
  TeacherPageShell,
  TeacherPageHeader,
  TeacherStatsGrid,
  TeacherStatCard,
  TeacherPanel,
  TeacherCardGrid,
  TeacherItemCard,
  TeacherEmpty,
  TeacherButton,
} from '../shared';

const StudentHomework: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
  const [homeworkDates, setHomeworkDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 15)));
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 60; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = generateDates();

  useEffect(() => {
    if (user?.schoolId && user?.classId) {
      fetchHomeworkDates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.schoolId, user?.classId]);

  useEffect(() => {
    if (user?.schoolId && user?.classId) {
      fetchHomeworks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, user?.schoolId, user?.classId]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollPosition = (container.scrollWidth - container.clientWidth) / 3;
      container.scrollTo({ left: scrollPosition, behavior: 'auto' });
    }
  }, []);

  const fetchHomeworkDates = async () => {
    if (!user?.schoolId || !user?.classId) return;
    try {
      const dates = await homeworkService.getStudentHomeworkDates(user.schoolId, user.classId);
      setHomeworkDates(dates);
    } catch (error) {
      console.error('Error fetching homework dates:', error);
    }
  };

  const fetchHomeworks = async () => {
    if (!user?.schoolId || !user?.classId) return;
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const data = await homeworkService.getStudentHomeworkByDate(user.schoolId, dateStr, user.classId);
      setHomeworks(data);
    } catch (error) {
      console.error('Error fetching homeworks:', error);
      setHomeworks([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
    };
  };

  const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();
  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  const hasHomework = (date: Date) => homeworkDates.includes(date.toISOString().split('T')[0]);

  const scrollToDate = (direction: 'left' | 'right') => {
    scrollContainerRef.current?.scrollBy({
      left: direction === 'left' ? -300 : 300,
      behavior: 'smooth',
    });
  };

  const goToPreviousWeek = () => {
    const newStartDate = new Date(startDate);
    newStartDate.setDate(newStartDate.getDate() - 7);
    setStartDate(newStartDate);
  };

  const goToNextWeek = () => {
    const newStartDate = new Date(startDate);
    newStartDate.setDate(newStartDate.getDate() + 7);
    setStartDate(newStartDate);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setStartDate(new Date(today.setDate(today.getDate() - 15)));
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollPosition = (container.scrollWidth - container.clientWidth) / 3;
        container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }
    }, 100);
  };

  const stats = useMemo(() => ({
    total: homeworks.length,
    withFiles: homeworks.filter(h => !!h.file).length,
    subjects: new Set(homeworks.map(h => h.subjectName).filter(Boolean)).size,
  }), [homeworks]);

  const selectedLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <TeacherPageShell>
      <TeacherPageHeader title="Your Homework" description="Keep track of your daily assignments." />

      <TeacherStatsGrid cols={3}>
        <TeacherStatCard title="Assignments Today" value={stats.total} icon={BookOpen} color="indigo" />
        <TeacherStatCard title="With Attachments" value={stats.withFiles} icon={Paperclip} color="emerald" />
        <TeacherStatCard title="Subjects" value={stats.subjects} icon={CalendarDays} color="violet" />
      </TeacherStatsGrid>

      <TeacherPanel>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <TeacherButton variant="secondary" compact onClick={goToPreviousWeek}>
              Prev Week
            </TeacherButton>
            <TeacherButton compact onClick={goToToday}>
              Today
            </TeacherButton>
            <TeacherButton variant="secondary" compact onClick={goToNextWeek}>
              Next Week
            </TeacherButton>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
            <CalendarDays size={15} />
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollToDate('left')}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <div ref={scrollContainerRef} className="flex-1 overflow-x-auto">
            <div className="flex gap-2 sm:gap-3 py-2">
              {dates.map((date, index) => {
                const { day, date: dateNum } = formatDate(date);
                const selected = isSelected(date);
                const today = isToday(date);
                const homework = hasHomework(date);
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`flex-shrink-0 w-[72px] sm:w-20 rounded-xl p-2.5 sm:p-3 transition-all relative ${
                      selected
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                        : 'bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase tracking-wider">{day}</span>
                      <span className="text-lg sm:text-xl font-bold mt-0.5">{dateNum}</span>
                    </div>
                    {homework && !selected && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full" />
                    )}
                    {today && !selected && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => scrollToDate('right')}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </TeacherPanel>

      <TeacherPanel title={selectedLabel}>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ))}
          </div>
        ) : homeworks.length === 0 ? (
          <TeacherEmpty
            icon={BookOpen}
            title="No homework for this date"
            description="No assignments for this date. Enjoy your free time!"
          />
        ) : (
          <TeacherCardGrid cols={2}>
            {homeworks.map((homework) => (
              <TeacherItemCard key={homework.homeworkId}>
                <div className="px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-indigo-50/50 dark:bg-indigo-900/10">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {homework.title}
                      </h3>
                      <span className="inline-flex mt-1.5 items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {homework.subjectName}
                      </span>
                    </div>
                    {homework.file && (
                      <button
                        onClick={() => window.open(homework.file!, '_blank')}
                        className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex-shrink-0"
                        title="Download attachment"
                      >
                        <Paperclip size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="px-4 sm:px-5 py-4 space-y-2">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {homework.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={13} />
                      Due: {new Date(homework.deadline).toLocaleDateString()}
                    </span>
                    {homework.className && <span>{homework.className}</span>}
                  </div>
                </div>
              </TeacherItemCard>
            ))}
          </TeacherCardGrid>
        )}
      </TeacherPanel>
    </TeacherPageShell>
  );
};

export default StudentHomework;
