import React from 'react';
import { CheckCircle, Download, Youtube, GraduationCap, UserCog, Users } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useReveal } from './utils/useReveal';

const panelFeatures = [
  {
    title: 'School Admin Panel',
    icon: UserCog,
    features: [
      'Manage non-teaching staff',
      'Class & curriculum management',
      'Exam timetable planning',
      'Announcements to classes/teachers',
      'Staff & teacher attendance',
      'Fees management with reports',
      'Upcoming events',
      'Teacher leave management',
    ],
    video: 'https://youtu.be/dgPEB2b3Jr4?si=OA2Zsjz2pleTpt5y',
  },
  {
    title: 'Teacher Admin Panel',
    icon: Users,
    features: [
      'Manage students',
      'Weekly timetable view',
      'Mark student attendance with reports',
      'Assign daily homework',
      'Apply for leave & manage student leave',
      'Publish student results',
    ],
    video: 'https://youtu.be/BADVwshwaJE?si=aAsCqAHP_-K4Qgzd',
  },
  {
    title: 'Student/Parent Access',
    icon: GraduationCap,
    features: [
      'View paid fees',
      'Track attendance',
      'Daily homework & timetable',
      'Notices & announcements',
      'Exam timetable & results',
      'Apply for leave',
      'Switch account feature',
    ],
    video: 'https://youtu.be/_UCVXDf-4d4?si=OA2Zsjz2pleTpt5y',
  },
];

const FeaturesSection: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const featuresReveal = useReveal<HTMLDivElement>();

  return (
    <section
      id="features"
      ref={featuresReveal.elementRef}
      className={`py-16 sm:py-20 lg:py-24 ${
        isDarkMode ? 'bg-slate-900' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header */}
        <div
          className={`text-center mb-12 sm:mb-16 lg:mb-20 transition-all duration-1000 ${
            featuresReveal.revealed
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 sm:mb-6 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
              Complete School Management Solution
            </span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Powerful Features for{' '}
            <span className="text-blue-600 dark:text-blue-500">Every Role</span>
          </h2>
          <p
            className={`text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            One comprehensive app with three specialized panels — School Admin, Teacher Admin, and Student/Parent Access
          </p>
        </div>

        {/* Panel Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {panelFeatures.map((panel, idx) => (
            <div
              key={idx}
              className={`group relative p-6 sm:p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 ${
                isDarkMode
                  ? 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                  : 'bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-lg'
              }`}
            >
              {/* Icon and Title */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isDarkMode ? 'bg-blue-950/50' : 'bg-blue-50'
                  }`}
                >
                  <panel.icon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-500" strokeWidth={2} />
                </div>
                <h3
                  className={`text-xl sm:text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {panel.title}
                </h3>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-6">
                {panel.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span
                      className={`text-sm sm:text-base ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Video Link */}
              <a
                href={panel.video}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all touch-manipulation min-h-[44px] w-full justify-center ${
                  isDarkMode
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <Youtube className="w-4 h-4 text-red-600" />
                Watch Video Guide
              </a>
            </div>
          ))}
        </div>

        {/* Download CTA */}
        <div
          className={`relative overflow-hidden p-8 sm:p-10 lg:p-12 rounded-2xl text-center ${
            isDarkMode
              ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-800'
              : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'
          }`}
        >
          {/* Background Icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <Download className="w-64 h-64 text-blue-600" strokeWidth={1} />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 mb-6">
              <Download className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2} />
            </div>
            <h3
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              TeachoVE - One App for All
            </h3>
            <p
              className={`text-base sm:text-lg lg:text-xl mb-8 max-w-2xl mx-auto ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Download TeachoVE today and access all three panels — School Admin, Teacher Admin, and Student/Parent Access
            </p>
            <a
              href="https://play.google.com/store/apps/details?id=com.sms.my_school"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-full text-base sm:text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 active:scale-95 hover:scale-105 touch-manipulation min-h-[56px] shadow-lg hover:shadow-xl"
            >
              <Download className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
              Download on Play Store
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
