import React, { useState, useEffect, useCallback } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { questionPapersService, Class, QuestionPaper } from '../../../services/questionPapersService';
import { schoolService } from '../../../services/schoolService';
import { API_CONFIG } from '../../../config/api';

const QuestionPapers: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  
  const [currentView, setCurrentView] = useState<'classes' | 'test-types' | 'papers'>('classes');
  const [classes, setClasses] = useState<Class[]>([]);
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [papersLoading, setPapersLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedTestType, setSelectedTestType] = useState<string>('');
  const [selectedPaperForDownload, setSelectedPaperForDownload] = useState<QuestionPaper | null>(null);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [downloadSchoolName, setDownloadSchoolName] = useState('School Name');
  const [downloadSchoolLogo, setDownloadSchoolLogo] = useState<File | null>(null);
  const [downloadSchoolLogoUrl, setDownloadSchoolLogoUrl] = useState<string>('');
  
  // Test types
  const testTypes = [
    { 
      id: 'Unit Test 1', 
      label: 'Unit Test 1', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ), 
      color: 'from-blue-500 to-blue-600' 
    },
    { 
      id: 'Unit Test 2', 
      label: 'Unit Test 2', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ), 
      color: 'from-green-500 to-green-600' 
    },
    { 
      id: 'First Term', 
      label: 'First Term', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ), 
      color: 'from-purple-500 to-purple-600' 
    },
    { 
      id: 'Second Term', 
      label: 'Second Term', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ), 
      color: 'from-orange-500 to-orange-600' 
    },
  ];

  // Load classes on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const classesResponse = await questionPapersService.getClasses();
        setClasses(classesResponse.classes || []);
      } catch (error) {
        console.error('Error loading classes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const loadPapers = useCallback(async () => {
    if (!selectedClass || !selectedTestType) return;
    
    try {
      setPapersLoading(true);
      const papersResponse = await questionPapersService.getQuestionPapers(selectedClass.classId, selectedTestType);
      setPapers(papersResponse.papers || []);
    } catch (error: any) {
      console.error('Error loading papers:', error);
      // Handle 404 gracefully - no papers available
      if (error.response?.status === 404) {
        setPapers([]);
      }
    } finally {
      setPapersLoading(false);
    }
  }, [selectedClass, selectedTestType]);

  // Load papers when test type is selected
  useEffect(() => {
    if (selectedClass && selectedTestType) {
      loadPapers();
    }
  }, [selectedClass, selectedTestType, loadPapers]);

  const handleClassSelect = (classItem: Class) => {
    setSelectedClass(classItem);
    setCurrentView('test-types');
  };

  const openDownloadDialog = (paper: QuestionPaper) => {
    setSelectedPaperForDownload(paper);
    setIsDownloadDialogOpen(true);
  };

  const handleDownloadLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        const errorToast = document.createElement('div');
        errorToast.className = `${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
        errorToast.textContent = 'Please select a PNG or JPG image file.';
        document.body.appendChild(errorToast);
        setTimeout(() => document.body.removeChild(errorToast), 3000);
        return;
      }
      
      setDownloadSchoolLogo(file);
      const url = URL.createObjectURL(file);
      setDownloadSchoolLogoUrl(url);
    }
  };

  const handleDownloadLogoRemove = () => {
    setDownloadSchoolLogo(null);
    setDownloadSchoolLogoUrl('');
  };

  const handleTestTypeSelect = (testType: string) => {
    setSelectedTestType(testType);
    setCurrentView('papers');
  };

  const handleBack = () => {
    if (currentView === 'papers') {
      setCurrentView('test-types');
      setPapers([]);
      setSelectedTestType('');
    } else if (currentView === 'test-types') {
      setCurrentView('classes');
      setSelectedClass(null);
    }
  };

  // Handle PDF download using backend API with FormData
  const handleDownload = async (paper: QuestionPaper) => {
    if (!selectedClass) return;
    
    try {
      // Show loading toast
      const loadingToast = document.createElement('div');
      loadingToast.className = `fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg ${isDarkMode ? 'bg-blue-900 text-blue-200 border-blue-700' : 'bg-blue-50 text-blue-700 border-blue-200'} border`;
      loadingToast.textContent = 'Preparing download...';
      document.body.appendChild(loadingToast);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('schoolName', downloadSchoolName);
      
      // Add logo file if available
      if (downloadSchoolLogo) {
        formData.append('schoolLogo', downloadSchoolLogo);
      }
      
      // Make API call to download PDF
      const apiUrl = `${API_CONFIG.BASE_URL}/question-papers/${selectedClass.classId}/${selectedTestType}/${paper.paperId}/download`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData, // Send as FormData instead of JSON
      });
      
      if (!response.ok) {
        // Try to parse error response
        try {
          const errorData = await response.json();
          if (errorData.error === 'Logo must be PNG or JPG') {
            throw new Error('Logo must be PNG or JPG');
          }
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      // Get the PDF blob from response
      const pdfBlob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${downloadSchoolName || 'School'}_${paper.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Remove loading toast and show success
      document.body.removeChild(loadingToast);
      const successToast = document.createElement('div');
      successToast.className = `${isDarkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-50 text-green-700 border-green-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
      successToast.textContent = 'Download completed successfully!';
      document.body.appendChild(successToast);
      setTimeout(() => document.body.removeChild(successToast), 3000);
      
      // Close dialog
      setIsDownloadDialogOpen(false);
    } catch (error: any) {
      console.error('Download error:', error);
      
      // Remove loading toast if it exists
      const existingToast = document.querySelector('.fixed.bottom-6.right-6');
      if (existingToast) {
        document.body.removeChild(existingToast);
      }
      
      // Show error toast
      const errorToast = document.createElement('div');
      errorToast.className = `${isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'} fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg border`;
      errorToast.textContent = error.message || 'Download failed. Please try again.';
      document.body.appendChild(errorToast);
      setTimeout(() => document.body.removeChild(errorToast), 3000);
    }
  };

  // Format date from Firestore timestamp
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    if (timestamp._seconds) {
      const date = new Date(timestamp._seconds * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    
    return 'N/A';
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Add shimmer animation styles */}
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: calc(200px + 100%) 0; }
          }
          .shimmer {
            background: linear-gradient(90deg, 
              transparent, 
              ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}, 
              transparent
            );
            background-size: 200px 100%;
            animation: shimmer 1.5s infinite ease-in-out;
          }
        `}
      </style>

      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              {currentView !== 'classes' && (
                <button
                  onClick={handleBack}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {currentView === 'classes' && 'Question Papers'}
                  {currentView === 'test-types' && `${selectedClass?.className} - Test Types`}
                  {currentView === 'papers' && `${selectedClass?.className} - ${selectedTestType}`}
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {currentView === 'classes' && 'Select a class to view question papers'}
                  {currentView === 'test-types' && 'Choose a test type to view papers'}
                  {currentView === 'papers' && `Question papers for ${selectedTestType}`}
                </p>
              </div>
            </div>

            {/* Breadcrumb */}
            {(currentView === 'test-types' || currentView === 'papers') && (
              <div className="flex items-center gap-2 text-sm">
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Question Papers</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {currentView === 'papers' && (
                  <>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedClass?.className}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
                <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                  {currentView === 'test-types' ? selectedClass?.className : selectedTestType}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content based on current view */}
        {currentView === 'classes' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                        <div>
                          <div className={`h-6 w-24 rounded mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                          <div className={`h-4 w-32 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : classes.length === 0 ? (
              <div className={`p-12 text-center rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  No classes found
                </h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Classes will appear here once they are available.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((classItem) => (
                  <div
                    key={classItem.classId}
                    onClick={() => handleClassSelect(classItem)}
                    className={`p-6 rounded-xl shadow-lg border cursor-pointer transition-all duration-300 hover:shadow-xl ${
                      isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg`}>
                          {classItem.className.charAt(0)}
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {classItem.className}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatDate(classItem.createdAt)}
                          </p>
                        </div>
                      </div>
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'test-types' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testTypes.map((testType) => (
                <div
                  key={testType.id}
                  onClick={() => handleTestTypeSelect(testType.id)}
                  className={`p-6 rounded-xl shadow-lg border cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 hover:border-blue-500' 
                      : 'bg-white border-gray-200 hover:border-blue-500'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${testType.color} flex items-center justify-center text-white mx-auto mb-4`}>
                      {testType.icon}
                    </div>
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                      {testType.label}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Question Papers
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'papers' && (
          <div>
            {papersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className={`h-5 w-3/4 rounded mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                        <div className={`h-4 w-full rounded mb-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                        <div className={`h-4 w-2/3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                      </div>
                    </div>
                    <div className={`h-4 w-20 rounded mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                    <div className="flex gap-2">
                      <div className={`h-10 w-20 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                      <div className={`h-10 w-16 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} shimmer`}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : papers.length === 0 ? (
              <div className={`p-12 text-center rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  No question papers found
                </h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No papers are available for {selectedTestType} in {selectedClass?.className}.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {papers.map((paper) => (
                  <div
                    key={paper.paperId}
                    className={`p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                          {paper.name}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                          {paper.type} • {selectedClass?.className}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Uploaded: {formatDate(paper.uploadedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(paper.fileUrl, '_blank')}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                          isDarkMode 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                      <button
                        onClick={() => openDownloadDialog(paper)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      {/* Download Dialog */}
      {isDownloadDialogOpen && selectedPaperForDownload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsDownloadDialogOpen(false)}></div>
          <div className={`relative w-full max-w-md mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl`}>
            <div className="flex flex-col">
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Download Options
                </h2>
                <button
                  onClick={() => setIsDownloadDialogOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* School Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    School Name
                  </label>
                  <input
                    type="text"
                    value={downloadSchoolName}
                    onChange={(e) => setDownloadSchoolName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter school name"
                  />
                </div>

                {/* School Logo */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    School Logo (Optional)
                  </label>
                  <div className="space-y-2">
                    {downloadSchoolLogoUrl ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={downloadSchoolLogoUrl}
                          alt="School Logo Preview"
                          className="w-12 h-12 rounded-lg object-cover border border-gray-300"
                        />
                        <button
                          onClick={handleDownloadLogoRemove}
                          className={`p-1 rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-900' 
                              : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleDownloadLogoUpload}
                          className="hidden"
                          id="download-logo-upload"
                        />
                        <label
                          htmlFor="download-logo-upload"
                          className={`px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                            isDarkMode 
                              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                        >
                          Choose Logo
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setIsDownloadDialogOpen(false)}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDownload(selectedPaperForDownload)}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors text-center ${
                      isDarkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default QuestionPapers;
