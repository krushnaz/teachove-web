import React, { useEffect, useState } from 'react';
import { BookOpen, CalendarDays, KeyRound, UserCircle2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { studentService, StudentProfile as StudentProfileData } from '../../../services/studentService';
import { toast } from 'react-toastify';
import {
  TeacherPageShell,
  TeacherPageHeader,
  TeacherStatsGrid,
  TeacherStatCard,
  TeacherPanel,
  TeacherCardGrid,
  TeacherItemCard,
  TeacherButton,
  TeacherLoading,
  TeacherError,
} from '../shared';

const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchStudentProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.studentId]);

  const fetchStudentProfile = async () => {
    if (!user?.studentId) {
      setError('Student ID not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await studentService.getStudentWithClass(user.studentId);
      setStudentData(data);
    } catch (error: any) {
      console.error('Error fetching student profile:', error);
      setError(error.message || 'Failed to load profile');
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: { _seconds: number; _nanoseconds: number }) => {
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      await studentService.updatePassword(
        user?.studentId || '',
        passwordData.currentPassword,
        passwordData.newPassword
      );
      toast.success('Password updated successfully');
      setIsEditingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    }
  };

  if (loading) return <TeacherLoading message="Loading profile..." />;
  if (error || !studentData) {
    return <TeacherError title="Error Loading Profile" message={error || 'Failed to load profile'} onRetry={fetchStudentProfile} />;
  }

  return (
    <TeacherPageShell>
      <TeacherPageHeader title="My Profile" description="View and manage your profile information." />

      <TeacherStatsGrid cols={3}>
        <TeacherStatCard title="Roll Number" value={studentData.rollNo} icon={UserCircle2} color="indigo" />
        <TeacherStatCard
          title="Total Subjects"
          value={studentData.classDetails.subjects.length}
          icon={BookOpen}
          color="blue"
        />
        <TeacherStatCard title="Admission Year" value={studentData.admissionYear} icon={CalendarDays} color="violet" />
      </TeacherStatsGrid>

      <TeacherPanel>
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          {studentData.profilePic ? (
            <img src={studentData.profilePic} alt={studentData.name} className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold">
              {studentData.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{studentData.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Roll No: {studentData.rollNo} | Class {studentData.classDetails.className}-{studentData.classDetails.section}
            </p>
          </div>
          <TeacherButton variant="secondary" icon={KeyRound} onClick={() => setIsEditingPassword(true)}>
            Change Password
          </TeacherButton>
        </div>
      </TeacherPanel>

      <TeacherCardGrid cols={2}>
        <TeacherItemCard>
          <div className="p-4 sm:p-5 space-y-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Personal Information</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Name: {studentData.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Email: {studentData.email}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Phone: {studentData.phoneNo}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Admission Year: {studentData.admissionYear}</p>
          </div>
        </TeacherItemCard>
        <TeacherItemCard>
          <div className="p-4 sm:p-5 space-y-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Account Details</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Created At: {formatDate(studentData.createdAt)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Last Updated: {formatDate(studentData.updatedAt)}
            </p>
          </div>
        </TeacherItemCard>
      </TeacherCardGrid>

      <TeacherPanel title={`My Subjects (${studentData.classDetails.subjects.length})`}>
        <TeacherCardGrid cols={3}>
          {studentData.classDetails.subjects.map((subject, index) => (
            <TeacherItemCard key={index}>
              <div className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center justify-center font-semibold">
                  {subject.subjectName.charAt(0)}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{subject.subjectName}</p>
              </div>
            </TeacherItemCard>
          ))}
        </TeacherCardGrid>
      </TeacherPanel>

      {/* Change Password Modal */}
      {isEditingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-xl shadow-xl max-w-md w-full mx-4 bg-white dark:bg-gray-800">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Change Password</h3>
                <button
                  onClick={() => {
                    setIsEditingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <TeacherButton
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setIsEditingPassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                  >
                    Cancel
                  </TeacherButton>
                  <TeacherButton type="submit" className="flex-1">
                    Update Password
                  </TeacherButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </TeacherPageShell>
  );
};

export default StudentProfile;
