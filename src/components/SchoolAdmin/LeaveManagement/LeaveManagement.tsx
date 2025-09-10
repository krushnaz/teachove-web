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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl p-6 shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Pending Teacher Leaves</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>12</p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                  <UserCheck className={`w-6 h-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl p-6 shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Approved This Month</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>28</p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                  <Eye className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl p-6 shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Student Leaves Today</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>5</p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                  <Users className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl p-6 shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total This Week</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>45</p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                  <Calendar className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
              </div>
            </div>
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
