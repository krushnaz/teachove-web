import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teacherService } from '../../../services/teacherService';
import { useAuth } from '../../../contexts/AuthContext';
import { Teacher } from '../../../models';
import { AddTeacherDrawer } from './index';
import { schoolService } from '../../../services';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Teachers: React.FC = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [teacherCount, setTeacherCount] = useState(0);

  const handleAddTeacher = async (teacher: { 
    teacherName: string; 
    email: string; 
    password: string; 
    phoneNo: string;
  }, profilePicFile?: File) => {
    if (!user?.schoolId) return;
    
    try {
      const teacherData = {
        schoolId: user.schoolId,
        teacherName: teacher.teacherName,
        email: teacher.email,
        phoneNo: teacher.phoneNo,
        password: teacher.password,
        subjects: [],
        classesAssigned: []
      };

      const response = await teacherService.addTeacher(teacherData, profilePicFile);
      
      // Add the new teacher to the local state
      setTeachers(prev => [
        {
          teacherId: response.teacherId,
          name: teacher.teacherName,
          email: teacher.email,
          password: teacher.password,
          phoneNo: teacher.phoneNo,
          profilePic: response.profilePic || '',
          subjects: [],
          classesAssigned: [],
          schoolName: schoolName,
          role: 'Teacher',
          schoolId: user.schoolId,
        },
        ...prev,
      ]);
      
      setDrawerOpen(false);
      toast.success('Teacher added successfully!');
    } catch (error) {
      console.error('Failed to add teacher:', error);
      toast.error('Failed to add teacher. Please try again.');
    }
  };

  const handleEditClick = (teacher: Teacher) => {
    setEditTeacher(teacher);
    setDrawerOpen(true);
  };

  const handleEditTeacher = async (teacherId: string, teacherData: {
    teacherName: string;
    email: string;
    phoneNo: string;
  }, profilePicFile?: File) => {
    try {
      const response = await teacherService.editTeacher(teacherId, {
        teacherName: teacherData.teacherName,
        email: teacherData.email,
        phoneNo: teacherData.phoneNo,
      }, profilePicFile);
      
      // Update the teacher in local state
      setTeachers(prev => prev.map(t => 
        t.teacherId === teacherId 
          ? { 
              ...t, 
              name: teacherData.teacherName, 
              email: teacherData.email, 
              phoneNo: teacherData.phoneNo,
              profilePic: response.profilePic || t.profilePic
            }
          : t
      ));
      
      setDrawerOpen(false);
      setEditTeacher(null);
      toast.success('Teacher updated successfully!');
    } catch (error) {
      console.error('Failed to update teacher:', error);
      toast.error('Failed to update teacher. Please try again.');
    }
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;
    try {
      await teacherService.deleteTeacherById(teacherToDelete.teacherId);
      setTeachers(prev => prev.filter(t => t.teacherId !== teacherToDelete.teacherId));
      toast.success('Teacher deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete teacher.');
    } finally {
      setConfirmDialogOpen(false);
      setTeacherToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
    setTeacherToDelete(null);
  };

  // Fetch teachers on component mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (user?.schoolId) {
          const response = await teacherService.getTeachersBySchool(user.schoolId);
          if (response.teachers) {
            // Map the API response to match the component's expected structure
            const mappedTeachers = response.teachers.map(teacher => ({
              ...teacher,
              name: teacher.teacherName || teacher.name, // Use teacherName from API or fallback to name
              role: 'Teacher',
              schoolName: schoolName || 'N/A'
            }));
            setTeachers(mappedTeachers);
            setTeacherCount(response.count || 0);
          } else {
            setError('Failed to fetch teachers');
          }
        } else {
          setError('School ID not found');
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
        setError('Failed to load teachers');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [user?.schoolId]);

  useEffect(() => {
    const fetchSchoolName = async () => {
      if (user?.schoolId) {
        try {
          const data = await schoolService.getSchoolDetails(user.schoolId);
          setSchoolName(data?.school?.schoolName || '');
        } catch {
          setSchoolName('');
        }
      }
    };
    fetchSchoolName();
  }, [user?.schoolId]);

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (teacher.phoneNo && teacher.phoneNo.includes(searchTerm));
    return matchesSearch;
  });

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teachers...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Teachers</h3>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a6 6 0 11-12 0 6 6 0 0112 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{teacherCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Teachers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{teachers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">School</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{teachers.length > 0 ? teachers[0].schoolName : 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{teachers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Teacher
          </button>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SR No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTeachers.map((teacher, index) => (
                <tr key={teacher.teacherId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {teacher.profilePic ? (
                        <img
                          src={teacher.profilePic}
                          alt={teacher.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
                          {teacher.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{teacher.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{teacher.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{teacher.phoneNo || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{teacher.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300" onClick={() => handleEditClick(teacher)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" onClick={() => handleDeleteClick(teacher)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No teachers found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
      <AddTeacherDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditTeacher(null); }}
        onAddTeacher={handleAddTeacher}
        onEditTeacher={handleEditTeacher}
        schoolName={schoolName}
        schoolId={user?.schoolId || ''}
        teacher={editTeacher || undefined}
      />
      {/* Confirmation Dialog */}
      {confirmDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Confirm Delete</h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to delete <span className="font-bold">{teacherToDelete?.name}</span>?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
