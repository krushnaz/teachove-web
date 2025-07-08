import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { isDarkMode } = useDarkMode();

  const menuItems = [
    { path: '/erp', label: 'Dashboard', icon: '📊' },
    { path: '/erp/students', label: 'Students', icon: '👨‍🎓' },
    { path: '/erp/teachers', label: 'Teachers', icon: '👨‍🏫' },
    { path: '/erp/attendance', label: 'Attendance', icon: '📝' },
    { path: '/erp/exams', label: 'Exams', icon: '📚' },
    { path: '/erp/fees', label: 'Fees', icon: '💰' },
    { path: '/erp/reports', label: 'Reports', icon: '📈' },
  ];

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } border-r`}>
      <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {!isCollapsed && (
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-primary-500'}`}>TeachoVE</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 transition-colors ${
              location.pathname === item.path 
                ? `${isDarkMode ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-600'} border-r-2 border-primary-600` 
                : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'}`
            }`}
          >
            <span className="text-xl mr-3">{item.icon}</span>
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 