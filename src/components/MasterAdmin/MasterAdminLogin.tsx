import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Sun, 
  Moon, 
  Eye, 
  EyeOff,
  Lock,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  Mail,
  Shield
} from "lucide-react";

const MasterAdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { loginMasterAdmin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await loginMasterAdmin(formData.email, formData.password);
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'master_admin') {
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate('/master-admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, navigate, location, user]);

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row ${isDarkMode ? 'dark bg-slate-950' : 'bg-white'}`}>
      
      {/* --- Left Side: Form Section --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-8 lg:px-20 xl:px-24 py-6 sm:py-8 lg:py-0 relative z-10 min-h-0">
        
        {/* Top Navigation + Dark mode on mobile */}
        <div className="absolute top-4 sm:top-8 left-4 sm:left-8 right-4 sm:right-auto flex items-center justify-between sm:justify-start">
          <Link
            to="/"
            className={`group inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
              isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 group-hover:bg-slate-700' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="hidden xs:inline sm:inline">Back to Home</span>
          </Link>
          {/* Dark mode toggle - visible on mobile when right panel is hidden */}
          <button
            onClick={toggleDarkMode}
            className="lg:hidden p-2.5 rounded-full border transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={isDarkMode ? { background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' } : { background: 'rgba(0,0,0,0.05)', borderColor: 'rgba(0,0,0,0.1)' }}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>
        </div>

        {/* Main Content Container - scrollable on small screens */}
        <div className="w-full max-w-xl mx-auto mt-16 sm:mt-20 lg:mt-0 overflow-y-auto flex-1 lg:flex-initial">
          
          {/* Header */}
          <div className="mb-6 sm:mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 sm:p-3 rounded-xl flex-shrink-0 ${isDarkMode ? 'bg-indigo-600/20' : 'bg-indigo-100'}`}>
                <Shield className={`w-7 h-7 sm:w-8 sm:h-8 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Master Admin
              </h1>
            </div>
            <p className={`text-base sm:text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Please enter your credentials to sign in.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all font-medium
                    ${isDarkMode 
                      ? 'bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                      : 'bg-slate-50 border border-transparent text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:bg-slate-100'
                    }`}
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Password
                </label>
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
              className={`w-full py-3.5 sm:py-4 px-6 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 touch-manipulation min-h-[48px]
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
          </form>
        </div>
      </div>

      {/* --- Right Side: Visual Section --- */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 z-10 mix-blend-overlay" />
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1920&auto=format&fit=crop"
          alt="Admin dashboard"
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
              <Shield className="w-6 h-6 text-white" />
           </div>
           <blockquote className="text-2xl font-medium text-white leading-relaxed mb-4">
             "The best way to predict the future is to create it."
           </blockquote>
           <p className="text-slate-300 font-medium">
             — Peter Drucker
           </p>
        </div>
      </div>

    </div>
  );
};

export default MasterAdminLogin;
