import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { authService } from '../../../services/authService';
import { teacherProfileService, TeacherProfileResponse, UpdateTeacherRequest } from '../../../services/teacherProfileService';
import EditProfileModal from './EditProfileModal';

const TeacherProfile: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<TeacherProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get schoolId and teacherId from authService
  const getUserData = () => {
    const userData = authService.getUser();
    if (!userData) {
      throw new Error('User not authenticated');
    }
    return {
      schoolId: userData.schoolId,
      teacherId: userData.teacherId
    };
  };

  useEffect(() => {
    fetchTeacherProfile();
  }, []);

  const fetchTeacherProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { schoolId, teacherId } = getUserData();
      const data = await teacherProfileService.getTeacherProfile(schoolId, teacherId);
      setProfileData(data);
    } catch (err) {
      console.error('Error fetching teacher profile:', err);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData: UpdateTeacherRequest) => {
    try {
      setIsLoading(true);
      const { teacherId } = getUserData();
      await teacherProfileService.updateTeacherProfile(teacherId, updatedData);
      // Refresh profile data after update
      await fetchTeacherProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className={`rounded-2xl p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="animate-pulse">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-8 w-64 bg-gray-300 rounded"></div>
                <div className="h-4 w-48 bg-gray-300 rounded"></div>
                <div className="h-4 w-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="space-y-8">
        <div className={`rounded-2xl p-8 ${isDarkMode ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-200'} border`}>
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-2`}>
              Error Loading Profile
            </h3>
            <p className={`${isDarkMode ? 'text-red-300' : 'text-red-500'} mb-4`}>
              {error || 'Unable to load profile data'}
            </p>
            <button
              onClick={fetchTeacherProfile}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { school, teacher, classes } = profileData;
  const teacherSubjects = teacherProfileService.getTeacherSubjects(classes, teacher.teacherId);
  const teacherClasses = teacherProfileService.getTeacherClasses(classes, teacher.teacherId);
  const associatedSince = teacherProfileService.getAssociatedSince(teacher.createdAt);

  return (
    <div className="space-y-8">
      {/* School & Teacher Association Header */}
      <div className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50'} border ${isDarkMode ? 'border-gray-600' : 'border-blue-100'}`}>
        {/* School Header Section */}
        <div className={`px-8 py-6 border-b ${isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-blue-200 bg-white/50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={school.logo}
                  alt="School Logo"
                  className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(school.schoolName)}&background=6366f1&color=fff&size=200`;
                  }}
                />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                  {school.schoolName}
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                  {school.address.line1}, {school.address.city}, {school.address.state} {school.address.pincode}
                </p>
                <div className="flex items-center space-x-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                    {school.type} School
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}`}>
                    Active Institution
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
                    AY: {school.currentAcademicYear}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Associated Since
              </p>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {associatedSince}
              </p>
            </div>
          </div>
        </div>

        {/* Teacher Profile Section */}
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={teacher.profilePic}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.teacherName)}&background=6366f1&color=fff&size=200`;
                  }}
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {teacher.teacherName}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
                    Teacher
                  </span>
                </div>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                  {teacher.email}
                </p>
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    📧 {teacher.email}
                  </span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    📱 {teacher.phoneNo}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}`}>
                    Active Teacher
                  </span>
                  {teacherSubjects.length > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`}>
                      {teacherSubjects.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Teaching Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Classes Taught */}
        <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Classes Taught
            </h3>
            <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
          </div>
          
          <div className="space-y-4">
            {teacherClasses.length > 0 ? (
              teacherClasses.map((classData, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Class {classData.className} - Section {classData.section}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Subjects: {classData.subjects.filter(s => s.teacherId === teacher.teacherId).map(s => s.subjectName).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      ₹{classData.classFees.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Class Fees</p>
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="text-4xl mb-2">📚</div>
                <p>No classes assigned yet</p>
                <p className="text-sm">Contact your school administrator</p>
              </div>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Personal Information
            </h3>
            <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-500'}`}></div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Full Name
                </p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {teacher.teacherName}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Email Address
                </p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {teacher.email}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Phone Number
                </p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {teacher.phoneNo}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={{
          email: teacher.email,
          password: teacher.password,
          phoneNo: teacher.phoneNo,
          profilePic: teacher.profilePic,
          teacherName: teacher.teacherName
        }}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default TeacherProfile;
