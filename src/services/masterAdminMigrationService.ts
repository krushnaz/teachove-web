import { apiHelper } from '../utils/apiHelper';

export interface LegacyCandidate {
  legacySchoolId: string;
  schoolName?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export interface LegacySchool {
  legacySchoolId: string;
  schoolName?: string;
  email?: string;
  phoneNo?: string;
  isActive?: boolean;
  role?: string;
}

export type MigrationModule =
  | 'schoolProfile'
  | 'teachers'
  | 'classes'
  | 'students'
  | 'examTimetable'
  | 'teacherAttendance'
  | 'studentFees'
  | 'announcements'
  | 'events'
  | 'teacherLeaves'
  | 'studentLeaves'
  | 'studentResult'
  | 'homeworks';

export interface MigrationRun {
  runId: string;
  schoolId: string;
  legacySchoolId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startedAtIso?: string;
  completedAtIso?: string;
  failedAtIso?: string;
  error?: string;
  currentModule?: string | null;
  yearId?: string | null;
  modules?: Record<
    string,
    {
      status: 'pending' | 'running' | 'completed' | 'failed';
      processed: number;
      written: number;
      skipped: number;
      errors: number;
    }
  >;
}

export interface MigrationLogEntry {
  id: string;
  ts: any;
  level: 'info' | 'error';
  module?: string;
  message: string;
  stats?: any;
}

class MasterAdminMigrationService {
  async getModules(): Promise<MigrationModule[]> {
    const res = (await apiHelper.get('/master-admin/migrations/modules')) as any;
    return res.modules || [];
  }

  async getLegacySchools(): Promise<LegacySchool[]> {
    const res = (await apiHelper.get('/master-admin/migrations/legacy-schools')) as any;
    return res.schools || [];
  }

  async getLegacyCandidates(schoolId: string): Promise<LegacyCandidate[]> {
    const res = (await apiHelper.get(`/master-admin/migrations/schools/${schoolId}/legacy-candidates`)) as any;
    return res.candidates || [];
  }

  async startMigration(input: {
    schoolId: string;
    legacySchoolId: string;
    modules?: MigrationModule[];
  }): Promise<{ runId: string }> {
    const res = (await apiHelper.post(`/master-admin/migrations/schools/${input.schoolId}/start`, {
      legacySchoolId: input.legacySchoolId,
      modules: input.modules,
    })) as any;
    if (!res.success) throw new Error(res.message || 'Failed to start migration');
    return { runId: res.runId };
  }

  async startLegacyMigration(input: {
    legacySchoolId: string;
    modules?: MigrationModule[];
    currentAcademicYear?: string;
  }): Promise<{ runId: string }> {
    const res = (await apiHelper.post(`/master-admin/migrations/legacy-schools/${input.legacySchoolId}/start`, {
      modules: input.modules,
      currentAcademicYear: input.currentAcademicYear,
    })) as any;
    if (!res.success) throw new Error(res.message || 'Failed to start migration');
    return { runId: res.runId };
  }

  async getSchoolRuns(schoolId: string): Promise<MigrationRun[]> {
    const res = (await apiHelper.get(`/master-admin/migrations/schools/${schoolId}/runs`)) as any;
    return res.runs || [];
  }

  async getLegacySchoolRuns(legacySchoolId: string): Promise<MigrationRun[]> {
    const res = (await apiHelper.get(`/master-admin/migrations/legacy-schools/${legacySchoolId}/runs`)) as any;
    return res.runs || [];
  }

  async getRun(runId: string): Promise<MigrationRun> {
    const res = (await apiHelper.get(`/master-admin/migrations/runs/${runId}`)) as any;
    if (!res.success) throw new Error(res.message || 'Failed to fetch run');
    return res.run;
  }

  async getRunLogs(runId: string): Promise<MigrationLogEntry[]> {
    const res = (await apiHelper.get(`/master-admin/migrations/runs/${runId}/logs`)) as any;
    return res.logs || [];
  }
}

export const masterAdminMigrationService = new MasterAdminMigrationService();
export default MasterAdminMigrationService;

