import React from 'react';
import { authService } from '../../../services/authService';
import SchoolProfile from './SchoolProfile';

const SchoolProfileWrapper: React.FC = () => {
  const getUserData = () => {
    const userData = authService.getUser();
    if (!userData) {
      throw new Error('User not authenticated');
    }
    return userData.schoolId;
  };

  try {
    const schoolId = getUserData();
    return <SchoolProfile schoolId={schoolId} />;
  } catch (error) {
    console.error('Error getting schoolId:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-600 mb-2">
            Authentication Error
          </h3>
          <p className="text-red-500 mb-4">
            Unable to load school profile. Please log in again.
          </p>
        </div>
      </div>
    );
  }
};

export default SchoolProfileWrapper;
