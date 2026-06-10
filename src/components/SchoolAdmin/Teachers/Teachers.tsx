import React, { useState, useEffect } from 'react';
import { teacherService } from '../../../services/teacherService';
import { useAuth } from '../../../contexts/AuthContext';
import { Teacher } from '../../../models';
import { AddTeacherDrawer } from './index';
import { schoolService } from '../../../services';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Users, 
  UserCheck, 
  School, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  Shield,
  AlertCircle
} from 'lucide-react';

const Teachers: React.FC = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [teacherCount, setTeacherCount] = useState(0);

  const handleAddTeacher = async (teacher: { 
    teacherName: string; 
    email: string; 
    password: string; 
    phoneNo: string;
    classId?: string;
  }, profilePicFile?: File) => {
    if (!user?.schoolId) return;
    
    const schoolId = user.schoolId;
    
    try {
      const teacherData = {
        schoolId: schoolId,
        teacherName: teacher.teacherName,
        email: teacher.email,
        phoneNo: teacher.phoneNo,
        password: teacher.password,
        classId: teacher.classId,
        subjects: [],
        classesAssigned: []
      };

      const response = await teacherService.addTeacher(teacherData, profilePicFile);
      
      setTeachers(prev => [
        {
          teacherId: response.teacherId,
          name: teacher.teacherName,
          email: teacher.email,
          password: teacher.password,
          phoneNo: teacher.phoneNo,
          profilePic: response.profilePic || '',
          classId: teacher.classId,
          subjects: [],
          classesAssigned: [],
          schoolName: schoolName,
          role: 'Teacher',
          schoolId: schoolId,
        },
        ...prev,
      ]);
      
      setDrawerOpen(false);
      toast.success('Teacher added successfully!');
    } catch (error) {
      console.error('Failed to add teacher:', error);
      toast.error('Failed to add teacher. Please try again.');
    }
  };

  const handleEditClick = (teacher: Teacher) => {
    setEditTeacher(teacher);
    setDrawerOpen(true);
  };

  const handleEditTeacher = async (teacherId: string, teacherData: {
    teacherName: string;
    email: string;
    phoneNo: string;
    password?: string;
    classId?: string;
  }, profilePicFile?: File) => {
    try {
      const response = await teacherService.editTeacher(teacherId, {
        teacherName: teacherData.teacherName,
        email: teacherData.email,
        phoneNo: teacherData.phoneNo,
        classId: teacherData.classId ?? '',
        ...(teacherData.password ? { password: teacherData.password } : {}),
      }, profilePicFile);
      
      setTeachers(prev => prev.map(t => 
        t.teacherId === teacherId 
          ? { 
              ...t, 
              name: teacherData.teacherName, 
              email: teacherData.email, 
              phoneNo: teacherData.phoneNo,
              classId: teacherData.classId,
              profilePic: response.profilePic || t.profilePic
            }
          : t
      ));
      
      setDrawerOpen(false);
      setEditTeacher(null);
      toast.success('Teacher updated successfully!');
    } catch (error) {
      console.error('Failed to update teacher:', error);
      toast.error('Failed to update teacher. Please try again.');
    }
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;
    try {
      await teacherService.deleteTeacherById(teacherToDelete.teacherId);
      setTeachers(prev => prev.filter(t => t.teacherId !== teacherToDelete.teacherId));
      toast.success('Teacher deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete teacher.');
    } finally {
      setConfirmDialogOpen(false);
      setTeacherToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
    setTeacherToDelete(null);
  };

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (user?.schoolId) {
          const response = await teacherService.getTeachersBySchool(user.schoolId);
          if (response.teachers) {
            const mappedTeachers = response.teachers.map(teacher => ({
              ...teacher,
              name: teacher.teacherName || teacher.name,
              role: 'Teacher',
              schoolName: schoolName || 'N/A'
            }));
            setTeachers(mappedTeachers);
            setTeacherCount(response.count || 0);
          } else {
            setError('Failed to fetch teachers');
          }
        } else {
          setError('School ID not found');
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
        setError('Failed to load teachers');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [user?.schoolId, schoolName]);

  useEffect(() => {
    const fetchSchoolName = async () => {
      if (user?.schoolId) {
        try {
          const data = await schoolService.getSchoolDetails(user.schoolId);
          setSchoolName(data?.school?.schoolName || '');
        } catch {
          setSchoolName('');
        }
      }
    };
    fetchSchoolName();
  }, [user?.schoolId]);

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = (teacher.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (teacher.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (teacher.phoneNo && teacher.phoneNo.includes(searchTerm));
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading professionals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sync Error</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
          >
            Reconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1 md:px-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Teachers Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and monitor your academic staff across {schoolName || 'the school'}.</p>
        </div>
        <button
          onClick={() => {
            setEditTeacher(null);
            setDrawerOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 active:scale-95"
        >
          <Plus size={20} />
          <span>Add Teacher</span>
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 px-1 md:px-0">
        {[
          { label: 'Total Staff', value: teacherCount, icon: Users, color: 'blue' },
          { label: 'Active Now', value: teachers.length, icon: UserCheck, color: 'emerald' },
          { label: 'Academic Dept', value: schoolName || 'N/A', icon: School, color: 'indigo' },
          { label: 'Growth', value: '+3 New', icon: Shield, color: 'amber' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-2.5 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-transform hover:translate-y-[-2px] h-full justify-between">
            <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 flex-shrink-0`}>
              <stat.icon className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 w-full">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">{stat.label}</p>
              <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate w-full">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
      </div>

      {/* Content Area - Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden edge-to-edge">
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">SR</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Teacher Profile</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Contact Information</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Designation</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTeachers.map((teacher, index) => (
                <tr key={teacher.teacherId} className="group hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-400 dark:text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {teacher.profilePic ? (
                        <img
                          src={teacher.profilePic}
                          alt={teacher.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm ring-2 ring-gray-100 dark:ring-gray-700">
                          {teacher.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{teacher.name}</span>
                        <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">#{teacher.teacherId.slice(-6)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Mail size={14} className="flex-shrink-0" />
                        <span className="text-sm truncate max-w-[180px]">{teacher.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone size={14} className="flex-shrink-0" />
                        <span className="text-sm">{teacher.phoneNo || '---'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      <Shield size={12} />
                      {teacher.role || 'Staff'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(teacher)}
                        className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                        title="Edit Record"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(teacher)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Delete Member"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTeachers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
              <Users size={40} className="text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Empty Roster</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mt-1">
              No staff members match the current search criteria or are assigned currently.
            </p>
          </div>
        )}
      </div>

      <AddTeacherDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditTeacher(null); }}
        onAddTeacher={handleAddTeacher}
        onEditTeacher={handleEditTeacher}
        schoolName={schoolName}
        schoolId={user?.schoolId || ''}
        teacher={editTeacher || undefined}
      />

      {/* Confirmation Modal */}
      {confirmDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 min-h-screen">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCancelDelete} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-8 border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all scale-100">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-6">
              <Trash2 size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Delete Member?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-gray-900 dark:text-white">{teacherToDelete?.name}</span>? This action is permanent and cannot be reversed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                No, Keep
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
