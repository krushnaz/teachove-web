import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Lock, 
  Building,
  Globe,
  Award,
  Upload,
  X
} from 'lucide-react';
import { schoolProfileService, type SchoolProfile, type UpdateSchoolProfileRequest } from '../../../services/schoolProfileService';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import EditProfileModal from './EditProfileModal';
import ResetPasswordModal from './ResetPasswordModal';

interface SchoolProfileProps {
  schoolId: string;
}

const SchoolProfileComponent: React.FC<SchoolProfileProps> = ({ schoolId }) => {
  const { isDarkMode } = useDarkMode();
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await schoolProfileService.getSchoolProfile(schoolId);
      setProfile(data);
      if (data.logo) {
        setLogoPreview(data.logo);
      }
    } catch (err) {
      setError('Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateProfile = async (updatedProfile: UpdateSchoolProfileRequest) => {
    try {
      setUploading(true);
      await schoolProfileService.updateSchoolProfileWithFile(schoolId, updatedProfile, logoFile);
      await fetchProfile(); // Refresh the profile data
      setLogoFile(null);
      setLogoPreview(profile?.logo || '');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await schoolProfileService.resetPassword(email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(profile?.logo || '');
  };

  const formatDate = (timestamp: { _seconds: number; _nanoseconds: number }) => {
    return new Date(timestamp._seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Error Loading Profile</h2>
          <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error || 'Profile not found'}</p>
          <button
            onClick={fetchProfile}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-8 mb-8`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="School Logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building className="w-10 h-10 text-white" />
                  )}
                </div>
                {/* Logo Upload Button */}
                <div className="absolute -bottom-1 -right-1">
                  <label
                    htmlFor="logo-upload"
                    className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                      isDarkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </div>
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{profile.schoolName}</h1>
                <p className={`text-lg flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Award className="w-5 h-5 mr-2 text-yellow-500" />
                  {profile.type} School
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(true)}
                disabled={uploading}
                className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                  uploading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Edit3 className="w-5 h-5" />
                <span>{uploading ? 'Uploading...' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>

          {/* Logo Preview and Actions */}
          {logoFile && (
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src={logoPreview} 
                    alt="Logo Preview" 
                    className="w-12 h-12 rounded-lg object-cover border border-gray-300"
                  />
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      New Logo Selected
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {logoFile.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveLogo}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                      : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`${isDarkMode ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-blue-50'} p-4 rounded-lg text-center`}>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{profile.currentAcademicYear}</div>
              <div className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>Academic Year</div>
            </div>
            <div className={`${isDarkMode ? 'bg-green-900/20 border border-green-700/30' : 'bg-green-50'} p-4 rounded-lg text-center`}>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{profile.role}</div>
              <div className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>Role</div>
            </div>
            <div className={`${isDarkMode ? 'bg-purple-900/20 border border-purple-700/30' : 'bg-purple-50'} p-4 rounded-lg text-center`}>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Active</div>
              <div className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>Status</div>
            </div>
            <div className={`${isDarkMode ? 'bg-orange-900/20 border border-orange-700/30' : 'bg-orange-50'} p-4 rounded-lg text-center`}>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                {formatDate(profile.createdAt).split(' ')[2]}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>Established</div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
            <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              <User className="w-6 h-6 mr-3 text-blue-600" />
              Basic Information
            </h2>
            
            <div className="space-y-6">
              <div className={`flex items-center space-x-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <Building className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>School Name</div>
                  <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{profile.schoolName}</div>
                </div>
              </div>

              <div className={`flex items-center space-x-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                  <Globe className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>School Type</div>
                  <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{profile.type}</div>
                </div>
              </div>

              <div className={`flex items-center space-x-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                  <Award className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Academic Year</div>
                  <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{profile.currentAcademicYear}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
            <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              <Mail className="w-6 h-6 mr-3 text-green-600" />
              Contact Information
            </h2>
            
            <div className="space-y-6">
              <div className={`flex items-center space-x-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <Mail className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email Address</div>
                  <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{profile.email}</div>
                </div>
              </div>

              <div className={`flex items-center space-x-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                  <Phone className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone Number</div>
                  <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{profile.phoneNo}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-8 lg:col-span-2`}>
            <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              <MapPin className="w-6 h-6 mr-3 text-red-600" />
              Address Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Street Address</div>
                <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{profile.address.line1}</div>
              </div>
              
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>City</div>
                <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{profile.address.city}</div>
              </div>
              
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>State</div>
                <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{profile.address.state}</div>
              </div>
              
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pincode</div>
                <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{profile.address.pincode}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Management */}
        <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-8 mt-8`}>
          <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <Lock className="w-6 h-6 mr-3 text-red-600" />
            Password Management
          </h2>
          
          <div className="flex justify-center">
            <div className={`p-6 rounded-lg border max-w-md ${isDarkMode ? 'bg-red-900/20 border-red-700/30' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>Reset Password</h3>
              <p className={`mb-4 ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>
                If you've forgotten your password, we can send an OTP to your email to reset it.
              </p>
              <button
                onClick={() => setShowResetPasswordModal(true)}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        profile={profile}
        onSave={handleUpdateProfile}
      />
      
      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        email={profile.email}
        onReset={handleResetPassword}
      />
    </div>
  );
};

export default SchoolProfileComponent;
