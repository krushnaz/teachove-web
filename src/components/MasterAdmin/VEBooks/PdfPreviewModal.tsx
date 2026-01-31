import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useDarkMode } from '../../../contexts/DarkModeContext';

interface PdfPreviewModalProps {
  isOpen: boolean;
  title: string;
  pdfUrl: string;
  onClose: () => void;
}

const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ isOpen, title, pdfUrl, onClose }) => {
  const { isDarkMode } = useDarkMode();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden ${
          isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        }`}
      >
        <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div>
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Open in new tab <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full h-full">
          <iframe title={title} src={pdfUrl} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;

