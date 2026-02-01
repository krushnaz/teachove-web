import React from 'react';
import { Mail, CheckCircle, Zap } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const steps = [
  {
    step: '01',
    title: 'Contact Sales',
    desc: 'Reach out to our sales team to discuss your requirements.',
    Icon: Mail,
  },
  {
    step: '02',
    title: 'Verification',
    desc: 'We verify your school details and set up your account.',
    Icon: CheckCircle,
  },
  {
    step: '03',
    title: 'Go Live',
    desc: 'Start using Vedant Education and transform your school.',
    Icon: Zap,
  },
];

const StepsSection: React.FC = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <section
      className={`py-16 sm:py-20 lg:py-24 ${
        isDarkMode ? 'bg-slate-950' : 'bg-gray-50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Get Started in 3 Steps
          </h2>
          <p
            className={`text-base sm:text-lg max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Join hundreds of schools that trust Vedant Education
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Timeline - Vertical for mobile, Horizontal for desktop */}
          <div className="relative">
            {/* Vertical timeline for mobile */}
            <div
              className={`md:hidden absolute left-10 top-0 bottom-0 w-0.5 ${
                isDarkMode ? 'bg-slate-700' : 'bg-gray-300'
              }`}
            />
            
            {/* Horizontal timeline for desktop */}
            <div
              className={`hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 ${
                isDarkMode ? 'bg-slate-700' : 'bg-gray-300'
              }`}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-8 relative">
              {steps.map((item, idx) => (
                <div key={idx} className="relative flex md:flex-col items-start md:items-center text-left md:text-center group">
                  {/* Step Circle */}
                  <div className="flex-shrink-0 mr-6 md:mr-0">
                    <div
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-0 md:mb-6 relative z-10 transition-transform duration-300 group-hover:scale-110 border-4 ${
                        isDarkMode 
                          ? 'bg-slate-800 border-slate-700' 
                          : 'bg-white border-blue-100'
                      }`}
                    >
                      <item.Icon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-500" strokeWidth={2} />
                      <div
                        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white bg-blue-600 shadow-lg"
                      >
                        {item.step}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 md:flex-none">
                    <h3
                      className={`text-xl sm:text-2xl font-bold mb-2 sm:mb-3 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`text-sm sm:text-base md:max-w-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
