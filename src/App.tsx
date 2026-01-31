import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { AuthProvider } from './contexts/AuthContext';
import { TeacherProfileProvider } from './contexts/TeacherProfileContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/Home/LandingPage';
import LoginPage from './components/LoginPage';

import {
  SchoolAdminDashboard,
  SchoolAdminStudents,
  SchoolAdminTeachers,
  SchoolAdminAttendance,
  SchoolAdminClassroom,
  SchoolAdminStudentFees,
  SchoolAdminAnnouncements,
  SchoolAdminEvents,
  SchoolAdminSubscriptionRequests,
  SchoolAdminQuestionPapers,
  SchoolAdminLeaveManagement,
  SchoolAdminSettings,
  SchoolProfileWrapper,
} from './components/SchoolAdmin';
import { ExamTimetable as SchoolExamTimetable } from './components/SchoolAdmin/Exams';
import SchoolAdminLayout from './components/SchoolAdmin/Layout';

import {
  TeacherAdminLayout,
  DashboardContent,
  TeacherProfile,
  Students,
  ExamTimetable,
  Events,
  TeacherAnnouncements,
  YourAttendance,
  TeacherLeave,
  Homework,
  ClassSchedule,
  StudentResult,
} from './components/TeacherAdmin';
import StudentAttendance from './components/TeacherAdmin/Attendance/StudentAttendance';

// ✅ Newly added imports for Student Layout
import StudentLayout from './components/Students/StudentLayout';
import StudentDashboard from './components/Students/StudentDashboard';
import { StudentAttendance as StudentAttendanceView } from './components/Students/Attendance';
import { StudentHomework } from './components/Students/Homework';
import { StudentTimetable } from './components/Students/Timetable';
import { StudentResults } from './components/Students/Results';
import { StudentEvents } from './components/Students/Events';
import { StudentAnnouncements } from './components/Students/Announcements';
import { StudentExamTimetable } from './components/Students/ExamTimetable';
import { StudentProfile } from './components/Students/Profile';
import { StudentFees } from './components/Students/Fees';
import { StudentLeaves } from './components/Students/Leaves';
import { MasterAdminLogin, MasterAdminDashboard } from './components/MasterAdmin';
import MasterAdminLayout from './components/MasterAdmin/Layout';
import { Schools } from './components/MasterAdmin/Schools';
import SchoolProfile from './components/MasterAdmin/Schools/SchoolProfile';
import SubscriptionRequests from './components/MasterAdmin/Subscriptions/SubscriptionRequests';
import SubscriptionPlans from './components/MasterAdmin/SubscriptionPlans/SubscriptionPlans';
import { VEBooks } from './components/MasterAdmin/VEBooks';
import { MasterAdminQuestionPapers } from './components/MasterAdmin/QuestionPapers';
import { ManageMigration } from './components/MasterAdmin/Migration';
import AcademicYears from './components/MasterAdmin/AcademicYears/AcademicYears';
import PageNotFound from './components/PageNotFound';

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <AuthProvider>
          <TeacherProfileProvider>
            <Routes>
              {/* 🌐 Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* 🔐 Login */}
              <Route path="/login" element={<LoginPage />} />

              {/* 🛡️ Master Admin Login */}
              <Route path="/master-admin" element={<MasterAdminLogin />} />

              {/* 🏫 School Admin Dashboard Routes */}
              <Route
                path="/school-admin/*"
                element={
                  <ProtectedRoute requiredRole="school">
                    <SchoolAdminLayout>
                      <Routes>
                        <Route index element={<SchoolAdminDashboard />} />
                        <Route path="students" element={<SchoolAdminStudents />} />
                        <Route path="teachers" element={<SchoolAdminTeachers />} />
                        <Route path="attendance" element={<SchoolAdminAttendance />} />
                        <Route path="classroom" element={<SchoolAdminClassroom />} />
                        <Route path="exams" element={<SchoolExamTimetable />} />
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
                }
              />

              {/* 👨‍🏫 Teacher Admin Dashboard Routes */}
              <Route
                path="/teacher-admin/*"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherAdminLayout>
                      <Routes>
                        <Route index element={<DashboardContent />} />
                        <Route path="profile" element={<TeacherProfile />} />
                        <Route path="students" element={<Students />} />
                        <Route path="student-attendance" element={<StudentAttendance />} />
                        <Route path="your-attendance" element={<YourAttendance />} />
                        <Route path="student-results" element={<StudentResult />} />
                        <Route path="exam-schedule" element={<ExamTimetable />} />
                        <Route path="events" element={<Events />} />
                        <Route path="homework" element={<Homework />} />
                        <Route path="announcements" element={<TeacherAnnouncements />} />
                        <Route path="leave" element={<TeacherLeave />} />
                        <Route path="class-schedule" element={<ClassSchedule />} />
                      </Routes>
                    </TeacherAdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* 🎓 Student Dashboard Routes */}
              <Route
                path="/student-dashboard/*"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentLayout>
                      <Routes>
                        <Route index element={<StudentDashboard />} />
                        <Route path="attendance" element={<StudentAttendanceView />} />
                        <Route path="homework" element={<StudentHomework />} />
                        <Route path="timetable" element={<StudentTimetable />} />
                        <Route path="results" element={<StudentResults />} />
                        <Route path="events" element={<StudentEvents />} />
                        <Route path="announcements" element={<StudentAnnouncements />} />
                        <Route path="exam-timetable" element={<StudentExamTimetable />} />
                        <Route path="profile" element={<StudentProfile />} />
                        <Route path="fees" element={<StudentFees />} />
                        <Route path="leaves" element={<StudentLeaves />} />
                        {/* Add more student routes below */}
                      </Routes>
                    </StudentLayout>
                  </ProtectedRoute>
                }
              />

              {/* 🛡️ Master Admin Dashboard Routes */}
              <Route
                path="/master-admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="master_admin">
                    <MasterAdminDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Master Admin other routes */}
              <Route
                path="/master-admin/add-schools"
                element={
                  <ProtectedRoute requiredRole="master_admin">
                    <MasterAdminLayout title="Schools Management">
                      <Schools />
                    </MasterAdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/master-admin/schools/:schoolId"
                element={
                  <ProtectedRoute requiredRole="master_admin">
                    <SchoolProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/master-admin/subscription-request"
                element={
                  <ProtectedRoute requiredRole="master_admin">
                    <SubscriptionRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/master-admin/subscription-plans"
                element={
                  <ProtectedRoute requiredRole="master_admin">
                    <SubscriptionPlans />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/master-admin/vedant-books"
                element={
                  <ProtectedRoute requiredRole="master_admin">
                    <MasterAdminLayout title="Vedant Education Books">
                      <VEBooks />
                    </MasterAdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/master-admin/question-papers"
                element={
                  <ProtectedRoute requiredRole="master_admin">
                    <MasterAdminLayout title="Question Papers">
                      <MasterAdminQuestionPapers />
                    </MasterAdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/master-admin/admin-access"
                element={
                  <ProtectedRoute requiredRole="master_admin">
                    <MasterAdminLayout title="Admin Access">
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">Admin Access page coming soon...</p>
                      </div>
                    </MasterAdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/master-admin/migration"
                element={
                  <ProtectedRoute requiredRole="master_admin">
                    <MasterAdminLayout title="Manage Migration">
                      <ManageMigration />
                    </MasterAdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/master-admin/academic-years"
                element={
                  <ProtectedRoute requiredRole="master_admin">
                    <MasterAdminLayout title="Academic Years">
                      <AcademicYears />
                    </MasterAdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* ⚙️ Legacy ERP Dashboard */}
              <Route
                path="/erp/*"
                element={
                  <ProtectedRoute>
                    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
                          <div className="container mx-auto px-6 py-8">{/* ERP content here */}</div>
                        </main>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* 404 - Page Not Found - Catch all unmatched routes */}
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </TeacherProfileProvider>
        </AuthProvider>
      </Router>
    </DarkModeProvider>
  );
}

export default App;
