import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services';
import { sessionSocketService } from '../services/sessionSocketService';

interface User {
  studentId?: string;
  teacherId?: string;
  role: string;
  schoolId?: string;
  schoolName?: string;
  phoneNo?: string;
  email: string;
  name?: string;
  profilePic?: string;
  admissionYear?: string;
  rollNo?: string;
  classId?: string;
  className?: string;
  currentAcademicYear?: string;
  createdAt?: any;
  updatedAt?: any;
  userId?: string;
}

interface SchoolDetails {
  schoolName: string;
  logo: string;
  type: string;
  address: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  city: string;
  state: string;
  pincode: string;
  phoneNo: string;
  currentAcademicYear: string;
}

interface ClassDetails {
  className: string;
  section: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  schoolDetails?: SchoolDetails;
  classDetails?: ClassDetails;
  classTeacher?: string;
  timestamp: string;
}

interface AuthContextType {
  user: User | null;
  schoolDetails: SchoolDetails | null;
  classDetails: ClassDetails | null;
  classTeacher: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneNo: string, password: string, role: string) => Promise<void>;
  loginMasterAdmin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(null);
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [classTeacher, setClassTeacher] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const forcedLogoutRef = useRef(false);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setSchoolDetails(null);
    setClassDetails(null);
    setClassTeacher(null);
  }, []);

  const redirectToLogin = useCallback((role?: string) => {
    if (role === 'master_admin') {
      navigate('/master-admin');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleSessionInvalid = useCallback((message?: string, role?: string) => {
    if (forcedLogoutRef.current) return;
    forcedLogoutRef.current = true;
    sessionSocketService.disconnect();
    authService.clearLocalSession();
    clearAuthState();
    toast.error(message || 'Your session has ended. Please log in again.');
    redirectToLogin(role);
    setTimeout(() => {
      forcedLogoutRef.current = false;
    }, 1000);
  }, [clearAuthState, redirectToLogin]);

  // Check if user is authenticated on app load
  const checkAuth = useCallback(async () => {
    try {
      const storedUser = authService.getUser();
      const storedSchoolDetails = authService.getSchoolDetails();
      const storedClassDetails = authService.getClassDetails();
      const storedClassTeacher = authService.getClassTeacher();
      const token = authService.getToken();
      const sessionId = authService.getSessionId();
      
      if (storedUser && token) {
        if (sessionId) {
          try {
            const status = await authService.validateSession(sessionId);
            if (!status.active) {
              authService.clearLocalSession();
              clearAuthState();
              console.log('Session no longer active:', status);
              return;
            }
          } catch (error) {
            console.error('Session validation failed:', error);
          }
        }

        setUser(storedUser);
        setSchoolDetails(storedSchoolDetails);
        setClassDetails(storedClassDetails);
        setClassTeacher(storedClassTeacher);
        console.log('User session restored:', storedUser);
      } else {
        clearAuthState();
        console.log('No valid session found');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      clearAuthState();
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthState]);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // WebSocket: listen for admin session revoke
  useEffect(() => {
    const sessionId = authService.getSessionId();
    if (!user || !sessionId) {
      sessionSocketService.disconnect();
      return;
    }

    sessionSocketService.connect(sessionId, (payload) => {
      handleSessionInvalid(
        payload.message || 'Your session was revoked by an administrator.',
        user.role
      );
    });

    return () => {
      sessionSocketService.disconnect();
    };
  }, [user, handleSessionInvalid]);

  // Re-validate session when tab becomes visible again (refresh/focus)
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState !== 'visible' || !user) return;
      const sessionId = authService.getSessionId();
      if (!sessionId) return;

      try {
        const status = await authService.validateSession(sessionId);
        if (!status.active) {
          handleSessionInvalid(
            status.logoutType === 'revoked_by_admin'
              ? 'Your session was revoked by an administrator.'
              : 'Your session has ended. Please log in again.',
            user.role
          );
        }
      } catch (error) {
        console.error('Session re-validation failed:', error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [user, handleSessionInvalid]);

  // Redirect user based on their role when authenticated (only on initial load)
  useEffect(() => {
    if (!isLoading && user) {
      const currentPath = window.location.pathname;
      // Only redirect if user is on the root path or login page
      if (currentPath === '/' || currentPath === '/login') {
        console.log('User authenticated, redirecting to dashboard...', { currentPath, userRole: user.role });
        if (user.role === 'school') {
          navigate('/school-admin');
        } else if (user.role === 'teacher') {
          navigate('/teacher-admin');
        } else if (user.role === 'student') {
          navigate('/student-dashboard');
        } else if (user.role === 'master_admin') {
          navigate('/master-admin/dashboard');
        }
      } else {
        console.log('User authenticated but already on a valid path:', currentPath);
      }
    }
  }, [user, isLoading, navigate]);

  const login = async (phoneNo: string, password: string, role: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(phoneNo, password, role);
      
      if (response.success) {
        setUser(response.user);
        setSchoolDetails(response.schoolDetails || null);
        setClassDetails(response.classDetails || null);
        setClassTeacher(response.classTeacher || null);
        console.log('Login successful, user set:', response.user);
        console.log('School details:', response.schoolDetails);
        console.log('Class details:', response.classDetails);
      } else {
        // Throw error with the API response message
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // If it's an API error with response data, preserve the response message
      if (error.response && error.response.message) {
        throw error;
      } else {
        // For other errors, throw with the error message
        throw new Error(error.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginMasterAdmin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.loginMasterAdmin(email, password);
      
      if (response.success) {
        setUser(response.user);
        setSchoolDetails(null);
        setClassDetails(null);
        setClassTeacher(null);
        console.log('Master admin login successful, user set:', response.user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Master admin login error:', error);
      throw new Error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const currentUser = user;
      sessionSocketService.disconnect();
      await authService.logout();
      clearAuthState();
      
      redirectToLogin(currentUser?.role);
      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error);
      const currentUser = user;
      authService.clearLocalSession();
      clearAuthState();
      redirectToLogin(currentUser?.role);
    }
  };

  const value: AuthContextType = {
    user,
    schoolDetails,
    classDetails,
    classTeacher,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginMasterAdmin,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 