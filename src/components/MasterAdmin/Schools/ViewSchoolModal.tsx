import React from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { School } from '../../../services/masterAdminSchoolService';
import { X, School as SchoolIcon, Mail, Phone, MapPin, Calendar, Building, CheckCircle, XCircle } from 'lucide-react';

interface ViewSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
}

const ViewSchoolModal: React.FC<ViewSchoolModalProps> = ({ isOpen, onClose, school }) => {
  const { isDarkMode } = useDarkMode();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
            {school.logo ? (
              <img
                src={school.logo}
                alt={school.schoolName}
                className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className={`p-2 rounded-lg ${
                school.isActive
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <SchoolIcon className={`w-6 h-6 ${
                  school.isActive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-400'
                }`} />
              </div>
            )}
            <div className="min-w-0">
              <h2 className={`text-lg sm:text-2xl font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {school.schoolName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {school.isActive ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                    <XCircle className="w-3 h-3" />
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Information */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Building className={`w-5 h-5 mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    School Type
                  </p>
                  <p className={`mt-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {school.type || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className={`w-5 h-5 mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Email
                  </p>
                  <p className={`mt-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {school.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className={`w-5 h-5 mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Phone Number
                  </p>
                  <p className={`mt-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {school.phoneNo}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className={`w-5 h-5 mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Academic Year
                  </p>
                  <p className={`mt-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {school.currentAcademicYear || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          {(school.city || school.state || school.pincode || school.line1) && (
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Address
              </h3>
              <div className="flex items-start gap-3">
                <MapPin className={`w-5 h-5 mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <div className="space-y-1">
                  {school.line1 && (
                    <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {school.line1}
                    </p>
                  )}
                  {(school.city || school.state) && (
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {school.city}{school.city && school.state ? ', ' : ''}{school.state}
                    </p>
                  )}
                  {school.pincode && (
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Pincode: {school.pincode}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* School ID */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              System Information
            </h3>
            <div className="flex items-start gap-3">
              <div>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  School ID
                </p>
                <p className={`mt-1 font-mono text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {school.id || school.schoolId || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex justify-end gap-3 p-4 sm:p-6 border-t sticky bottom-0 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-colors touch-manipulation min-h-[44px] w-full sm:w-auto ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSchoolModal;
