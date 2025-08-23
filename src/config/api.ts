// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    SCHOOL: {
      PROFILE: '/school/profile',
      UPDATE_PROFILE: '/school/profile',
      DASHBOARD: '/school/dashboard',
      DETAILS: '/schools/:schoolId/details',
    },
    STUDENTS: {
      LIST: '/students',
      CREATE: '/students',
      UPDATE: '/students/:id',
      DELETE: '/students/:id',
      DETAILS: '/students/:id',
      BY_SCHOOL: '/students/:schoolId',
    },
    TEACHERS: {
      LIST: '/teachers',
      CREATE: '/teachers',
      UPDATE: '/teachers/:id',
      UPDATE_BY_ID: '/teachers/update/:id',
      DELETE: '/teachers/:id',
      DELETE_BY_ID: '/teachers/delete/:id',
      DETAILS: '/teachers/:id',
      BY_SCHOOL: '/teachers/school/:schoolId',
      ADD: '/teachers/add',
    },
    TEACHER_ATTENDANCE: {
      MARK: '/teacher-attendance/',
      GET_STATUS: '/teacher-attendance/teacher/:schoolId/:date/:teacherId',
      DOWNLOAD_REPORT: '/teacher-attendance/download-teacher-report',
    },
    CLASSROOM: {
      GET_CLASSES: '/classrooms/:schoolId/classes',
    },
    ATTENDANCE: {
      LIST: '/attendance',
      MARK: '/attendance/mark',
      REPORT: '/attendance/report',
    },
    EXAMS: {
      LIST: '/exams',
      CREATE: '/exams',
      UPDATE: '/exams/:id',
      DELETE: '/exams/:id',
      TIMETABLE: '/exams/timetable',
      EXAM_TIMETABLES: '/exam-timetables/:schoolId/',
      CREATE_EXAM_TIMETABLE: '/exam-timetables',
      DELETE_EXAM_TIMETABLE: '/exam-timetables/:schoolId/:timetableId',
      ADD_SUBJECT: '/exam-timetables/:schoolId/subject',
      DELETE_SUBJECT: '/exam-timetables/:schoolId/examTimeTableSubject/:subjectId',
    },
    STUDENT_PAYMENTS: {
      SUMMARY_BY_SCHOOL: '/student-payments/school/:schoolId/summary',
      DOWNLOAD_CLASS_REPORT: '/student-payments/class/payment-report-class-wise',
    },
    FEES: {
      LIST: '/fees',
      CREATE: '/fees',
      UPDATE: '/fees/:id',
      DELETE: '/fees/:id',
      PAYMENT: '/fees/payment',
    },
  },
}; 