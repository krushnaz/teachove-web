import React, { useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import StudentSidebar from './Sidebar';
import StudentHeader from './Header';

interface StudentLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ 
  children, 
  title = "Dashboard",
  subtitle = "Welcome back, Student"
}) => {
  const { isDarkMode } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sticky Header (offset for fixed sidebar on large screens) */}
      <div className="sticky top-0 z-50 lg:ml-64">
        <StudentHeader 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          title={title}
          subtitle={subtitle}
        />
      </div>

      <div className="flex">
        {/* Fixed Sidebar (independent from main scroll) */}
        <StudentSidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Scrollable Main Content */}
        <div className="flex-1 min-h-screen overflow-y-auto lg:ml-64">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
