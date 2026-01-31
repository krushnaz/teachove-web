import React, { useState, useEffect, useMemo } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { masterAdminAcademicYearService, AcademicYear } from '../../../services/masterAdminAcademicYearService';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff,
  Calendar,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';
import { toast } from 'react-toastify';

const AcademicYears: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({ academicYear: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const data = await masterAdminAcademicYearService.getAcademicYears();
      setAcademicYears(data);
    } catch (error: any) {
      console.error('Error fetching academic years:', error);
      toast.error(error.message || 'Failed to load academic years');
    } finally {
      setLoading(false);
    }
  };

  const validateAcademicYear = (year: string): boolean => {
    const yearPattern = /^\d{4}-\d{4}$/;
    if (!yearPattern.test(year)) {
      setFormError('Academic year must be in format YYYY-YYYY (e.g., 2025-2026)');
      return false;
    }

    const [startYear, endYear] = year.split('-').map(Number);
    if (endYear !== startYear + 1) {
      setFormError('End year must be exactly one year after start year (e.g., 2025-2026)');
      return false;
    }

    setFormError('');
    return true;
  };

  const handleAddAcademicYear = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAcademicYear(formData.academicYear)) {
      return;
    }

    try {
      setActionLoading('add');
      await masterAdminAcademicYearService.addAcademicYear({ academicYear: formData.academicYear });
      toast.success('Academic year added successfully!');
      setAddModalOpen(false);
      setFormData({ academicYear: '' });
      setFormError('');
      fetchAcademicYears();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add academic year');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditAcademicYear = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAcademicYear || !validateAcademicYear(formData.academicYear)) {
      return;
    }

    try {
      setActionLoading('edit');
      await masterAdminAcademicYearService.updateAcademicYear(
        selectedAcademicYear.id || selectedAcademicYear.academicYearId || '',
        { academicYear: formData.academicYear }
      );
      toast.success('Academic year updated successfully!');
      setEditModalOpen(false);
      setSelectedAcademicYear(null);
      setFormData({ academicYear: '' });
      setFormError('');
      fetchAcademicYears();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update academic year');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAcademicYear = async () => {
    if (!selectedAcademicYear) return;

    const academicYearId = selectedAcademicYear.id || selectedAcademicYear.academicYearId || '';
    if (!academicYearId) return;

    try {
      setActionLoading('delete');
      await masterAdminAcademicYearService.deleteAcademicYear(academicYearId);
      toast.success('Academic year deleted successfully!');
      setDeleteModalOpen(false);
      setSelectedAcademicYear(null);
      fetchAcademicYears();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete academic year');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActivation = async (academicYear: AcademicYear) => {
    const academicYearId = academicYear.id || academicYear.academicYearId || '';
    if (!academicYearId) return;

    try {
      setActionLoading(`toggle-${academicYearId}`);
      const newStatus = !academicYear.isActive;
      await masterAdminAcademicYearService.toggleActiveStatus(academicYearId, newStatus);
      toast.success(`Academic year ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchAcademicYears();
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle academic year status');
    } finally {
      setActionLoading(null);
    }
  };

  const openAddModal = () => {
    setFormData({ academicYear: '' });
    setFormError('');
    setAddModalOpen(true);
  };

  const openEditModal = (academicYear: AcademicYear) => {
    setSelectedAcademicYear(academicYear);
    setFormData({ academicYear: academicYear.academicYear });
    setFormError('');
    setEditModalOpen(true);
  };

  const openDeleteModal = (academicYear: AcademicYear) => {
    setSelectedAcademicYear(academicYear);
    setDeleteModalOpen(true);
  };

  const filteredAcademicYears = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return academicYears;
    return academicYears.filter(ay =>
      ay.academicYear?.toLowerCase().includes(term)
    );
  }, [academicYears, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Academic Years Management
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage academic years for the platform
          </p>
        </div>
        <button
          onClick={openAddModal}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isDarkMode
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <Plus className="w-5 h-5" />
          Add Academic Year
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`} />
        <input
          type="text"
          placeholder="Search academic years..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        />
      </div>

      {/* Academic Years Table */}
      <div className={`rounded-lg border overflow-hidden ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Academic Year
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Created
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              {filteredAcademicYears.length === 0 ? (
                <tr>
                  <td colSpan={4} className={`px-6 py-12 text-center ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No academic years found</p>
                  </td>
                </tr>
              ) : (
                filteredAcademicYears.map((academicYear) => {
                  const academicYearId = academicYear.id || academicYear.academicYearId || '';
                  const isLoading = actionLoading === `toggle-${academicYearId}` || 
                                   actionLoading === `edit-${academicYearId}` || 
                                   actionLoading === `delete-${academicYearId}`;

                  return (
                    <tr key={academicYearId} className={`hover:${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    } transition-colors`}>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        <div className="flex items-center gap-3">
                          <Calendar className={`w-5 h-5 ${
                            academicYear.isActive 
                              ? 'text-green-500' 
                              : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <span className="font-medium">{academicYear.academicYear}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {academicYear.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {academicYear.createdAt 
                          ? new Date(academicYear.createdAt.seconds * 1000 || academicYear.createdAt).toLocaleDateString()
                          : 'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleActivation(academicYear)}
                            disabled={isLoading}
                            className={`p-2 rounded-lg transition-colors ${
                              academicYear.isActive
                                ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                            } disabled:opacity-50`}
                            title={academicYear.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {isLoading ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : academicYear.isActive ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openEditModal(academicYear)}
                            disabled={isLoading}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode
                                ? 'text-blue-400 hover:bg-blue-900/20'
                                : 'text-blue-600 hover:bg-blue-50'
                            } disabled:opacity-50`}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(academicYear)}
                            disabled={isLoading}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode
                                ? 'text-red-400 hover:bg-red-900/20'
                                : 'text-red-600 hover:bg-red-50'
                            } disabled:opacity-50`}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-xl max-w-md w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Add Academic Year
              </h2>
            </div>
            <form onSubmit={handleAddAcademicYear} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2025-2026"
                  value={formData.academicYear}
                  onChange={(e) => {
                    setFormData({ academicYear: e.target.value });
                    setFormError('');
                  }}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    formError
                      ? 'border-red-500'
                      : isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  required
                />
                {formError && (
                  <p className="mt-1 text-sm text-red-500">{formError}</p>
                )}
                <p className={`mt-1 text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Format: YYYY-YYYY (e.g., 2025-2026)
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setFormData({ academicYear: '' });
                    setFormError('');
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'add'}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {actionLoading === 'add' ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Adding...
                    </span>
                  ) : (
                    'Add Academic Year'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedAcademicYear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-xl max-w-md w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Edit Academic Year
              </h2>
            </div>
            <form onSubmit={handleEditAcademicYear} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2025-2026"
                  value={formData.academicYear}
                  onChange={(e) => {
                    setFormData({ academicYear: e.target.value });
                    setFormError('');
                  }}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    formError
                      ? 'border-red-500'
                      : isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  required
                />
                {formError && (
                  <p className="mt-1 text-sm text-red-500">{formError}</p>
                )}
                <p className={`mt-1 text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Format: YYYY-YYYY (e.g., 2025-2026)
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedAcademicYear(null);
                    setFormData({ academicYear: '' });
                    setFormError('');
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'edit'}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {actionLoading === 'edit' ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    'Update Academic Year'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedAcademicYear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-xl max-w-md w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Delete Academic Year
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Are you sure you want to delete the academic year <strong>{selectedAcademicYear.academicYear}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setSelectedAcademicYear(null);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAcademicYear}
                  disabled={actionLoading === 'delete'}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {actionLoading === 'delete' ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Deleting...
                    </span>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicYears;
