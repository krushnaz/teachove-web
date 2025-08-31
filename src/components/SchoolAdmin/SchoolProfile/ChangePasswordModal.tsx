import React, { useState } from 'react';
import { X, Save, Lock, Eye, EyeOff } from 'lucide-react';
import { ChangePasswordRequest } from '../../../services/schoolProfileService';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (passwordData: ChangePasswordRequest) => Promise<void>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleInputChange = (field: keyof ChangePasswordRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one number';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
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
      // Reset form
      setFormData({ currentPassword: '', newPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ currentPassword: '', newPassword: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Lock className="w-6 h-6 mr-3 text-blue-600" />
            Change Password
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className={`flex items-center ${formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className="mr-2">•</span>
                  At least 8 characters long
                </li>
                <li className={`flex items-center ${/(?=.*[a-z])/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className="mr-2">•</span>
                  Contains lowercase letter
                </li>
                <li className={`flex items-center ${/(?=.*[A-Z])/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className="mr-2">•</span>
                  Contains uppercase letter
                </li>
                <li className={`flex items-center ${/(?=.*\d)/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className="mr-2">•</span>
                  Contains number
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Changing...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal; 