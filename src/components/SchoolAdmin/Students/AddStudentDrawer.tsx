import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classroomService, Classroom } from '../../../services/classroomService';
import { subscriptionService, CanAddStudentsResponse } from '../../../services/subscriptionService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';

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
    rollNo: string; // Add rollNo field
  }, profilePicFile?: File) => void;
  onEditStudent?: (studentId: string, studentData: {
    name: string;
    email: string;
    phoneNo: string;
    admissionYear: string;
    classId: string;
    rollNo: string; // Add rollNo field
  }, profilePicFile?: File) => void;
  student?: {
    studentId: string;
    name: string;
    email: string;
    phoneNo: string;
    admissionYear: string;
    classId: string;
    rollNo?: string; // Add rollNo field
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
          rollNo: student.rollNo || '', // Add rollNo field
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
      toast.error('Subscription limit reached. Purchase more student slots to add students.');
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
        await onEditStudent(student!.studentId, {
          name: form.name,
          email: form.email,
          phoneNo: form.phoneNo,
          admissionYear: form.admissionYear,
          classId: form.classId,
          rollNo: form.rollNo, // Add rollNo field
        }, selectedFile || undefined);
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
      className={`fixed inset-0 z-50 transition-all duration-300 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Student' : 'Add Student'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Subscription limit reached (Add mode only) */}
            {!isEdit && canAddStudentsLoading && (
              <div className="mb-6 flex items-center justify-center py-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Checking subscription...</span>
              </div>
            )}
            {!isEdit && !canAddStudentsLoading && canAddStudents && !canAddStudents.canAdd && (
              <div className="mb-6 p-5 rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                    <svg className="w-7 h-7 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Subscription limit reached</h3>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      Your current subscription does not allow adding more students. You have used{' '}
                      <strong>{canAddStudents.currentStudents}</strong> of{' '}
                      <strong>{canAddStudents.totalSubscribedSlots}</strong> student slots.
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Purchase a new subscription to add more students.
                    </p>
                    <button
                      type="button"
                      onClick={() => { onClose(); navigate('/school-admin/subscription-request'); }}
                      className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Go to Subscriptions
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Name */}
              {/* Form fields disabled when subscription limit reached (Add mode) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  disabled={limitReached}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Enter student name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={limitReached}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Enter email address"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNo"
                  value={form.phoneNo}
                  onChange={handleChange}
                  required
                  disabled={limitReached}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Password (only for add, not edit) */}
              {!isEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    disabled={limitReached}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="Enter password"
                  />
                </div>
              )}

              {/* Roll Number */}
              <div>
                <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Roll Number *
                </label>
                <input
                  type="text"
                  id="rollNo"
                  value={form.rollNo}
                  onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                  disabled={limitReached}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Enter roll number"
                  required
                />
              </div>

              {/* Class Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Class *
                </label>
                <select
                  name="classId"
                  value={form.classId}
                  onChange={handleChange}
                  required
                  disabled={submitting || classesLoading || limitReached}
                  className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 ${
                    (submitting || classesLoading || limitReached) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">
                    {classesLoading ? 'Loading classes...' : 'Select a class'}
                  </option>
                  {classes.map((classroom) => (
                    <option key={classroom.classId} value={classroom.classId}>
                      {classroom.className}-{classroom.section}
                    </option>
                  ))}
                </select>
              </div>

              {/* Admission Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Admission Year *
                </label>
                <input
                  type="text"
                  name="admissionYear"
                  value={form.admissionYear}
                  onChange={handleChange}
                  required
                  disabled={limitReached}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="2024-2025"
                />
              </div>

              {/* Profile Picture Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Profile Picture
                </label>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-400 dark:hover:border-primary-500 transition-colors duration-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="student-profile-pic-upload"
                    disabled={limitReached}
                  />
                  <label
                    htmlFor="student-profile-pic-upload"
                    className="cursor-pointer block"
                  >
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {previewUrl ? 'Click to change image' : 'Click to upload profile picture'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </label>
                </div>

                {/* Image Preview */}
                {previewUrl && (
                  <div className="mt-4 flex justify-center">
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Profile preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600 shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 focus:outline-none shadow-lg"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 rounded-md bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60"
              disabled={submitting || classesLoading || limitReached}
            >
              {submitting ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Student' : 'Add Student')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudentDrawer;
