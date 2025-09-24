// Result-related models and interfaces

export interface SubjectResult {
  subjectId: string;
  subjectName: string;
  marksObtained: number;
  totalMarks: number;
  grade?: string;
  remarks?: string;
}

export interface StudentResult {
  resultId: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  schoolId: string;
  classId: string;
  examType: string; // 'midterm', 'final', 'unit-test', etc.
  examName: string;
  examDate: string;
  subjects: SubjectResult[];
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  overallGrade?: string;
  rank?: number;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateResultRequest {
  studentId: string;
  examType: string;
  examName: string;
  examDate: string;
  subjects: Omit<SubjectResult, 'subjectId'>[];
  remarks?: string;
}

export interface UpdateResultRequest extends Partial<CreateResultRequest> {
  resultId: string;
}

export interface ResultsResponse {
  success: boolean;
  count: number;
  results: StudentResult[];
  timestamp: string;
}

export interface ResultResponse {
  success: boolean;
  result: StudentResult;
  message?: string;
  timestamp: string;
}

export const EXAM_TYPES = [
  { value: 'midterm', label: 'Mid Term Exam' },
  { value: 'final', label: 'Final Exam' },
  { value: 'unit-test', label: 'Unit Test' },
  { value: 'monthly', label: 'Monthly Test' },
  { value: 'quarterly', label: 'Quarterly Exam' },
  { value: 'half-yearly', label: 'Half Yearly Exam' },
  { value: 'annual', label: 'Annual Exam' },
] as const;

export const GRADE_SCALE = [
  { min: 90, max: 100, grade: 'A+', description: 'Outstanding' },
  { min: 80, max: 89, grade: 'A', description: 'Excellent' },
  { min: 70, max: 79, grade: 'B+', description: 'Very Good' },
  { min: 60, max: 69, grade: 'B', description: 'Good' },
  { min: 50, max: 59, grade: 'C+', description: 'Above Average' },
  { min: 40, max: 49, grade: 'C', description: 'Average' },
  { min: 33, max: 39, grade: 'D', description: 'Below Average' },
  { min: 0, max: 32, grade: 'F', description: 'Fail' },
] as const;
