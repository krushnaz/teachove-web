import React, { useState, useEffect } from 'react';
import { classroomService } from '../../../services/classroomService';
import { useAuth } from '../../../contexts/AuthContext';

interface AddStudentDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddStudent: (studentData: {
    name: string;
    email: string;
    password: string;
    phoneNo: string;
    admissionYear: string;
    classId: string;
    rollNo: string;
  }, profilePicFile?: File) => void;
  onEditStudent: (studentId: string, studentData: {
    name: string;
    email: string;
    phoneNo: string;
    admissionYear: string;
    classId: string;
    rollNo: string;
  }, profilePicFile?: File) => void;
  student?: {
    studentId: string;
    name: string;
    email: string;
    phoneNo: string;
    admissionYear: string;
    classId: string;
    rollNo: string;
    profilePic?: string;
  };
  teacherClassId: string;
  teacherClassName: string;
}

const AddStudentDrawer: React.FC<AddStudentDrawerProps> = ({
  open,
  onClose,
  onAddStudent,
  onEditStudent,
  student,
  teacherClassId,
  teacherClassName
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNo: '',
    admissionYear: '',
    rollNo: '',
  });
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [classDetails, setClassDetails] = useState<{ className: string; section: string } | null>(null);
  const [classLoading, setClassLoading] = useState(false);

  // Fetch class details when component opens
  useEffect(() => {
    const fetchClassDetails = async () => {
      if (open && teacherClassId && user?.schoolId) {
        setClassLoading(true);
        try {
          const classData = await classroomService.getClassById(user.schoolId, teacherClassId);
          setClassDetails({
            className: classData.className,
            section: classData.section
          });
        } catch (error) {
          console.error('Error fetching class details:', error);
          // Fallback to teacherClassName if API fails
          setClassDetails({
            className: teacherClassName,
            section: ''
          });
        } finally {
          setClassLoading(false);
        }
      }
    };

    fetchClassDetails();
  }, [open, teacherClassId, user?.schoolId, teacherClassName]);

  // Reset form when drawer opens/closes or student changes
  useEffect(() => {
    if (open) {
      if (student) {
        setFormData({
          name: student.name,
          email: student.email,
          password: '',
          phoneNo: student.phoneNo,
          admissionYear: student.admissionYear,
          rollNo: student.rollNo,
        });
        setProfilePicPreview(student.profilePic || '');
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          phoneNo: '',
          admissionYear: '',
          rollNo: '',
        });
        setProfilePicPreview('');
      }
      setProfilePicFile(null);
      setErrors({});
    }
  }, [open, student]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!student && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (!formData.phoneNo.trim()) {
      newErrors.phoneNo = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNo.replace(/\D/g, ''))) {
      newErrors.phoneNo = 'Phone number must be 10 digits';
    }

    if (!formData.admissionYear.trim()) {
      newErrors.admissionYear = 'Admission year is required';
    }

    if (!formData.rollNo.trim()) {
      newErrors.rollNo = 'Roll number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const studentData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        phoneNo: formData.phoneNo.trim(),
        admissionYear: formData.admissionYear.trim(),
        classId: teacherClassId,
        rollNo: formData.rollNo.trim(),
      };

      if (student) {
        await onEditStudent(student.studentId, studentData, profilePicFile || undefined);
      } else {
        await onAddStudent(studentData, profilePicFile || undefined);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {student ? 'Edit Student' : 'Add Student'}
            </h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {profilePicPreview ? (
                      <img
                        src={profilePicPreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      JPG, PNG or GIF (max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="Enter student name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password (only for new students) */}
              {!student && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                  )}
                </div>
              )}

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phoneNo
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="Enter phone number"
                />
                {errors.phoneNo && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phoneNo}</p>
                )}
              </div>

              {/* Class (uneditable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Class
                </label>
                <input
                  type="text"
                  value={
                    classLoading 
                      ? 'Loading...' 
                      : classDetails 
                        ? `${classDetails.className} ${classDetails.section}`.trim()
                        : teacherClassName
                  }
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Students will be added to your assigned class
                </p>
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Roll Number *
                </label>
                <input
                  type="text"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.rollNo
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="Enter roll number"
                />
                {errors.rollNo && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.rollNo}</p>
                )}
              </div>

              {/* Admission Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admission Year *
                </label>
                <input
                  type="text"
                  name="admissionYear"
                  value={formData.admissionYear}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.admissionYear
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="e.g., 2025-2026"
                />
                {errors.admissionYear && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.admissionYear}</p>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {student ? 'Updating...' : 'Adding...'}
                </div>
              ) : (
                student ? 'Update Student' : 'Add Student'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudentDrawer; 