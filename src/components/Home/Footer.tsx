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
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img 
              src="/icon-192.png" 
              alt="TeachoVE — School ERP logo" 
              width={56}
              height={56}
              loading="lazy"
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

          <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
            {[
              { label: 'Apps', href: '#apps' },
              { label: 'Features', href: '#features' },
              { label: 'Benefits', href: '#benefits' },
              { label: 'Contact', href: '#contact' },
              { label: 'Login', href: '/login' },
            ].map((link) =>
              link.href.startsWith('#') ? (
                <a
                  key={link.href}
                  href={link.href}
                  className={isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
                >
                  {link.label}
                </a>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className={isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
                >
                  {link.label}
                </a>
              )
            )}
          </nav>
        </div>

        <p
          className={`text-center text-xs sm:text-sm mb-4 max-w-3xl mx-auto ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}
        >
          TeachoVE is a cloud-based School ERP and school management software for India — including student management software, attendance management system, fee management software, teacher management, and school CRM tools.
        </p>

        <div
          className={`text-center text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          © {new Date().getFullYear()} TeachoVE. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
