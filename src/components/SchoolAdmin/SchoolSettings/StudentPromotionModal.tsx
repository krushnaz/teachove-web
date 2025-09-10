import React, { useState } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { 
  X, 
  GraduationCap, 
  Users, 
  CheckCircle, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface StudentPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudentPromotionModal: React.FC<StudentPromotionModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useDarkMode();
  const [currentYear] = useState('2023-24');
  const [nextYear] = useState('2024-25');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const classes = [
    { id: 'grade-1', name: 'Grade 1', studentCount: 25 },
    { id: 'grade-2', name: 'Grade 2', studentCount: 28 },
    { id: 'grade-3', name: 'Grade 3', studentCount: 30 },
    { id: 'grade-4', name: 'Grade 4', studentCount: 27 },
    { id: 'grade-5', name: 'Grade 5', studentCount: 32 },
    { id: 'grade-6', name: 'Grade 6', studentCount: 29 },
    { id: 'grade-7', name: 'Grade 7', studentCount: 31 },
    { id: 'grade-8', name: 'Grade 8', studentCount: 26 },
    { id: 'grade-9', name: 'Grade 9', studentCount: 33 },
    { id: 'grade-10', name: 'Grade 10', studentCount: 28 },
  ];

  const handleClassToggle = (classId: string) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSelectAll = () => {
    setSelectedClasses(classes.map(c => c.id));
  };

  const handleDeselectAll = () => {
    setSelectedClasses([]);
  };

  const handlePromote = async () => {
    if (selectedClasses.length === 0) {
      setError('Please select at least one class to promote');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      setSuccess(`Successfully promoted ${selectedClasses.length} classes to ${nextYear} academic year`);
      
      // Close modal after success
      setTimeout(() => {
        onClose();
        setSelectedClasses([]);
      }, 2000);
    } catch (error) {
      setError('Failed to promote students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                <GraduationCap className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Student Promotion
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Promote students to the next academic year
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

          {/* Academic Year Selection */}
          <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Current Academic Year
                </label>
                <div className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                  {currentYear}
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <ArrowRight className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`} />
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Promote to</span>
              </div>
              
              <div className="text-center">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Next Academic Year
                </label>
                <div className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                  {nextYear}
                </div>
              </div>
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

          {/* Class Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Select Classes to Promote
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                      : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  Select All
                </button>
                <button
                  onClick={handleDeselectAll}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  onClick={() => handleClassToggle(classItem.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedClasses.includes(classItem.id)
                      ? isDarkMode
                        ? 'bg-blue-900/20 border-blue-700/30'
                        : 'bg-blue-50 border-blue-200'
                      : isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        selectedClasses.includes(classItem.id)
                          ? isDarkMode
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-blue-500 border-blue-500'
                          : isDarkMode
                          ? 'border-gray-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedClasses.includes(classItem.id) && (
                          <CheckCircle className={`w-3 h-3 ${isDarkMode ? 'text-white' : 'text-white'}`} />
                        )}
                      </div>
                      <div>
                        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {classItem.name}
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {classItem.studentCount} students
                        </p>
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                      <Users className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          {selectedClasses.length > 0 && (
            <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Promotion Summary
              </h4>
              <div className="flex items-center gap-4 text-sm">
                <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className="font-medium">{selectedClasses.length}</span> classes selected
                </div>
                <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className="font-medium">
                    {selectedClasses.reduce((total, classId) => {
                      const classItem = classes.find(c => c.id === classId);
                      return total + (classItem?.studentCount || 0);
                    }, 0)}
                  </span> students will be promoted
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handlePromote}
              disabled={loading || selectedClasses.length === 0}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                loading || selectedClasses.length === 0
                  ? `${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'} cursor-not-allowed`
                  : `${isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`
              }`}
            >
              {loading ? 'Promoting Students...' : 'Promote Students'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPromotionModal;
