import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';

interface User {
  role: string;
  schoolId: string;
  schoolName: string;
  phoneNo: string;
  email: string;
  currentAcademicYear: string;
}

interface AuthContextType {
  user: User | null;
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
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated on app load
  const checkAuth = () => {
    try {
      const storedUser = authService.getUser();
      const token = authService.getToken();
      
      if (storedUser && token) {
        setUser(storedUser);
        console.log('User session restored:', storedUser);
      } else {
        setUser(null);
        console.log('No valid session found');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
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
        console.log('Login successful, user set:', response.user);
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
      navigate('/login');
      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, clear local session
      setUser(null);
      navigate('/login');
    }
  };

  const value: AuthContextType = {
    user,
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