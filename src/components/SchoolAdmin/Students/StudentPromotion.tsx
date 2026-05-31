import React, { useState, useEffect } from 'react';
import { studentService } from '../../../services/studentService';
import { classroomService } from '../../../services/classroomService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Student } from '../../../models';
import { ArrowLeft, Users, GraduationCap, ChevronRight, AlertCircle, RefreshCw, CheckCircle2, Search, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../contexts/DarkModeContext';

const StudentPromotion: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [currentClassId, setCurrentClassId] = useState('');
  const [nextClassId, setNextClassId] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [studentsToPromote, setStudentsToPromote] = useState<Student[]>([]);
  const [hasPreviewed, setHasPreviewed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [previewFilter, setPreviewFilter] = useState('');

  // Generate some academic years starting from current year
  const startYear = new Date().getFullYear();
  const academicYears = [
    `${startYear - 1}-${(startYear).toString().slice(2)}`,
    `${startYear}-${(startYear + 1).toString().slice(2)}`,
    `${startYear + 1}-${(startYear + 2).toString().slice(2)}`,
  ];

  useEffect(() => {
    // Set default academic year
    setAcademicYear(academicYears[1]);
    
    // Fetch classes
    const fetchClasses = async () => {
      if (!user?.schoolId) return;
      try {
        const classData = await classroomService.getClassesBySchoolId(user.schoolId, academicYears[1]);
        setClasses(classData);
      } catch (error) {
        console.error('Failed to fetch classes', error);
        toast.error('Failed to load classes');
      }
    };
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.schoolId]);

  const handlePreview = async () => {
    if (!user?.schoolId || !currentClassId) {
      toast.warning('Please select a current class');
      return;
    }

    setLoading(true);
    setHasPreviewed(false);
    try {
      const response = await studentService.getStudentsByClass(user.schoolId, currentClassId);
      // Filter out students who might already be alumni, if the API returns them
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const activeStudents = response.students.filter((s: Student) => s.status !== 'alumni' && s.isActive !== false);
      setStudentsToPromote(activeStudents);
      setHasPreviewed(true);
      
      if (activeStudents.length === 0) {
        toast.info('No active students found in this class.');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to preview students');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!user?.schoolId || !currentClassId || !academicYear) {
      toast.error('Missing required fields');
      return;
    }

    setLoading(true);
    try {
      const data = {
        schoolId: user.schoolId,
        currentClass: currentClassId,
        nextClass: nextClassId === 'graduation' || nextClassId === '' ? null : nextClassId,
        academicYear: academicYear,
      };

      const result = await studentService.promoteStudents(data);
      toast.success(`${result.totalPromoted} students promoted successfully.`);
      
      // Reset state after promotion
      setHasPreviewed(false);
      setStudentsToPromote([]);
      setCurrentClassId('');
      setNextClassId('');
      setShowConfirm(false);
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to promote students');
    } finally {
      setLoading(false);
    }
  };

  const isGraduating = nextClassId === 'graduation' || nextClassId === '';
  
  const filteredStudents = studentsToPromote.filter((s: Student) => 
    s.name.toLowerCase().includes(previewFilter.toLowerCase()) || 
    (s.rollNo && s.rollNo.toString().includes(previewFilter))
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F8FAFC] text-gray-900'} transition-colors duration-200`}>
      <div className="w-full mx-auto p-0 sm:p-2 lg:p-4 space-y-4 sm:space-y-6">
        
        {/* Header Section */}
        <div className={`rounded-none sm:rounded-md border-b sm:border p-6 sm:p-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-md text-indigo-600 dark:text-indigo-400">
                <RefreshCw size={32} className={loading ? 'animate-spin' : ''} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Academic Promotion</h1>
                <p className="text-sm font-medium opacity-60 mt-1 max-w-2xl">
                  Bulk transfer students between academic grades or transition them to alumni status upon graduation.
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/school-admin/students')}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-md text-sm font-bold border transition-all ${
                isDarkMode ? 'bg-gray-900 border-gray-700 hover:bg-gray-850' : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <ArrowLeft size={16} /> Student Directory
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          
          {/* Controls - Left Column */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            <div className={`rounded-none sm:rounded-md border-b sm:border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
              <div className="flex items-center gap-2 mb-6">
                 <GraduationCap size={20} className="text-indigo-500" />
                 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Transition Settings</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Target Academic Year</label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className={`w-full px-4 py-3 text-sm font-bold border rounded-md transition-all focus:ring-0 ${
                      isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500'
                    }`}
                  >
                    {academicYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Origin Class (Source)</label>
                  <select
                    value={currentClassId}
                    onChange={(e) => {
                      setCurrentClassId(e.target.value);
                      setHasPreviewed(false);
                    }}
                    className={`w-full px-4 py-3 text-sm font-bold border rounded-md transition-all focus:ring-0 ${
                      isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500'
                    }`}
                  >
                    <option value="">Select source class...</option>
                    {classes.map((c: any) => (
                      <option key={c.classId} value={c.classId}>
                        {c.className} {c.section && `- ${c.section}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative py-2 flex items-center justify-center">
                   <div className={`w-full h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
                   <div className={`absolute p-1.5 rounded-full border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-white border-gray-100 text-gray-400'}`}>
                     <ChevronRight size={14} className="rotate-90" />
                   </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Destination Class (Target)</label>
                  <select
                    value={nextClassId}
                    onChange={(e) => setNextClassId(e.target.value)}
                    className={`w-full px-4 py-3 text-sm font-bold border rounded-md transition-all focus:ring-0 ${
                      isDarkMode 
                        ? 'bg-gray-900 border-gray-700 text-indigo-400 focus:border-indigo-500' 
                        : 'bg-indigo-50/50 border-indigo-100 text-indigo-700 focus:border-indigo-500'
                    }`}
                  >
                    <option value="">Select destination...</option>
                    <option className="font-black text-amber-600 dark:text-amber-400" value="graduation">🎓 GRADUATED / ALUMNI</option>
                    {classes.map((c: any) => (
                      <option key={c.classId} value={c.classId}>
                        Grade {c.className} {c.section && `[${c.section}]`}
                      </option>
                    ))}
                  </select>
                  <div className={`mt-3 p-3 rounded-md flex gap-2 ${isDarkMode ? 'bg-gray-900/50 text-gray-400' : 'bg-blue-50/50 text-blue-600'}`}>
                    <Info size={14} className="shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold leading-relaxed">
                      Graduated students will be archived. Ensure the target class belongs to the {academicYear} session.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handlePreview}
                  disabled={loading || !currentClassId}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md font-black text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 uppercase tracking-widest"
                >
                  {loading && !hasPreviewed ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Users className="w-4 h-4" />
                  )}
                  Initialize Preview
                </button>
              </div>
            </div>
          </div>

          {/* Preview - Right Column */}
          <div className="lg:col-span-8">
            <div className={`h-full rounded-none sm:rounded-md border-b sm:border flex flex-col min-h-[500px] overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
              
              {hasPreviewed ? (
                <>
                  <div className={`p-4 sm:p-6 border-b flex flex-col sm:flex-row items-center justify-between gap-4 ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-100 bg-gray-50/50'}`}>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider">Candidate Registry</h3>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          {studentsToPromote.length} active students identified
                        </p>
                      </div>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Filter candidates..."
                        value={previewFilter}
                        onChange={(e) => setPreviewFilter(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 text-xs font-bold border rounded-md focus:ring-0 ${
                          isDarkMode ? 'bg-gray-900 border-gray-700 focus:border-indigo-500' : 'bg-white border-gray-200 focus:border-indigo-500'
                        }`}
                      />
                    </div>

                    {studentsToPromote.length > 0 && (
                      <button
                        onClick={() => setShowConfirm(true)}
                        className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        Execute Batch Promotion
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar max-h-[600px]">
                    {filteredStudents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredStudents.map((student: Student) => (
                          <div key={student.studentId} className={`flex items-center gap-4 p-3 rounded border transition-all hover:border-indigo-400 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                            {student.profilePic ? (
                              <img src={student.profilePic} alt={student.name} className="w-10 h-10 rounded shadow-sm object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-gray-900 dark:text-white truncate">{student.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Roll: {student.rollNo || 'N/A'}</span>
                                <span className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                                <span className="text-[10px] font-bold text-gray-400 truncate">{student.email}</span>
                              </div>
                            </div>
                            <div className="shrink-0 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-50 border border-emerald-100 text-emerald-600 dark:bg-emerald-900/10 dark:border-emerald-800/50">
                              READY
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                          <AlertCircle className="w-8 h-8 text-gray-300" />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-500">No Match Found</h4>
                        <p className="text-[11px] font-medium text-gray-400 max-w-xs mt-2">
                          No students in current preview match your filter criteria.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                  <div className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center mb-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <Users size={40} className="opacity-20" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-widest mb-2">Awaiting Parameters</h3>
                  <p className="text-xs font-medium max-w-xs leading-relaxed">
                    Please select a source class and destination class to initialize the promotion sequence preview.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
            <div className={`relative w-full max-w-md overflow-hidden rounded-md shadow-2xl transform transition-all border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-white'}`}>
              <div className={`p-8 text-white ${isGraduating ? 'bg-amber-600' : 'bg-indigo-600'}`}>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center ring-4 ring-white/10">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-center uppercase tracking-widest">Authorize Promotion</h3>
              </div>
              
              <div className="p-8">
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-bold text-gray-500 uppercase">Batch Size</span>
                    <span className="text-sm font-black">{studentsToPromote.length} Selected</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-bold text-gray-500 uppercase">Transaction</span>
                    <span className={`text-sm font-black uppercase tracking-tight ${isGraduating ? 'text-amber-600' : 'text-indigo-600'}`}>
                      {isGraduating ? 'Archive (Alumni)' : 'Upgrade Grade'}
                    </span>
                  </div>
                </div>

                <p className={`text-xs font-bold leading-relaxed mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isGraduating 
                    ? "Warning: These students will be marked as alumni and removed from active classroom registers. This action is recorded in academic history."
                    : `Confirming migration of identified candidates to their respective new class for the ${academicYear} session.`
                  }
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    disabled={loading}
                    className={`py-3 px-4 font-black text-xs uppercase tracking-widest rounded-md transition-all ${
                      isDarkMode ? 'bg-gray-900 text-gray-400 hover:bg-gray-850' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    Abort
                  </button>
                  <button
                    onClick={handlePromote}
                    disabled={loading}
                    className={`py-3 px-4 font-black text-xs uppercase tracking-widest text-white rounded-md shadow-md transition-all flex justify-center items-center gap-2 ${
                      isGraduating 
                        ? 'bg-amber-600 hover:bg-amber-700' 
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      "Confirm Execution"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPromotion;
