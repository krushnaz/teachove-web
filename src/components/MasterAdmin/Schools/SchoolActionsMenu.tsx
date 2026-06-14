import React, { useEffect, useRef } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { School } from '../../../services/masterAdminSchoolService';
import { Crown, Edit, Eye, MoreVertical, Power, PowerOff, Trash2 } from 'lucide-react';

interface SchoolActionsMenuProps {
  school: School;
  isOpen: boolean;
  isToggleLoading: boolean;
  onToggle: () => void;
  onClose: () => void;
  onView: () => void;
  onViewPlans: () => void;
  onEdit: () => void;
  onToggleActivation: () => void;
  onDelete: () => void;
}

const SchoolActionsMenu: React.FC<SchoolActionsMenuProps> = ({
  school,
  isOpen,
  isToggleLoading,
  onToggle,
  onClose,
  onView,
  onViewPlans,
  onEdit,
  onToggleActivation,
  onDelete,
}) => {
  const { isDarkMode } = useDarkMode();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const itemClass = `flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
    isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
  }`;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`rounded-lg p-2 transition-colors ${
          isDarkMode
            ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        }`}
        aria-label="School actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border shadow-lg ${
            isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" className={itemClass} onClick={onView}>
            <Eye className="h-4 w-4 text-blue-500" />
            View Profile
          </button>
          <button type="button" className={itemClass} onClick={onViewPlans}>
            <Crown className="h-4 w-4 text-indigo-500" />
            View Plans
          </button>
          <button type="button" className={itemClass} onClick={onEdit}>
            <Edit className="h-4 w-4 text-indigo-500" />
            Edit School
          </button>
          <button
            type="button"
            className={itemClass}
            onClick={onToggleActivation}
            disabled={isToggleLoading}
          >
            {isToggleLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : school.isActive ? (
              <PowerOff className="h-4 w-4 text-orange-500" />
            ) : (
              <Power className="h-4 w-4 text-green-500" />
            )}
            {school.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`} />
          <button
            type="button"
            className={`${itemClass} ${isDarkMode ? 'hover:bg-red-900/20 text-red-300' : 'hover:bg-red-50 text-red-600'}`}
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete School
          </button>
        </div>
      )}
    </div>
  );
};

export default SchoolActionsMenu;
