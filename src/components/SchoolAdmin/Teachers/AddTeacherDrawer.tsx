import React, { useState } from 'react';
import { teacherService } from '../../../services/teacherService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AddTeacherDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddTeacher: (teacher: { 
    teacherName: string; 
    email: string; 
    password: string; 
    phoneNo: string;
    profilePic?: string;
    subjects: string[];
    classesAssigned: string[];
    schoolName: string 
  }) => void;
  onEditTeacher?: (teacherId: string, teacherData: {
    teacherName: string;
    email: string;
    phoneNo: string;
    subjects: string[];
    classesAssigned: string[];
  }) => void;
  schoolName: string;
  schoolId: string;
  teacher?: {
    teacherId: string;
    name: string;
    email: string;
    password: string;
    phoneNo: string;
    profilePic?: string;
    subjects: string[];
    classesAssigned: string[];
    schoolName: string;
    schoolId: string;
  };
}

const AddTeacherDrawer: React.FC<AddTeacherDrawerProps> = ({ open, onClose, onAddTeacher, onEditTeacher, schoolName, schoolId, teacher }) => {
  const isEdit = !!teacher;
  const [form, setForm] = useState({
    teacherName: '',
    email: '',
    password: '',
    phoneNo: '',
    profilePic: '',
    subjects: [''],
    classesAssigned: [''],
    schoolName: '',
  });
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (open) {
      if (isEdit && teacher) {
        setForm({
          teacherName: teacher.name,
          email: teacher.email,
          password: teacher.password || '',
          phoneNo: teacher.phoneNo || '',
          profilePic: teacher.profilePic || '',
          subjects: teacher.subjects || [''],
          classesAssigned: teacher.classesAssigned || [''],
          schoolName: teacher.schoolName,
        });
      } else {
        setForm(f => ({ ...f, schoolName: schoolName || '' }));
      }
    }
  }, [open, schoolName, isEdit, teacher]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (field: 'subjects' | 'classesAssigned', index: number, value: string) => {
    const newArray = [...form[field]];
    newArray[index] = value;
    setForm({ ...form, [field]: newArray });
  };

  const addArrayItem = (field: 'subjects' | 'classesAssigned') => {
    setForm({ ...form, [field]: [...form[field], ''] });
  };

  const removeArrayItem = (field: 'subjects' | 'classesAssigned', index: number) => {
    const newArray = form[field].filter((_, i) => i !== index);
    setForm({ ...form, [field]: newArray });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit && teacher && onEditTeacher) {
        await onEditTeacher(teacher.teacherId, {
          teacherName: form.teacherName,
          email: form.email,
          phoneNo: form.phoneNo,
          subjects: form.subjects.filter(s => s.trim() !== ''),
          classesAssigned: form.classesAssigned.filter(c => c.trim() !== ''),
        });
      } else {
        await onAddTeacher(form);
      }
    } catch (err) {
      toast.error(isEdit ? 'Failed to update teacher.' : 'Failed to add teacher.');
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
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{isEdit ? 'Edit Teacher' : 'Add Teacher'}</h2>
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
        <div className="p-6 space-y-6 max-h-full overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teacher Name</label>
              <input
                type="text"
                name="teacherName"
                value={form.teacherName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter teacher name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Picture URL</label>
              <input
                type="url"
                name="profilePic"
                value={form.profilePic}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter profile picture URL (optional)"
              />
            </div>
            
            {/* Subjects */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subjects</label>
              {form.subjects.map((subject, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => handleArrayChange('subjects', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter subject"
                  />
                  {form.subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('subjects', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('subjects')}
                className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
              >
                + Add Subject
              </button>
            </div>

            {/* Classes Assigned */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Classes Assigned</label>
              {form.classesAssigned.map((className, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => handleArrayChange('classesAssigned', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter class name"
                  />
                  {form.classesAssigned.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('classesAssigned', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('classesAssigned')}
                className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
              >
                + Add Class
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">School Name</label>
              <input
                type="text"
                name="schoolName"
                value={form.schoolName}
                readOnly
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 cursor-not-allowed"
                placeholder="School name"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
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
                className="px-4 py-2 rounded-md bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Teacher' : 'Add Teacher')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTeacherDrawer; 