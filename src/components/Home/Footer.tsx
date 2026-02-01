import React from 'react';
import { BookOpen, Twitter, Linkedin, Instagram } from 'lucide-react';
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
            <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
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

          {/* Social Links */}
          <div className="flex gap-4 sm:gap-6">
            {[
              { name: 'Twitter', Icon: Twitter },
              { name: 'LinkedIn', Icon: Linkedin },
              { name: 'Instagram', Icon: Instagram },
            ].map(({ name, Icon }) => (
              <a
                key={name}
                href="#"
                className={`p-2 rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-white hover:bg-slate-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label={name}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
