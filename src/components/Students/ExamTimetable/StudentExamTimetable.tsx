import React, { useEffect, useState } from 'react';
import { CalendarDays, BookOpen, Clock3 } from 'lucide-react';
import { examTimetableService } from '../../../services/examTimetableService';
import { useAuth } from '../../../contexts/AuthContext';
import { ExamTimetable as ExamTimetableType } from '../../../models/examTimetable';
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

const StudentExamTimetable: React.FC = () => {
  const { user } = useAuth();
  const [timetables, setTimetables] = useState<ExamTimetableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('');

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      setError(null);
      if (user?.schoolId && user?.classId) {
        const data = await examTimetableService.getExamTimetablesByClass(user.schoolId, user.classId);
        setTimetables(data);
      } else {
        setError('School ID or Class ID not found');
      }
    } catch (fetchError) {
      console.error('Error fetching exam timetables:', fetchError);
      setError('Failed to load exam timetables. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.schoolId && user?.classId) {
      fetchTimetables();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const getDaysUntilExam = (examDate: string) => {
    const [day, month, year] = examDate.split('-');
    const exam = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = exam.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExamStatus = (examStartDate: string) => {
    const daysUntil = getDaysUntilExam(examStartDate);
    if (daysUntil < 0) return 'Completed';
    if (daysUntil === 0) return 'Today';
    return `${daysUntil} days left`;
  };

  if (loading) return <TeacherLoading message="Loading exam timetables..." />;
  if (error) return <TeacherError title="Error Loading Timetables" message={error} onRetry={fetchTimetables} />;

  return (
    <TeacherPageShell>
      <TeacherPageHeader title="Exam Timetable" description="View your upcoming exam schedule." />

      <TeacherStatsGrid cols={3}>
        <TeacherStatCard title="Total Exams" value={timetables.length} icon={CalendarDays} color="indigo" />
        <TeacherStatCard
          title="Total Subjects"
          value={timetables.reduce((total, timetable) => total + timetable.subjects.length, 0)}
          icon={BookOpen}
          color="emerald"
        />
        <TeacherStatCard
          title="Upcoming"
          value={timetables.filter((t) => getDaysUntilExam(t.examStartDate) >= 0).length}
          icon={Clock3}
          color="violet"
        />
      </TeacherStatsGrid>

      <TeacherFilterBar>
        <TeacherSearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search exams or class..." />
        <TeacherSelect
          value={selectedExam}
          onChange={setSelectedExam}
          options={[{ value: '', label: 'All Exams' }, ...examNames.map((name) => ({ value: name, label: name }))]}
          className="sm:w-60"
        />
      </TeacherFilterBar>

      {filteredTimetables.length === 0 ? (
        <TeacherPanel>
          <TeacherEmpty
            icon={CalendarDays}
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
              title={timetable.examName}
              headerAction={
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {timetable.className} - {getExamStatus(timetable.examStartDate)}
                </span>
              }
              className="overflow-hidden"
              noPadding
            >
              <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
                Exam Period: {formatDate(timetable.examStartDate)} - {formatDate(timetable.examEndDate)} |{' '}
                {timetable.subjects.length} Subject{timetable.subjects.length !== 1 ? 's' : ''}
              </div>
              <div className="overflow-x-auto">
                <TeacherTable headers={['Subject', 'Date', 'Start Time', 'End Time', 'Status']} minWidth="720px">
                  {timetable.subjects.map((subject, index) => (
                    <tr
                      key={`${subject.subjectId}-${index}`}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {subject.subjectName}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(subject.examDate)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{subject.startTime}</td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{subject.endTime}</td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {getExamStatus(subject.examDate)}
                      </td>
                    </tr>
                  ))}
                </TeacherTable>
              </div>
            </TeacherPanel>
          ))}
        </div>
      )}
    </TeacherPageShell>
  );
};

export default StudentExamTimetable;

