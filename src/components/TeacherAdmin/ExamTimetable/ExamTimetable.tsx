import React, { useState, useEffect } from 'react';
import { examTimetableService } from '../../../services/examTimetableService';
import { useAuth } from '../../../contexts/AuthContext';
import { ExamTimetable as ExamTimetableType } from '../../../models/examTimetable';
import { Calendar, FileText, School } from 'lucide-react';
import {
  TeacherPageShell,
  TeacherPageHeader,
  TeacherStatsGrid,
  TeacherStatCard,
  TeacherFilterBar,
  TeacherSearchInput,
  TeacherSelect,
  TeacherPanel,
  TeacherTable,
  TeacherLoading,
  TeacherError,
  TeacherEmpty,
} from '../shared';

const ExamTimetable: React.FC = () => {
  const { user } = useAuth();
  const [timetables, setTimetables] = useState<ExamTimetableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('');

  useEffect(() => {
    const fetchTimetables = async () => {
      if (!user?.schoolId || !user?.classId) {
        setTimetables([]);
        setError(user?.schoolId ? null : 'School ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await examTimetableService.getExamTimetablesByClass(user.schoolId, user.classId);
        setTimetables(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching exam timetables:', err);
        setTimetables([]);
        setError('Failed to load exam timetables. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTimetables();
  }, [user?.schoolId, user?.classId]);

  const filteredTimetables = timetables.filter((timetable) => {
    const matchesSearch =
      timetable.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      timetable.className.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = selectedExam === '' || timetable.examName === selectedExam;
    return matchesSearch && matchesExam;
  });

  const examNames = Array.from(new Set(timetables.map((t) => t.examName)));

  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return <TeacherLoading message="Loading exam timetables..." />;
  }

  if (error) {
    return (
      <TeacherError
        title="Error Loading Timetables"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <TeacherPageShell>
      <TeacherPageHeader
        title="Exam Schedule"
        description="View exam timetables and subject schedules for your class."
      />

      <TeacherStatsGrid cols={3}>
        <TeacherStatCard title="Total Exams" value={timetables.length} icon={Calendar} color="indigo" />
        <TeacherStatCard
          title="Total Subjects"
          value={timetables.reduce((total, t) => total + t.subjects.length, 0)}
          icon={FileText}
          color="emerald"
        />
        <TeacherStatCard title="My Class" value={user?.className || 'N/A'} icon={School} color="violet" />
      </TeacherStatsGrid>

      <TeacherFilterBar>
        <TeacherSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search exams or classes..."
        />
        <TeacherSelect
          value={selectedExam}
          onChange={setSelectedExam}
          className="sm:w-52"
          options={[
            { value: '', label: 'All Exams' },
            ...examNames.map((name) => ({ value: name, label: name })),
          ]}
        />
      </TeacherFilterBar>

      {filteredTimetables.length === 0 ? (
        <TeacherPanel>
          <TeacherEmpty
            icon={Calendar}
            title="No exam timetables found"
            description={
              timetables.length === 0
                ? 'No exam timetables have been created for your class yet.'
                : 'Try adjusting your search criteria.'
            }
          />
        </TeacherPanel>
      ) : (
        <div className="space-y-4">
          {filteredTimetables.map((timetable) => (
            <TeacherPanel
              key={timetable.timetableId}
              noPadding
              title={timetable.examName}
              headerAction={
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-full">
                  {timetable.subjects.length} Subject{timetable.subjects.length !== 1 ? 's' : ''}
                </span>
              }
            >
              <p className="px-4 sm:px-6 pt-4 pb-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                {timetable.className} • {formatDate(timetable.examStartDate)} - {formatDate(timetable.examEndDate)}
              </p>
              <TeacherTable
                headers={['Subject', 'Date', 'Start', 'End', 'Duration']}
                minWidth="640px"
              >
                {timetable.subjects.map((subject, index) => (
                  <tr key={`${subject.subjectId}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                          {subject.subjectName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{subject.subjectName}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {formatDate(subject.examDate)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {subject.startTime}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {subject.endTime}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {subject.startTime} - {subject.endTime}
                    </td>
                  </tr>
                ))}
              </TeacherTable>
            </TeacherPanel>
          ))}
        </div>
      )}
    </TeacherPageShell>
  );
};

export default ExamTimetable;
