export interface Subject {
  examTimeTableId: string;
  supervisorName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  supervisorId: string;
  totalMarks: number;
  subjectId: string;
  subjectName: string;
  examTimeTableSubjectId: string;
}

export interface ExamTimetable {
  examEndDate: string;
  classId: string;
  examStartDate: string;
  timetableId: string;
  schoolId: string;
  examName: string;
  className: string;
  subjects: Subject[];
}

export interface CreateExamTimetableRequest {
  examName: string;
  className: string;
  classId?: string;
  startDate: string;
  endDate: string;
  schoolId: string;
}

export interface CreateSubjectRequest {
  examTimeTableId: string;
  supervisorName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  supervisorId: string;
  totalMarks: number;
  subjectId: string;
  subjectName: string;
}

export interface ExamTimetableResponse {
  success: boolean;
  data: ExamTimetable[];
  message?: string;
} 