import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  School, 
  Briefcase, 
  GraduationCap, 
  Sun, 
  Moon, 
  Eye, 
  EyeOff,
  Phone,
  Lock,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  X,
  Mail,
  CheckCircle2,
  UserCheck,
  Rocket
} from "lucide-react";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    phoneNo: '9876543210',
    password: '12345678',
    role: 'school'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showCreateAccountDialog, setShowCreateAccountDialog] = useState(false);
  
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const setRole = (role: 'school' | 'teacher' | 'student') => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(formData.phoneNo, formData.password, formData.role);
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { value: 'school', label: 'School', icon: School },
    { value: 'teacher', label: 'Teacher', icon: Briefcase },
    { value: 'student', label: 'Student', icon: GraduationCap }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname;
      if (from) navigate(from, { replace: true });
      else if (user?.role === 'school') navigate('/school-admin', { replace: true });
      else if (user?.role === 'teacher') navigate('/teacher-admin', { replace: true });
      else if (user?.role === 'student') navigate('/student-dashboard', { replace: true });
      else navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate, location, user]);

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-slate-950' : 'bg-white'}`}>
      
      {/* --- Left Side: Form Section --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-24 relative z-10">
        
        {/* Top Navigation */}
        <div className="absolute top-8 left-8 sm:left-12">
          <Link
            to="/"
            className={`group inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
              isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 group-hover:bg-slate-700' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Main Content Container (Wider) */}
        <div className="w-full max-w-xl mx-auto mt-12 lg:mt-0">
          
          {/* Header */}
          <div className="mb-10">
            <h1 className={`text-4xl sm:text-5xl font-bold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Welcome back
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Please enter your details to sign in.
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-8">
            <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Select Portal
            </label>
            <div className="grid grid-cols-3 gap-4">
              {roles.map((role) => {
                const isSelected = formData.role === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setRole(role.value as any)}
                    className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200
                      ${isSelected
                        ? (isDarkMode ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-indigo-600 bg-indigo-50 text-indigo-700')
                        : (isDarkMode ? 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:bg-slate-800' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50')
                      }
                    `}
                  >
                    <role.icon className={`w-6 h-6 ${isSelected ? 'scale-110' : 'scale-100'} transition-transform`} strokeWidth={isSelected ? 2.5 : 2} />
                    <span className="text-sm font-semibold">{role.label}</span>
                    
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Input */}
            <div className="space-y-2">
              <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <input
                  type="tel"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleInputChange}
                  required
                  className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all font-medium
                    ${isDarkMode 
                      ? 'bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                      : 'bg-slate-50 border border-transparent text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:bg-slate-100'
                    }`}
                  placeholder="9876543210"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={`w-full pl-12 pr-12 py-4 rounded-xl outline-none transition-all font-medium
                    ${isDarkMode 
                      ? 'bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                      : 'bg-slate-50 border border-transparent text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:bg-slate-100'
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${
                    isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${isDarkMode ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2
                ${isDarkMode 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ChevronRight className="w-5 h-5" strokeWidth={3} />
                </>
              )}
            </button>
            
            <div className={`text-center text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setShowCreateAccountDialog(true)}
                className={`font-bold transition-colors ${isDarkMode ? 'text-white hover:text-indigo-400' : 'text-slate-900 hover:text-indigo-600'}`}
              >
                Create an account
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- Right Side: Visual Section --- */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 z-10 mix-blend-overlay" />
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1920&auto=format&fit=crop"
          alt="Students collaborating"
          className="w-full h-full object-cover opacity-90"
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-20" />
        
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="absolute top-8 right-8 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Quote / Branding */}
        <div className="absolute bottom-0 left-0 right-0 p-16 z-30">
           <div className="w-12 h-12 mb-6 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40">
              <School className="w-6 h-6 text-white" />
           </div>
           <blockquote className="text-2xl font-medium text-white leading-relaxed mb-4">
             "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
           </blockquote>
           <p className="text-slate-300 font-medium">
             — Malcolm X
           </p>
        </div>
      </div>

      {/* Create Account Dialog */}
      {showCreateAccountDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
          }`}>
            {/* Close Button */}
            <button
              onClick={() => setShowCreateAccountDialog(false)}
              className={`absolute top-4 right-4 z-10 p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className={`px-8 py-6 border-b ${
              isDarkMode ? 'border-slate-800 bg-gradient-to-r from-indigo-600/10 to-purple-600/10' : 'border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50'
            }`}>
              <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Get Started with TeachoVE
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Follow these simple steps to create your account
              </p>
            </div>

            {/* Steps Container */}
            <div className="p-8">
              {/* Steps Progress Bar */}
              <div className="relative mb-12">
                <div className={`absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 ${
                  isDarkMode ? 'bg-slate-800' : 'bg-slate-200'
                }`} />
                <div className="relative flex justify-between">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg ${
                      isDarkMode 
                        ? 'bg-indigo-600 border-4 border-slate-900' 
                        : 'bg-indigo-600 border-4 border-white'
                    }`}>
                      <Phone className="w-8 h-8 text-white" />
                    </div>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Step 1
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg ${
                      isDarkMode 
                        ? 'bg-indigo-600 border-4 border-slate-900' 
                        : 'bg-indigo-600 border-4 border-white'
                    }`}>
                      <UserCheck className="w-8 h-8 text-white" />
                    </div>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Step 2
                    </span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg ${
                      isDarkMode 
                        ? 'bg-indigo-600 border-4 border-slate-900' 
                        : 'bg-indigo-600 border-4 border-white'
                    }`}>
                      <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Step 3
                    </span>
                  </div>
                </div>
              </div>

              {/* Steps Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1: Contact Vedant Tech */}
                <div className={`p-6 rounded-xl border-2 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-indigo-500/30' 
                    : 'bg-indigo-50/50 border-indigo-200'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-indigo-600/20' : 'bg-indigo-100'
                    }`}>
                      <Phone className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Contact Vedant Tech
                    </h3>
                  </div>
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Reach out to our team to get started with your account setup.
                  </p>
                  <div className="space-y-3">
                    <a
                      href="mailto:vedanteducation.22@gmail.com"
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        isDarkMode 
                          ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white' 
                          : 'bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700'
                      }`}
                    >
                      <Mail className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                      <span className="text-sm font-medium">vedanteducation.22@gmail.com</span>
                    </a>
                    <a
                      href="tel:+919766117311"
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        isDarkMode 
                          ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white' 
                          : 'bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700'
                      }`}
                    >
                      <Phone className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                      <span className="text-sm font-medium">+91 9766117311</span>
                    </a>
                  </div>
                </div>

                {/* Step 2: Get Credentials */}
                <div className={`p-6 rounded-xl border-2 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-indigo-500/30' 
                    : 'bg-indigo-50/50 border-indigo-200'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-indigo-600/20' : 'bg-indigo-100'
                    }`}>
                      <UserCheck className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Get Credentials
                    </h3>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Our team will provide you with your login credentials and account details after verification.
                  </p>
                </div>

                {/* Step 3: Start Using TeachoVE */}
                <div className={`p-6 rounded-xl border-2 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-indigo-500/30' 
                    : 'bg-indigo-50/50 border-indigo-200'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-indigo-600/20' : 'bg-indigo-100'
                    }`}>
                      <Rocket className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Start Using TeachoVE
                    </h3>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Once you receive your credentials, log in and start managing your school efficiently with TeachoVE.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className={`mt-8 pt-6 border-t ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Need help? Contact our support team anytime
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;