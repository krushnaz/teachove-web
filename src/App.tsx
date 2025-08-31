import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/Home/LandingPage';
import LoginPage from './components/LoginPage';
import { SchoolAdminDashboard, SchoolAdminStudents, SchoolAdminTeachers, SchoolAdminAttendance, SchoolAdminClassroom, SchoolAdminStudentFees, SchoolAdminAnnouncements, SchoolAdminSubscriptionRequests } from './components/SchoolAdmin';
import SchoolProfile from './components/SchoolAdmin/SchoolProfile/SchoolProfile';
import { ExamTimetable } from './components/SchoolAdmin/Exams';
import SchoolAdminLayout from './components/SchoolAdmin/Layout';
import { TeacherAdminDashboard } from './components/TeacherAdmin';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Students from './components/Students';
import Teachers from './components/Teachers';
import Attendance from './components/Attendance';
import Exams from './components/Exams';
import Fees from './components/Fees';
import Reports from './components/Reports';

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Landing Page Route */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Login Route */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* School Admin Dashboard Routes */}
            <Route path="/school-admin/*" element={
              <ProtectedRoute requiredRole="school">
                <SchoolAdminLayout>
                  <Routes>
                    <Route index element={<SchoolAdminDashboard />} />
                    <Route path="students" element={<SchoolAdminStudents />} />
                    <Route path="teachers" element={<SchoolAdminTeachers />} />
                    <Route path="attendance" element={<SchoolAdminAttendance />} />
                    <Route path="classroom" element={<SchoolAdminClassroom />} />
                    <Route path="exams" element={<ExamTimetable />} />
                    <Route path="fees" element={<SchoolAdminStudentFees />} />
                    <Route path="announcements" element={<SchoolAdminAnnouncements />} />
                    <Route path="subscription-request" element={<SchoolAdminSubscriptionRequests />} />
                    <Route path="profile" element={<SchoolProfile schoolId="nvGVyZZCGqcIZU8rqJg9" />} />
                  </Routes>
                </SchoolAdminLayout>
              </ProtectedRoute>
            } />
            
            {/* Teacher Admin Dashboard Routes */}
            <Route path="/teacher-admin/*" element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherAdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Legacy ERP Dashboard Routes */}
            <Route path="/erp/*" element={
              <ProtectedRoute>
                <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
                      <div className="container mx-auto px-6 py-8">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/students" element={<Students />} />
                          <Route path="/teachers" element={<Teachers />} />
                          <Route path="/attendance" element={<Attendance />} />
                          <Route path="/exams" element={<Exams />} />
                          <Route path="/fees" element={<Fees />} />
                          <Route path="/reports" element={<Reports />} />
                        </Routes>
                      </div>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </Router>
    </DarkModeProvider>
  );
}

export default App;
