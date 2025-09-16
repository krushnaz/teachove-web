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
  title = "Dashboard",
  subtitle = "Welcome back, Teacher"
}) => {
  const { isDarkMode } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-40">
        <TeacherAdminHeader 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          title={title}
          subtitle={subtitle}
        />
      </div>

      <div className="flex">
        {/* Sticky Sidebar */}
        <div className="sticky top-0 h-screen">
          <TeacherAdminSidebar 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 min-h-screen overflow-y-auto">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAdminLayout;
