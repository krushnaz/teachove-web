import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { schoolService } from '../../../services';
import { GraduationCap, Calendar, Megaphone, Presentation } from 'lucide-react';

const DUMMY_EVENTS = [
  { title: 'Annual Sports Day', date: '2024-06-20', description: 'A day full of sports and fun activities.' },
  { title: 'Science Exhibition', date: '2024-06-25', description: 'Showcase of science projects by students.' },
];
const DUMMY_ANNOUNCEMENTS = [
  { title: 'Summer Vacation', date: '2024-06-15', description: 'School will remain closed from June 15 to July 1.' },
  { title: 'PTA Meeting', date: '2024-06-18', description: 'Parent-Teacher meeting at 10:00 AM in the auditorium.' },
];

const SchoolAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'announcements'>('events');

  useEffect(() => {
    const fetchDetails = async () => {
      if (!user?.schoolId) return;
      setLoading(true);
      try {
        const data = await schoolService.getSchoolDetails(user.schoolId);
        setSchool(data);
      } catch (e) {
        setSchool(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [user?.schoolId]);

  if (loading) {
    return (
      <div>
        {/* Shimmer for Welcome Header */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-5 w-1/3 bg-gray-100 dark:bg-gray-800 rounded"></div>
        </div>
        {/* Shimmer for Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="rounded-lg shadow-sm border p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex items-center">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mr-4"></div>
              <div className="flex-1">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
        {/* Shimmer for Tabs */}
        <div className="mb-8 animate-pulse">
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded mr-4"></div>
            <div className="h-8 w-32 bg-gray-100 dark:bg-gray-800 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 p-4 shadow-sm flex flex-col">
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 w-1/3 bg-gray-100 dark:bg-gray-800 rounded mb-1"></div>
                <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        {/* Shimmer for Quick Actions and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
          <div className="lg:col-span-2">
            <div className="rounded-lg shadow-sm border p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-lg shadow-sm border p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="flex-1">
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                    <div className="h-2 w-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Shimmer for Attendance Overview */}
        <div className="mt-8 animate-pulse">
          <div className="rounded-lg shadow-sm border p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="text-center">
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2"></div>
                  <div className="h-3 w-12 bg-gray-100 dark:bg-gray-800 rounded mx-auto"></div>
                </div>
              ))}
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome{school?.school?.schoolName ? `, ${school.school.schoolName}` : ''}!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">Here's an overview of your school dashboard.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-lg shadow-sm border p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex items-center">
          <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center text-white text-2xl mr-4">
            <GraduationCap />
          </div>
              <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Students</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{school?.studentCount ?? '--'}</p>
          </div>
        </div>
        <div className="rounded-lg shadow-sm border p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex items-center">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-2xl mr-4">
            <Presentation />
              </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Teachers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{school?.teacherCount ?? '--'}</p>
              </div>
            </div>
      </div>

      {/* Tabs for Events and Announcements */}
      <div className="mb-8">
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
          <button
            className={`flex items-center px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-200 ${activeTab === 'events' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-gray-900' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            onClick={() => setActiveTab('events')}
          >
            <Calendar className="mr-2" /> Upcoming Events
          </button>
          <button
            className={`flex items-center ml-6 px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-200 ${activeTab === 'announcements' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-gray-900' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            onClick={() => setActiveTab('announcements')}
          >
            <Megaphone className="mr-2" /> Announcements
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {activeTab === 'events' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {DUMMY_EVENTS.map((event, idx) => (
                <div key={idx} className="rounded-lg border border-primary-100 dark:border-primary-900 bg-primary-50 dark:bg-gray-900 p-4 shadow-sm flex flex-col">
                  <div className="flex items-center mb-2">
                    <Calendar className="text-primary-600 dark:text-primary-400 mr-2 text-xl" />
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{event.title}</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">{event.date}</div>
                  <div className="text-gray-700 dark:text-gray-200">{event.description}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {DUMMY_ANNOUNCEMENTS.map((announcement, idx) => (
                <div key={idx} className="rounded-lg border border-primary-100 dark:border-primary-900 bg-primary-50 dark:bg-gray-900 p-4 shadow-sm flex flex-col">
                  <div className="flex items-center mb-2">
                    <Megaphone className="text-primary-600 dark:text-primary-400 mr-2 text-xl" />
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{announcement.title}</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">{announcement.date}</div>
                  <div className="text-gray-700 dark:text-gray-200">{announcement.description}</div>
          </div>
        ))}
            </div>
          )}
        </div>
      </div>

      {/* Other Dashboard Details (Quick Actions, Activities, Attendance) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="rounded-lg shadow-sm border p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link
                to="/school-admin/students/add"
                className="p-4 rounded-lg border transition-colors border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg mb-3"><GraduationCap /></div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Add Student</p>
              </Link>
              <Link
                to="/school-admin/teachers/add"
                className="p-4 rounded-lg border transition-colors border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white text-lg mb-3"><Presentation /></div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Add Teacher</p>
              </Link>
              <Link
                to="/school-admin/attendance"
                className="p-4 rounded-lg border transition-colors border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-lg mb-3">📝</div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Mark Attendance</p>
              </Link>
              <Link
                to="/school-admin/fees"
                className="p-4 rounded-lg border transition-colors border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white text-lg mb-3">💰</div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Collect Fees</p>
              </Link>
              <Link
                to="/school-admin/announcements"
                className="p-4 rounded-lg border transition-colors border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white text-lg mb-3"><Megaphone /></div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Create Announcement</p>
              </Link>
                <Link
                to="/school-admin/exams"
                  className="p-4 rounded-lg border transition-colors border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-lg mb-3"><Calendar /></div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Schedule Exam</p>
                </Link>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="rounded-lg shadow-sm border p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activities</h3>
          <div className="space-y-4">
            {/* Dummy activities for now */}
            <div className="flex items-start space-x-3">
              <div className="text-lg"><GraduationCap /></div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-200">New student registered</p>
                <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-lg">💰</div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-200">Fee payment received</p>
                <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-lg"><Calendar /></div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-200">Exam schedule updated</p>
                <p className="text-xs text-gray-500 mt-1">10 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-lg">📝</div>
                <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-200">Teacher attendance marked</p>
                <p className="text-xs text-gray-500 mt-1">15 minutes ago</p>
              </div>
                </div>
            <div className="flex items-start space-x-3">
              <div className="text-lg"><Presentation /></div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-200">New teacher joined</p>
                <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
              </div>
            </div>
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
    </div>
  );
};

export default SchoolAdminDashboard; 