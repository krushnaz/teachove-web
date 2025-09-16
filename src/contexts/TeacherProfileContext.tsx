import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { authService } from '../services/authService';
import { teacherProfileService, TeacherProfileResponse, TeacherData, SchoolData, ClassData } from '../services/teacherProfileService';

interface TeacherProfileContextType {
  teacherProfile: TeacherProfileResponse | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

const TeacherProfileContext = createContext<TeacherProfileContextType | undefined>(undefined);

interface TeacherProfileProviderProps {
  children: ReactNode;
}

export const TeacherProfileProvider: React.FC<TeacherProfileProviderProps> = ({ children }) => {
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchTeacherProfile = async () => {
    if (!user || user.role !== 'teacher' || !user.schoolId) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Get teacherId from authService
      const teacherId = authService.getTeacherId();
      if (!teacherId) {
        throw new Error('Teacher ID not found in auth service');
      }

      console.log('Fetching teacher profile with:', { schoolId: user.schoolId, teacherId });
      const profile = await teacherProfileService.getTeacherProfile(user.schoolId, teacherId);
      console.log('Teacher profile fetched successfully:', profile);
      setTeacherProfile(profile);
    } catch (err: any) {
      console.error('Error fetching teacher profile:', err);
      setError(err.message || 'Failed to fetch teacher profile');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchTeacherProfile();
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'teacher') {
      fetchTeacherProfile();
    } else {
      setTeacherProfile(null);
    }
  }, [isAuthenticated, user]);

  const value: TeacherProfileContextType = {
    teacherProfile,
    isLoading,
    error,
    refreshProfile,
  };

  return (
    <TeacherProfileContext.Provider value={value}>
      {children}
    </TeacherProfileContext.Provider>
  );
};

export const useTeacherProfile = (): TeacherProfileContextType => {
  const context = useContext(TeacherProfileContext);
  if (context === undefined) {
    throw new Error('useTeacherProfile must be used within a TeacherProfileProvider');
  }
  return context;
};
