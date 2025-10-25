// src/components/Students/StudentDashboard.tsx
import React from 'react';
import { useDarkMode } from "../../contexts/DarkModeContext";
import { useAuth } from "../../contexts/AuthContext";

const StudentDashboard = () => {
  const { isDarkMode } = useDarkMode();
  const { user, schoolDetails, classDetails, classTeacher } = useAuth();

  const stats = [
    { title: "Total Classes", value: "8", color: "#22c55e", bgColor: "bg-green-500/10", textColor: "text-green-500" },
    { title: "Assignments Due", value: "3", color: "#f59e0b", bgColor: "bg-amber-500/10", textColor: "text-amber-500" },
    { title: "Attendance", value: "92%", color: "#3b82f6", bgColor: "bg-blue-500/10", textColor: "text-blue-500" },
    { title: "Rank", value: "5th", color: "#a855f7", bgColor: "bg-purple-500/10", textColor: "text-purple-500" },
  ];

  const quickActions = [
    { label: "View Timetable", Icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ) },
    { label: "Assignments", Icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ) },
    { label: "Results", Icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ) },
    { label: "Study Material", Icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ) },
  ];

  const upcomingClasses = [
    { subject: "Mathematics", time: "10:00 AM - 10:45 AM", room: "Room 204", teacher: "Mr. Sharma" },
    { subject: "Science", time: "11:30 AM - 12:15 PM", room: "Lab 2", teacher: "Ms. Kapoor" },
    { subject: "English", time: "2:00 PM - 2:45 PM", room: "Room 107", teacher: "Mrs. Iyer" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Box */}
      <div className={`rounded-xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {/* Student & Class (Left) vs School Summary (Right) */}
          <div className="flex items-start justify-between gap-6 w-full">
            {/* Left: Avatar + student details */}
            <div className="min-w-0 flex items-start gap-4">
              {user?.profilePic ? (
                <img 
                  src={user.profilePic} 
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover shadow border border-white/20"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xl shadow border border-white/20">
                  {(user?.name || 'S').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
              <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Welcome back, {user?.name || 'Student'} 👋
              </h1>
              <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Here's a quick snapshot of your studies today.
              </p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {classDetails && (
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-blue-500/15 text-blue-300' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6l-8 4 8 4 8-4-8-4z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 10v6l8 4 8-4v-6" />
                    </svg>
                    Class {classDetails.className} - {classDetails.section}
                  </span>
                )}
                {classTeacher && (
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-green-500/15 text-green-300' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A3 3 0 017.879 16h8.242a3 3 0 012.758 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Teacher: {classTeacher}
                  </span>
                )}
                {user?.rollNo && (
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-purple-500/15 text-purple-300' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 10h12M6 14h8" />
                    </svg>
                    Roll No: {user.rollNo}
                  </span>
                )}
                {user?.phoneNo && (
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-orange-500/15 text-orange-300' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h1l2 4-2 1a12 12 0 006 6l1-2 4 2v1a2 2 0 01-2 2h-1C8.716 19 3 13.284 3 6V5z" />
                    </svg>
                    {user.phoneNo}
                  </span>
                )}
              </div>
              </div>
            </div>
            {/* Right: School summary */}
            {schoolDetails && (
              <div className="flex items-start gap-4 ml-auto">
                {schoolDetails.logo && (
                  <img 
                    src={schoolDetails.logo} 
                    alt={schoolDetails.schoolName}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 shadow-sm"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="text-right">
                  <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{schoolDetails.schoolName}</div>
                  <div className="flex items-center gap-2 justify-end text-sm">
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{schoolDetails.type} School</span>
                    <span className={`${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{schoolDetails.city}, {schoolDetails.state}</span>
                  </div>
                  <div className="mt-1 flex items-start gap-2 text-sm justify-end">
                    <svg className={`w-4 h-4 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.5-7.5 10.5-7.5 10.5S4.5 18 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{schoolDetails.address?.line1}, {schoolDetails.city}, {schoolDetails.state} - {schoolDetails.pincode}</span>
                  </div>
                  {schoolDetails.phoneNo && (
                    <div className="mt-1 flex items-start gap-2 text-sm justify-end">
                      <svg className={`w-4 h-4 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h1l2 4-2 1a12 12 0 006 6l1-2 4 2v1a2 2 0 01-2 2h-1C8.716 19 3 13.284 3 6V5z" />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{schoolDetails.phoneNo}</span>
                    </div>
                  )}
                  <div className="mt-2 flex justify-end">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-200 text-gray-700'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="text-sm font-medium">{schoolDetails.currentAcademicYear}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <div className={`w-6 h-6 ${stat.textColor}`}>
                  {stat.title === "Total Classes" && (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  )}
                  {stat.title === "Assignments Due" && (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  )}
                  {stat.title === "Attendance" && (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {stat.title === "Rank" && (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.title}
                </p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Quick actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ label, Icon }) => (
            <button
              key={label}
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'} border rounded-xl p-4 flex items-center space-x-3 transition-all hover:shadow-md`}
            >
              <Icon />
              <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Classes */}
      <div>
        <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Upcoming classes
        </h2>
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl overflow-hidden shadow-sm`}>
          {upcomingClasses.map((cls, index) => (
            <div
              key={cls.subject}
              className={`p-4 flex items-center justify-between ${index !== upcomingClasses.length - 1 ? (isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200') : ''} ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'} flex items-center justify-center`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {cls.subject}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {cls.teacher} • {cls.room}
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-lg ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-blue-50 border border-blue-200'}`}>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {cls.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
