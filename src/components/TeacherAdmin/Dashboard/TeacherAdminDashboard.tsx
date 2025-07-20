import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';

const TeacherAdminDashboard: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const stats = [
    { title: 'My Students', value: '45', change: '+3', icon: '👨‍🎓', color: 'bg-primary-500' },
    { title: 'Classes Today', value: '4', change: '2 completed', icon: '📚', color: 'bg-green-500' },
    { title: 'Homework Pending', value: '12', change: 'Due today', icon: '📝', color: 'bg-yellow-500' },
    { title: 'Attendance Rate', value: '96.8%', change: '+1.2%', icon: '📊', color: 'bg-purple-500' },
  ];

  const quickActions = [
    { title: 'Mark Attendance', icon: '📝', color: 'bg-blue-500', link: '/teacher-admin/attendance' },
    { title: 'Assign Homework', icon: '📚', color: 'bg-green-500', link: '/teacher-admin/homework' },
    { title: 'Grade Assignments', icon: '📊', color: 'bg-yellow-500', link: '/teacher-admin/grades' },
    { title: 'View Schedule', icon: '📅', color: 'bg-purple-500', link: '/teacher-admin/schedule' },
    { title: 'Student Reports', icon: '📈', color: 'bg-red-500', link: '/teacher-admin/reports' },
    { title: 'Send Message', icon: '💬', color: 'bg-indigo-500', link: '/teacher-admin/messages' },
  ];

  const recentActivities = [
    { action: 'Marked attendance for Class 10A', time: '2 minutes ago', type: 'attendance', icon: '📝' },
    { action: 'Assigned homework to Class 9B', time: '15 minutes ago', type: 'homework', icon: '📚' },
    { action: 'Graded Science test papers', time: '1 hour ago', type: 'grading', icon: '📊' },
    { action: 'Updated student progress report', time: '2 hours ago', type: 'report', icon: '📈' },
    { action: 'Scheduled parent meeting', time: '3 hours ago', type: 'meeting', icon: '📅' },
  ];

  const todaySchedule = [
    { time: '8:00 AM', subject: 'Mathematics', class: 'Class 10A', room: 'Room 101' },
    { time: '9:30 AM', subject: 'Science', class: 'Class 9B', room: 'Room 102' },
    { time: '11:00 AM', subject: 'English', class: 'Class 10B', room: 'Room 103' },
    { time: '2:00 PM', subject: 'Mathematics', class: 'Class 9A', room: 'Room 101' },
  ];

  const menuItems = [
    { path: '/teacher-admin', label: 'Dashboard', icon: '📊' },
    { path: '/teacher-admin/students', label: 'My Students', icon: '👨‍🎓' },
    { path: '/teacher-admin/attendance', label: 'Attendance', icon: '📝' },
    { path: '/teacher-admin/homework', label: 'Homework', icon: '📚' },
    { path: '/teacher-admin/grades', label: 'Grades', icon: '📊' },
    { path: '/teacher-admin/schedule', label: 'Schedule', icon: '📅' },
    { path: '/teacher-admin/reports', label: 'Reports', icon: '📈' },
    { path: '/teacher-admin/messages', label: 'Messages', icon: '💬' },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile Header */}
      <div className={`lg:hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              ☰
            </button>
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-primary-500'}`}>Teacher Admin</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'}`}
              title="Logout"
            >
              🚪
            </button>
            <Link to="/" className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
              🏠
            </Link>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out`}>
          <div className={`h-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r shadow-lg`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-primary-500'}`}>Teacher Admin</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            
            <nav className="mt-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 transition-colors ${
                    window.location.pathname === item.path 
                      ? `${isDarkMode ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-600'} border-r-2 border-primary-600` 
                      : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'}`
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Desktop Header */}
          <div className={`hidden lg:block ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h2>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Welcome back, Teacher</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
                
                {/* Profile */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.email?.charAt(0).toUpperCase() || 'T'}
                    </div>
                    <span className={`hidden md:block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {user?.email || 'Teacher'}
                    </span>
                  </button>
                  
                  {showProfile && (
                    <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {user?.email || 'Teacher'}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email || 'teacher@school.com'}</p>
                      </div>
                      <div className="p-2">
                        <button className={`w-full text-left px-2 py-1 text-sm rounded transition-colors ${
                          isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}>
                          Profile Settings
                        </button>
                        <button 
                          onClick={handleLogout}
                          className={`w-full text-left px-2 py-1 text-sm rounded transition-colors ${
                            isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-4 lg:p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{stat.title}</p>
                      <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                      <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-2">
                <div className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                      <Link
                        key={index}
                        to={action.link}
                        className={`p-4 rounded-lg border transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                      >
                        <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white text-lg mb-3`}>
                          {action.icon}
                        </div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{action.title}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activities</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="text-lg">{activity.icon}</div>
                      <div className="flex-1">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{activity.action}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="mt-8">
              <div className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Today's Schedule</h3>
                <div className="space-y-3">
                  {todaySchedule.map((classItem, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                          index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                        }`}>
                          {classItem.time.split(':')[0]}
                        </div>
                        <div>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{classItem.subject}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{classItem.class} • {classItem.room}</p>
                        </div>
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {classItem.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Student Performance */}
            <div className="mt-8">
              <div className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Student Performance Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Average Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">42</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Students Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">8</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Assignments Due</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Class Performance</span>
                    <span className="text-sm font-medium text-green-600">Excellent</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default TeacherAdminDashboard; 