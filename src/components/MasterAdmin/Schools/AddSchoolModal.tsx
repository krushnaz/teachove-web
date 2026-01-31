import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { School } from '../../../services/masterAdminSchoolService';
import { masterAdminAcademicYearService, AcademicYear } from '../../../services/masterAdminAcademicYearService';
import { X } from 'lucide-react';

interface AddSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (school: Partial<School>) => Promise<void>;
  loading: boolean;
}

const AddSchoolModal: React.FC<AddSchoolModalProps> = ({ isOpen, onClose, onAdd, loading }) => {
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    schoolName: '',
    phoneNo: '',
    password: '',
    currentAcademicYear: '',
  });
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(false);

  // Fetch academic years from API
  useEffect(() => {
    if (isOpen) {
      fetchAcademicYears();
    }
  }, [isOpen]);

  const fetchAcademicYears = async () => {
    try {
      setLoadingAcademicYears(true);
      const years = await masterAdminAcademicYearService.getAcademicYears();
      setAcademicYears(years);
      
      // Set default to active academic year or first one
      if (years.length > 0) {
        const activeYear = years.find(ay => ay.isActive);
        setFormData(prev => ({
          ...prev,
          currentAcademicYear: activeYear?.academicYear || years[0].academicYear
        }));
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
      // Fallback to generated years if API fails
      const currentYear = new Date().getFullYear();
      const fallbackYears: AcademicYear[] = [];
      for (let i = -1; i <= 5; i++) {
        const startYear = currentYear + i;
        const endYear = startYear + 1;
        fallbackYears.push({
          academicYear: `${startYear}-${endYear}`,
          startYear,
          endYear,
          isActive: false
        });
      }
      setAcademicYears(fallbackYears);
      if (fallbackYears.length > 0) {
        setFormData(prev => ({
          ...prev,
          currentAcademicYear: fallbackYears[0].academicYear
        }));
      }
    } finally {
      setLoadingAcademicYears(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd(formData);
    // Reset form on success - academic year will be set by useEffect when modal reopens
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Add New School
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* School Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              School Name *
            </label>
            <input
              type="text"
              required
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
              }`}
              placeholder="Enter school name"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phoneNo}
              onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
              }`}
              placeholder="Enter phone number"
            />
          </div>

          {/* Password */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Password *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
              }`}
              placeholder="Enter password"
            />
          </div>

          {/* Academic Year */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Academic Year
            </label>
            {loadingAcademicYears ? (
              <div className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-400'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              }`}>
                Loading academic years...
              </div>
            ) : (
              <select
                value={formData.currentAcademicYear}
                onChange={(e) => setFormData({ ...formData, currentAcademicYear: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
                required
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year.id || year.academicYearId || year.academicYear} value={year.academicYear}>
                    {year.academicYear} {year.isActive ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Footer */}
          <div className={`flex justify-end gap-3 pt-4 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                loading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? 'Adding...' : 'Add School'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSchoolModal;
