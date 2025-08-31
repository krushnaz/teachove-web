import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { classroomService, Classroom as ClassroomType, CreateClassRequest, Subject as SubjectType } from '../../../services/classroomService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Subject {
  id: string;
  name: string;
  teacher: string;
}

interface ClassroomData {
  id: string;
  name: string;
  capacity: number;
  grade: string;
  teacher: string;
  students: number;
  status: 'active' | 'inactive';
  subjects: Subject[];
}

const Classroom: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<ClassroomData | null>(null);

  const [formData, setFormData] = useState({
    className: '',
    section: '',
    classTeacherId: '',
    classFees: 0,
    subjects: [{ subjectName: '', teacherId: '' }]
  });
  const [academicYear] = useState('2025-2026');


  // Fetch classrooms from API
  useEffect(() => {
    const fetchClassrooms = async () => {
      if (!user?.schoolId) return;
      
      try {
        setLoading(true);
        const apiClassrooms = await classroomService.getClassesBySchoolId(user.schoolId, academicYear);
        
        // Transform API data to match component structure
        const transformedClassrooms: ClassroomData[] = apiClassrooms.map(cls => ({
          id: cls.classId,
          name: `${cls.className}-${cls.section}`,
          capacity: 35, // Default capacity
          grade: `${cls.className}th Grade`,
          teacher: cls.classTeacherName,
          students: 0, // Will need to be fetched separately
          status: 'active' as const,
          subjects: cls.subjects.map(sub => ({
            id: sub.teacherId, // Using teacherId as temporary id
            name: sub.subjectName,
            teacher: sub.teacherId // Will need to fetch teacher names
          }))
        }));
        
        setClassrooms(transformedClassrooms);
      } catch (error) {
        console.error('Error fetching classrooms:', error);
        toast.error('Failed to fetch classrooms');
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, [user?.schoolId, academicYear]);

  const handleAddClassroom = () => {
    setShowAddModal(true);
    setEditingClassroom(null);
    setFormData({
      className: '',
      section: '',
      classTeacherId: '',
      classFees: 0,
      subjects: [{ subjectName: '', teacherId: '' }]
    });
  };

  const handleEditClassroom = (classroom: ClassroomData) => {
    setEditingClassroom(classroom);
    setShowAddModal(true);
    // Parse classroom name to extract className and section
    const [className, section] = classroom.name.split('-');
    setFormData({
      className: className || '',
      section: section || '',
      classTeacherId: classroom.teacher,
      classFees: 25000, // Default value
      subjects: classroom.subjects.map(sub => ({
        subjectName: sub.name,
        teacherId: sub.teacher
      }))
    });
  };

  const handleDeleteClassroom = async (id: string) => {
    if (!user?.schoolId) return;
    
    if (window.confirm('Are you sure you want to delete this classroom?')) {
      try {
        await classroomService.deleteClass(user.schoolId, academicYear, id);
        setClassrooms(classrooms.filter(c => c.id !== id));
        toast.success('Classroom deleted successfully');
      } catch (error) {
        console.error('Error deleting classroom:', error);
        toast.error('Failed to delete classroom');
      }
    }
  };



  const handleFormChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectChange = (index: number, field: 'subjectName' | 'teacherId', value: string) => {
    const updatedSubjects = [...formData.subjects];
    updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
    handleFormChange('subjects', updatedSubjects);
  };

  const addSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { subjectName: '', teacherId: '' }]
    }));
  };

  const removeFormSubject = (index: number) => {
    if (formData.subjects.length > 1) {
      setFormData(prev => ({
        ...prev,
        subjects: prev.subjects.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmitForm = async () => {
    if (!user?.schoolId) return;

    try {
      if (editingClassroom) {
        // Update existing class
        await classroomService.updateClass(
          user.schoolId,
          academicYear,
          editingClassroom.id,
          formData
        );
        toast.success('Classroom updated successfully');
      } else {
        // Create new class
        const response = await classroomService.createClass(
          user.schoolId,
          academicYear,
          formData
        );
        toast.success('Classroom created successfully');
        
        // Add to local state
        const newClassroom: ClassroomData = {
          id: response.classId,
          name: `${formData.className}-${formData.section}`,
          capacity: 35,
          grade: `${formData.className}th Grade`,
          teacher: formData.classTeacherId,
          students: 0,
          status: 'active',
          subjects: formData.subjects.map(sub => ({
            id: sub.teacherId,
            name: sub.subjectName,
            teacher: sub.teacherId
          }))
        };
        setClassrooms(prev => [...prev, newClassroom]);
      }
      
      setShowAddModal(false);
      setEditingClassroom(null);
    } catch (error) {
      console.error('Error saving classroom:', error);
      toast.error(editingClassroom ? 'Failed to update classroom' : 'Failed to create classroom');
    }
  };



  const removeSubject = (classroomId: string, subjectId: string) => {
    setClassrooms(classrooms.map(c => 
      c.id === classroomId 
        ? { ...c, subjects: c.subjects.filter(s => s.id !== subjectId) }
        : c
    ));
  };



  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Classroom Management
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage classrooms, assign teachers, and monitor student capacity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Classrooms</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{classrooms.length}</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {classrooms.reduce((sum, c) => sum + c.students, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Teachers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(classrooms.map(c => c.teacher)).size}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg. Capacity</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(classrooms.reduce((sum, c) => sum + c.capacity, 0) / classrooms.length)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <button
            onClick={handleAddClassroom}
            className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105`}
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Classroom
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search classrooms..."
            className={`px-4 py-2 pl-10 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Classrooms Table */}
      <div className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Classroom
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Grade
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Teacher
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Students
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Subjects
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {classrooms.map((classroom) => (
                <tr key={classroom.id} className={`hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-200`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {classroom.name}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Capacity: {classroom.capacity}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                      {classroom.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {classroom.teacher}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(classroom.students, 5))].map((_, i) => (
                          <div
                            key={i}
                            className={`w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {classroom.students}/{classroom.capacity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {classroom.subjects.slice(0, 3).map((subject) => (
                        <span
                          key={subject.id}
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}
                        >
                          {subject.name}
                        </span>
                      ))}
                      {classroom.subjects.length > 3 && (
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                          +{classroom.subjects.length - 3}
                        </span>
                      )}
                      {classroom.subjects.length === 0 && (
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No subjects
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      classroom.status === 'active' 
                        ? (isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                        : (isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                    }`}>
                      {classroom.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClassroom(classroom)}
                        className={`px-3 py-2 text-xs font-medium border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 flex items-center gap-2`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Class
                      </button>
                      <button
                        onClick={() => handleDeleteClassroom(classroom.id)}
                        className={`px-3 py-2 text-xs font-medium border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 flex items-center gap-2`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Class
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

            {/* Beautiful Add/Edit Classroom Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl transform transition-all duration-300 scale-100 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-3xl shadow-2xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
            
            {/* Header with gradient background */}
            <div className={`relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'} p-6`}>
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-white/20' : 'bg-white/30'} backdrop-blur-sm`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {editingClassroom ? 'Edit Classroom' : 'Create New Classroom'}
                    </h3>
                    <p className="text-blue-100 text-sm mt-1">
                      {editingClassroom ? 'Update classroom information' : 'Add a new classroom to your school'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-white/20' : 'hover:bg-white/30'} transition-all duration-200 text-white`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <form className="space-y-6">
                {/* Class Name and Section Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Class Name
                    </label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c1.746 0 3.332.477 4.5 1.253" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={formData.className}
                        onChange={(e) => handleFormChange('className', e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="e.g., 10th"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Section
                    </label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={formData.section}
                        onChange={(e) => handleFormChange('section', e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="e.g., A"
                      />
                    </div>
                  </div>
                </div>

                {/* Teacher ID and Fees Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Class Teacher ID
                    </label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={formData.classTeacherId}
                        onChange={(e) => handleFormChange('classTeacherId', e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Teacher ID"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Class Fees (₹)
                    </label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <input
                        type="number"
                        value={formData.classFees}
                        onChange={(e) => handleFormChange('classFees', parseInt(e.target.value) || 0)}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="25000"
                      />
                    </div>
                  </div>
                </div>

                {/* Subjects Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className={`block text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      📚 Subjects
                    </label>
                    <button
                      type="button"
                      onClick={addSubject}
                      className={`px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Subject
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.subjects.map((subject, index) => (
                      <div key={index} className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 hover:border-gray-500' 
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Subject Name
                            </label>
                            <input
                              type="text"
                              value={subject.subjectName}
                              onChange={(e) => handleSubjectChange(index, 'subjectName', e.target.value)}
                              placeholder="e.g., Mathematics"
                              className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                                isDarkMode 
                                  ? 'bg-gray-700 border-gray-500 text-white placeholder-gray-400' 
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              }`}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Teacher ID
                            </label>
                            <input
                              type="text"
                              value={subject.teacherId}
                              onChange={(e) => handleSubjectChange(index, 'teacherId', e.target.value)}
                              placeholder="Teacher ID"
                              className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                                isDarkMode 
                                  ? 'bg-gray-700 border-gray-500 text-white placeholder-gray-400' 
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              }`}
                            />
                          </div>
                        </div>
                        
                        {/* Remove button */}
                        {formData.subjects.length > 1 && (
                          <div className="flex justify-end mt-3">
                            <button
                              type="button"
                              onClick={() => removeFormSubject(index)}
                              className={`p-2 rounded-lg ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'} transition-all duration-200 hover:scale-110`}
                              title="Remove Subject"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </form>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`px-6 py-3 rounded-xl border-2 font-semibold transition-all duration-200 ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitForm}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {editingClassroom ? 'Update Classroom' : 'Create Classroom'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Classroom; 