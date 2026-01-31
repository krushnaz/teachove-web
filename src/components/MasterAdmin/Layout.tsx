import React, { useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import MasterAdminSidebar from './Sidebar';
import MasterAdminHeader from './Header';

interface MasterAdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const MasterAdminLayout: React.FC<MasterAdminLayoutProps> = ({ 
  children, 
  title = "Dashboard",
  subtitle = "Welcome back, Master Administrator"
}) => {
  const { isDarkMode } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Fixed Header */}
      <div className="flex-shrink-0 z-40">
        <MasterAdminHeader 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          title={title}
          subtitle={subtitle}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Sidebar */}
        <div className="flex-shrink-0">
          <MasterAdminSidebar 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 min-h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterAdminLayout;
