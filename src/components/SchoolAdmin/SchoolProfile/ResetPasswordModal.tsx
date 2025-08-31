import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { useDarkMode } from '../../../contexts/DarkModeContext';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onReset: (email: string) => Promise<void>;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  email,
  onReset
}) => {
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'email') {
      try {
        setLoading(true);
        setError(null);
        await onReset(email);
        setStep('otp');
      } catch (err) {
        setError('Failed to send OTP. Please try again.');
        console.error('Error sending OTP:', err);
      } finally {
        setLoading(false);
      }
    } else if (step === 'otp') {
      if (otp.length === 6) {
        setStep('password');
      } else {
        setError('Please enter a valid 6-digit OTP');
      }
    } else if (step === 'password') {
      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      try {
        setLoading(true);
        setError(null);
        // Here you would typically verify OTP and update password
        // For now, we'll just show success
        setSuccess(true);
      } catch (err) {
        setError('Failed to update password. Please try again.');
        console.error('Error updating password:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    setStep('email');
    setOtp('');
    setNewPassword('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <h2 className={`text-2xl font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <Mail className="w-6 h-6 mr-3 text-blue-600" />
            Reset Password
          </h2>
          <button
            onClick={handleClose}
            className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!success ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Forgot your password?
                </h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  We'll send a password reset link to your email address:
                </p>
                <p className="text-blue-600 font-medium mt-2">{email}</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">What happens next?</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• You'll receive an email with a reset link</li>
                      <li>• Click the link to set a new password</li>
                      <li>• The link expires in 24 hours</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
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
                      <Send className="w-4 h-4" />
                      <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Password Updated!
              </h3>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Your password has been successfully updated. You can now log in with your new password.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal; 