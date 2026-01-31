import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import { 
  Home, 
  ArrowLeft, 
  AlertCircle,
  School
} from 'lucide-react';

const PageNotFound: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen w-full flex items-center justify-center px-4 ${
      isDarkMode ? 'bg-slate-950' : 'bg-white'
    }`}>
      <div className="max-w-3xl w-full">
        {/* Main Content */}
        <div className="text-center mb-12">
          {/* 404 Number */}
          <h1 className={`text-[12rem] sm:text-[16rem] font-black leading-none mb-4 ${
            isDarkMode ? 'text-slate-800' : 'text-slate-200'
          }`}>
            404
          </h1>

          {/* Icon */}
          <div className="mb-6">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
              isDarkMode 
                ? 'bg-indigo-600' 
                : 'bg-indigo-600'
            }`}>
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className={`text-4xl sm:text-5xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Page Not Found
          </h2>

          {/* Description */}
          <p className={`text-xl mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            The page you're looking for doesn't exist
          </p>
          <p className={`text-lg ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
            It might have been moved or the URL is incorrect
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            onClick={() => navigate(-1)}
            className={`group flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all ${
              isDarkMode
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          <Link
            to="/"
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all ${
              isDarkMode
                ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <Home className="w-5 h-5" />
            Go to Home
          </Link>
        </div>

        {/* Quick Links */}
        <div className={`text-center pt-8 border-t ${
          isDarkMode ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <School className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Quick Links
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/login"
              className={`text-base font-semibold transition-colors ${
                isDarkMode 
                  ? 'text-indigo-400 hover:text-indigo-300' 
                  : 'text-indigo-600 hover:text-indigo-700'
              }`}
            >
              Login
            </Link>
            <span className={`text-base ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>•</span>
            <Link
              to="/"
              className={`text-base font-semibold transition-colors ${
                isDarkMode 
                  ? 'text-indigo-400 hover:text-indigo-300' 
                  : 'text-indigo-600 hover:text-indigo-700'
              }`}
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
