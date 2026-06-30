import React from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../../contexts/DarkModeContext';

const Navigation: React.FC = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed w-full top-0 z-50 transition-all duration-300 border-b ${
        isDarkMode 
          ? 'bg-slate-900/95 border-slate-800' 
          : 'bg-white/95 border-gray-200'
      } backdrop-blur-xl`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3">
            <img 
              src="/icon-192.png" 
              alt="TeachoVE — School ERP and school management software logo" 
              width={64}
              height={64}
              className="h-14 sm:h-16 w-auto object-contain"
            />
            <span
              className={`text-lg sm:text-xl font-bold tracking-tight ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              TeachoVE
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            {['Apps', 'Features', 'Benefits', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`text-sm font-medium transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/login"
              className={`px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-full hover:opacity-90 active:scale-95 touch-manipulation min-h-[44px] flex items-center justify-center ${
                isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <span className="hidden xs:inline sm:inline">Login Portal</span>
              <span className="inline xs:hidden sm:hidden">Login</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
