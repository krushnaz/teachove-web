import React, { useState } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { 
  Settings, 
  Key, 
  GraduationCap, 
  Shield, 
  Bell, 
  Database, 
  Users, 
  Mail,
  CheckCircle
} from 'lucide-react';
import ResetPasswordModal from './ResetPasswordModal';
import StudentPromotionModal from './StudentPromotionModal';

const SchoolSettings: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showStudentPromotion, setShowStudentPromotion] = useState(false);

  const settingsCategories = [
    {
      id: 'security',
      title: 'Security & Access',
      description: 'Manage passwords, permissions, and security settings',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-red-500 to-pink-600',
      items: [
        {
          id: 'reset-password',
          title: 'Reset Password',
          description: 'Change your account password securely',
          icon: <Key className="w-5 h-5" />,
          action: () => setShowResetPassword(true)
        }
      ]
    },
    {
      id: 'academic',
      title: 'Academic Management',
      description: 'Control academic year, promotions, and student management',
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-600',
      items: [
        {
          id: 'student-promotion',
          title: 'Student Promotion',
          description: 'Promote students to next academic year',
          icon: <Users className="w-5 h-5" />,
          action: () => setShowStudentPromotion(true)
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure email and system notifications',
      icon: <Bell className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-600',
      items: [
        {
          id: 'email-notifications',
          title: 'Email Notifications',
          description: 'Manage email notification preferences',
          icon: <Mail className="w-5 h-5" />,
          action: () => console.log('Email notifications')
        }
      ]
    },
    {
      id: 'data',
      title: 'Data Management',
      description: 'Backup, export, and manage school data',
      icon: <Database className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-600',
      items: [
        {
          id: 'data-backup',
          title: 'Data Backup',
          description: 'Create and manage data backups',
          icon: <Database className="w-5 h-5" />,
          action: () => console.log('Data backup')
        }
      ]
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
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-purple-900/20 border border-purple-700/30' : 'bg-purple-50 border border-purple-200'}`}>
              <Settings className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                School Settings
              </h1>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Manage your school's configuration and preferences
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl p-6 shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Security Status</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Active</p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                  <Shield className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl p-6 shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Last Backup</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>2 days ago</p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                  <Database className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl p-6 shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Notifications</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>Enabled</p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                  <Bell className={`w-6 h-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl p-6 shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>System Status</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Healthy</p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                  <CheckCircle className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Categories */}
        <div className="space-y-8">
          {settingsCategories.map((category) => (
            <div key={category.id} className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-lg`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} text-white`}>
                    {category.icon}
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {category.title}
                    </h2>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={item.action}
                      className={`p-6 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                        isDarkMode 
                          ? 'bg-gray-700/50 border-gray-600 hover:border-gray-500' 
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                            {item.title}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.description}
                          </p>
                        </div>
                        <div className={`text-gray-400`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <ResetPasswordModal 
        isOpen={showResetPassword} 
        onClose={() => setShowResetPassword(false)} 
      />
      <StudentPromotionModal 
        isOpen={showStudentPromotion} 
        onClose={() => setShowStudentPromotion(false)} 
      />
    </div>
  );
};

export default SchoolSettings;
