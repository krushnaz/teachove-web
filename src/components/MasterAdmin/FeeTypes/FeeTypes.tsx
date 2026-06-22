import React, { useState, useEffect, useMemo } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import {
  masterAdminFeeTypeService,
  FeeType,
} from '../../../services/masterAdminFeeTypeService';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Receipt,
  CheckCircle,
  XCircle,
  Loader,
  Database,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';

const emptyForm = {
  name: '',
  code: '',
  description: '',
  category: 'custom' as FeeType['category'],
  pricingModel: 'manual' as FeeType['pricingModel'],
  sortOrder: 99,
};

const FeeTypes: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFeeType, setSelectedFeeType] = useState<FeeType | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchFeeTypes();
  }, []);

  const fetchFeeTypes = async () => {
    try {
      setLoading(true);
      const data = await masterAdminFeeTypeService.getFeeTypes();
      setFeeTypes(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load fee types';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    try {
      setActionLoading('seed');
      const result = await masterAdminFeeTypeService.seedDefaults();
      toast.success(result.message || 'Default fee types seeded');
      fetchFeeTypes();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to seed defaults';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSyncAllSchools = async (dryRun: boolean) => {
    try {
      setActionLoading(dryRun ? 'sync-dry' : 'sync');
      const result = await masterAdminFeeTypeService.syncAllSchools(dryRun);
      toast.success(result.message || 'School sync complete');
      if (dryRun && result.results) {
        console.info('Fee sync dry run:', result.results);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sync schools';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setFormError('Name and code are required');
      return;
    }
    try {
      setActionLoading('add');
      await masterAdminFeeTypeService.addFeeType(formData);
      toast.success('Fee type added');
      setAddModalOpen(false);
      setFormData(emptyForm);
      setFormError('');
      fetchFeeTypes();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add fee type';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeType) return;
    const id = selectedFeeType.id || selectedFeeType.feeTypeId || '';
    try {
      setActionLoading('edit');
      await masterAdminFeeTypeService.updateFeeType(id, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        pricingModel: formData.pricingModel,
        sortOrder: formData.sortOrder,
      });
      toast.success('Fee type updated');
      setEditModalOpen(false);
      setSelectedFeeType(null);
      setFormData(emptyForm);
      fetchFeeTypes();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update fee type';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedFeeType) return;
    const id = selectedFeeType.id || selectedFeeType.feeTypeId || '';
    try {
      setActionLoading('delete');
      await masterAdminFeeTypeService.deleteFeeType(id);
      toast.success('Fee type deleted');
      setDeleteModalOpen(false);
      setSelectedFeeType(null);
      fetchFeeTypes();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete fee type';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async (feeType: FeeType) => {
    const id = feeType.id || feeType.feeTypeId || '';
    try {
      setActionLoading(`toggle-${id}`);
      await masterAdminFeeTypeService.toggleActiveStatus(id, !feeType.isActive);
      toast.success(`Fee type ${feeType.isActive ? 'deactivated' : 'activated'}`);
      fetchFeeTypes();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to toggle status';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (feeType: FeeType) => {
    setSelectedFeeType(feeType);
    setFormData({
      name: feeType.name,
      code: feeType.code,
      description: feeType.description || '',
      category: feeType.category,
      pricingModel: feeType.pricingModel,
      sortOrder: feeType.sortOrder ?? 99,
    });
    setFormError('');
    setEditModalOpen(true);
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return feeTypes;
    return feeTypes.filter(
      (ft) =>
        ft.name.toLowerCase().includes(term) ||
        ft.code.toLowerCase().includes(term)
    );
  }, [feeTypes, searchTerm]);

  const renderFormFields = (isEdit: boolean) => (
    <div className="space-y-4">
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-4 py-2 rounded-lg border ${
            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          }`}
          required
        />
      </div>
      {!isEdit && (
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. transport_fee"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
            required
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value as FeeType['category'] })
            }
            disabled={isEdit && selectedFeeType?.isSystemPreset}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="school_fee">School Fee</option>
            <option value="misc">Misc</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Pricing
          </label>
          <select
            value={formData.pricingModel}
            onChange={(e) =>
              setFormData({
                ...formData,
                pricingModel: e.target.value as FeeType['pricingModel'],
              })
            }
            disabled={isEdit && selectedFeeType?.isSystemPreset}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="class_based">Class based</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Sort order
        </label>
        <input
          type="number"
          value={formData.sortOrder}
          onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
          className={`w-full px-4 py-2 rounded-lg border ${
            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          }`}
        />
      </div>
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
          className={`w-full px-4 py-2 rounded-lg border ${
            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          }`}
        />
      </div>
      {formError && <p className="text-sm text-red-500">{formError}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Fee Types
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Global fee catalog used by all schools. Seed defaults once, then sync existing schools.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button
            onClick={handleSeedDefaults}
            disabled={actionLoading === 'seed'}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50"
          >
            {actionLoading === 'seed' ? <Loader className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            Seed Defaults
          </button>
          <button
            onClick={() => handleSyncAllSchools(true)}
            disabled={actionLoading === 'sync-dry'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            } disabled:opacity-50`}
          >
            {actionLoading === 'sync-dry' ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Dry Run Sync
          </button>
          <button
            onClick={() => handleSyncAllSchools(false)}
            disabled={actionLoading === 'sync'}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium disabled:opacity-50"
          >
            {actionLoading === 'sync' ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sync All Schools
          </button>
          <button
            onClick={() => {
              setFormData(emptyForm);
              setFormError('');
              setAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Fee Type
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        <input
          type="text"
          placeholder="Search by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
            isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
          }`}
        />
      </div>

      <div className={`rounded-lg border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                {['Name', 'Code', 'Category', 'Pricing', 'Order', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`px-6 py-12 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No fee types. Click &quot;Seed Defaults&quot; to create the 5 system presets.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((ft) => {
                  const id = ft.id || ft.feeTypeId || '';
                  const busy = actionLoading?.includes(id);
                  return (
                    <tr key={id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className={`px-4 py-3 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {ft.name}
                        {ft.isSystemPreset && (
                          <span className="ml-2 text-[10px] uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                            System
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{ft.code}</td>
                      <td className={`px-4 py-3 text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{ft.category}</td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{ft.pricingModel}</td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{ft.sortOrder}</td>
                      <td className="px-4 py-3">
                        {ft.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleToggle(ft)}
                            disabled={busy}
                            className="p-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
                          >
                            {busy ? <Loader className="w-4 h-4 animate-spin" /> : ft.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                          <button onClick={() => openEdit(ft)} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <Edit className="w-4 h-4" />
                          </button>
                          {!ft.isSystemPreset && (
                            <button
                              onClick={() => {
                                setSelectedFeeType(ft);
                                setDeleteModalOpen(true);
                              }}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-md w-full p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add Fee Type</h2>
            <form onSubmit={handleAdd}>
              {renderFormFields(false)}
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setAddModalOpen(false)} className="flex-1 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading === 'add'} className="flex-1 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50">
                  {actionLoading === 'add' ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editModalOpen && selectedFeeType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-md w-full p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Fee Type</h2>
            <form onSubmit={handleEdit}>
              {renderFormFields(true)}
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setEditModalOpen(false)} className="flex-1 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading === 'edit'} className="flex-1 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalOpen && selectedFeeType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-md w-full p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delete Fee Type</h2>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Delete <strong>{selectedFeeType.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={actionLoading === 'delete'} className="flex-1 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeTypes;
