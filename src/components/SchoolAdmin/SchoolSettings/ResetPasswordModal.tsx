import React, { useState, useRef, useEffect } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Shield
} from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState(user?.email || '');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setEmail(user?.email || '');
      setOtp(['', '', '', '']);
      setPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
    }
  }, [isOpen, user?.email]);

  const handleSendOTP = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep('otp');
      setSuccess('OTP sent successfully to your email');
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 4) {
      setTimeout(() => {
        handleVerifyOTP(newOtp.join(''));
      }, 500);
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode: string) => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (otpCode === '1234') { // Mock verification
        setStep('password');
        setSuccess('OTP verified successfully');
      } else {
        setError('Invalid OTP. Please try again.');
        setOtp(['', '', '', '']);
        otpInputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess('Password reset successfully!');
      
      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('email');
    } else if (step === 'password') {
      setStep('otp');
    }
    setError('');
    setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {step !== 'email' && (
                <button
                  onClick={handleBack}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                <Shield className={`w-6 h-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Reset Password
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {step === 'email' && 'Enter your email to receive OTP'}
                  {step === 'otp' && 'Enter the 4-digit OTP sent to your email'}
                  {step === 'password' && 'Enter your new password'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {['email', 'otp', 'password'].map((stepName, index) => {
                const isCurrentStep = step === stepName;
                const isCompleted = (stepName === 'email' && step !== 'email') || 
                                  (stepName === 'otp' && step === 'password');
                const isActive = isCurrentStep || isCompleted;
                
                return (
                  <div key={stepName} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCurrentStep
                        ? `${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`
                        : isCompleted
                        ? `${isDarkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white'}`
                        : `${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-600'}`
                    }`}>
                      {isActive ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < 2 && (
                      <div className={`w-12 h-0.5 mx-2 ${
                        isCompleted
                          ? `${isDarkMode ? 'bg-green-600' : 'bg-green-500'}`
                          : `${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${isDarkMode ? 'bg-red-900/20 border border-red-700/30' : 'bg-red-50 border border-red-200'}`}>
              <AlertCircle className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</span>
            </div>
          )}

          {success && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${isDarkMode ? 'bg-green-900/20 border border-green-700/30' : 'bg-green-50 border border-green-200'}`}>
              <CheckCircle className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>{success}</span>
            </div>
          )}

          {/* Step Content */}
          {step === 'email' && (
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <button
                onClick={handleSendOTP}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  loading
                    ? `${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'} cursor-not-allowed`
                    : `${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`
                }`}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Enter 4-digit OTP sent to {email}
                </label>
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      className={`w-12 h-12 text-center text-xl font-bold rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => handleSendOTP()}
                  className={`text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {step === 'password' && (
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  New Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleResetPassword}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  loading
                    ? `${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'} cursor-not-allowed`
                    : `${isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`
                }`}
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
