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
        {/* Hero/Profile shimmer */}
        <div className={`relative overflow-hidden rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`h-32 ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600' : 'bg-gradient-to-r from-blue-100 to-purple-100'}`} />
          <div className="p-6 pt-0 -mt-10">
            <div className="animate-pulse flex items-end justify-between">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 rounded-2xl bg-gray-300 ring-4 ring-white dark:ring-gray-800" />
                <div className="space-y-3">
                  <div className="h-6 w-60 bg-gray-300 rounded" />
                  <div className="h-4 w-40 bg-gray-300 rounded" />
                  <div className="h-4 w-32 bg-gray-300 rounded" />
                </div>
              </div>
              <div className="h-10 w-32 bg-gray-300 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Stats shimmer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} animate-pulse`}>
              <div className="h-4 w-24 bg-gray-300 rounded mb-3" />
              <div className="h-8 w-20 bg-gray-300 rounded" />
            </div>
          ))}
        </div>

        {/* Two columns shimmer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1,2].map(i => (
            <div key={i} className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} animate-pulse`}>
              <div className="h-5 w-40 bg-gray-300 rounded mb-6" />
              <div className="space-y-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-12 bg-gray-300/60 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
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
      {/* Profile Hero */}
      <div className={`relative overflow-hidden rounded-2xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`h-36 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800' : 'bg-gradient-to-r from-blue-100 via-purple-100 to-blue-100'}`} />
        <div className="p-6 pt-0 -mt-12">
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={teacher.profilePic}
                  alt="Profile"
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-gray-900 shadow-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.teacherName)}&background=6366f1&color=fff&size=200`;
                  }}
                />
                <div className="absolute -bottom-2 -right-2 px-2 py-1 text-xs rounded-full bg-blue-600 text-white border-4 border-white dark:border-gray-900 shadow">
                  Teacher
                </div>
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{teacher.teacherName}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}`}>Active</span>
                  {teacherSubjects.length > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`}>{teacherSubjects.join(', ')}</span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>AY {school.currentAcademicYear}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow ${
                isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Associated Since</p>
          <p className={`mt-1 text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{associatedSince}</p>
        </div>
        <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Classes</p>
          <p className={`mt-1 text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{teacherClasses.length}</p>
        </div>
        <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Subjects</p>
          <p className={`mt-1 text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{teacherSubjects.length}</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Info Card */}
        <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm lg:col-span-1`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Personal Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Full Name</span>
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{teacher.teacherName}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Email</span>
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium truncate max-w-[60%]`}>{teacher.email}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Phone</span>
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{teacher.phoneNo}</span>
            </div>
          </div>
        </div>

        {/* School Info + Classes */}
        <div className="lg:col-span-2 space-y-8">
          <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>School</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{school.type} School</span>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={school.logo}
                alt="School Logo"
                className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(school.schoolName)}&background=1d4ed8&color=fff&size=200`;
                }}
              />
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{school.schoolName}</p>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{school.address.line1}, {school.address.city}, {school.address.state} {school.address.pincode}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Classes Taught</h3>
              <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`} />
            </div>
            {teacherClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teacherClasses.map((classData, index) => (
                  <div key={index} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Class {classData.className} - {classData.section}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Subjects: {classData.subjects.filter(s => s.teacherId === teacher.teacherId).map(s => s.subjectName).join(', ') || '—'}</p>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        ₹{classData.classFees.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="text-4xl mb-2">📚</div>
                <p>No classes assigned yet</p>
                <p className="text-sm">Contact your school administrator</p>
              </div>
            )}
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
