import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
import { studentService } from '../../../services/studentService';
import { useAuth } from '../../../contexts/AuthContext';
import { Student } from '../../../models';
import AddStudentDrawer from './AddStudentDrawer';
import { toast } from 'react-toastify';

// Remove the old interface since we're importing Student from api config

const Students: React.FC = () => {
  const { user } = useAuth();
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

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (user?.schoolId) {
          const response = await studentService.getStudentsBySchool(user.schoolId);
          if (response.success) {
            setStudents(response.students);
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
    rollNo: string; // Add rollNo field
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
    rollNo: string; // Add rollNo field
  }, profilePicFile?: File) => {
    if (!user?.schoolId) {
      toast.error('User session expired. Please login again.');
      return;
    }

    try {
      const response = await studentService.editStudent(studentId, {
        schoolId: user.schoolId,
        classId: studentData.classId,
        name: studentData.name,
        email: studentData.email,
        phoneNo: studentData.phoneNo,
        admissionYear: studentData.admissionYear,
        rollNo: studentData.rollNo, // Add rollNo to API call
      }, profilePicFile);

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

  // Handler for opening add student drawer
  const handleAddStudentClick = () => {
    setEditingStudent(null);
    setDrawerOpen(true);
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
                         (student.rollNo && student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())); // Add rollNo to search
    const studentClass = student.className && student.section
      ? `${student.className}-${student.section}`
      : student.classId;
    const matchesClass = selectedClass === 'all' || studentClass === selectedClass;
    return matchesSearch && matchesClass;
  }).sort((a, b) => {
    // Sort by roll number if both have roll numbers
    if (a.rollNo && b.rollNo) {
      // Convert to numbers if they are numeric, otherwise sort alphabetically
      const aNum = parseInt(a.rollNo);
      const bNum = parseInt(b.rollNo);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      } else {
        return a.rollNo.localeCompare(b.rollNo);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Students</h3>
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{students.length}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{students.filter(s => s.isActive !== false).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Classes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{new Set(students.map(s => {
                return s.className && s.section
                  ? `${s.className}-${s.section}`
                  : s.classId;
              })).size}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">New This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
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
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="sm:w-32">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                              <option value="all">All Classes</option>
              {Array.from(new Set(students.map(s => {
                return s.className && s.section
                  ? `${s.className}-${s.section}`
                  : s.classId;
              }))).map((classInfo) => (
                <option key={classInfo} value={classInfo}>{classInfo}</option>
              ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleAddStudentClick}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Student
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Admission Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student, index) => (
                <tr key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {student.rollNo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {student.profilePic ? (
                        <img
                          src={student.profilePic}
                          alt={student.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {student.className && student.section
                      ? `${student.className}-${student.section}`
                      : student.classId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{student.phoneNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{student.admissionYear}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.isActive !== false
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {student.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditStudentClick(student)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        title="Edit Student"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(student)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Student"
                      >
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
        
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No students found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search criteria.</p>
          </div>
        )}
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

      {/* Delete Confirmation Dialog */}
      {confirmDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Confirm Delete</h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <span className="font-bold">{studentToDelete?.name}</span>?
              This action cannot be undone.
            </p>
            {deleteLoading && (
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Deleting student...</span>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleteLoading}
                className={`px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none ${
                  deleteLoading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className={`px-4 py-2 rounded-md bg-red-600 text-white font-semibold shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  deleteLoading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-red-700'
                }`}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students; 