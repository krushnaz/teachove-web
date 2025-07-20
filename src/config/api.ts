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
      DELETE: '/teachers/:id',
      DETAILS: '/teachers/:id',
      BY_SCHOOL: '/teachers/school/:schoolId',
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