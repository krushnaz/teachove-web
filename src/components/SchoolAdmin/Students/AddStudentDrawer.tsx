import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classroomService, Classroom } from '../../../services/classroomService';
import { subscriptionService, CanAddStudentsResponse } from '../../../services/subscriptionService';
import {
  resolveBlockTitle,
  resolveBlockMessage,
  showSlotUsage,
  getPurchaseButtonLabel,
} from '../../../utils/subscriptionStudentGuard';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { X, User, Mail, Phone, Lock, Calendar, ClipboardList, Camera, AlertCircle, Sparkles, Plus, ChevronRight } from 'lucide-react';
import { useDarkMode } from '../../../contexts/DarkModeContext';

interface AddStudentDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddStudent: (student: { 
    name: string; 
    email: string; 
    password: string; 
    phoneNo: string;
    admissionYear: string;
    classId: string;
    rollNo: string | number; // Add rollNo field
  }, profilePicFile?: File) => void;
  onEditStudent?: (studentId: string, studentData: {
    name: string;
    email: string;
    phoneNo: string;
    admissionYear: string;
    classId: string;
    rollNo: string | number; // Add rollNo field
    password?: string;
  }, profilePicFile?: File) => void;
  student?: {
    studentId: string;
    name: string;
    email: string;
    phoneNo: string;
    admissionYear: string;
    classId: string;
    rollNo?: string | number; // Add rollNo field
    profilePic?: string;
  };
}

const AddStudentDrawer: React.FC<AddStudentDrawerProps> = ({ 
  open, 
  onClose, 
  onAddStudent, 
  onEditStudent, 
  student 
}) => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const isEdit = !!student;
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [canAddStudents, setCanAddStudents] = useState<CanAddStudentsResponse | null>(null);
  const [canAddStudentsLoading, setCanAddStudentsLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phoneNo: '',
    admissionYear: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString(),
    classId: '',
    rollNo: '', // Add rollNo field
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const limitReached = !isEdit && !!canAddStudents && !canAddStudents.canAdd;

  // Fetch classes when drawer opens
  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.schoolId || !open) return;
      
      try {
        setClassesLoading(true);
        const fetchedClasses = await classroomService.getClassesBySchoolId(user.schoolId);
        setClasses(fetchedClasses);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
        toast.error('Failed to load classes');
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClasses();
  }, [user?.schoolId, open]);

  // Fetch can-add-students when drawer opens in Add mode (subscription limit check)
  useEffect(() => {
    const fetchCanAddStudents = async () => {
      if (!user?.schoolId || !open || isEdit) return;
      setCanAddStudentsLoading(true);
      setCanAddStudents(null);
      try {
        const data = await subscriptionService.getCanAddStudents(user.schoolId);
        setCanAddStudents(data ?? null);
      } catch (error) {
        console.error('Failed to check subscription limit:', error);
        setCanAddStudents(null);
      } finally {
        setCanAddStudentsLoading(false);
      }
    };

    fetchCanAddStudents();
  }, [user?.schoolId, open, isEdit]);

  // Reset form when drawer opens/closes or student changes
  useEffect(() => {
    if (open) {
      if (student) {
        setForm({
          name: student.name,
          email: student.email,
          password: '',
          phoneNo: student.phoneNo,
          admissionYear: student.admissionYear,
          classId: student.classId,
          rollNo: student.rollNo ? String(student.rollNo) : '', // Add rollNo field
        });
        setPreviewUrl(student.profilePic || '');
      } else {
        setForm({
          name: '',
          email: '',
          password: '',
          phoneNo: '',
          admissionYear: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString(),
          classId: '',
          rollNo: '', // Add rollNo field
        });
        setPreviewUrl('');
      }
      setSelectedFile(null);
    }
  }, [open, student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    // If editing and had original image, restore it
    if (isEdit && student?.profilePic) {
      setPreviewUrl(student.profilePic);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEdit && canAddStudents && !canAddStudents.canAdd) {
      toast.error(resolveBlockMessage(canAddStudents, 'school'));
      return;
    }

    if (!form.name || !form.email || !form.phoneNo || !form.admissionYear || !form.classId || !form.rollNo) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isEdit && !form.password) {
      toast.error('Please enter a password');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && onEditStudent) {
        const editData: any = {
          name: form.name,
          email: form.email,
          phoneNo: form.phoneNo,
          admissionYear: form.admissionYear,
          classId: form.classId,
          rollNo: form.rollNo, // Add rollNo field
        };
        if (form.password) {
          editData.password = form.password;
        }
        await onEditStudent(student!.studentId, editData, selectedFile || undefined);
      } else {
        await onAddStudent({
          name: form.name,
          email: form.email,
          password: form.password,
          phoneNo: form.phoneNo,
          admissionYear: form.admissionYear,
          classId: form.classId,
          rollNo: form.rollNo, // Add rollNo field
        }, selectedFile || undefined);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] transition-all duration-300 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      {/* Overlay - Simple Darkening */}
      <div
        className={`fixed inset-0 bg-gray-900/60 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[480px] ${isDarkMode ? 'bg-gray-900 border-l border-gray-800' : 'bg-white'} shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header - Sleek ERP Style */}
        <div className={`flex-shrink-0 flex items-center justify-between px-6 py-5 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {isEdit ? 'Edit Student Profile' : 'Add New Student'}
            </h2>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 flex items-center gap-1.5`}>
              <Sparkles size={12} className="text-indigo-500" />
              {isEdit ? 'Update existing student records' : 'Register a new student to the school database'}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-all ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Subscription Limit Alert */}
            {!isEdit && (canAddStudentsLoading || (canAddStudents && !canAddStudents.canAdd)) && (
              <div className={`p-4 rounded-md border ${
                canAddStudentsLoading 
                  ? 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700' 
                  : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50'
              }`}>
                {canAddStudentsLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Verifying subscription...</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                        {resolveBlockTitle(canAddStudents!)}
                      </h4>
                      <p className="text-xs text-amber-800 dark:text-amber-400 mt-1">
                        {resolveBlockMessage(canAddStudents!, 'school')}
                      </p>
                      {showSlotUsage(canAddStudents!) && (
                        <p className="text-xs text-amber-800 dark:text-amber-400 mt-1">
                          Slots used: {canAddStudents?.currentStudents} of {canAddStudents?.totalSubscribedSlots}
                        </p>
                      )}
                      <button
                        onClick={() => { onClose(); navigate('/school-admin/subscription-request'); }}
                        className="mt-3 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {getPurchaseButtonLabel(canAddStudents!)}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-gray-200 dark:border-gray-800 group transition-colors hover:border-indigo-400 dark:hover:border-indigo-600">
                <div className="relative group">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-900/50"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-600">
                      <Camera size={32} />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="student-pic"
                    disabled={limitReached}
                  />
                  <label
                    htmlFor="student-pic"
                    className={`absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-600 text-white shadow-lg cursor-pointer hover:bg-indigo-700 transition-transform hover:scale-110 ${limitReached ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Plus size={14} />
                  </label>
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-1 -right-1 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Profile Picture
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">Recommended: Square image, max 5MB</p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="space-y-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User size={16} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      disabled={limitReached}
                      placeholder="Jane Doe"
                      className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-md border transition-all outline-none ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white'
                      } disabled:opacity-50`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Class Selection */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Class <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="classId"
                        value={form.classId}
                        onChange={handleChange}
                        required
                        disabled={submitting || classesLoading || limitReached}
                        className={`w-full px-3 py-2.5 text-sm rounded-md border appearance-none transition-all outline-none ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:bg-white'
                        } disabled:opacity-50 cursor-pointer`}
                      >
                        <option value="">Select</option>
                        {classes.map((c) => (
                          <option key={c.classId} value={c.classId}>{c.className}-{c.section}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        <ChevronRight size={14} className="rotate-90" />
                      </div>
                    </div>
                  </div>

                  {/* Roll Number */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Roll ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="rollNo"
                      value={form.rollNo}
                      onChange={handleChange}
                      required
                      disabled={limitReached}
                      placeholder="e.g. 101"
                      className={`w-full px-4 py-2.5 text-sm rounded-md border transition-all outline-none ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:bg-white'
                      } disabled:opacity-50`}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail size={16} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        disabled={limitReached}
                        placeholder="jane@example.com"
                        className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-md border transition-all outline-none ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:bg-white'
                        } disabled:opacity-50`}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Phone No <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Phone size={16} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        type="tel"
                        name="phoneNo"
                        value={form.phoneNo}
                        onChange={handleChange}
                        required
                        disabled={limitReached}
                        placeholder="+91 XXXXX XXXXX"
                        className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-md border transition-all outline-none ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:bg-white'
                        } disabled:opacity-50`}
                      />
                    </div>
                  </div>
                </div>

                {/* Secondary Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Admission Year <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Calendar size={16} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="admissionYear"
                        value={form.admissionYear}
                        onChange={handleChange}
                        required
                        disabled={limitReached}
                        placeholder="2024-2025"
                        className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-md border transition-all outline-none ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:bg-white'
                        } disabled:opacity-50`}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Access Password {isEdit ? '(Optional)' : <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock size={16} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required={!isEdit}
                        disabled={limitReached}
                        placeholder={isEdit ? "Keep empty to unchanged" : "Set password"}
                        className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-md border transition-all outline-none ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:bg-white'
                        } disabled:opacity-50`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Action Footer - Fixed */}
        <div className={`flex-shrink-0 px-6 py-5 border-t ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50'} flex justify-end gap-3`}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
              isDarkMode 
                ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || classesLoading || limitReached}
            className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isEdit ? 'Updating...' : 'Adding...'}</span>
              </>
            ) : (
              <>
                <ClipboardList size={14} />
                <span>{isEdit ? 'Save Changes' : 'Register Student'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStudentDrawer;
