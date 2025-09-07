export interface Subject {
  subjectId: string;
  subjectName: string;
  examDate: string; // DD-MM-YYYY
  startTime: string; // e.g., 10:00 AM
  endTime: string;   // e.g., 12:00 PM
}

export interface ExamTimetable {
  timetableId: string;
  classId: string;
  className: string;
  examName: string;
  examStartDate: string; // DD-MM-YYYY
  examEndDate: string;   // DD-MM-YYYY
  subjects: Subject[];
}

export interface CreateTimetableSubject {
  subjectId?: string;
  subjectName: string;
  examDate: string; // DD-MM-YYYY
  startTime: string; // e.g., 10:00 AM
  endTime: string;   // e.g., 12:00 PM
}

export interface CreateExamTimetableRequest {
  classId: string;
  className: string;
  examName: string;
  examStartDate: string; // DD-MM-YYYY
  examEndDate: string;   // DD-MM-YYYY
  subjects: CreateTimetableSubject[];
}

export interface ExamTimetableResponse {
  success?: boolean;
  data: ExamTimetable[];
  message?: string;
} 