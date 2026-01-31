import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import type { VEBookMergeBook } from '../../../services/masterAdminVEBooksService';

interface MergeBookModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  initial?: VEBookMergeBook | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: { mergeBookName: string; pdf?: File | null }) => Promise<void>;
}

const MergeBookModal: React.FC<MergeBookModalProps> = ({ isOpen, mode, initial, loading, onClose, onSubmit }) => {
  const { isDarkMode } = useDarkMode();
  const [mergeBookName, setMergeBookName] = useState('');
  const [pdf, setPdf] = useState<File | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setMergeBookName(initial?.mergeBookName || '');
    setPdf(null);
  }, [isOpen, initial]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ mergeBookName, pdf });
  };

  const pdfRequired = mode === 'add';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {mode === 'add' ? 'Add Merged Book' : 'Edit Merged Book'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Name *
            </label>
            <input
              type="text"
              required
              value={mergeBookName}
              onChange={(e) => setMergeBookName(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
              }`}
              placeholder="e.g. Final Compilation"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              PDF {pdfRequired ? '*' : '(optional)'}
            </label>
            <input
              type="file"
              accept="application/pdf"
              required={pdfRequired}
              onChange={(e) => setPdf(e.target.files?.[0] || null)}
              className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            {mode === 'edit' && initial?.pdfUrl && (
              <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Leave empty to keep current PDF.
              </p>
            )}
          </div>

          <div className={`flex justify-end gap-3 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? 'Saving...' : mode === 'add' ? 'Add' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MergeBookModal;

