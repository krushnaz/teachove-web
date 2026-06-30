import React from 'react';
import MasterAdminLayout from '../Layout';
import AuthSessionsPanel from './AuthSessionsPanel';

const AdminAccess: React.FC = () => {
  return (
    <MasterAdminLayout
      title="Admin Access"
      subtitle="Monitor login sessions across web and mobile apps"
    >
      <div className="space-y-6">
        <AuthSessionsPanel title="All Auth Sessions" showRevoke limit={200} />
      </div>
    </MasterAdminLayout>
  );
};

export default AdminAccess;
