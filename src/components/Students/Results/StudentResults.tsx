import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { resultService } from '../../../services/resultService';
import { CircularProgress } from '@mui/material';

interface Subject {
  subjectName: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
}

interface Result {
  id: string;
  schoolId: string;
  classId: string;
  studentId: string;
  examType: string;
  examName: string;
  examDate: string;
  subjects: Subject[];
  totalObtained: number;
  totalMaximum: number;
  percentage: number;
  overallGrade: string;
  remarks?: string;
  createdAt: string;
}

// Shimmer Loading Components
const ShimmerCard: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
    <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
    <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
  </div>
);

const StudentResults: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Extract unique academic years from results
  const getAcademicYears = () => {
    const years = results.map(result => {
      const date = new Date(result.examDate);
      const year = date.getFullYear();
      // Academic year logic: April to March
      const month = date.getMonth();
      if (month >= 3) { // April onwards
        return `${year}-${year + 1}`;
      } else { // January to March
        return `${year - 1}-${year}`;
      }
    });
    return ['all', ...Array.from(new Set(years)).sort().reverse()];
  };

  const academicYears = getAcademicYears();

  useEffect(() => {
    loadResults();
  }, [user?.schoolId, user?.studentId, user?.classId]);

  useEffect(() => {
    filterResults();
  }, [selectedYear, results]);

  const loadResults = async () => {
    if (!user?.schoolId || !user?.studentId || !user?.classId) return;
    
    try {
      setLoading(true);
      const response = await resultService.getResultsByStudent(
        user.schoolId,
        user.studentId,
        user.classId
      );
      
      const resultsData = Array.isArray(response) ? response : response?.results || [];
      setResults(resultsData);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    if (selectedYear === 'all') {
      setFilteredResults(results);
    } else {
      const filtered = results.filter(result => {
        const date = new Date(result.examDate);
        const year = date.getFullYear();
        const month = date.getMonth();
        let academicYear;
        if (month >= 3) {
          academicYear = `${year}-${year + 1}`;
        } else {
          academicYear = `${year - 1}-${year}`;
        }
        return academicYear === selectedYear;
      });
      setFilteredResults(filtered);
    }
  };

  const handleDownload = async (resultId: string) => {
    if (!user?.schoolId) return;
    
    try {
      setDownloading(resultId);
      const blob = await resultService.downloadStudentResult(user.schoolId, resultId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `result-${resultId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading result:', error);
      alert('Failed to download result. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeUpper = grade.toUpperCase();
    if (gradeUpper === 'A' || gradeUpper === 'A+') return isDarkMode ? 'text-green-400' : 'text-green-600';
    if (gradeUpper === 'B' || gradeUpper === 'B+') return isDarkMode ? 'text-blue-400' : 'text-blue-600';
    if (gradeUpper === 'C' || gradeUpper === 'C+') return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
    if (gradeUpper === 'D') return isDarkMode ? 'text-orange-400' : 'text-orange-600';
    return isDarkMode ? 'text-red-400' : 'text-red-600';
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return isDarkMode ? 'text-green-400' : 'text-green-600';
    if (percentage >= 75) return isDarkMode ? 'text-blue-400' : 'text-blue-600';
    if (percentage >= 60) return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
    if (percentage >= 40) return isDarkMode ? 'text-orange-400' : 'text-orange-600';
    return isDarkMode ? 'text-red-400' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        <ShimmerCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Results</h1>
          <p className="text-gray-600 dark:text-gray-400">View your academic performance</p>
        </div>
        
        {/* Academic Year Filter */}
        <div className="flex items-center gap-3">
          <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Academic Year:
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            }`}
          >
            <option value="all">All Years</option>
            {academicYears.filter(y => y !== 'all').map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results List */}
      {filteredResults.length === 0 ? (
        <div className={`rounded-xl p-12 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <svg className={`mx-auto h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            No results found
          </h3>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {selectedYear === 'all' ? 'No exam results available yet.' : `No results for academic year ${selectedYear}.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredResults.map((result) => (
            <div
              key={result.id}
              className={`rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
                isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Result Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {result.examName}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${
                      isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {result.examType}
                    </span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(result.examDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
                
                {/* Overall Performance */}
                <div className="flex items-center gap-4">
                  <div className={`text-center px-6 py-4 rounded-xl ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className={`text-3xl font-bold ${getPercentageColor(result.percentage)}`}>
                      {result.percentage.toFixed(1)}%
                    </div>
                    <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {result.totalObtained}/{result.totalMaximum}
                    </div>
                  </div>
                  <div className={`text-center px-6 py-4 rounded-xl ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className={`text-3xl font-bold ${getGradeColor(result.overallGrade)}`}>
                      {result.overallGrade}
                    </div>
                    <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Grade
                    </div>
                  </div>
                </div>
              </div>

              {/* Subjects Table */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`text-left py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Subject
                      </th>
                      <th className={`text-center py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Marks Obtained
                      </th>
                      <th className={`text-center py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Total Marks
                      </th>
                      <th className={`text-center py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Percentage
                      </th>
                      <th className={`text-center py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.subjects.map((subject, index) => (
                      <tr
                        key={index}
                        className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} hover:${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors`}
                      >
                        <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                          {subject.subjectName}
                        </td>
                        <td className={`py-3 px-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {subject.marksObtained}
                        </td>
                        <td className={`py-3 px-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {subject.totalMarks}
                        </td>
                        <td className={`py-3 px-4 text-center font-semibold ${getPercentageColor(subject.percentage)}`}>
                          {subject.percentage.toFixed(1)}%
                        </td>
                        <td className={`py-3 px-4 text-center font-bold text-lg ${getGradeColor(subject.grade)}`}>
                          {subject.grade}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Remarks and Actions */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {result.remarks && (
                  <div className="flex items-start gap-2">
                    <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Teacher's Remarks:
                      </span>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {result.remarks}
                      </p>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => handleDownload(result.id)}
                  disabled={downloading === result.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    downloading === result.id
                      ? isDarkMode
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {downloading === result.id ? (
                    <>
                      <CircularProgress size={16} color="inherit" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentResults;

