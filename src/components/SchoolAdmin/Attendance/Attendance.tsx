import React, { useState } from 'react';
import SchoolAdminLayout from '../Layout';

interface StaffMember {
  id: number;
  name: string;
  designation: string;
  avatar: string;
  status: 'present' | 'absent' | 'not-marked';
}

interface AttendanceData {
  present: number;
  absent: number;
  late: number;
  total: number;
}

const Attendance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('teachers');
  const [selectedReportType, setSelectedReportType] = useState('teachers');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const teachers: StaffMember[] = [
    { id: 1, name: 'Dr. Rajesh Kumar', designation: 'Mathematics Teacher', avatar: 'RK', status: 'present' },
    { id: 2, name: 'Prof. Sunita Sharma', designation: 'English Teacher', avatar: 'SS', status: 'present' },
    { id: 3, name: 'Mr. Amit Patel', designation: 'Science Teacher', avatar: 'AP', status: 'absent' },
    { id: 4, name: 'Ms. Priya Verma', designation: 'History Teacher', avatar: 'PV', status: 'absent' },
    { id: 5, name: 'Dr. Sanjay Singh', designation: 'Computer Science Teacher', avatar: 'SS', status: 'present' },
    { id: 6, name: 'Mrs. Kavita Desai', designation: 'Geography Teacher', avatar: 'KD', status: 'not-marked' },
    { id: 7, name: 'Mr. Ramesh Gupta', designation: 'Physical Education Teacher', avatar: 'RG', status: 'present' },
    { id: 8, name: 'Ms. Anjali Reddy', designation: 'Art & Craft Teacher', avatar: 'AR', status: 'present' }
  ];

  const nonTeachingStaff: StaffMember[] = [
    { id: 1, name: 'Mr. Suresh Kumar', designation: 'Administrative Officer', avatar: 'SK', status: 'present' },
    { id: 2, name: 'Mrs. Geeta Sharma', designation: 'Accountant', avatar: 'GS', status: 'present' },
    { id: 3, name: 'Mr. Rajesh Verma', designation: 'Librarian', avatar: 'RV', status: 'absent' },
    { id: 4, name: 'Ms. Priya Singh', designation: 'Receptionist', avatar: 'PS', status: 'absent' },
    { id: 5, name: 'Mr. Amit Kumar', designation: 'IT Support', avatar: 'AK', status: 'present' },
    { id: 6, name: 'Mrs. Sunita Patel', designation: 'Clerk', avatar: 'SP', status: 'present' },
    { id: 7, name: 'Mr. Ramesh Singh', designation: 'Security Guard', avatar: 'RS', status: 'present' },
    { id: 8, name: 'Ms. Kavita Gupta', designation: 'Cleaner', avatar: 'KG', status: 'not-marked' }
  ];

  const [teachersList, setTeachersList] = useState(teachers);
  const [nonTeachingList, setNonTeachingList] = useState(nonTeachingStaff);

  const handleStatusToggle = (id: number, type: 'teachers' | 'non-teaching') => {
    if (type === 'teachers') {
      setTeachersList(prev => prev.map(teacher => 
        teacher.id === id ? { 
          ...teacher, 
          status: teacher.status === 'present' ? 'absent' : 'present' 
        } : teacher
      ));
    } else {
      setNonTeachingList(prev => prev.map(staff => 
        staff.id === id ? { 
          ...staff, 
          status: staff.status === 'present' ? 'absent' : 'present' 
        } : staff
      ));
    }
  };

  const getAttendanceData = (list: StaffMember[]): AttendanceData => {
    const present = list.filter(item => item.status === 'present').length;
    const absent = list.filter(item => item.status === 'absent').length;
    const total = list.length;
    
    return { present, absent, late: 0, total };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      default:
        return 'Not Marked';
    }
  };

  const renderAttendanceList = (list: StaffMember[], type: 'teachers' | 'non-teaching') => {
    const attendanceData = getAttendanceData(list);
    
    return (
      <div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Present</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{attendanceData.present}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Absent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{attendanceData.absent}</p>
              </div>
            </div>
          </div>
          

          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{attendanceData.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mark Attendance Button */}
        <div className="mb-6">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Mark Attendance
          </button>
        </div>

        {/* Attendance List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SR No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Staff Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {list.map((member, index) => (
                  <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
                          {member.avatar}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{member.designation}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusToggle(member.id, type)}
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 ${getStatusColor(member.status)}`}
                      >
                        <span className="flex items-center">
                          {member.status === 'present' && (
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {member.status === 'absent' && (
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {getStatusText(member.status)}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderReports = () => {
    const teachersData = getAttendanceData(teachersList);
    const nonTeachingData = getAttendanceData(nonTeachingList);
    const selectedData = selectedReportType === 'teachers' ? teachersData : nonTeachingData;
    
    const presentPercentage = selectedData.total > 0 ? (selectedData.present / selectedData.total) * 100 : 0;
    const absentPercentage = selectedData.total > 0 ? (selectedData.absent / selectedData.total) * 100 : 0;

    return (
      <div>
        {/* Report Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Staff Type</label>
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="teachers">Teachers</option>
                <option value="non-teaching">Non-Teaching Staff</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="flex items-end">
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Report
              </button>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart Visualization */}
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray={`${presentPercentage}, 100`}
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeDasharray={`${absentPercentage}, 100`}
                    strokeDashoffset={`-${presentPercentage}`}
                  />

                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedData.total}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Present: {selectedData.present} ({presentPercentage.toFixed(1)}%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Absent: {selectedData.absent} ({absentPercentage.toFixed(1)}%)</span>
              </div>

            </div>
          </div>
        </div>

        {/* Mark Attendance Button */}
        <div className="mb-6">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Mark Attendance
          </button>
        </div>
      </div>
    );
  };

  return (
    <SchoolAdminLayout title="Attendance" subtitle="Manage staff attendance and generate reports">
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('teachers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'teachers'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Teacher Attendance
            </button>
            <button
              onClick={() => setActiveTab('non-teaching')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'non-teaching'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Non-Teaching Staff Attendance
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Reports
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'teachers' && renderAttendanceList(teachersList, 'teachers')}
      {activeTab === 'non-teaching' && renderAttendanceList(nonTeachingList, 'non-teaching')}
      {activeTab === 'reports' && renderReports()}
    </SchoolAdminLayout>
  );
};

export default Attendance; 