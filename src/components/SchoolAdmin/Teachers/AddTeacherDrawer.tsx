import React, { useState } from 'react';
import { teacherService } from '../../../services/teacherService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AddTeacherDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddTeacher: (teacher: { name: string; email: string; password: string; schoolName: string }) => void;
  schoolName: string;
  schoolId: string;
  teacher?: {
    teacherId: string;
    name: string;
    email: string;
    password: string;
    schoolName: string;
    schoolId: string;
  };
}

const AddTeacherDrawer: React.FC<AddTeacherDrawerProps> = ({ open, onClose, onAddTeacher, schoolName, schoolId, teacher }) => {
  const isEdit = !!teacher;
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    schoolName: '',
  });
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (open) {
      if (isEdit && teacher) {
        setForm({
          name: teacher.name,
          email: teacher.email,
          password: teacher.password || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit && teacher) {
        await teacherService.updateTeacherById(teacher.teacherId, { ...form, schoolId });
        toast.success('Teacher updated successfully!');
      } else {
        await teacherService.addTeacher({ ...form, schoolId });
        toast.success('Teacher added successfully!');
      }
      await onAddTeacher(form);
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
        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
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
  );
};

export default AddTeacherDrawer; 