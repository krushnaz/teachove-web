import React from 'react';
import TeacherAdminLayout from './Layout';
import DashboardContent from './Dashboard/DashboardContent';

const TeacherAdminDashboard: React.FC = () => {
  return (
    <TeacherAdminLayout 
      title="Dashboard" 
      subtitle="Welcome back, Teacher"
    >
      <DashboardContent />
    </TeacherAdminLayout>
  );
};

export default TeacherAdminDashboard;
