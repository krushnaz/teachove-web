import React from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../../contexts/DarkModeContext';

const LandingPage: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const schoolAdminFeatures = [
    'Manage teacher records: add, edit, delete',
    'Maintain student and non-teaching staff records',
    'Academics management: classes, subjects, exam timetables',
    'Announcements and notices to teachers, students, or specific classes',
    'Attendance management for teachers and non-teaching staff with reports and summaries',
    'Student fees management with options to add, edit, delete and generate reports',
    'Event management',
    'Approve and track teacher leave requests',
    'Access Vedant Education books'
  ];

  const teacherAdminFeatures = [
    'Manage student records',
    'Mark and view student attendance',
    'Manage student results',
    'Homework management',
    'View class and exam schedules',
    'Access event details',
    'View own attendance records',
    'Apply for leave and manage student leave requests',
    'View announcements and notices'
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navigation */}
      <nav className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-primary-500'}`}>
                VedanTech
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <Link to="/login" className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Complete School
            <span className="text-primary-500 block">Management System</span>
          </h1>
          <p className={`text-xl md:text-2xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
            Streamline your educational institution with our comprehensive ERP solutions. 
            Manage students, teachers, attendance, fees, and more with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="bg-primary-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-600 transition-colors">
              Try TeachoVE
            </Link>
            <Link to="/login" className="border-2 border-primary-500 text-primary-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-500 hover:text-white transition-colors">
              Try StudoVE
            </Link>
          </div>
        </div>
      </section>

      {/* Apps Showcase */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-4xl font-bold text-center mb-16 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Our Applications
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* TeachoVE */}
            <div className={`rounded-2xl p-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-lg`}>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  T
                </div>
                <h3 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  TeachoVE
                </h3>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  School Administration & Teacher Management
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  School Admin Features:
                </h4>
                <ul className="space-y-3">
                  {schoolAdminFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-primary-500 text-lg">✓</span>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* StudoVE */}
            <div className={`rounded-2xl p-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-lg`}>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  S
                </div>
                <h3 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  StudoVE
                </h3>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Student Portal & Learning Management
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Teacher Admin Features:
                </h4>
                <ul className="space-y-3">
                  {teacherAdminFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-green-500 text-lg">✓</span>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-4xl font-bold text-center mb-16 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Key Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '👨‍🏫', title: 'Teacher Management', desc: 'Complete teacher records and performance tracking' },
              { icon: '👨‍🎓', title: 'Student Records', desc: 'Comprehensive student information management' },
              { icon: '📊', title: 'Attendance Tracking', desc: 'Automated attendance with detailed reports' },
              { icon: '💰', title: 'Fee Management', desc: 'Streamlined fee collection and tracking' },
              { icon: '📚', title: 'Academic Management', desc: 'Classes, subjects, and exam timetables' },
              { icon: '📢', title: 'Announcements', desc: 'Real-time communication with staff and students' },
              { icon: '📅', title: 'Event Management', desc: 'Organize and track school events' },
              { icon: '📝', title: 'Leave Management', desc: 'Approve and track leave requests' },
              { icon: '📖', title: 'Digital Library', desc: 'Access to Vedant Education books' }
            ].map((feature, index) => (
              <div key={index} className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-lg hover:shadow-xl transition-shadow`}>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Ready to Transform Your School?
          </h2>
          <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Join thousands of schools already using our comprehensive management system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="bg-primary-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-600 transition-colors">
              Start Free Trial
            </Link>
            <button className={`border-2 border-primary-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-500 hover:text-white transition-colors ${isDarkMode ? 'text-white border-white' : 'text-primary-500'}`}>
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} border-t`}>
        <div className="max-w-7xl mx-auto text-center">
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            VedanTech
          </h3>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            © 2024 VedanTech. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 