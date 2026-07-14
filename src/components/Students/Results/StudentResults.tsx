import React, { useEffect, useState } from 'react';
import { Award, CalendarDays, Download, FileText, Percent } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { resultService } from '../../../services/resultService';
import {
  TeacherPageShell,
  TeacherPageHeader,
  TeacherStatsGrid,
  TeacherStatCard,
  TeacherFilterBar,
  TeacherSelect,
  TeacherPanel,
  TeacherTable,
  TeacherButton,
  TeacherLoading,
  TeacherEmpty,
} from '../shared';

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

const StudentResults: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('all');
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

  if (loading) return <TeacherLoading message="Loading results..." />;

  const averagePercentage =
    filteredResults.length > 0
      ? (filteredResults.reduce((sum, result) => sum + result.percentage, 0) / filteredResults.length).toFixed(1)
      : '0.0';

  return (
    <TeacherPageShell>
      <TeacherPageHeader title="Your Results" description="View your academic performance." />

      <TeacherStatsGrid cols={3}>
        <TeacherStatCard title="Exams" value={filteredResults.length} icon={FileText} color="indigo" />
        <TeacherStatCard title="Average %" value={`${averagePercentage}%`} icon={Percent} color="blue" />
        <TeacherStatCard
          title="Best Grade"
          value={filteredResults[0]?.overallGrade || '-'}
          subtitle="Current filter"
          icon={Award}
          color="emerald"
        />
      </TeacherStatsGrid>

      <TeacherFilterBar>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Academic Year</div>
        <TeacherSelect
          value={selectedYear}
          onChange={setSelectedYear}
          options={[
            { value: 'all', label: 'All Years' },
            ...academicYears
              .filter((year) => year !== 'all')
              .map((year) => ({ value: year, label: year })),
          ]}
          className="sm:w-56"
        />
      </TeacherFilterBar>

      {filteredResults.length === 0 ? (
        <TeacherPanel>
          <TeacherEmpty
            icon={CalendarDays}
            title="No results found"
            description={
              selectedYear === 'all'
                ? 'No exam results available yet.'
                : `No results for academic year ${selectedYear}.`
            }
          />
        </TeacherPanel>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((result) => (
            <TeacherPanel
              key={result.id}
              title={result.examName}
              headerAction={
                <TeacherButton
                  compact
                  icon={Download}
                  loading={downloading === result.id}
                  onClick={() => handleDownload(result.id)}
                >
                  Download PDF
                </TeacherButton>
              }
              noPadding
            >
              <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
                {result.examType} | {new Date(result.examDate).toLocaleDateString('en-US')} | {result.percentage.toFixed(1)}%
                ({result.totalObtained}/{result.totalMaximum}) | Grade {result.overallGrade}
              </div>
              <div className="overflow-x-auto">
                <TeacherTable headers={['Subject', 'Obtained', 'Total', 'Percentage', 'Grade']} minWidth="700px">
                  {result.subjects.map((subject, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <td className="px-4 sm:px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {subject.subjectName}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{subject.marksObtained}</td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{subject.totalMarks}</td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {subject.percentage.toFixed(1)}%
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">{subject.grade}</td>
                    </tr>
                  ))}
                </TeacherTable>
              </div>
              {result.remarks && (
                <div className="px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
                  Teacher&apos;s Remarks: {result.remarks}
                </div>
              )}
            </TeacherPanel>
          ))}
        </div>
      )}
    </TeacherPageShell>
  );
};

export default StudentResults;

