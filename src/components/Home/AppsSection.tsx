import React from 'react';
import { Zap } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useReveal } from './utils/useReveal';
import schoolAdminScreen from '../../assets/appScreenshorts/schoolAdminHomeScreen.jpg';
import teacherAdminScreen from '../../assets/appScreenshorts/teacherAdminHomeScreen.jpg';
import studentAdminScreen from '../../assets/appScreenshorts/studentAdminHomeScreen.jpg';

const apps = [
  {
    title: 'School Admin Panel',
    subtitle: 'Complete Management Hub',
    desc: 'Comprehensive dashboard for school administrators to manage staff, curriculum, fees, attendance, exams, and events efficiently.',
    img: schoolAdminScreen,
    features: ['Staff Management', 'Fee Reports', 'Attendance', 'Exam Planning', 'Events', 'Announcements'],
  },
  {
    title: 'Teacher Admin Panel',
    subtitle: 'Classroom Management',
    desc: 'Empower educators with tools to manage students, track attendance, assign homework, publish results, and handle leave requests.',
    img: teacherAdminScreen,
    features: ['Student Management', 'Attendance Tracking', 'Daily Homework', 'Results Publishing', 'Leave Management'],
    swap: true,
  },
  {
    title: 'Student/Parent Access',
    subtitle: 'Stay Connected & Informed',
    desc: 'Students and parents can view fees, attendance, homework, timetables, results, notices, apply for leave, and switch accounts easily.',
    img: studentAdminScreen,
    features: ['Fee Tracking', 'Attendance View', 'Homework & Timetable', 'Exam Results', 'Leave Application', 'Notices'],
  },
];

const AppsSection: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const appsReveal = useReveal<HTMLDivElement>();

  return (
    <section
      id="apps"
      ref={appsReveal.elementRef}
      className={`py-16 sm:py-20 lg:py-32 ${
        isDarkMode ? 'bg-slate-950' : 'bg-gray-50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-12 sm:mb-16 lg:mb-20 transition-all duration-1000 ease-out ${
            appsReveal.revealed
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 sm:mb-6 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
              Complete Ecosystem
            </span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 tracking-tight ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            A Suite for{' '}
            <span className="text-blue-600 dark:text-blue-500">Every Role</span>
          </h2>
          <p
            className={`text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Seamlessly connected applications designed to transform how schools operate
          </p>
        </div>

        {/* App Cards */}
        <div className="space-y-8 sm:space-y-12 lg:space-y-24">
          {apps.map((app, idx) => (
            <div
              key={idx}
              className={`transition-all duration-1000 ease-out ${
                appsReveal.revealed
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              {/* Mobile Layout - Side by Side with Odd-Even Pattern */}
              <div className={`flex md:hidden gap-4 items-start ${idx % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                {/* Content - Mobile */}
                <div className="flex-1 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold">
                    <Zap className="w-3 h-3" />
                    For {app.title.split(' ')[0]}s
                  </div>

                  <div>
                    <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {app.title}
                    </h3>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-500 mb-2">
                      {app.subtitle}
                    </p>
                  </div>

                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {app.desc}
                  </p>

                  {/* Features - Mobile */}
                  <div className="flex flex-wrap gap-1.5">
                    {app.features.map((feature, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          isDarkMode
                            ? 'bg-slate-800 text-gray-300'
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                </div>

                {/* Phone Mockup - Mobile (Small) */}
                <div className="flex-shrink-0">
                  <div
                    className={`rounded-xl overflow-hidden border-2 ${
                      isDarkMode ? 'border-slate-800 bg-slate-800' : 'border-gray-200 bg-gray-900'
                    }`}
                  >
                    <img
                      src={app.img}
                      alt={app.title}
                      className="w-[120px] h-auto object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Tablet & Desktop Layout */}
              <div className={`hidden md:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${app.swap ? 'lg:grid-flow-dense' : ''}`}>
                {/* Content */}
                <div className={`${app.swap ? 'lg:col-start-2' : ''} space-y-6`}>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold">
                    <Zap className="w-4 h-4" />
                    For {app.title.split(' ')[0]}s
                  </div>

                  <div>
                    <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {app.title}
                    </h3>
                    <p className="text-lg sm:text-xl font-medium text-blue-600 dark:text-blue-500 mb-4">
                      {app.subtitle}
                    </p>
                  </div>

                  <p className={`text-base sm:text-lg leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {app.desc}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {app.features.map((feature, i) => (
                      <span
                        key={i}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium ${
                          isDarkMode
                            ? 'bg-slate-800 text-gray-300'
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                </div>

                {/* Phone Mockup - Desktop */}
                <div className={`flex items-center justify-center ${app.swap ? 'lg:col-start-1' : ''}`}>
                  <div className="relative">
                    <div
                      className={`rounded-2xl sm:rounded-3xl overflow-hidden border-4 ${
                        isDarkMode ? 'border-slate-800 bg-slate-800' : 'border-gray-200 bg-gray-900'
                      }`}
                    >
                      <img
                        src={app.img}
                        alt={app.title}
                        className="w-[280px] md:w-[320px] lg:w-[300px] object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AppsSection;
