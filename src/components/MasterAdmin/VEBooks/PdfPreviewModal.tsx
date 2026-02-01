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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-5xl h-[90vh] sm:h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
          isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        }`}
      >
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 border-b flex-shrink-0 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="min-w-0 flex-1">
            <h2 className={`text-base sm:text-lg font-bold truncate pr-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
            >
              Open in new tab <ExternalLink className="w-4 h-4 flex-shrink-0" />
            </a>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 self-end sm:self-auto touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full flex-1 min-h-0">
          <iframe title={title} src={pdfUrl} className="w-full h-full min-h-[300px]" />
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;

