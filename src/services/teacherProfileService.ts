import { apiClient } from '../config/axios';
import { API_CONFIG } from '../config/api';

export interface SchoolData {
  schoolId: string;
  role: string;
  type: string;
  email: string;
  phoneNo: string;
  address: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  password: string;
  schoolName: string;
  currentAcademicYear: string;
  pincode: string;
  city: string;
  logo: string;
  state: string;
  line1: string;
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface Subject {
  subjectName: string;
  teacherId: string;
}

export interface ClassData {
  classId: string;
  className: string;
  section: string;
  classTeacherId: string;
  classFees: number;
  subjects: Subject[];
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface TeacherData {
  teacherId: string;
  schoolId: string;
  teacherName: string;
  email: string;
  phoneNo: string;
  password: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  profilePic: string;
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface TeacherProfileResponse {
  success: boolean;
  school: SchoolData;
  teacher: TeacherData;
  classes: ClassData[];
}

export interface UpdateTeacherRequest {
  teacherName?: string;
  email?: string;
  phoneNo?: string;
  password?: string;
  profilePic?: string;
}

export interface UpdateTeacherResponse {
  success: boolean;
  message: string;
  teacher?: TeacherData;
}

class TeacherProfileService {
  /**
   * Get teacher profile with school and class information
   */
  async getTeacherProfile(schoolId: string, teacherId: string): Promise<TeacherProfileResponse> {
    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.TEACHER_PROFILE.GET_PROFILE
          .replace(':schoolId', schoolId)
          .replace(':teacherId', teacherId)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      throw error;
    }
  }

  /**
   * Update teacher profile
   */
  async updateTeacherProfile(
    teacherId: string, 
    updateData: UpdateTeacherRequest
  ): Promise<UpdateTeacherResponse> {
    try {
      const response = await apiClient.put(
        API_CONFIG.ENDPOINTS.TEACHER_PROFILE.UPDATE_TEACHER.replace(':teacherId', teacherId),
        updateData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating teacher profile:', error);
      throw error;
    }
  }

  /**
   * Format date from Firebase timestamp
   */
  formatFirebaseDate(timestamp: { _seconds: number; _nanoseconds: number }): string {
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get associated since date (createdAt)
   */
  getAssociatedSince(createdAt: { _seconds: number; _nanoseconds: number }): string {
    const date = new Date(createdAt._seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }

  /**
   * Get subjects taught by teacher
   */
  getTeacherSubjects(classes: ClassData[], teacherId: string): string[] {
    const subjects = new Set<string>();
    classes.forEach(classData => {
      classData.subjects.forEach(subject => {
        if (subject.teacherId === teacherId) {
          subjects.add(subject.subjectName);
        }
      });
    });
    return Array.from(subjects);
  }

  /**
   * Get classes taught by teacher
   */
  getTeacherClasses(classes: ClassData[], teacherId: string): ClassData[] {
    return classes.filter(classData => 
      classData.subjects.some(subject => subject.teacherId === teacherId)
    );
  }
}

export const teacherProfileService = new TeacherProfileService();
export default teacherProfileService;
