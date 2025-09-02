import React, { useState, useEffect } from 'react';
import { studentService } from '../../../services/studentService';
import { classroomService, Classroom } from '../../../services/classroomService';
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
  }, profilePicFile?: File) => void;
  onEditStudent?: (studentId: string, studentData: {
    name: string;
    email: string;
    phoneNo: string;
    admissionYear: string;
    classId: string;
  }, profilePicFile?: File) => void;
  student?: {
    studentId: string;
    name: string;
    email: string;
    phoneNo: string;
    admissionYear: string;
    classId: string;
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
  const isEdit = !!student;
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phoneNo: '',
    admissionYear: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString(),
    classId: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

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

  useEffect(() => {
    if (open) {
      if (isEdit && student) {
        setForm({
          name: student.name,
          email: student.email,
          password: '', // Password not returned from API for security
          phoneNo: student.phoneNo || '',
          admissionYear: student.admissionYear,
          classId: student.classId,
        });
        if (student.profilePic) {
          setPreviewUrl(student.profilePic);
        }
      } else {
        setForm({
          name: '',
          email: '',
          password: '',
          phoneNo: '',
          admissionYear: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString(),
          classId: '',
        });
        setSelectedFile(null);
        setPreviewUrl('');
      }
    }
  }, [open, isEdit, student]);

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
    setSubmitting(true);
    try {
      if (isEdit && student && onEditStudent) {
        await onEditStudent(student.studentId, {
          name: form.name,
          email: form.email,
          phoneNo: form.phoneNo,
          admissionYear: form.admissionYear,
          classId: form.classId,
        }, selectedFile || undefined);
      } else {
        await onAddStudent({
          name: form.name,
          email: form.email,
          password: form.password,
          phoneNo: form.phoneNo,
          admissionYear: form.admissionYear,
          classId: form.classId,
        }, selectedFile || undefined);
      }
    } catch (err) {
      toast.error(isEdit ? 'Failed to update student.' : 'Failed to add student.');
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Name */}
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter password"
                  />
                </div>
              )}

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
                  disabled={submitting || classesLoading}
                  className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 ${
                    (submitting || classesLoading) ? 'opacity-50 cursor-not-allowed' : ''
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
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
              disabled={submitting || classesLoading}
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
