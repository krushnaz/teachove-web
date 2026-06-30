import React, { useEffect, useRef, useState } from 'react';
import { X, Download, FileText, Printer } from 'lucide-react';
import { GeneratedQuestionPaper } from '../../../models/generatedQuestionPaper';
import QuestionPaperPreview from './QuestionPaperPreview';
import { exportPaperAsPdf, exportPaperAsWord, SchoolInfo } from './exportUtils';

interface PaperPreviewModalProps {
  open: boolean;
  onClose: () => void;
  paper: GeneratedQuestionPaper | null;
  school?: SchoolInfo;
  loading?: boolean;
}

const PaperPreviewModal: React.FC<PaperPreviewModalProps> = ({
  open,
  onClose,
  paper,
  school,
  loading = false,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handlePdf = async () => {
    if (!paper) return;
    setExporting(true);
    try {
      await exportPaperAsPdf(paper, school);
      onClose();
    } finally {
      setExporting(false);
    }
  };

  const handleWord = async () => {
    if (!paper) return;
    setExporting(true);
    try {
      await exportPaperAsWord(paper, school);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60">
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate flex-1">
          {paper?.examName || 'Preview'}
        </h2>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            disabled={!paper || exporting}
            onClick={handlePdf}
            className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-indigo-600 text-white disabled:opacity-50"
          >
            <Download size={14} /> <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            type="button"
            disabled={!paper}
            onClick={handleWord}
            className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50"
          >
            <FileText size={14} /> <span className="hidden sm:inline">Word</span>
          </button>
          <button
            type="button"
            disabled={!paper}
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <Printer size={16} /> Print
          </button>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        ) : paper ? (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <QuestionPaperPreview ref={previewRef} paper={paper} school={school} />
          </div>
        ) : (
          <p className="text-center text-gray-500 py-20">Paper not found</p>
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .fixed.inset-0 .max-w-4xl, .fixed.inset-0 .max-w-4xl * { visibility: visible !important; }
          .fixed.inset-0 .max-w-4xl { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default PaperPreviewModal;
