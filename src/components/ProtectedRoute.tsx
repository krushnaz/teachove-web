import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'school' | 'teacher';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required and user doesn't have the required role
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    if (user?.role === 'school') {
      return <Navigate to="/school-admin" replace />;
    } else if (user?.role === 'teacher') {
      return <Navigate to="/teacher-admin" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  // User is authenticated and has required role (if specified)
  return <>{children}</>;
};

export default ProtectedRoute; 