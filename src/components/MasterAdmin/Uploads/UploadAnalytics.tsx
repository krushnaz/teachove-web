import React from 'react';
import MasterAdminLayout from '../Layout';
import UploadTrackingPanel from './UploadTrackingPanel';

const UploadAnalytics: React.FC = () => {
  return (
    <MasterAdminLayout
      title="Upload Analytics"
      subtitle="Track all file uploads across schools — size, type, and storage usage"
    >
      <UploadTrackingPanel title="All File Uploads" showSchoolColumn limit={200} />
    </MasterAdminLayout>
  );
};

export default UploadAnalytics;
