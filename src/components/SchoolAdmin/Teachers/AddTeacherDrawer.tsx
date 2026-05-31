import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Camera, 
  Trash2, 
  Plus, 
  Check, 
  AlertCircle,
  Loader2
} from 'lucide-react';

interface AddTeacherDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddTeacher: (teacher: { 
    teacherName: string; 
    email: string; 
    password: string; 
    phoneNo: string;
  }, profilePicFile?: File) => void;
  onEditTeacher?: (teacherId: string, teacherData: {
    teacherName: string;
    email: string;
    phoneNo: string;
  }, profilePicFile?: File) => void;
  schoolName: string;
  schoolId: string;
  teacher?: {
    teacherId: string;
    name: string;
    email: string;
    password: string;
    phoneNo: string;
    profilePic?: string;
    schoolName: string;
    schoolId: string;
  };
}

const AddTeacherDrawer: React.FC<AddTeacherDrawerProps> = ({ open, onClose, onAddTeacher, onEditTeacher, teacher }) => {
  const isEdit = !!teacher;
  const [form, setForm] = useState({
    teacherName: '',
    email: '',
    password: '',
    phoneNo: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (open) {
      if (isEdit && teacher) {
        setForm({
          teacherName: teacher.name,
          email: teacher.email,
          password: teacher.password || '',
          phoneNo: teacher.phoneNo || '',
        });
        setPreviewUrl(teacher.profilePic || '');
      } else {
        setForm({
          teacherName: '',
          email: '',
          password: '',
          phoneNo: '',
        });
        setSelectedFile(null);
        setPreviewUrl('');
      }
    }
  }, [open, isEdit, teacher]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be below 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedFile(null);
    setPreviewUrl(isEdit ? (teacher?.profilePic || '') : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.teacherName || !form.email || (!isEdit && !form.password)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && teacher && onEditTeacher) {
        await onEditTeacher(teacher.teacherId, {
          teacherName: form.teacherName,
          email: form.email,
          phoneNo: form.phoneNo,
        }, selectedFile || undefined);
      } else {
        await onAddTeacher(form, selectedFile || undefined);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[200] transition-opacity duration-300 ${
          open ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 z-[201] shadow-2xl transition-transform duration-500 ease-out transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEdit ? 'Update Faculty' : 'Enroll New Teacher'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isEdit ? 'Modify existing teacher credentials' : 'Add a new member to the school staff'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
            <form id="teacher-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Pic Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-3xl bg-primary-50 dark:bg-primary-900/20 border-2 border-dashed border-primary-200 dark:border-primary-800 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary-400">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={32} className="text-primary-400" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  {previewUrl && (
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Professional Photograph</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Recommended square format, max 5MB</p>
                </div>
              </div>

              {/* Data Fields */}
              <div className="grid grid-cols-1 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Full Identity</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                      type="text"
                      name="teacherName"
                      value={form.teacherName}
                      onChange={handleChange}
                      placeholder="e.g. Dr. Robert Wilson"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Work Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="teacher@institution.edu"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Contact Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                      type="tel"
                      name="phoneNo"
                      value={form.phoneNo}
                      onChange={handleChange}
                      placeholder="+1 (000) 000-0000"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Password (only if adding) */}
                {!isEdit && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Secure Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-6 border-t border-gray-100 dark:border-gray-800 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-6 rounded-2xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button
              form="teacher-form"
              type="submit"
              disabled={submitting}
              className="flex-[2] py-4 px-6 bg-primary-600 text-white rounded-2xl font-extrabold shadow-xl shadow-primary-600/30 hover:bg-primary-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isEdit ? <Check size={20} /> : <Plus size={20} />}
                  <span>{isEdit ? 'Update Details' : 'Securely Add Staff'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTeacherDrawer;
