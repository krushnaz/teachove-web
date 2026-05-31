import React from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const Footer: React.FC = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <footer
      className={`py-8 sm:py-12 border-t ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img 
              src="/icon.png" 
              alt="TeachoVE Logo" 
              className="h-12 sm:h-14 w-auto object-contain"
            />
            <span
              className={`text-lg sm:text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              TeachoVE
            </span>
          </div>

          {/* Copyright */}
          <div
            className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            © {new Date().getFullYear()} TeachoVE. All rights reserved.
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
