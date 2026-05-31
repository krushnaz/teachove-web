import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../../services/studentService';
import { useAuth } from '../../../contexts/AuthContext';
import { Student } from '../../../models';
import { GraduationCap, Search, ArrowLeft, Mail, Phone, CalendarDays, ExternalLink, ChevronRight, UserCircle2 } from 'lucide-react';
import { useDarkMode } from '../../../contexts/DarkModeContext';

const Alumni: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [alumni, setAlumni] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch students and filter alumni
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (user?.schoolId) {
          const response = await studentService.getStudentsBySchool(user.schoolId);
          if (response.success) {
            const alumniList = response.students.filter((student: Student) => student.status === 'alumni');
            setAlumni(alumniList);
          } else {
            setError('Failed to fetch alumni');
          }
        } else {
          setError('School ID not found');
        }
      } catch (error) {
        console.error('Error fetching alumni:', error);
        setError('Failed to load alumni');
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, [user?.schoolId]);

  const filteredAlumni = alumni.filter((student: Student) => {
    const term = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(term) ||
      (student.email && student.email.toLowerCase().includes(term)) ||
      (student.rollNo && student.rollNo.toString().toLowerCase().includes(term))
    );
  }).sort((a: Student, b: Student) => a.name.localeCompare(b.name));

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-[#F8FAFC]'}`}>
         <div className="w-full mx-auto p-4 space-y-6">
           <div className="h-20 w-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-md" />
           <div className="h-12 w-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-md" />
           <div className="h-96 w-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-md" />
         </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-[#F8FAFC]'}`}>
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Error</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-2.5 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 transition-colors"
          >
            Try Refreshing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F8FAFC] text-gray-900'} transition-colors duration-200`}>
      <div className="w-full mx-auto p-0 sm:p-2 lg:p-4 space-y-4 sm:space-y-6">
        
        {/* ERP Header Section */}
        <div className={`rounded-none sm:rounded-md border-b sm:border p-6 sm:p-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-start gap-4">
               <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-md text-amber-600 dark:text-amber-400">
                 <GraduationCap size={32} />
               </div>
               <div>
                 <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Alumni Directory</h1>
                 <p className="text-sm font-medium opacity-60 mt-1 max-w-2xl">
                   Archived records of students who have successfully completed their academic tenure at the institution.
                 </p>
               </div>
             </div>
             <div className="flex items-center gap-2">
               <button 
                 onClick={() => navigate(-1)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold border transition-all ${
                   isDarkMode ? 'bg-gray-900 border-gray-700 hover:bg-gray-850' : 'bg-white border-gray-200 hover:bg-gray-50'
                 }`}
               >
                 <ArrowLeft size={16} /> Back
               </button>
                <button 
                 className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm"
               >
                 <ExternalLink size={16} /> Export CSV
               </button>
             </div>
           </div>
        </div>

        {/* Search & Statistics */}
        <div className={`rounded-none sm:rounded-md border-b sm:border p-4 sm:p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
           <div className="flex flex-col sm:flex-row items-center gap-4">
             <div className="relative flex-1 w-full">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                 <Search size={18} />
               </div>
               <input
                 type="text"
                 placeholder="Search by alumni name, email or roll number..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className={`block w-full pl-10 pr-3 py-2.5 text-sm font-bold border transition-all rounded-md focus:ring-0 ${
                   isDarkMode 
                    ? 'bg-gray-900 border-gray-700 text-white focus:border-indigo-500 placeholder-gray-600' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 placeholder-gray-400'
                 }`}
               />
             </div>
             <div className={`px-4 py-2 rounded border flex items-center gap-2 shrink-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
               <span className="text-xs font-black uppercase tracking-widest opacity-50">Total Records:</span>
               <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{filteredAlumni.length}</span>
             </div>
           </div>
        </div>

        {/* Data Grid / Table */}
        <div className={`rounded-none sm:rounded-md border-b sm:border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className={isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Identification</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Primary Contact</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Academic Detail</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Profile Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                {filteredAlumni.map((student) => (
                  <tr 
                    key={student.studentId} 
                    onClick={() => navigate(`/school-admin/students/${student.studentId}`)}
                    className={`transition-colors cursor-pointer group ${isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-indigo-50/30'}`}
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {student.profilePic ? (
                            <img src={student.profilePic} alt={student.name} className="h-10 w-10 rounded shadow-md object-cover border border-gray-200 dark:border-gray-700" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xs">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white dark:border-gray-800" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {student.name}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            Roll No: {student.rollNo || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-400">
                          <Mail size={12} className="shrink-0" /> {student.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-400">
                          <Phone size={12} className="shrink-0" /> {student.phoneNo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                       <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                         Admitted {student.admissionYear || 'Unknown'}
                       </p>
                       <p className="text-[10px] font-bold text-gray-500 mt-1">
                         Graduated from Class {student.classHistory?.[student.classHistory.length - 1]?.class || 'N/A'}
                       </p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                       <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-50 border border-amber-100 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-400">
                         Archived Record
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Grid */}
          <div className="md:hidden divide-y dark:divide-gray-800">
            {filteredAlumni.map((student) => (
              <div 
                key={student.studentId}
                onClick={() => navigate(`/school-admin/students/${student.studentId}`)}
                className={`p-4 active:bg-gray-50 dark:active:bg-gray-850 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  {student.profilePic ? (
                    <img src={student.profilePic} alt={student.name} className="h-12 w-12 rounded shadow-md object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white truncate">{student.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black uppercase tracking-tighter text-amber-600 dark:text-amber-500">ALumni</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">RN: {student.rollNo || 'N/A'}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase">
                    <CalendarDays size={12} className="text-indigo-500" />
                    Joined {student.admissionYear}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase">
                    <UserCircle2 size={12} className="text-indigo-500" />
                    Class {student.classHistory?.[student.classHistory.length - 1]?.class || 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAlumni.length === 0 && (
            <div className="text-center py-20 px-4">
               <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-gray-200 dark:border-gray-800">
                 <GraduationCap size={32} className="text-gray-300 dark:text-gray-700" />
               </div>
               <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">No Records Detected</h3>
               <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8">
                 We couldn't find any alumni matching your search parameters. Try adjusting your search term.
               </p>
               <button 
                 onClick={() => setSearchTerm('')}
                 className="px-6 py-2 rounded-md bg-indigo-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
               >
                 Clear Search Filter
               </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Alumni;
