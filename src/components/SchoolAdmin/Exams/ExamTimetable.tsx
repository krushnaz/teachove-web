import React, { useState } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import SchoolAdminLayout from '../Layout';

interface Subject {
  id: string;
  name: string;
  examDate: string;
  examTime: string;
}

interface ExamTimetable {
  id: string;
  examName: string;
  className: string;
  startDate: string;
  endDate: string;
  subjects: Subject[];
}

const ExamTimetable: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timetables, setTimetables] = useState<ExamTimetable[]>([]);
  const [selectedTimetable, setSelectedTimetable] = useState<ExamTimetable | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  // Form state for new timetable
  const [formData, setFormData] = useState({
    examName: '',
    className: '',
    startDate: '',
    endDate: ''
  });

  // Form state for new subject
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    examDate: '',
    examTime: ''
  });

  const classOptions = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11', 'Class 12'
  ];

  const handleAddTimetable = () => {
    if (!formData.examName || !formData.className || !formData.startDate || !formData.endDate) {
      alert('Please fill all fields');
      return;
    }

    const newTimetable: ExamTimetable = {
      id: Date.now().toString(),
      examName: formData.examName,
      className: formData.className,
      startDate: formData.startDate,
      endDate: formData.endDate,
      subjects: []
    };

    setTimetables([...timetables, newTimetable]);
    setFormData({ examName: '', className: '', startDate: '', endDate: '' });
    setIsSidebarOpen(false);
  };

  const handleAddSubject = (timetableId: string) => {
    if (!subjectForm.name || !subjectForm.examDate || !subjectForm.examTime) {
      alert('Please fill all subject fields');
      return;
    }

    const newSubject: Subject = {
      id: Date.now().toString(),
      name: subjectForm.name,
      examDate: subjectForm.examDate,
      examTime: subjectForm.examTime
    };

    setTimetables(timetables.map(timetable => 
      timetable.id === timetableId 
        ? { ...timetable, subjects: [...timetable.subjects, newSubject] }
        : timetable
    ));

    setSubjectForm({ name: '', examDate: '', examTime: '' });
  };

  const handleDeleteSubject = (timetableId: string, subjectId: string) => {
    setTimetables(timetables.map(timetable => 
      timetable.id === timetableId 
        ? { ...timetable, subjects: timetable.subjects.filter(subject => subject.id !== subjectId) }
        : timetable
    ));
  };

  const handleDeleteSelectedSubjects = (timetableId: string) => {
    if (selectedSubjects.length === 0) {
      alert('Please select subjects to delete');
      return;
    }

    setTimetables(timetables.map(timetable => 
      timetable.id === timetableId 
        ? { ...timetable, subjects: timetable.subjects.filter(subject => !selectedSubjects.includes(subject.id)) }
        : timetable
    ));
    setSelectedSubjects([]);
  };

  const handleDeleteAllSubjects = (timetableId: string) => {
    setTimetables(timetables.map(timetable => 
      timetable.id === timetableId 
        ? { ...timetable, subjects: [] }
        : timetable
    ));
    setSelectedSubjects([]);
  };

  const handleDeleteTimetable = (timetableId: string) => {
    setTimetables(timetables.filter(timetable => timetable.id !== timetableId));
    if (selectedTimetable?.id === timetableId) {
      setSelectedTimetable(null);
    }
  };

  const handleSubjectSelection = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

    return (
    <SchoolAdminLayout title="Exam Timetable" subtitle="Manage exam schedules and timetables">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Exam Timetable</h1>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode 
                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            Add Timetable
          </button>
        </div>

        {/* Timetables List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {timetables.map((timetable) => (
            <div
              key={timetable.id}
              className={`p-6 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              } shadow-lg`}
            >
              {/* Timetable Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">{timetable.examName}</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Class: {timetable.className}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {timetable.startDate} - {timetable.endDate}
                </p>
              </div>

              {/* Subjects */}
              <div className="space-y-3 mb-4">
                {timetable.subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className={`p-3 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(subject.id)}
                          onChange={() => handleSubjectSelection(subject.id)}
                          className="rounded"
                        />
                        <div>
                          <p className="font-medium">{subject.name}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {subject.examDate} at {subject.examTime}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSubject(timetable.id, subject.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedTimetable(timetable)}
                  className={`w-full px-3 py-2 text-sm rounded border transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 hover:bg-gray-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Add Subject
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDeleteSelectedSubjects(timetable.id)}
                    className="flex-1 px-3 py-2 text-sm rounded bg-yellow-500 text-white hover:bg-yellow-600"
                  >
                    Delete Selected
                  </button>
                  <button
                    onClick={() => handleDeleteAllSubjects(timetable.id)}
                    className="flex-1 px-3 py-2 text-sm rounded bg-orange-500 text-white hover:bg-orange-600"
                  >
                    Delete All
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteTimetable(timetable.id)}
                  className="w-full px-3 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600"
                >
                  Delete Timetable
                </button>
              </div>
            </div>
          ))}
        </div>

        {timetables.length === 0 && (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>No exam timetables created yet.</p>
            <p>Click "Add Timetable" to create your first timetable.</p>
          </div>
        )}
      </div>

      {/* Add Timetable Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
          <div className={`relative w-96 max-w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Add New Timetable</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Exam Name</label>
                  <input
                    type="text"
                    value={formData.examName}
                    onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                    placeholder="Enter exam name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Class Name</label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">Select Class</option>
                    {classOptions.map((className) => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <button
                  onClick={handleAddTimetable}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-primary-600 text-white hover:bg-primary-700' 
                      : 'bg-primary-500 text-white hover:bg-primary-600'
                  }`}
                >
                  Add Timetable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Sidebar */}
      {selectedTimetable && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedTimetable(null)} />
          <div className={`relative w-96 max-w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Add Subject to {selectedTimetable.examName}</h2>
                <button
                  onClick={() => setSelectedTimetable(null)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject Name</label>
                  <input
                    type="text"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                    placeholder="Enter subject name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Exam Date</label>
                  <input
                    type="date"
                    value={subjectForm.examDate}
                    onChange={(e) => setSubjectForm({ ...subjectForm, examDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Exam Time</label>
                  <input
                    type="time"
                    value={subjectForm.examTime}
                    onChange={(e) => setSubjectForm({ ...subjectForm, examTime: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <button
                  onClick={() => handleAddSubject(selectedTimetable.id)}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-primary-600 text-white hover:bg-primary-700' 
                      : 'bg-primary-500 text-white hover:bg-primary-600'
                  }`}
                >
                  Add Subject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SchoolAdminLayout>
  );
};

export default ExamTimetable; 