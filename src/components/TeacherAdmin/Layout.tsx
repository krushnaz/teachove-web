import React, { useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import TeacherAdminSidebar from './Sidebar';
import TeacherAdminHeader from './Header';

interface TeacherAdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const TeacherAdminLayout: React.FC<TeacherAdminLayoutProps> = ({
  children,
  title = 'Dashboard',
  subtitle = 'Welcome back, Teacher',
}) => {
  const { isDarkMode } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex-shrink-0 z-40">
        <TeacherAdminHeader
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          title={title}
          subtitle={subtitle}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-shrink-0">
          <TeacherAdminSidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </div>

        <div className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-gray-900">
          <div className="p-2 sm:p-4 lg:p-8 min-h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAdminLayout;
