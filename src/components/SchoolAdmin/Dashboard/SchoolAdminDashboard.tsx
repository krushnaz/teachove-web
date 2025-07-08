import React from 'react';
import { Link } from 'react-router-dom';
import SchoolAdminLayout from '../Layout';

const SchoolAdminDashboard: React.FC = () => {
  const stats = [
    { title: 'Total Students', value: '1,247', change: '+12%', icon: '👨‍🎓', color: 'bg-primary-500' },
    { title: 'Total Teachers', value: '89', change: '+5%', icon: '👨‍🏫', color: 'bg-green-500' },
    { title: 'Attendance Rate', value: '94.2%', change: '+2.1%', icon: '📊', color: 'bg-yellow-500' },
    { title: 'Fee Collection', value: '₹2.4M', change: '+8.3%', icon: '💰', color: 'bg-purple-500' },
  ];

  const quickActions = [
    { title: 'Add Student', icon: '👨‍🎓', color: 'bg-blue-500', link: '/school-admin/students/add' },
    { title: 'Add Teacher', icon: '👨‍🏫', color: 'bg-green-500', link: '/school-admin/teachers/add' },
    { title: 'Mark Attendance', icon: '📝', color: 'bg-yellow-500', link: '/school-admin/attendance' },
    { title: 'Collect Fees', icon: '💰', color: 'bg-purple-500', link: '/school-admin/fees' },
    { title: 'Create Announcement', icon: '📢', color: 'bg-red-500', link: '/school-admin/announcements' },
    { title: 'Schedule Exam', icon: '📚', color: 'bg-indigo-500', link: '/school-admin/exams' },
  ];

  const recentActivities = [
    { action: 'New student registered', time: '2 minutes ago', type: 'student', icon: '👨‍🎓' },
    { action: 'Fee payment received', time: '5 minutes ago', type: 'payment', icon: '💰' },
    { action: 'Exam schedule updated', time: '10 minutes ago', type: 'exam', icon: '📚' },
    { action: 'Teacher attendance marked', time: '15 minutes ago', type: 'attendance', icon: '📝' },
    { action: 'New teacher joined', time: '1 hour ago', type: 'teacher', icon: '👨‍🏫' },
  ];

  return (
    <SchoolAdminLayout title="Dashboard" subtitle="Welcome back, School Administrator">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-lg shadow-sm border p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</p>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
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
          <div className="rounded-lg shadow-sm border p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="p-4 rounded-lg border transition-colors border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white text-lg mb-3`}>
                    {action.icon}
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{action.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="rounded-lg shadow-sm border p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="text-lg">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Overview */}
      <div className="mt-8">
        <div className="rounded-lg shadow-sm border p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Today's Attendance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">1,172</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Present</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">75</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Absent</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">12</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Late</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Overall Attendance Rate</span>
              <span className="text-sm font-medium text-green-600">94.2%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </SchoolAdminLayout>
  );
};

export default SchoolAdminDashboard; 