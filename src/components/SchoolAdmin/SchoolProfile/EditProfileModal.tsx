import React, { useState, useEffect } from 'react';
import { X, Save, Building, Mail, Phone, MapPin } from 'lucide-react';
import { SchoolProfile, UpdateSchoolProfileRequest } from '../../../services/schoolProfileService';
import { useDarkMode } from '../../../contexts/DarkModeContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SchoolProfile;
  onSave: (updatedProfile: UpdateSchoolProfileRequest) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave
}) => {
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState<UpdateSchoolProfileRequest>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        schoolName: profile.schoolName,
        type: profile.type,
        email: profile.email,
        phoneNo: profile.phoneNo,
        address: { ...profile.address },
        currentAcademicYear: profile.currentAcademicYear
      });
      setErrors({});
    }
  }, [isOpen, profile]);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.schoolName?.trim()) {
      newErrors.schoolName = 'School name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phoneNo?.trim()) {
      newErrors.phoneNo = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNo.replace(/\D/g, ''))) {
      newErrors.phoneNo = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.address?.line1?.trim()) {
      newErrors['address.line1'] = 'Street address is required';
    }

    if (!formData.address?.city?.trim()) {
      newErrors['address.city'] = 'City is required';
    }

    if (!formData.address?.state?.trim()) {
      newErrors['address.state'] = 'State is required';
    }

    if (!formData.address?.pincode?.trim()) {
      newErrors['address.pincode'] = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.address.pincode)) {
      newErrors['address.pincode'] = 'Please enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <h2 className={`text-2xl font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <Building className="w-6 h-6 mr-3 text-blue-600" />
            Edit School Profile
          </h2>
          <button
            onClick={onClose}
            className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Basic Information</h3>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  School Name *
                </label>
                <input
                  type="text"
                  value={formData.schoolName || ''}
                  onChange={(e) => handleInputChange('schoolName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.schoolName ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                  }`}
                  placeholder="Enter school name"
                />
                {errors.schoolName && (
                  <p className="text-red-500 text-sm mt-1">{errors.schoolName}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  School Type *
                </label>
                <select
                  value={formData.type || ''}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select school type</option>
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Higher Secondary">Higher Secondary</option>
                  <option value="College">College</option>
                  <option value="University">University</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Academic Year *
                </label>
                <input
                  type="text"
                  value={formData.currentAcademicYear || ''}
                  onChange={(e) => handleInputChange('currentAcademicYear', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 2025-2026"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Contact Information</h3>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phoneNo || ''}
                    onChange={(e) => handleInputChange('phoneNo', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phoneNo ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phoneNo && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="mt-8">
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
              <MapPin className="w-5 h-5 mr-2 text-red-600" />
              Address Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address?.line1 || ''}
                  onChange={(e) => handleInputChange('address.line1', e.target.value)}
                                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['address.line1'] ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  placeholder="Enter street address"
                />
                {errors['address.line1'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['address.line1']}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  City *
                </label>
                <input
                  type="text"
                  value={formData.address?.city || ''}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['address.city'] ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  placeholder="Enter city"
                />
                {errors['address.city'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['address.city']}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  State *
                </label>
                <input
                  type="text"
                  value={formData.address?.state || ''}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['address.state'] ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  placeholder="Enter state"
                />
                {errors['address.state'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['address.state']}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Pincode *
                </label>
                <input
                  type="text"
                  value={formData.address?.pincode || ''}
                  onChange={(e) => handleInputChange('address.pincode', e.target.value)}
                                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['address.pincode'] ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  placeholder="Enter pincode"
                  maxLength={6}
                />
                {errors['address.pincode'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['address.pincode']}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex justify-end space-x-4 mt-8 pt-6 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 border rounded-lg transition-colors ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal; 