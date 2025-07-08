import React from 'react';

const Dashboard: React.FC = () => {
  const stats = [
    { title: 'Total Students', value: '1,247', change: '+12%', icon: '👨‍🎓', color: 'bg-primary-500' },
    { title: 'Total Teachers', value: '89', change: '+5%', icon: '👨‍🏫', color: 'bg-green-500' },
    { title: 'Attendance Rate', value: '94.2%', change: '+2.1%', icon: '📊', color: 'bg-yellow-500' },
    { title: 'Fee Collection', value: '₹2.4M', change: '+8.3%', icon: '💰', color: 'bg-purple-500' },
  ];

  const recentActivities = [
    { action: 'New student registered', time: '2 minutes ago', type: 'student' },
    { action: 'Fee payment received', time: '5 minutes ago', type: 'payment' },
    { action: 'Exam schedule updated', time: '10 minutes ago', type: 'exam' },
    { action: 'Teacher attendance marked', time: '15 minutes ago', type: 'attendance' },
    { action: 'New teacher joined', time: '1 hour ago', type: 'teacher' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your school management dashboard</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Generate Report
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Export Data
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Today's Attendance</span>
              <span className="text-sm font-medium text-gray-900">94.2%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">1,172</p>
                <p className="text-xs text-gray-500">Present</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">75</p>
                <p className="text-xs text-gray-500">Absent</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">12</p>
                <p className="text-xs text-gray-500">Late</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <div className="text-2xl mb-2">👨‍🎓</div>
            <p className="text-sm font-medium text-gray-700">Add Student</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <div className="text-2xl mb-2">👨‍🏫</div>
            <p className="text-sm font-medium text-gray-700">Add Teacher</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <div className="text-2xl mb-2">📝</div>
            <p className="text-sm font-medium text-gray-700">Mark Attendance</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <div className="text-2xl mb-2">💰</div>
            <p className="text-sm font-medium text-gray-700">Collect Fees</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 