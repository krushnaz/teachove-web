import React, { useState, useEffect, useRef } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { homeworkService, HomeworkItem } from '../../../services/homeworkService';

const StudentHomework: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
  const [homeworkDates, setHomeworkDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 15))); // Start from 15 days ago
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate dates for horizontal calendar (30 days from startDate)
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 60; i++) { // Show 60 days total
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
  }, [user?.schoolId, user?.classId]);

  useEffect(() => {
    if (user?.schoolId && user?.classId) {
      fetchHomeworks();
    }
  }, [selectedDate, user?.schoolId, user?.classId]);

  // Scroll to center (today's date area) on initial load
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Scroll to show dates around today (approximately center)
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
      fullDate: date.toISOString().split('T')[0]
    };
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const hasHomework = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return homeworkDates.includes(dateStr);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const scrollToDate = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
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
    // Scroll to center after a small delay
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollPosition = (container.scrollWidth - container.clientWidth) / 3;
        container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleDownload = (fileUrl: string, title: string) => {
    window.open(fileUrl, '_blank');
  };

  const ShimmerCard = () => (
    <div className={`rounded-xl p-6 border animate-pulse ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className={`h-6 rounded w-3/4 mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-4 rounded w-1/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>
        <div className={`w-12 h-12 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
      </div>
      <div className={`h-4 rounded w-full mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
      <div className={`h-4 rounded w-5/6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Your Homework
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Keep track of your assignments
            </p>
          </div>
          <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Horizontal Date Picker */}
      <div className={`rounded-xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {/* Navigation Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousWeek}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Previous Week
            </button>
            <button
              onClick={goToToday}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
              }`}
            >
              Today
            </button>
            <button
              onClick={goToNextWeek}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Next Week
            </button>
          </div>
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Left Arrow */}
          <button
            onClick={() => scrollToDate('left')}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              isDarkMode
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Date Scroll Container */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: isDarkMode ? '#4B5563 #1F2937' : '#D1D5DB #F3F4F6'
            }}
          >
            <div className="flex space-x-3 py-2">
              {dates.map((date, index) => {
                const { day, date: dateNum, month } = formatDate(date);
                const selected = isSelected(date);
                const today = isToday(date);
                const homework = hasHomework(date);

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={`flex-shrink-0 w-20 rounded-xl p-3 transition-all duration-200 relative ${
                      selected
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                        : isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className={`text-xs font-medium ${selected ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {day}
                      </span>
                      <span className={`text-2xl font-bold mt-1 ${selected ? 'text-white' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {dateNum}
                      </span>
                      <span className={`text-xs ${selected ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {month}
                      </span>
                    </div>
                    {/* Homework Indicator Dot */}
                    {homework && !selected && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    {/* Today Indicator */}
                    {today && !selected && (
                      <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scrollToDate('right')}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
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
      </div>

      {/* Homework List */}
      <div>
        <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {formatDate(selectedDate).day}, {formatDate(selectedDate).month} {formatDate(selectedDate).date}
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <ShimmerCard key={i} />
            ))}
          </div>
        ) : homeworks.length === 0 ? (
          <div className={`rounded-xl p-12 border text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <svg className={`w-10 h-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No Homework
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No assignments for this date. Enjoy your free time!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {homeworks.map((homework) => (
              <div
                key={homework.homeworkId}
                className={`rounded-xl p-6 border transition-all hover:shadow-lg ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {homework.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isDarkMode ? 'bg-blue-500/15 text-blue-300' : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {homework.subjectName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <svg className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Due: {new Date(homework.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      {homework.className && (
                        <div className="flex items-center space-x-1">
                          <svg className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6l-8 4 8 4 8-4-8-4z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 10v6l8 4 8-4v-6" />
                          </svg>
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                            {homework.className}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {homework.file && (
                    <button
                      onClick={() => handleDownload(homework.file!, homework.title)}
                      className={`p-3 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {homework.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHomework;

