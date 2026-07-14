import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../../services/studentService';
import { subscriptionService, CanAddStudentsResponse } from '../../../services/subscriptionService';
import { useAuth } from '../../../contexts/AuthContext';
import { Student } from '../../../models';
import AddStudentDrawer from './AddStudentDrawer';
import BulkUploadStudentsModal from '../../shared/BulkUploadStudentsModal';
import SubscriptionStudentBlockModal from '../../shared/SubscriptionStudentBlockModal';
import { toast } from 'react-toastify';
import { classroomService } from '../../../services/classroomService';
import { Users, UserCheck, School, BarChart3, Plus, Upload, Edit2, Trash2 } from 'lucide-react';
import {
  TeacherPageShell,
  TeacherPageHeader,
  TeacherStatsGrid,
  TeacherStatCard,
  TeacherFilterBar,
  TeacherSearchInput,
  TeacherButton,
  TeacherHeaderActions,
  TeacherTableWrapper,
  TeacherTable,
  TeacherLoading,
  TeacherError,
  TeacherEmpty,
} from '../shared';

const Students: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [subscriptionLimitOpen, setSubscriptionLimitOpen] = useState(false);
  const [subscriptionLimitData, setSubscriptionLimitData] = useState<CanAddStudentsResponse | null>(null);
  const [addStudentCheckLoading, setAddStudentCheckLoading] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [teacherClassLabel, setTeacherClassLabel] = useState('My Class');

  useEffect(() => {
    const loadClassLabel = async () => {
      if (!user?.schoolId || !user?.classId) {
        setTeacherClassLabel('My Class');
        return;
      }
      try {
        const classData = await classroomService.getClassById(user.schoolId, user.classId);
        const label = [classData.className, classData.section].filter(Boolean).join('-');
        setTeacherClassLabel(label || 'My Class');
      } catch (error) {
        console.error('Failed to load teacher class details:', error);
        setTeacherClassLabel('My Class');
      }
    };

    loadClassLabel();
  }, [user?.schoolId, user?.classId]);

  // Fetch students from teacher's class
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (user?.schoolId && user?.classId) {
          const response = await studentService.getStudentsByClass(user.schoolId, user.classId);
          if (response.success) {
            // Filter out alumni
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const activeStudents = response.students.filter(student => student.status !== 'alumni');
            setStudents(activeStudents);
          } else {
            setError('Failed to load students');
          }
        } else {
          setError('School ID or Class ID not found');
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    if (user?.schoolId && user?.classId) {
      fetchStudents();
    }
  }, [user?.schoolId, user?.classId]);

  // Handler for adding a new student
  const handleAddStudent = async (studentData: {
    name: string;
    email: string;
    password: string;
    phoneNo: string;
    admissionYear: string;
    classId: string;
    rollNo: string | number;
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
        rollNo: studentData.rollNo,
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
        rollNo: studentData.rollNo,
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
    rollNo: string | number;
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
        rollNo: studentData.rollNo,
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
              rollNo: studentData.rollNo,
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

  // Check subscription limit before opening add student drawer (same as Flutter)
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

  const handleBulkUploadClick = async () => {
    if (!user?.schoolId || !user?.classId) return;
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
      setBulkUploadOpen(true);
    } finally {
      setAddStudentCheckLoading(false);
    }
  };

  const refreshStudents = async () => {
    if (!user?.schoolId || !user?.classId) return;
    const response = await studentService.getStudentsByClass(user.schoolId, user.classId);
    if (response.success) {
      const activeStudents = response.students.filter(
        (student: Student & { status?: string }) => student.status !== 'alumni'
      );
      setStudents(activeStudents);
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
                         (student.rollNo && String(student.rollNo).toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  }).sort((a, b) => {
    // Sort by roll number if both have roll numbers
    if (a.rollNo !== undefined && a.rollNo !== null && b.rollNo !== undefined && b.rollNo !== null) {
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

  if (loading) {
    return <TeacherLoading message="Loading students..." />;
  }

  if (error) {
    return (
      <TeacherError
        title="Error Loading Students"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <TeacherPageShell>
      <TeacherPageHeader
        title="Students"
        description={`Manage students in ${teacherClassLabel}.`}
        action={
          <TeacherHeaderActions>
            <TeacherButton
              variant="secondary"
              icon={Upload}
              compact
              onClick={handleBulkUploadClick}
              disabled={addStudentCheckLoading || !user?.classId}
              loading={addStudentCheckLoading}
            >
              <span className="hidden sm:inline">Upload Excel</span>
              <span className="sm:hidden">Upload</span>
            </TeacherButton>
            <TeacherButton
              icon={Plus}
              compact
              onClick={handleAddStudentClick}
              disabled={addStudentCheckLoading}
              loading={addStudentCheckLoading}
            >
              Add Student
            </TeacherButton>
          </TeacherHeaderActions>
        }
      />

      <TeacherStatsGrid>
        <TeacherStatCard title="My Students" value={students.length} icon={Users} color="indigo" />
        <TeacherStatCard
          title="Active Students"
          value={students.filter((s) => s.isActive !== false).length}
          icon={UserCheck}
          color="emerald"
        />
        <TeacherStatCard title="My Class" value={teacherClassLabel} icon={School} color="violet" />
        <TeacherStatCard title="Attendance Rate" value="96.8%" icon={BarChart3} color="amber" />
      </TeacherStatsGrid>

      <TeacherFilterBar>
        <TeacherSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search students..."
        />
      </TeacherFilterBar>

      <TeacherTableWrapper>
        <TeacherTable
          headers={['Roll No', 'Student', 'Email', 'Class', 'Phone', 'Year', 'Status', 'Actions']}
          minWidth="900px"
        >
          {filteredStudents.map((student) => (
            <tr key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
              <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                {student.rollNo || '-'}
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  {student.profilePic ? (
                    <img src={student.profilePic} alt={student.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{student.name}</span>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[160px] truncate">
                {student.email}
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                {student.className && student.section ? `${student.className}-${student.section}` : student.classId}
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">{student.phoneNo}</td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">{student.admissionYear}</td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                  student.isActive !== false
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                }`}>
                  {student.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                <div className="flex gap-2">
                  <button onClick={() => handleEditStudentClick(student)} className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteClick(student)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </TeacherTable>
        {filteredStudents.length === 0 && (
          <TeacherEmpty icon={Users} title="No students found" description="Try adjusting your search criteria." />
        )}
      </TeacherTableWrapper>

      <BulkUploadStudentsModal
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        schoolId={user?.schoolId || ''}
        onSuccess={refreshStudents}
        fixedClassId={user?.classId}
        fixedClassLabel={teacherClassLabel}
        role="teacher"
      />

      {/* Add Student Drawer */}
      <AddStudentDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingStudent(null);
        }}
        onAddStudent={handleAddStudent}
        onEditStudent={handleEditStudent}
        student={editingStudent ? {
          studentId: editingStudent.studentId,
          name: editingStudent.name,
          email: editingStudent.email,
          phoneNo: editingStudent.phoneNo,
          admissionYear: editingStudent.admissionYear,
          classId: editingStudent.classId,
          rollNo: editingStudent.rollNo || '',
          profilePic: editingStudent.profilePic
        } : undefined}
        teacherClassId={user?.classId || ''}
        teacherClassName={teacherClassLabel}
      />

      {subscriptionLimitOpen && subscriptionLimitData && (
        <SubscriptionStudentBlockModal
          open={subscriptionLimitOpen}
          onClose={() => setSubscriptionLimitOpen(false)}
          data={subscriptionLimitData}
          role="teacher"
        />
      )}

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
            <div className="flex justify-end gap-3">
              <TeacherButton variant="secondary" onClick={handleCancelDelete} disabled={deleteLoading}>
                Cancel
              </TeacherButton>
              <TeacherButton variant="danger" onClick={handleConfirmDelete} loading={deleteLoading}>
                Delete
              </TeacherButton>
            </div>
          </div>
        </div>
      )}
    </TeacherPageShell>
  );
};

export default Students; 