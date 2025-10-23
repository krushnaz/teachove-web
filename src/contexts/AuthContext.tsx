import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';

interface User {
  studentId?: string;
  teacherId?: string;
  role: string;
  schoolId: string;
  schoolName: string;
  phoneNo: string;
  email: string;
  name?: string;
  profilePic?: string;
  admissionYear?: string;
  rollNo?: string;
  classId?: string;
  className?: string;
  currentAcademicYear: string;
  createdAt?: any;
  updatedAt?: any;
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

  // Check if user is authenticated on app load
  const checkAuth = () => {
    try {
      const storedUser = authService.getUser();
      const storedSchoolDetails = authService.getSchoolDetails();
      const storedClassDetails = authService.getClassDetails();
      const storedClassTeacher = authService.getClassTeacher();
      const token = authService.getToken();
      
      if (storedUser && token) {
        setUser(storedUser);
        setSchoolDetails(storedSchoolDetails);
        setClassDetails(storedClassDetails);
        setClassTeacher(storedClassTeacher);
        console.log('User session restored:', storedUser);
      } else {
        setUser(null);
        setSchoolDetails(null);
        setClassDetails(null);
        setClassTeacher(null);
        console.log('No valid session found');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
      setSchoolDetails(null);
      setClassDetails(null);
      setClassTeacher(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

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

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setSchoolDetails(null);
      setClassDetails(null);
      setClassTeacher(null);
      navigate('/login');
      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, clear local session
      setUser(null);
      setSchoolDetails(null);
      setClassDetails(null);
      setClassTeacher(null);
      navigate('/login');
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