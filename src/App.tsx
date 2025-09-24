import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { AuthProvider } from './contexts/AuthContext';
import { TeacherProfileProvider } from './contexts/TeacherProfileContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/Home/LandingPage';
import LoginPage from './components/LoginPage';
import { SchoolAdminDashboard, SchoolAdminStudents, SchoolAdminTeachers, SchoolAdminAttendance, SchoolAdminClassroom, SchoolAdminStudentFees, SchoolAdminAnnouncements, SchoolAdminEvents, SchoolAdminSubscriptionRequests, SchoolAdminQuestionPapers, SchoolAdminLeaveManagement, SchoolAdminSettings, SchoolProfileWrapper } from './components/SchoolAdmin';
import { ExamTimetable } from './components/SchoolAdmin/Exams';
import SchoolAdminLayout from './components/SchoolAdmin/Layout';
import { TeacherAdminLayout, DashboardContent, TeacherProfile, Students } from './components/TeacherAdmin';
import { StudentResult } from './components/TeacherAdmin';
import StudentAttendance from './components/TeacherAdmin/Attendance/StudentAttendance';

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <AuthProvider>
          <TeacherProfileProvider>
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
                      <Route path="events" element={<SchoolAdminEvents />} />
                      <Route path="question-papers" element={<SchoolAdminQuestionPapers />} />
                      <Route path="leaves" element={<SchoolAdminLeaveManagement />} />
                      <Route path="settings" element={<SchoolAdminSettings />} />
                      <Route path="subscription-request" element={<SchoolAdminSubscriptionRequests />} />
                      <Route path="profile" element={<SchoolProfileWrapper />} />
                    </Routes>
                  </SchoolAdminLayout>
                </ProtectedRoute>
              } />
              
              {/* Teacher Admin Dashboard Routes */}
              <Route path="/teacher-admin/*" element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherAdminLayout>
                    <Routes>
                      <Route index element={<DashboardContent />} />
                      <Route path="profile" element={<TeacherProfile />} />
                      <Route path="students" element={<Students />} />
                      <Route path="student-attendance" element={<StudentAttendance />} />
                      <Route path="student-results" element={<StudentResult />} />
                      {/* Add other teacher admin routes here as needed */}
                    </Routes>
                  </TeacherAdminLayout>
                </ProtectedRoute>
              } />
              
              {/* Legacy ERP Dashboard Routes */}
              <Route path="/erp/*" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
                        <div className="container mx-auto px-6 py-8">
                  
                        </div>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
          </TeacherProfileProvider>
        </AuthProvider>
      </Router>
    </DarkModeProvider>
  );
}

export default App;
