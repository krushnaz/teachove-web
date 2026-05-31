import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { API_CONFIG } from '../../../config/api';
import { apiHelper } from '../../../utils/apiHelper';
import { ArrowLeft, User, Calendar as CalendarIcon, FileText, Award, CreditCard, Mail, Phone, MapPin, Building, CalendarDays, ExternalLink, ChevronRight, GraduationCap } from 'lucide-react';
import { Student } from '../../../models';
import { toast } from 'react-toastify';
import { useDarkMode } from '../../../contexts/DarkModeContext';

interface TabListProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabList: React.FC<TabListProps & { isDarkMode: boolean }> = ({ activeTab, setActiveTab, isDarkMode }) => {
  const tabs = [
    { id: 'profile', label: 'Basic Info', icon: User },
    { id: 'attendance', label: 'Attendance', icon: CalendarIcon },
    { id: 'leaves', label: 'Leaves', icon: FileText },
    { id: 'results', label: 'Results', icon: Award },
    { id: 'fees', label: 'Fees', icon: CreditCard },
  ];

  return (
    <div className={`flex w-full overflow-x-auto no-scrollbar border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      <div className="flex px-4 sm:px-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap transition-all relative ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const StudentProfileView: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState('profile');
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user?.schoolId || !studentId) return;

      try {
        setLoading(true);

        // Fetch Profile
        const profileEndpoint = API_CONFIG.ENDPOINTS.STUDENTS.GET_WITH_CLASS.replace(':studentId', studentId);
        try {
          const profileData = await apiHelper.get(profileEndpoint);
          setStudent(profileData.student);
        } catch (e) { console.error("Profile fetch error", e); }

        // Fetch Attendance (limit 1 year/month)
        const attEndpoint = API_CONFIG.ENDPOINTS.STUDENT_ATTENDANCE.GET_BY_STUDENT_MONTH
          .replace(':schoolId', user.schoolId)
          .replace(':studentId', studentId) + '?month=' + (new Date().getMonth() + 1) + '&year=' + new Date().getFullYear();
        try {
          const attData = await apiHelper.get(attEndpoint);
          setAttendance(attData.attendance || []);
        } catch (e) { console.error("Attendance fetch error", e); }

        // Fetch Leaves
        const leaveEndpoint = API_CONFIG.ENDPOINTS.STUDENT_LEAVES.GET_BY_STUDENT
          .replace(':schoolId', user.schoolId)
          .replace(':studentId', studentId);
        try {
          const leaveData = await apiHelper.get(leaveEndpoint);
          setLeaves(leaveData.leaves || []);
        } catch (e) { console.error("Leaves fetch error", e); }

        // Fetch Results
        const resultEndpoint = API_CONFIG.ENDPOINTS.STUDENT_RESULTS.GET_ALL_BY_STUDENT
          .replace(':schoolId', user.schoolId)
          .replace(':studentId', studentId);
        try {
          const resultData = await apiHelper.get(resultEndpoint);
          setResults(resultData || []);
        } catch (e) { console.error("Results fetch error", e); }

        // Fetch Fees
        const feeEndpoint = API_CONFIG.ENDPOINTS.STUDENT_PAYMENTS.GET_STUDENT_PAYMENTS
          .replace(':schoolId', user.schoolId)
          .replace(':studentId', studentId);
        try {
          const feeData = await apiHelper.get(feeEndpoint);
          setFees(feeData.payments || (Array.isArray(feeData) ? feeData : []));
        } catch (e) { console.error("Fees fetch error", e); }

      } catch (error) {
        console.error('Failed to fetch student details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user?.schoolId, studentId]);

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-[#F8FAFC]'} p-0 sm:p-2 lg:p-4 transition-colors duration-200 animate-pulse`}>
         <div className="w-full mx-auto space-y-4 sm:space-y-6">
           <div className={`h-40 rounded-none sm:rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b sm:border border-gray-200 dark:border-gray-800`} />
           <div className={`h-12 w-full rounded-none sm:rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} />
           <div className={`h-80 rounded-none sm:rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b sm:border border-gray-200 dark:border-gray-800`} />
         </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#F8FAFC] text-gray-900'}`}>
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-sm w-full mx-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">Student Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The requested student profile could not be located in our records.</p>
          <button 
            onClick={() => navigate(-1)} 
            className="w-full py-2.5 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F8FAFC] text-gray-900'} transition-colors duration-200`}>
      <div className="w-full mx-auto p-0 sm:p-2 lg:p-4 space-y-4 sm:space-y-6">
        
        {/* Breadcrumbs & Actions */}
        <div className="flex justify-between items-center px-4 sm:px-0">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${
              isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-indigo-600'
            }`}
          >
            <ArrowLeft size={18} />
            <span>Back to Directory</span>
          </button>
          <div className="flex gap-2">
            <button
               onClick={() => toast.info("Exporting profile...")}
               className={`p-2 rounded-md border transition-colors ${
                 isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white' : 'bg-white border-gray-200 text-gray-500 hover:text-indigo-600'
               }`}
               title="Export PDF"
            >
              <ExternalLink size={18} />
            </button>
          </div>
        </div>

        {/* Main Profile Header Card */}
        <div className={`rounded-none sm:rounded-md border-b sm:border p-6 sm:p-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm relative overflow-hidden`}>
          <div className="relative z-10 flex flex-col md:flex-row gap-6 sm:gap-10 items-start">
            <div className="relative">
              {student.profilePic ? (
                <img 
                  src={student.profilePic} 
                  alt={student.name} 
                  className="h-28 w-28 sm:h-36 sm:w-36 rounded-md object-cover border-4 border-white dark:border-gray-900 shadow-md" 
                />
              ) : (
                <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-4xl font-black border-4 border-white dark:border-gray-900 shadow-md">
                  {student.name?.charAt(0).toUpperCase() || 'S'}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 p-1.5 bg-indigo-600 text-white rounded shadow-lg border-2 border-white dark:border-gray-800">
                <GraduationCap size={16} />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {student.name}
                  </h1>
                  <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-black uppercase tracking-widest border ${
                    student.status === 'alumni' 
                      ? 'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-400' 
                      : 'bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400'
                  }`}>
                    {student.status === 'alumni' ? 'Alumni' : 'Active'}
                  </span>
                </div>
                <p className={`text-sm sm:text-lg font-medium opacity-70 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Student ID: {student.studentId?.slice(-6).toUpperCase() || 'N/A'} • Admission ID: {student.admissionYear || 'N/A'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8 pt-2">
                {[
                  { icon: Mail, value: student.email || 'N/A', label: 'Email' },
                  { icon: Phone, value: student.phoneNo || 'N/A', label: 'Phone' },
                  { icon: Building, value: student.className ? `${student.className} ${student.section || ''}` : student.classId || 'N/A', label: 'Class' },
                  { icon: User, value: `Roll No: ${student.rollNo || 'N/A'}`, label: 'Identity' },
                  { icon: CalendarDays, value: `Joined: ${student.admissionYear || 'N/A'}`, label: 'Year' },
                  { icon: MapPin, value: student.address || student.permanentAddress || 'N/A', label: 'Location' },
                ].map((item, id) => (
                  <div key={id} className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                      <item.icon size={14} />
                    </div>
                    <span className="text-sm font-semibold truncate" title={item.value}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab System */}
        <div className={`rounded-none sm:rounded-md border-b sm:border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <TabList activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} />
          
          <div className="p-6 sm:p-8">
            {activeTab === 'profile' && (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center gap-2 mb-6 text-indigo-600 dark:text-indigo-400">
                  <User size={20} className="font-bold" />
                  <h3 className="text-lg font-bold uppercase tracking-widest text-gray-900 dark:text-white">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Father's Information</p>
                      <div className={`p-4 rounded-md border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{student.fatherName || 'Not mentioned'}</p>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                          <Phone size={14} /> {student.fatherPhoneNo || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Mother's Information</p>
                      <div className={`p-4 rounded-md border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{student.motherName || 'Not mentioned'}</p>
                        <p className="text-sm text-gray-500 mt-1">Primary Guardian</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Personal Details</p>
                      <div className={`p-4 rounded-md border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'} space-y-4`}>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Date of Birth</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{student.dob || student.dateOfBirth || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-800">
                          <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Gender</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white uppercase">{student.gender || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-800">
                          <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Blood Group</span>
                          <span className="text-sm font-bold text-red-600 dark:text-red-400">{student.bloodGroup || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {student.classHistory && student.classHistory.length > 0 && (
                  <div className="mt-12">
                    <div className="flex items-center gap-2 mb-6">
                      <Award size={20} className="text-amber-500" />
                      <h3 className="text-lg font-bold uppercase tracking-widest text-gray-900 dark:text-white">Academic Journey</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {student.classHistory.map((history: any, idx: number) => (
                        <div key={idx} className={`p-4 rounded-md border flex items-center justify-between group transition-all hover:border-indigo-500 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black">
                              {history.academicYear?.split('-')[0]?.slice(-2) || '00'}
                            </div>
                            <div>
                              <p className="font-black text-gray-900 dark:text-white">Grade {history.class || history.classId}</p>
                              <p className="text-xs text-gray-500">{history.academicYear}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="animate-in slide-in-from-bottom-2 duration-400">
                 <div className="flex items-center justify-between mb-8">
                   <h3 className="text-lg font-bold uppercase tracking-widest text-gray-900 dark:text-white">Monthly Attendance</h3>
                   <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                     <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present</div>
                     <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Absent</div>
                   </div>
                 </div>
                 
                {attendance.length === 0 ? (
                  <div className={`text-center py-20 rounded-md border-2 border-dashed ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50'}`}>
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No records available for current period</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-10 gap-3">
                    {attendance.map((record, i) => (
                      <div 
                        key={i} 
                        className={`p-3 rounded border text-center transition-all hover:scale-105 cursor-default ${
                          record.isPresent 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-800/50 dark:text-emerald-400' 
                            : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/10 dark:border-red-800/50 dark:text-red-400'
                        }`}
                      >
                        <p className="text-[10px] font-black uppercase opacity-60 mb-1">{record.date ? record.date.split('-')[1] || record.date : '-'}</p>
                        <p className="text-lg font-black">{record.date ? record.date.split('-')[0] : i+1}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'leaves' && (
              <div className="animate-in slide-in-from-bottom-2 duration-400">
                <h3 className="text-lg font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-8">Leave Applications</h3>
                {leaves.length === 0 ? (
                  <div className={`text-center py-20 rounded-md border-2 border-dashed ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50'}`}>
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No leave requests initiated</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {leaves.map((leave, i) => (
                      <div key={i} className={`p-6 rounded-md border transition-all hover:border-indigo-400 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-black text-gray-900 dark:text-white pr-2">{leave.subject || leave.reason}</h4>
                          <span className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded border ${
                            leave.status === 'Approved' ? 'bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20' :
                            leave.status === 'Rejected' ? 'bg-red-100 border-red-200 text-red-700 dark:bg-red-900/20' :
                            'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-900/20'
                          }`}>
                            {leave.status || 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 leading-relaxed">{leave.message || leave.description}</p>
                        <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                            <CalendarDays size={14} className="text-indigo-500" /> {leave.startDate}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                            <ArrowLeft size={14} className="rotate-180 text-indigo-500" /> {leave.endDate}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'results' && (
               <div className="animate-in slide-in-from-bottom-2 duration-400">
                 <h3 className="text-lg font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-8">Performance Analytics</h3>
                 {results.length === 0 ? (
                  <div className={`text-center py-20 rounded-md border-2 border-dashed ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50'}`}>
                    <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No exam results published yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {results.map((result, i) => (
                      <div key={i} className={`rounded-md border p-6 transition-all hover:bg-gray-50 dark:hover:bg-gray-850 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex justify-between items-start mb-8 gap-4">
                          <div>
                             <div className="inline-flex px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/20 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase mb-2">
                               {result.examType}
                             </div>
                            <h4 className="font-extrabold text-xl text-gray-900 dark:text-white">{result.examName}</h4>
                          </div>
                          <div className="text-right">
                             <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{result.percentage}%</div>
                             <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Grade {result.overallGrade}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {result.subjects?.map((sub: any, sIdx: number) => (
                            <div key={sIdx} className="flex flex-col gap-1.5">
                              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{sub.subjectName || sub.name}</span>
                                <span className="text-indigo-600 dark:text-indigo-400">{sub.marksObtained || sub.marks}/{sub.totalMarks || 100}</span>
                              </div>
                              <div className={`h-1.5 w-full rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} overflow-hidden`}>
                                <div 
                                  className="h-full bg-indigo-500 rounded-full" 
                                  style={{ width: `${(sub.marksObtained / (sub.totalMarks || 100)) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
               </div>
            )}

            {activeTab === 'fees' && (
              <div className="animate-in slide-in-from-bottom-2 duration-400">
                <h3 className="text-lg font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-8">Transaction Records</h3>
                {fees.length === 0 ? (
                  <div className={`text-center py-20 rounded-md border-2 border-dashed ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50'}`}>
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No fee payment history found</p>
                  </div>
                ) : (
                  <div className={`overflow-hidden rounded border ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className={isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}>
                          <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Transaction Date</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Description</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Amount</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Status</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                          {fees.map((fee, i) => (
                            <tr key={i} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-indigo-50/30'}`}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-600 dark:text-gray-400">
                                {new Date(fee.paymentDate || fee.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900 dark:text-white">
                                {fee.feeType || fee.title || 'Tuition Fee Payment'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-indigo-600 dark:text-indigo-400">
                                ₹{fee.amountPaid || fee.amount || '0'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className={`inline-flex px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded border ${
                                  (fee.status || '').toLowerCase() === 'completed' || (fee.status || '').toLowerCase() === 'paid' 
                                    ? 'bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20' 
                                    : 'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-900/20'
                                }`}>
                                  {fee.status || 'Paid'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileView;
