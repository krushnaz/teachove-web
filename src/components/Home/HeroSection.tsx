import React from 'react';
import { Link } from 'react-router-dom';
import { Play, TrendingUp, Users, GraduationCap, Activity } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useReveal } from './utils/useReveal';

const HeroSection: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const heroReveal = useReveal<HTMLDivElement>();

  return (
    <section
      ref={heroReveal.elementRef}
      className={`relative pt-24 sm:pt-32 lg:pt-40 pb-16 sm:pb-20 lg:pb-24 px-4 ${
        isDarkMode ? 'bg-slate-900' : 'bg-white'
      }`}
    >
      <div
        className={`max-w-7xl mx-auto text-center transition-all duration-1000 transform ${
          heroReveal.revealed
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 sm:mb-8 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
            Trusted by 500+ Schools Nationwide
          </span>
        </div>

        {/* Headline */}
        <h1
          className={`max-w-5xl mx-auto text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          The Future of{' '}
          <span className="text-blue-600 dark:text-blue-500">
            School Management
          </span>
        </h1>

        {/* Tagline */}
        <p
          className={`max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 leading-relaxed ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          Everything Your School Needs, in One Place — uniting administrators, teachers, and students to simplify education.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-row items-center justify-center gap-4 mb-12 sm:mb-16 lg:mb-20 max-w-none mx-auto px-4 sm:px-0">
          <Link
            to="/login"
            className="px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all rounded-full active:scale-95 touch-manipulation min-h-[48px] flex items-center justify-center whitespace-nowrap"
          >
            Get Started Free
          </Link>
          <a
            href="#apps"
            className={`px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-semibold transition-all border-2 rounded-full active:scale-95 flex items-center justify-center gap-2 touch-manipulation min-h-[48px] whitespace-nowrap ${
              isDarkMode
                ? 'border-blue-500 text-blue-400 hover:bg-blue-950/30'
                : 'border-blue-600 text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Play className="w-5 h-5" fill="currentColor" />
            Watch Demo
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {[
            { label: 'Schools', value: '500+', icon: Activity },
            { label: 'Students', value: '50K+', icon: GraduationCap },
            { label: 'Teachers', value: '5K+', icon: Users },
            { label: 'Uptime', value: '99.9%', icon: TrendingUp },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`p-4 sm:p-6 text-center transition-transform hover:scale-105 ${
                isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'
              } rounded-xl`}
            >
              <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-600 dark:text-blue-500" />
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-500 mb-1">
                {stat.value}
              </div>
              <div
                className={`text-xs sm:text-sm font-medium uppercase tracking-wide ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
