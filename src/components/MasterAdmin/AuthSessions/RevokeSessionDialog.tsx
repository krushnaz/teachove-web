import React from 'react';
import { AlertTriangle, ShieldOff, X } from 'lucide-react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { AuthSession } from '../../../services/authSessionService';

interface RevokeSessionDialogProps {
  open: boolean;
  session: AuthSession | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const RevokeSessionDialog: React.FC<RevokeSessionDialogProps> = ({
  open,
  session,
  loading = false,
  onClose,
  onConfirm,
}) => {
  const { isDarkMode } = useDarkMode();

  if (!open || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="revoke-session-title"
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className={`p-3 rounded-xl ${
              isDarkMode ? 'bg-rose-900/30' : 'bg-rose-50'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${
                isDarkMode ? 'text-rose-400' : 'text-rose-600'
              }`} />
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`p-1 rounded-lg transition-colors disabled:opacity-50 ${
                isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2
            id="revoke-session-title"
            className={`mt-4 text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Revoke session?
          </h2>
          <p className={`mt-2 text-sm leading-relaxed ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            This will immediately log out <strong>{session.userName}</strong> from{' '}
            <strong>{session.deviceName}</strong>. They will be signed out on that device in real time.
          </p>

          <div className={`mt-4 rounded-xl border p-4 text-sm ${
            isDarkMode ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex justify-between gap-4">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Role</span>
              <span className={`capitalize font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {session.role}
              </span>
            </div>
            <div className="flex justify-between gap-4 mt-2">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Platform</span>
              <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {session.platform}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50"
            >
              <ShieldOff className="w-4 h-4" />
              {loading ? 'Revoking…' : 'Revoke Session'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevokeSessionDialog;
