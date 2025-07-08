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
      <SchoolAdminHeader 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        title={title}
        subtitle={subtitle}
      />

      <div className="flex">
        <SchoolAdminSidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolAdminLayout; 