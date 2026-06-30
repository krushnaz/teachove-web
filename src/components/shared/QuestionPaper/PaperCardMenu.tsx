import React, { useEffect, useRef, useState } from 'react';
import {
  Archive,
  Copy,
  Edit,
  Eye,
  FileText,
  Download,
  MoreVertical,
  Trash2,
} from 'lucide-react';

export interface PaperMenuAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface PaperCardMenuProps {
  actions: PaperMenuAction[];
  className?: string;
}

const PaperCardMenu: React.FC<PaperCardMenuProps> = ({ actions, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        aria-label="More options"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 min-w-[180px] py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={action.disabled}
              onClick={() => {
                setOpen(false);
                action.onClick();
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 ${
                action.danger ? 'text-red-600' : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const paperMenuIcons = {
  preview: <Eye size={16} />,
  pdf: <Download size={16} />,
  word: <FileText size={16} />,
  edit: <Edit size={16} />,
  duplicate: <Copy size={16} />,
  archive: <Archive size={16} />,
  delete: <Trash2 size={16} />,
};

export default PaperCardMenu;
