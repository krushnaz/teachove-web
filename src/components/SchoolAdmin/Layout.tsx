import React, { useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import SchoolAdminSidebar from './Sidebar';
import SchoolAdminHeader from './Header';

interface SchoolAdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const SchoolAdminLayout: React.FC<SchoolAdminLayoutProps> = ({ 
  children, 
  title = "Dashboard",
  subtitle = "Welcome back, School Administrator"
}) => {
  const { isDarkMode } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-40">
      <SchoolAdminHeader 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        title={title}
        subtitle={subtitle}
      />
      </div>

      <div className="flex">
        {/* Sticky Sidebar */}
        <div className="sticky top-0 h-screen">
        <SchoolAdminSidebar 
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

export default SchoolAdminLayout; 