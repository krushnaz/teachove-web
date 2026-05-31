import React, { useState } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import TeacherLeaves from './TeacherLeaves';
import StudentLeaves from './StudentLeaves';
import { Calendar, Users, UserCheck, Eye } from 'lucide-react';

const LeaveManagement: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<'teachers' | 'students'>('teachers');

  const tabs = [
    {
      id: 'teachers',
      label: 'Teacher Leaves',
      icon: <UserCheck className="w-5 h-5" />,
      description: 'Manage teacher leave requests'
    },
    {
      id: 'students',
      label: 'Student Leaves',
      icon: <Users className="w-5 h-5" />,
      description: 'View student leave records'
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Add shimmer animation styles */}
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: calc(200px + 100%) 0; }
          }
          .shimmer {
            background: linear-gradient(90deg, 
              transparent, 
              ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}, 
              transparent
            );
            background-size: 200px 100%;
            animation: shimmer 1.5s infinite ease-in-out;
          }
        `}
      </style>

      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-blue-50 border border-blue-200'}`}>
              <Calendar className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Leave Management
              </h1>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Manage teacher and student leave requests
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 sm:gap-6 mb-8">
            {[
              { label: 'Pending Teacher Leaves', value: '12', icon: UserCheck, color: 'yellow', text: 'text-yellow-400', textLight: 'text-yellow-600', bg: 'bg-yellow-900/20', bgLight: 'bg-yellow-50' },
              { label: 'Approved This Month', value: '28', icon: Eye, color: 'green', text: 'text-green-400', textLight: 'text-green-600', bg: 'bg-green-900/20', bgLight: 'bg-green-50' },
              { label: 'Student Leaves Today', value: '5', icon: Users, color: 'blue', text: 'text-blue-400', textLight: 'text-blue-600', bg: 'bg-blue-900/20', bgLight: 'bg-blue-50' },
              { label: 'Total This Week', value: '45', icon: Calendar, color: 'purple', text: 'text-purple-400', textLight: 'text-purple-600', bg: 'bg-purple-900/20', bgLight: 'bg-purple-50' }
            ].map((stat, i) => (
              <div key={i} className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl p-2.5 sm:p-5 shadow-lg flex flex-col justify-between h-full`}>
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <div className={`p-1.5 sm:p-3 rounded-lg ${isDarkMode ? stat.bg : stat.bgLight} ${isDarkMode ? stat.text : stat.textLight} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <div>
                  <p className={`text-base sm:text-2xl font-bold ${isDarkMode ? stat.text : stat.textLight}`}>{stat.value}</p>
                  <p className={`text-[10px] sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-0.5 truncate`}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-lg mb-6`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'teachers' | 'students')}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? isDarkMode
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/10'
                      : 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <div className="text-left">
                  <div>{tab.label}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-lg`}>
          {activeTab === 'teachers' && <TeacherLeaves />}
          {activeTab === 'students' && <StudentLeaves />}
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
