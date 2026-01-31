import React, { useEffect, useMemo, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { masterAdminMigrationService, MigrationModule } from '../../../services/masterAdminMigrationService';

interface StartMigrationModalProps {
  isOpen: boolean;
  legacySchoolId: string;
  schoolName: string;
  onClose: () => void;
  onStarted: (runId: string) => void;
}

const StartMigrationModal: React.FC<StartMigrationModalProps> = ({ isOpen, legacySchoolId, schoolName, onClose, onStarted }) => {
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<MigrationModule[]>([]);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    (async () => {
      try {
        const mods = await masterAdminMigrationService.getModules();
        setModules(mods);
        setSelectedModules(new Set(mods));
      } catch (_e) {
        // handled by parent via toast in start action if needed
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen]);

  const canStart = useMemo(() => legacySchoolId.trim().length > 0 && selectedModules.size > 0 && !loading, [legacySchoolId, selectedModules, loading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Start Migration</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              School: <b>{schoolName}</b>
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className={`p-4 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-gray-50'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <b>Legacy School ID:</b> {legacySchoolId}
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              We will create `newSchool/{legacySchoolId}` using the same ID, then migrate all selected modules.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Modules to migrate</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedModules(new Set(modules))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModules(new Set())}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 p-3 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-gray-50'}`}>
              {modules.map((m) => {
                const checked = selectedModules.has(m);
                return (
                  <label key={m} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-white'}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = new Set(selectedModules);
                        if (checked) next.delete(m);
                        else next.add(m);
                        setSelectedModules(next);
                      }}
                    />
                    <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{m}</span>
                  </label>
                );
              })}
            </div>
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
              type="button"
              disabled={!canStart}
              onClick={async () => {
                try {
                  setLoading(true);
                  const res = await masterAdminMigrationService.startLegacyMigration({
                    legacySchoolId: legacySchoolId.trim(),
                    modules: Array.from(selectedModules) as MigrationModule[],
                  });
                  onStarted(res.runId);
                } finally {
                  setLoading(false);
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Starting...
                </span>
              ) : (
                'Start Migration'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartMigrationModal;

