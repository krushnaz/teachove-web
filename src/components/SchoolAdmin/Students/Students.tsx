import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../../services/studentService';
import { subscriptionService, CanAddStudentsResponse } from '../../../services/subscriptionService';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { Student } from '../../../models';
import AddStudentDrawer from './AddStudentDrawer';
import { toast } from 'react-toastify';
import { 
  Users, 
  UserCheck, 
  School, 
  Calendar, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  ChevronRight,
  Filter,
  AlertCircle,
  MoreVertical,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';

// Remove the old interface since we're importing Student from api config

const Students: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [subscriptionLimitOpen, setSubscriptionLimitOpen] = useState(false);
  const [subscriptionLimitData, setSubscriptionLimitData] = useState<CanAddStudentsResponse | null>(null);
  const [addStudentCheckLoading, setAddStudentCheckLoading] = useState(false);

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (user?.schoolId) {
          const response = await studentService.getStudentsBySchool(user.schoolId);
          if (response.success) {
            // Filter out alumni
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const activeStudents = response.students.filter(student => student.status !== 'alumni');
            setStudents(activeStudents);
          } else {
            setError('Failed to fetch students');
          }
        } else {
          setError('School ID not found');
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user?.schoolId]);

  // Handler for adding a new student
  const handleAddStudent = async (studentData: {
    name: string;
    email: string;
    password: string;
    phoneNo: string;
    admissionYear: string;
    classId: string;
    rollNo: string | number; // Add rollNo field
  }, profilePicFile?: File) => {
    if (!user?.schoolId) return;

    try {
      const response = await studentService.addStudent({
        schoolId: user.schoolId,
        classId: studentData.classId,
        name: studentData.name,
        email: studentData.email,
        phoneNo: studentData.phoneNo,
        password: studentData.password,
        admissionYear: studentData.admissionYear,
        rollNo: studentData.rollNo, // Add rollNo to API call
      }, profilePicFile);

      // Add the new student to the local state
      const newStudent: Student = {
        studentId: response.studentId || `temp-${Date.now()}`,
        schoolId: user.schoolId,
        classId: studentData.classId,
        name: studentData.name,
        email: studentData.email,
        phoneNo: studentData.phoneNo,
        admissionYear: studentData.admissionYear,
        rollNo: studentData.rollNo, // Add rollNo to local state
        profilePic: response.profilePic || '',
        isActive: true,
      };

      setStudents(prev => [newStudent, ...prev]);
      setDrawerOpen(false);
      toast.success('Student added successfully!');
    } catch (error) {
      console.error('Failed to add student:', error);
      toast.error('Failed to add student. Please try again.');
    }
  };

  // Handler for editing a student
  const handleEditStudent = async (studentId: string, studentData: {
    name: string;
    email: string;
    phoneNo: string;
    admissionYear: string;
    classId: string;
    rollNo: string | number; // Add rollNo field
    password?: string;
  }, profilePicFile?: File) => {
    if (!user?.schoolId) {
      toast.error('User session expired. Please login again.');
      return;
    }

    try {
      const editPayload: any = {
        schoolId: user.schoolId,
        classId: studentData.classId,
        name: studentData.name,
        email: studentData.email,
        phoneNo: studentData.phoneNo,
        admissionYear: studentData.admissionYear,
        rollNo: studentData.rollNo, // Add rollNo to API call
      };
      if (studentData.password) {
        editPayload.password = studentData.password;
      }

      const response = await studentService.editStudent(studentId, editPayload, profilePicFile);

      // Update the student in local state
      setStudents(prev => prev.map(s =>
        s.studentId === studentId
          ? {
              ...s,
              name: studentData.name,
              email: studentData.email,
              phoneNo: studentData.phoneNo,
              admissionYear: studentData.admissionYear,
              classId: studentData.classId,
              rollNo: studentData.rollNo, // Add rollNo to local state update
              profilePic: response.profilePic || s.profilePic
            }
          : s
      ));

      setDrawerOpen(false);
      setEditingStudent(null);
      toast.success('Student updated successfully!');
    } catch (error) {
      console.error('Failed to update student:', error);
      toast.error('Failed to update student. Please try again.');
    }
  };

  // Check subscription limit before opening add student drawer (same as Flutter _onAddStudentTapped)
  const handleAddStudentClick = async () => {
    if (!user?.schoolId) return;
    setAddStudentCheckLoading(true);
    try {
      const data = await subscriptionService.getCanAddStudents(user.schoolId);
      if (data == null) {
        toast.error('Could not verify subscription limit. Please try again.');
        return;
      }
      if (!data.canAdd) {
        setSubscriptionLimitData(data);
        setSubscriptionLimitOpen(true);
        return;
      }
      setEditingStudent(null);
      setDrawerOpen(true);
    } finally {
      setAddStudentCheckLoading(false);
    }
  };

  // Handler for opening edit student drawer
  const handleEditStudentClick = (student: Student) => {
    setEditingStudent(student);
    setDrawerOpen(true);
  };

  // Handler for delete confirmation
  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setConfirmDialogOpen(true);
  };

  // Handler for confirming delete
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    setDeleteLoading(true);
    try {
      await studentService.deleteStudent(studentToDelete.studentId);
      setStudents(prev => prev.filter(s => s.studentId !== studentToDelete.studentId));
      toast.success('Student deleted successfully!');
    } catch (error) {
      console.error('Failed to delete student:', error);
      toast.error('Failed to delete student. Please try again.');
    } finally {
      setDeleteLoading(false);
      setConfirmDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  // Handler for canceling delete
  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
    setStudentToDelete(null);
    setDeleteLoading(false);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.rollNo && String(student.rollNo).toLowerCase().includes(searchTerm.toLowerCase())); // Add rollNo to search
    const studentClass = student.className && student.section
      ? `${student.className}-${student.section}`
      : student.classId;
    const matchesClass = selectedClass === 'all' || studentClass === selectedClass;
    return matchesSearch && matchesClass;
  }).sort((a, b) => {
    // Sort by roll number if both have roll numbers
    if (a.rollNo !== undefined && a.rollNo !== null && b.rollNo !== undefined && b.rollNo !== null) {
      // Convert to numbers if they are numeric, otherwise sort alphabetically
      const aNum = parseInt(String(a.rollNo));
      const bNum = parseInt(String(b.rollNo));
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      } else {
        return String(a.rollNo).localeCompare(String(b.rollNo));
      }
    }
    
    // If one has roll number and other doesn't, prioritize the one with roll number
    if (a.rollNo && !b.rollNo) return -1;
    if (!a.rollNo && b.rollNo) return 1;
    
    // If neither has roll number, sort by name
    return a.name.localeCompare(b.name);
  });

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-[#F8FAFC]'} p-0 sm:p-2 lg:p-4 transition-colors duration-200`}>
        <div className="w-full mx-auto space-y-4 sm:space-y-6 animate-pulse">
          {/* Header Skeleton */}
          <div className={`h-32 sm:h-40 rounded-none sm:rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b sm:border border-gray-200 dark:border-gray-800`} />

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 px-2 sm:px-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-20 sm:h-24 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-800`} />
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className={`h-14 mx-4 sm:mx-0 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-800`} />

          {/* List Skeleton */}
          <div className="space-y-3 px-4 sm:px-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-16 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-800`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#F8FAFC] text-gray-900'}`}>
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">Error Loading Students</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-2.5 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F8FAFC] text-gray-900'} transition-colors duration-200`}>
      <div className="w-full mx-auto p-0 sm:p-2 lg:p-4 space-y-4 sm:space-y-6">
        
        {/* Header Section */}
        <div className={`relative overflow-hidden rounded-none sm:rounded-md p-6 sm:p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b sm:border border-gray-200 dark:border-gray-800 shadow-sm`}>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-3 border border-indigo-100 dark:border-indigo-800/30">
                <Users size={13} />
                Students Management
              </div>
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Student Directory
              </h1>
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Manage student records, track progress, and organize classrooms.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/school-admin/students/promote')}
                className={`px-4 py-2.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="p-1 px-1.5 rounded bg-amber-50 dark:bg-amber-900/30">
                  <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span>Promote Students</span>
              </button>
              <button
                onClick={handleAddStudentClick}
                disabled={addStudentCheckLoading}
                className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {addStudentCheckLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Add Student</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 px-2 sm:px-0">
          {[
            { 
              label: 'Total Students', 
              value: students.length, 
              icon: Users,
              color: 'text-indigo-600 dark:text-indigo-400',
              bg: 'bg-indigo-50 dark:bg-indigo-900/20'
            },
            { 
              label: 'Active Students', 
              value: students.filter(s => s.isActive !== false).length, 
              icon: UserCheck,
              color: 'text-emerald-600 dark:text-emerald-400',
              bg: 'bg-emerald-50 dark:bg-emerald-900/20'
            },
            { 
              label: 'Total Classes', 
              value: new Set(students.map(s => s.className && s.section ? `${s.className}-${s.section}` : s.classId)).size, 
              icon: School,
              color: 'text-blue-600 dark:text-blue-400',
              bg: 'bg-blue-50 dark:bg-blue-900/20'
            },
            { 
              label: 'Admission Year', 
              value: new Date().getFullYear().toString(), 
              icon: Calendar,
              color: 'text-amber-600 dark:text-amber-400',
              bg: 'bg-amber-50 dark:bg-amber-900/20'
            },
          ].map((stat, idx) => (
            <div key={idx} className={`p-2.5 sm:p-5 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm flex flex-col justify-between h-full`}>
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <div className={`p-1.5 sm:p-2 rounded-md ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{stat.value}</h3>
                <p className="text-[10px] sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5 truncate">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className={`mx-4 sm:mx-0 p-3 sm:p-4 rounded-md shadow-sm ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search size={18} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
              </div>
              <input
                type="text"
                placeholder="Search students by name, email or roll no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-sm rounded-md border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white'
                } outline-none`}
              />
            </div>
            <div className="md:w-64 flex gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className={`w-full pl-3 pr-8 py-2 text-sm rounded-md border appearance-none transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-900 border-gray-700 text-white focus:border-indigo-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:bg-white'
                  } outline-none cursor-pointer`}
                >
                  <option value="all">All Classes</option>
                  {Array.from(new Set(students.map(s => s.className && s.section ? `${s.className}-${s.section}` : s.classId))).map((classInfo) => (
                    <option key={classInfo} value={classInfo}>{classInfo}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                  <Filter size={14} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-0 sm:px-0">
          <div className="flex items-center justify-between mb-4 sm:mb-6 px-4 sm:px-0">
            <h2 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Student Records ({filteredStudents.length})
            </h2>
          </div>

          <div className={`overflow-hidden rounded-none sm:rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Roll No</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredStudents.map((student) => (
                    <tr 
                      key={student.studentId}
                      onClick={() => navigate(`/school-admin/students/${student.studentId}`)}
                      className={`group transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {student.rollNo || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {student.profilePic ? (
                              <img className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" src={student.profilePic} alt="" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800/30">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{student.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {student.className && student.section ? `${student.className}-${student.section}` : student.classId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {student.phoneNo || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          student.isActive !== false
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {student.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStudentClick(student);
                            }}
                            className={`p-1.5 rounded transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(student);
                            }}
                            className={`p-1.5 rounded transition-colors ${isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student) => (
                <div 
                  key={student.studentId}
                  onClick={() => navigate(`/school-admin/students/${student.studentId}`)}
                  className={`p-4 flex items-center justify-between cursor-pointer ${isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0">
                      {student.profilePic ? (
                        <img className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-700" src={student.profilePic} alt="" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{student.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Roll: {student.rollNo || '-'} • {student.className}-{student.section}</div>
                      <div className="mt-1">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          student.isActive !== false
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {student.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <ChevronRight size={18} className="text-gray-400" />
                    <div className="flex gap-1">
                       <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStudentClick(student);
                        }}
                        className="p-1.5 text-gray-400"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-16 px-4">
                <div className={`w-16 h-16 rounded-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-800`}>
                  <Users size={32} className="text-gray-400" />
                </div>
                <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>No students found</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchTerm ? 'No student matches your search criteria.' : 'Start by adding your first student to the system.'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={handleAddStudentClick}
                    className="mt-6 px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-md hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    Add First Student
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Student Drawer */}
      <AddStudentDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingStudent(null);
        }}
        onAddStudent={handleAddStudent}
        onEditStudent={handleEditStudent}
        student={editingStudent || undefined}
      />

      {/* Subscription limit modal */}
      {subscriptionLimitOpen && subscriptionLimitData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSubscriptionLimitOpen(false)} />
          <div className={`relative w-full max-w-lg transform transition-all overflow-hidden rounded-md border shadow-2xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Subscription Limit Reached</h3>
                  <div className={`mt-3 space-y-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <p>
                      Your current subscription does not allow adding more students. You have used{' '}
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{subscriptionLimitData.currentStudents}</span> of{' '}
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{subscriptionLimitData.totalSubscribedSlots}</span> student slots.
                    </p>
                    <div className={`p-3 rounded-md border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200 italic'}`}>
                      "{subscriptionLimitData.message}"
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSubscriptionLimitOpen(false)}
                  className={`px-4 py-2.5 text-sm font-bold uppercase tracking-wider rounded transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => { setSubscriptionLimitOpen(false); navigate('/school-admin/subscription-request'); }}
                  className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold uppercase tracking-wider rounded hover:bg-indigo-700 shadow-sm transition-all"
                >
                  Purchase Slots
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCancelDelete} />
          <div className={`relative w-full max-w-md transform transition-all overflow-hidden rounded-md border shadow-2xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="p-6">
               <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                  <Trash2 size={24} />
                </div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Confirm Delete</h3>
              </div>
              <p className={`mb-8 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to delete <span className="font-bold text-red-600 dark:text-red-400">{studentToDelete?.name}</span>?
                This action is permanent and cannot be undone.
              </p>
              
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={deleteLoading}
                  className={`px-4 py-2.5 text-sm font-bold uppercase tracking-wider rounded transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                  className="px-6 py-2.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider rounded hover:bg-red-700 shadow-sm transition-all disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Student'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students; 