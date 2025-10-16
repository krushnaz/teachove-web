import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    phoneNo: '9876543210',
    password: '12345678',
    role: 'school'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Attempting login with:', { phoneNo: formData.phoneNo, role: formData.role });
      
      const response = await login(formData.phoneNo, formData.password, formData.role);
      
      console.log('Login successful');
    } catch (error: any) {
      console.error('Login error:', error);
      // Show the error message from the API response
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { value: 'school', label: 'School', icon: '🏫' },
    { value: 'teacher', label: 'Teacher', icon: '👨‍🏫' }
  ];

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#0A0E27]' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'} flex relative overflow-hidden`}>
      {/* Animated Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -left-40 h-80 w-80 rounded-full ${isDarkMode ? 'bg-blue-600/20' : 'bg-blue-400/30'} blur-3xl animate-pulse`} />
        <div className={`absolute top-1/4 -right-40 h-96 w-96 rounded-full ${isDarkMode ? 'bg-purple-600/20' : 'bg-purple-400/30'} blur-3xl animate-pulse`} style={{ animationDelay: '1s' }} />
        <div className={`absolute bottom-0 left-1/3 h-80 w-80 rounded-full ${isDarkMode ? 'bg-pink-600/20' : 'bg-pink-400/30'} blur-3xl animate-pulse`} style={{ animationDelay: '2s' }} />
      </div>

      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Back to Home Link */}
          <div className="mb-8">
            <Link
              to="/"
              className={`inline-flex items-center space-x-2 text-sm font-semibold transition-all duration-300 hover:translate-x-1 ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </Link>
        </div>

        {/* Login Form */}
          <div className={`rounded-3xl shadow-2xl border ${isDarkMode ? 'bg-white/5 border-white/10 backdrop-blur-xl' : 'bg-white/90 border-gray-200 backdrop-blur-xl'} p-8 lg:p-10`}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className={`inline-flex h-16 w-16 rounded-2xl ${isDarkMode ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500' : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600'} shadow-xl mb-4 items-center justify-center mx-auto`}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className={`text-3xl sm:text-4xl font-extrabold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Welcome Back
              </h2>
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Sign in to your account to continue
              </p>
            </div>

          {/* Error Message */}
          {error && (
              <div className={`mb-6 p-4 rounded-2xl flex items-start space-x-3 ${isDarkMode ? 'bg-red-500/10 border border-red-500/20 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number Field */}
            <div>
                <label htmlFor="phoneNo" className={`block text-sm font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Phone Number
              </label>
              <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-400 group-focus-within:text-blue-400' : 'text-gray-400 group-focus-within:text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                <input
                  type="tel"
                  id="phoneNo"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleInputChange}
                  required
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 transition-all duration-300 outline-none ${
                      isDarkMode 
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:bg-white/10 focus:border-blue-500 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
                <label htmlFor="password" className={`block text-sm font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Password
              </label>
              <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-400 group-focus-within:text-purple-400' : 'text-gray-400 group-focus-within:text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                    className={`w-full pl-12 pr-12 py-4 border-2 rounded-2xl focus:ring-4 transition-all duration-300 outline-none ${
                      isDarkMode 
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:bg-white/10 focus:border-purple-500 focus:ring-purple-500/20' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-all duration-300 ${
                      isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
                <label htmlFor="role" className={`block text-sm font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Select Role
              </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-400 group-focus-within:text-pink-400' : 'text-gray-400 group-focus-within:text-pink-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                    className={`w-full pl-12 pr-10 py-4 border-2 rounded-2xl focus:ring-4 transition-all duration-300 appearance-none outline-none cursor-pointer ${
                      isDarkMode 
                        ? 'bg-white/5 border-white/10 text-white focus:bg-white/10 focus:border-pink-500 focus:ring-pink-500/20' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-pink-500 focus:ring-pink-500/20'
                }`}
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value} className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
                        {role.icon} {role.label}
                  </option>
                ))}
              </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-400 group-focus-within:text-pink-400' : 'text-gray-400 group-focus-within:text-pink-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center group cursor-pointer">
                <input
                  type="checkbox"
                    className={`h-5 w-5 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                      isDarkMode 
                        ? 'border-white/20 bg-white/5 checked:bg-gradient-to-br checked:from-blue-500 checked:via-purple-500 checked:to-pink-500 checked:border-transparent focus:ring-4 focus:ring-blue-500/20' 
                        : 'border-gray-300 bg-gray-50 checked:bg-gradient-to-br checked:from-blue-600 checked:via-purple-600 checked:to-pink-600 checked:border-transparent focus:ring-4 focus:ring-blue-500/20'
                    }`}
                />
                  <span className={`ml-3 text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`}>Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                  className={`text-sm font-semibold transition-colors duration-300 hover:underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
                className={`group w-full ${isDarkMode ? 'bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-pink-500/90 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500' : 'bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-pink-500/90 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500'} text-white py-4 px-6 rounded-2xl font-bold text-lg focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
            <div className="mt-8 text-center">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Don't have an account?{' '}
                <Link to="/signup" className={`font-bold transition-colors duration-300 hover:underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                Sign up
              </Link>
            </p>
            </div>
          </div>
          </div>
        </div>

      {/* Right Side - Branding & Illustration */}
      <div className={`hidden lg:flex flex-1 ${isDarkMode ? 'bg-gradient-to-br from-[#0A0E27] via-[#0F1535] to-[#0A0E27]' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} items-center justify-center p-12 relative z-10`}>
        <div className="text-center max-w-lg">
          {/* Dark Mode Toggle */}
          <div className="absolute top-8 right-8">
            <button
              onClick={toggleDarkMode}
              className={`p-4 rounded-2xl transition-all duration-300 hover:scale-110 ${
                isDarkMode ? 'bg-white/10 text-yellow-400 hover:bg-white/20' : 'bg-white/80 text-gray-700 hover:bg-white shadow-lg'
              }`}
            >
              {isDarkMode ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          {/* Brand Logo */}
          <div className={`w-32 h-32 mx-auto mb-8 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500' : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600'} flex items-center justify-center transform hover:scale-110 transition-transform duration-500`}>
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>

          {/* Brand Name */}
          <h1 className={`text-5xl sm:text-6xl font-extrabold mb-4 ${isDarkMode ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'} bg-clip-text text-transparent`}>
            VedanTech
          </h1>

          {/* Tagline */}
          <h2 className={`text-2xl sm:text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            School Management System
          </h2>

          {/* Description */}
          <p className={`text-lg mb-10 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Empowering educational institutions with modern technology solutions for seamless administration, student management, and academic excellence.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`group p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white/80 border border-gray-200 hover:bg-white shadow-lg hover:shadow-xl'}`}>
              <div className="flex flex-col items-center space-y-3">
                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Easy to Use</span>
              </div>
            </div>
            <div className={`group p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white/80 border border-gray-200 hover:bg-white shadow-lg hover:shadow-xl'}`}>
              <div className="flex flex-col items-center space-y-3">
                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Fast & Secure</span>
              </div>
            </div>
            <div className={`group p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white/80 border border-gray-200 hover:bg-white shadow-lg hover:shadow-xl'}`}>
              <div className="flex flex-col items-center space-y-3">
                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-pink-500/20' : 'bg-pink-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>24/7 Support</span>
              </div>
            </div>
            <div className={`group p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white/80 border border-gray-200 hover:bg-white shadow-lg hover:shadow-xl'}`}>
              <div className="flex flex-col items-center space-y-3">
                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Cloud Based</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 