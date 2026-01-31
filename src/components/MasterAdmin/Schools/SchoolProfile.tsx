import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { masterAdminSchoolService, School } from '../../../services/masterAdminSchoolService';
import { 
  ArrowLeft,
  School as SchoolIcon,
  Users,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  Download
} from 'lucide-react';
import { toast } from 'react-toastify';
import MasterAdminLayout from '../Layout';

interface SchoolStats {
  teacherCount: number;
  studentCount: number;
}

interface Teacher {
  teacherId: string;
  teacherName: string;
  email: string;
  phoneNo: string;
  profilePic?: string;
  subjects?: string[];
  classesAssigned?: string[];
}

interface Student {
  studentId: string;
  name: string;
  email: string;
  phoneNo: string;
  rollNo?: string;
  className?: string;
  section?: string;
  profilePic?: string;
}

const SchoolProfile: React.FC = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'students' | 'analysis'>('overview');
  const [school, setSchool] = useState<School | null>(null);
  const [stats, setStats] = useState<SchoolStats>({ teacherCount: 0, studentCount: 0 });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    if (schoolId) {
      fetchSchoolProfile();
    }
  }, [schoolId]);

  useEffect(() => {
    if (activeTab === 'teachers' && schoolId && teachers.length === 0) {
      fetchTeachers();
    }
    if (activeTab === 'students' && schoolId && students.length === 0) {
      fetchStudents();
    }
  }, [activeTab, schoolId]);

  const fetchSchoolProfile = async () => {
    if (!schoolId) return;
    
    try {
      setLoading(true);
      const response = await masterAdminSchoolService.getSchoolProfileWithStats(schoolId);
      setSchool(response.school);
      setStats(response.stats);
    } catch (error: any) {
      console.error('Error fetching school profile:', error);
      toast.error(error.message || 'Failed to load school profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    if (!schoolId) return;
    
    try {
      setLoadingTeachers(true);
      const response = await masterAdminSchoolService.getSchoolTeachers(schoolId);
      setTeachers(response.teachers);
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
      toast.error(error.message || 'Failed to load teachers');
    } finally {
      setLoadingTeachers(false);
    }
  };

  const fetchStudents = async () => {
    if (!schoolId) return;
    
    try {
      setLoadingStudents(true);
      const response = await masterAdminSchoolService.getSchoolStudents(schoolId);
      setStudents(response.students);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast.error(error.message || 'Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  if (loading) {
    return (
      <MasterAdminLayout title="School Profile">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </MasterAdminLayout>
    );
  }

  if (!school) {
    return (
      <MasterAdminLayout title="School Profile">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">School not found</p>
        </div>
      </MasterAdminLayout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: SchoolIcon },
    { id: 'teachers', label: 'Teachers', icon: Users },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
  ];

  return (
    <MasterAdminLayout title={`${school.schoolName} - Profile`}>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/master-admin/add-schools')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Schools
        </button>

        {/* School Header Card */}
        <div className={`rounded-xl border p-6 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-start gap-6">
            {school.logo ? (
              <img
                src={school.logo}
                alt={school.schoolName}
                className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-700"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className={`w-24 h-24 rounded-xl flex items-center justify-center ${
                school.isActive
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <SchoolIcon className={`w-12 h-12 ${
                  school.isActive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-400'
                }`} />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {school.schoolName}
                </h1>
                {school.isActive ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400">
                    <XCircle className="w-4 h-4" />
                    Inactive
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Mail className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {school.email || 'No email'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {school.phoneNo}
                  </span>
                </div>
                {school.city && school.state && (
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {school.city}, {school.state}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`rounded-xl border p-6 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Teachers
                </p>
                <p className={`text-3xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.teacherCount}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
              }`}>
                <Users className={`w-8 h-8 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-6 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Students
                </p>
                <p className={`text-3xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.studentCount}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
              }`}>
                <GraduationCap className={`w-8 h-8 ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`rounded-xl border overflow-hidden ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Tab Headers */}
          <div className={`border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? isDarkMode
                          ? 'border-b-2 border-indigo-500 text-indigo-400 bg-indigo-900/20'
                          : 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab school={school} stats={stats} />
            )}

            {activeTab === 'teachers' && (
              <TeachersTab 
                teachers={teachers} 
                loading={loadingTeachers}
                onRefresh={fetchTeachers}
                schoolId={schoolId || ''}
              />
            )}

            {activeTab === 'students' && (
              <StudentsTab 
                students={students} 
                loading={loadingStudents}
                onRefresh={fetchStudents}
                schoolId={schoolId || ''}
              />
            )}

            {activeTab === 'analysis' && (
              <AnalysisTab school={school} stats={stats} />
            )}
          </div>
        </div>
      </div>
    </MasterAdminLayout>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ school: School; stats: SchoolStats }> = ({ school, stats }) => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className="space-y-6">
      {/* School Profile Information */}
      <div>
        <h3 className={`text-xl font-bold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          School Profile
        </h3>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
          isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
        } rounded-lg p-6`}>
          <div className="flex items-start gap-3">
            <Building className={`w-5 h-5 mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <div>
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                School Type
              </p>
              <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {school.type || 'Not specified'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className={`w-5 h-5 mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <div>
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Academic Year
              </p>
              <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {school.currentAcademicYear || 'Not specified'}
              </p>
            </div>
          </div>

          {school.email && (
            <div className="flex items-start gap-3">
              <Mail className={`w-5 h-5 mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <div>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Email
                </p>
                <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {school.email}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Phone className={`w-5 h-5 mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <div>
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Phone Number
              </p>
              <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {school.phoneNo}
              </p>
            </div>
          </div>

          {(school.city || school.state) && (
            <div className="flex items-start gap-3 md:col-span-2">
              <MapPin className={`w-5 h-5 mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <div>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Address
                </p>
                <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {school.line1 && `${school.line1}, `}
                  {school.city}{school.city && school.state ? ', ' : ''}{school.state}
                  {school.pincode && ` - ${school.pincode}`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Teachers Tab Component
const TeachersTab: React.FC<{ 
  teachers: Teacher[]; 
  loading: boolean;
  onRefresh: () => void;
  schoolId: string;
}> = ({ teachers, loading, onRefresh, schoolId }) => {
  const { isDarkMode } = useDarkMode();
  const [downloading, setDownloading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className={`w-12 h-12 mx-auto mb-4 ${
          isDarkMode ? 'text-gray-600' : 'text-gray-400'
        }`} />
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          No teachers found for this school
        </p>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await masterAdminSchoolService.downloadTeachersExcel(schoolId);
      toast.success('Teachers Excel file downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading teachers Excel:', error);
      toast.error(error.message || 'Failed to download teachers Excel');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Teachers ({teachers.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading || teachers.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode
                ? 'bg-green-700 hover:bg-green-600 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Downloading...' : 'Download Excel'}
          </button>
          <button
            onClick={onRefresh}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}>
            <tr>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Name
              </th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Email
              </th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Phone
              </th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Subjects
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
          }`}>
            {teachers.map((teacher) => (
              <tr key={teacher.teacherId} className={`hover:${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {teacher.teacherName}
                </td>
                <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {teacher.email}
                </td>
                <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {teacher.phoneNo}
                </td>
                <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {teacher.subjects?.join(', ') || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Students Tab Component
const StudentsTab: React.FC<{ 
  students: Student[]; 
  loading: boolean;
  onRefresh: () => void;
  schoolId: string;
}> = ({ students, loading, onRefresh, schoolId }) => {
  const { isDarkMode } = useDarkMode();
  const [downloading, setDownloading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <GraduationCap className={`w-12 h-12 mx-auto mb-4 ${
          isDarkMode ? 'text-gray-600' : 'text-gray-400'
        }`} />
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          No students found for this school
        </p>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await masterAdminSchoolService.downloadStudentsExcel(schoolId);
      toast.success('Students Excel file downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading students Excel:', error);
      toast.error(error.message || 'Failed to download students Excel');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Students ({students.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading || students.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode
                ? 'bg-green-700 hover:bg-green-600 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Downloading...' : 'Download Excel'}
          </button>
          <button
            onClick={onRefresh}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}>
            <tr>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Name
              </th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Roll No
              </th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Class
              </th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Email
              </th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Phone
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
          }`}>
            {students.map((student) => (
              <tr key={student.studentId} className={`hover:${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {student.name}
                </td>
                <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {student.rollNo || '-'}
                </td>
                <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {student.className && student.section 
                    ? `${student.className}-${student.section}`
                    : student.className || '-'
                  }
                </td>
                <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {student.email}
                </td>
                <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {student.phoneNo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Analysis Tab Component
const AnalysisTab: React.FC<{ school: School; stats: SchoolStats }> = ({ school, stats }) => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className="space-y-6">
      <h3 className={`text-xl font-bold ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        School Analysis
      </h3>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`rounded-xl border p-6 ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Teacher to Student Ratio
            </h4>
            <TrendingUp className={`w-5 h-5 ${
              isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
          </div>
          <p className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {stats.teacherCount > 0 
              ? (stats.studentCount / stats.teacherCount).toFixed(1)
              : '0'
            }
          </p>
          <p className={`text-sm mt-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Students per teacher
          </p>
        </div>

        <div className={`rounded-xl border p-6 ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Total Users
            </h4>
            <Users className={`w-5 h-5 ${
              isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
          </div>
          <p className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {stats.teacherCount + stats.studentCount}
          </p>
          <p className={`text-sm mt-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Teachers + Students
          </p>
        </div>
      </div>

      {/* Additional Analysis Placeholder */}
      <div className={`rounded-xl border p-6 ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Additional analytics and insights will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default SchoolProfile;
