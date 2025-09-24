import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useTeacherProfile } from '../../../contexts/TeacherProfileContext';
import { studentService } from '../../../services/studentService';
import { resultService } from '../../../services/resultService';
import { Student, StudentResult, CreateResultRequest, UpdateResultRequest, EXAM_TYPES, GRADE_SCALE } from '../../../models';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface StudentResultState {
  studentId: string;
  studentName: string;
  rollNo: string;
  email: string;
  className: string;
  results: StudentResult[];
}

// Shimmer Loading Components
const ShimmerCard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-300 dark:bg-gray-700 rounded-xl h-full"></div>
  </div>
);

const ShimmerTableRow: React.FC = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-8"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        <div className="ml-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-center">
      <div className="flex space-x-2">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </td>
  </tr>
);

// Result Modal Component
const ResultModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  result: StudentResult | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (resultData: CreateResultRequest | UpdateResultRequest) => void;
  isLoading: boolean;
  isDarkMode: boolean;
}> = ({ isOpen, onClose, student, result, mode, onSave, isLoading, isDarkMode }) => {
  const [formData, setFormData] = useState<CreateResultRequest>({
    studentId: '',
    examType: '',
    examName: '',
    examDate: '',
    subjects: [],
    remarks: ''
  });

  const [subjects, setSubjects] = useState([
    { subjectName: 'Mathematics', marksObtained: 0, totalMarks: 100 },
    { subjectName: 'Science', marksObtained: 0, totalMarks: 100 },
    { subjectName: 'English', marksObtained: 0, totalMarks: 100 },
    { subjectName: 'Social Studies', marksObtained: 0, totalMarks: 100 },
    { subjectName: 'Hindi', marksObtained: 0, totalMarks: 100 }
  ]);

  useEffect(() => {
    if (isOpen && student) {
      if (mode === 'edit' && result) {
        setFormData({
          studentId: result.studentId,
          examType: result.examType,
          examName: result.examName,
          examDate: result.examDate,
          subjects: result.subjects.map(s => ({
            subjectName: s.subjectName,
            marksObtained: s.marksObtained,
            totalMarks: s.totalMarks
          })),
          remarks: result.remarks || ''
        });
        setSubjects(result.subjects.map(s => ({
          subjectName: s.subjectName,
          marksObtained: s.marksObtained,
          totalMarks: s.totalMarks
        })));
      } else {
        setFormData({
          studentId: student.studentId,
          examType: '',
          examName: '',
          examDate: new Date().toISOString().split('T')[0],
          subjects: [],
          remarks: ''
        });
        setSubjects([
          { subjectName: 'Mathematics', marksObtained: 0, totalMarks: 100 },
          { subjectName: 'Science', marksObtained: 0, totalMarks: 100 },
          { subjectName: 'English', marksObtained: 0, totalMarks: 100 },
          { subjectName: 'Social Studies', marksObtained: 0, totalMarks: 100 },
          { subjectName: 'Hindi', marksObtained: 0, totalMarks: 100 }
        ]);
      }
    }
  }, [isOpen, student, result, mode]);

  const handleSubjectChange = (index: number, field: string, value: number) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
    setSubjects(updatedSubjects);
  };

  const calculateGrade = (percentage: number) => {
    const gradeInfo = GRADE_SCALE.find(g => percentage >= g.min && percentage <= g.max);
    return gradeInfo?.grade || 'F';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.examType || !formData.examName || !formData.examDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const resultData = {
      ...formData,
      subjects: subjects.map(s => ({
        subjectName: s.subjectName,
        marksObtained: s.marksObtained,
        totalMarks: s.totalMarks,
        grade: calculateGrade((s.marksObtained / s.totalMarks) * 100)
      }))
    };

    if (mode === 'edit' && result) {
      onSave({ ...resultData, resultId: result.resultId });
    } else {
      onSave(resultData);
    }
  };

  if (!isOpen) return null;

  const totalObtained = subjects.reduce((sum, s) => sum + s.marksObtained, 0);
  const totalMax = subjects.reduce((sum, s) => sum + s.totalMarks, 0);
  const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const overallGrade = calculateGrade(percentage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {mode === 'add' ? 'Add Result' : mode === 'edit' ? 'Edit Result' : 'View Result'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {student?.name} - {student?.rollNo}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exam Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exam Type *
              </label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                required
              >
                <option value="">Select Exam Type</option>
                {EXAM_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exam Name *
              </label>
              <input
                type="text"
                value={formData.examName}
                onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                placeholder="e.g., Mid Term Exam 2024"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exam Date *
              </label>
              <input
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                required
              />
            </div>
          </div>

          {/* Subjects Table */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Subject Marks</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Marks Obtained
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Marks
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {subjects.map((subject, index) => {
                    const subjectPercentage = subject.totalMarks > 0 ? (subject.marksObtained / subject.totalMarks) * 100 : 0;
                    const subjectGrade = calculateGrade(subjectPercentage);
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {subject.subjectName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="number"
                            min="0"
                            max={subject.totalMarks}
                            value={subject.marksObtained}
                            onChange={(e) => handleSubjectChange(index, 'marksObtained', parseInt(e.target.value) || 0)}
                            disabled={mode === 'view'}
                            className="w-20 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="number"
                            min="1"
                            value={subject.totalMarks}
                            onChange={(e) => handleSubjectChange(index, 'totalMarks', parseInt(e.target.value) || 100)}
                            disabled={mode === 'view'}
                            className="w-20 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                          {subjectPercentage.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            subjectGrade === 'A+' || subjectGrade === 'A' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : subjectGrade === 'B+' || subjectGrade === 'B'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : subjectGrade === 'C+' || subjectGrade === 'C'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : subjectGrade === 'D'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {subjectGrade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overall Summary */}
          <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Overall Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Obtained</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{totalObtained}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Maximum</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{totalMax}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Percentage</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{percentage.toFixed(2)}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Overall Grade</p>
                <p className={`text-xl font-bold ${
                  overallGrade === 'A+' || overallGrade === 'A' 
                    ? 'text-green-600 dark:text-green-400'
                    : overallGrade === 'B+' || overallGrade === 'B'
                    ? 'text-blue-600 dark:text-blue-400'
                    : overallGrade === 'C+' || overallGrade === 'C'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : overallGrade === 'D'
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {overallGrade}
                </p>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              disabled={mode === 'view'}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              placeholder="Add any additional remarks or comments..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              {mode === 'view' ? 'Close' : 'Cancel'}
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    {mode === 'add' ? 'Adding...' : 'Updating...'}
                  </>
                ) : (
                  mode === 'add' ? 'Add Result' : 'Update Result'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const StudentResults: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { teacherProfile } = useTeacherProfile();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentResults, setStudentResults] = useState<StudentResultState[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [showModal, setShowModal] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        if (user?.schoolId && user?.classId) {
          // Load students and their results
          const studentsResponse = await studentService.getStudentsByClass(user.schoolId, user.classId);
          
          let studentsData: Student[] = [];
          if (Array.isArray(studentsResponse)) {
            studentsData = studentsResponse;
          } else if (studentsResponse.success && Array.isArray(studentsResponse.students)) {
            studentsData = studentsResponse.students;
          } else {
            console.error('Unexpected students response format:', studentsResponse);
            toast.error('Failed to load students');
            return;
          }

          setStudents(studentsData);

          // Load results for each student
          const resultsData: StudentResultState[] = [];
          for (const student of studentsData) {
            try {
              const studentResultsResponse = await resultService.getResultsByStudent(user.schoolId, student.studentId);
              const results = Array.isArray(studentResultsResponse) ? studentResultsResponse : 
                            (studentResultsResponse.success ? studentResultsResponse.results : []);
              
              resultsData.push({
                studentId: student.studentId,
                studentName: student.name,
                rollNo: student.rollNo || '',
                email: student.email || '',
                className: student.className || '',
                results: results
              });
            } catch (error) {
              // If no results found for student, add empty results array
              resultsData.push({
                studentId: student.studentId,
                studentName: student.name,
                rollNo: student.rollNo || '',
                email: student.email || '',
                className: student.className || '',
                results: []
              });
            }
          }

          setStudentResults(resultsData);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user?.schoolId, user?.classId]);

  const handleAddResult = (student: Student) => {
    setSelectedStudent(student);
    setSelectedResult(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleEditResult = (student: Student, result: StudentResult) => {
    setSelectedStudent(student);
    setSelectedResult(result);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewResult = (student: Student, result: StudentResult) => {
    setSelectedStudent(student);
    setSelectedResult(result);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDeleteResult = async (student: Student, result: StudentResult) => {
    if (!user?.schoolId) return;
    
    if (window.confirm(`Are you sure you want to delete the result for ${result.examName}?`)) {
      try {
        await resultService.deleteResult(user.schoolId, result.resultId);
        toast.success('Result deleted successfully!');
        
        // Refresh results for this student
        const studentResultsResponse = await resultService.getResultsByStudent(user.schoolId, student.studentId);
        const updatedResults = Array.isArray(studentResultsResponse) ? studentResultsResponse : 
                              (studentResultsResponse.success ? studentResultsResponse.results : []);
        
        setStudentResults(prev => 
          prev.map(sr => 
            sr.studentId === student.studentId 
              ? { ...sr, results: updatedResults }
              : sr
          )
        );
      } catch (error) {
        console.error('Error deleting result:', error);
        toast.error('Failed to delete result');
      }
    }
  };

  const handleModalSave = async (resultData: CreateResultRequest | UpdateResultRequest) => {
    if (!user?.schoolId || !selectedStudent) return;

    setIsModalLoading(true);
    try {
      if (modalMode === 'add') {
        await resultService.createResult(user.schoolId, resultData as CreateResultRequest);
        toast.success('Result added successfully!');
      } else if (modalMode === 'edit') {
        await resultService.updateResult(user.schoolId, (resultData as UpdateResultRequest).resultId, resultData as UpdateResultRequest);
        toast.success('Result updated successfully!');
      }

      // Refresh results for this student
      const studentResultsResponse = await resultService.getResultsByStudent(user.schoolId, selectedStudent.studentId);
      const updatedResults = Array.isArray(studentResultsResponse) ? studentResultsResponse : 
                            (studentResultsResponse.success ? studentResultsResponse.results : []);
      
      setStudentResults(prev => 
        prev.map(sr => 
          sr.studentId === selectedStudent.studentId 
            ? { ...sr, results: updatedResults }
            : sr
        )
      );

      setShowModal(false);
    } catch (error) {
      console.error('Error saving result:', error);
      toast.error(modalMode === 'add' ? 'Failed to add result' : 'Failed to update result');
    } finally {
      setIsModalLoading(false);
    }
  };

  const filteredStudentResults = studentResults.filter(sr => {
    const matchesSearch = sr.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sr.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sr.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!selectedExamType) return matchesSearch;
    
    const hasExamType = sr.results.some(result => result.examType === selectedExamType);
    return matchesSearch && hasExamType;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Shimmer */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg w-36 animate-pulse"></div>
          </div>
        </div>

        {/* Filters Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ShimmerCard className="h-10" />
          <ShimmerCard className="h-10" />
        </div>

        {/* Table Shimmer */}
        <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Results Count</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(5)].map((_, index) => (
                  <ShimmerTableRow key={index} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Results</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track student examination results</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              // Download results report functionality can be added here
              toast.info('Report download feature coming soon!');
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          />
        </div>
        <div>
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <option value="">All Exam Types</option>
            {EXAM_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Students & Results</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Roll No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Results Count
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudentResults.map((studentResult) => {
                const student = students.find(s => s.studentId === studentResult.studentId);
                if (!student) return null;

                return (
                  <tr key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {studentResult.rollNo || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                          {studentResult.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {studentResult.studentName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {studentResult.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {studentResult.className}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        studentResult.results.length > 0
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {studentResult.results.length}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleAddResult(student)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add
                        </button>
                        
                        {studentResult.results.length > 0 && (
                          <div className="relative inline-block text-left">
                            <select
                              onChange={(e) => {
                                const [action, resultIndex] = e.target.value.split('-');
                                if (action && resultIndex) {
                                  const result = studentResult.results[parseInt(resultIndex)];
                                  if (action === 'view') {
                                    handleViewResult(student, result);
                                  } else if (action === 'edit') {
                                    handleEditResult(student, result);
                                  } else if (action === 'delete') {
                                    handleDeleteResult(student, result);
                                  }
                                }
                                e.target.value = ''; // Reset select
                              }}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                              <option value="">Manage Results</option>
                              {studentResult.results.map((result, index) => (
                                <optgroup key={result.resultId} label={`${result.examName} (${result.examType})`}>
                                  <option value={`view-${index}`}>📄 View</option>
                                  <option value={`edit-${index}`}>✏️ Edit</option>
                                  <option value={`delete-${index}`}>🗑️ Delete</option>
                                </optgroup>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudentResults.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No students found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || selectedExamType ? 'No students match your search criteria.' : 'No students are enrolled in this class.'}
            </p>
          </div>
        )}
      </div>

      {/* Result Modal */}
      <ResultModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        student={selectedStudent}
        result={selectedResult}
        mode={modalMode}
        onSave={handleModalSave}
        isLoading={isModalLoading}
        isDarkMode={isDarkMode}
      />
      
      {/* Toast Container */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? 'dark' : 'light'}
      />
    </div>
  );
};

export default StudentResults;

// adding full support for Edit Result, View Result, and Delete Result. For Edit, allow selecting a specific result, updating its details, and also provide an option to delete individual subject details inside that result. For View, display all results in an expandable panel where each student’s result can be expanded to show full details in a clean, elegant layout. For Delete, show a list of all results with checkboxes or selection controls so multiple results can be selected and deleted. Make the dialogs and expand panels elegant, modern, and consistent with the design system used in @StudentAttendance.tsx. Ensure smooth user interaction and responsive design.
