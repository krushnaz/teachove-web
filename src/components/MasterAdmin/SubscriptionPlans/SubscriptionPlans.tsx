import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { masterAdminService } from '../../../services/masterAdminService';
import {
  DollarSign,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  X,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import MasterAdminLayout from '../Layout';

interface SubscriptionPlan {
  id?: string;
  planName: string;
  description?: string;
  amount: number;
  features?: string[];
  isActive: boolean;
  planType?: string;
  duration?: 'monthly' | 'yearly';
  createdAt?: any;
  updatedAt?: any;
}

const SubscriptionPlans: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>({
    planName: '',
    description: '',
    amount: 0,
    features: [],
    isActive: true,
    planType: '',
    duration: 'monthly',
  });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const fetchedPlans = await masterAdminService.getAllSubscriptionPlans();
      setPlans(fetchedPlans);
    } catch (error: any) {
      console.error('Error fetching subscription plans:', error);
      toast.error(error.message || 'Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SubscriptionPlan, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async () => {
    if (!formData.planName || !formData.amount || formData.amount <= 0) {
      toast.error('Please fill in all required fields (Plan Name and Amount)');
      return;
    }

    try {
      setSaving(true);
      if (editingPlan?.id) {
        await masterAdminService.updateSubscriptionPlan(editingPlan.id, formData);
        toast.success('Subscription plan updated successfully!');
      } else {
      await masterAdminService.createSubscriptionPlan({
        planName: formData.planName!,
        description: formData.description || '',
        amount: formData.amount!,
        features: formData.features || [],
        isActive: formData.isActive !== false,
        planType: formData.planType || formData.planName!,
        duration: formData.duration || 'monthly',
      });
        toast.success('Subscription plan created successfully!');
      }
      setShowForm(false);
      setEditingPlan(null);
      setFormData({
        planName: '',
        description: '',
        amount: 0,
        features: [],
        isActive: true,
        planType: '',
      });
      await fetchPlans();
    } catch (error: any) {
      console.error('Error saving subscription plan:', error);
      toast.error(error.message || 'Failed to save subscription plan');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      planName: plan.planName,
      description: plan.description || '',
      amount: plan.amount,
      features: plan.features || [],
      isActive: plan.isActive,
      planType: plan.planType || plan.planName,
      duration: plan.duration || 'monthly',
    });
    setShowForm(true);
  };

  const handleDelete = async (planId: string) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan?')) {
      return;
    }

    try {
      await masterAdminService.deleteSubscriptionPlan(planId);
      toast.success('Subscription plan deleted successfully!');
      await fetchPlans();
    } catch (error: any) {
      console.error('Error deleting subscription plan:', error);
      toast.error(error.message || 'Failed to delete subscription plan');
    }
  };

  const handleToggleStatus = async (planId: string) => {
    try {
      await masterAdminService.togglePlanStatus(planId);
      toast.success('Plan status updated successfully!');
      await fetchPlans();
    } catch (error: any) {
      console.error('Error toggling plan status:', error);
      toast.error(error.message || 'Failed to update plan status');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <MasterAdminLayout title="Subscription Plans Management">
      <div className={`min-h-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4 sm:p-6`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6`}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2.5 sm:p-3 rounded-lg flex-shrink-0 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <DollarSign className={`w-5 h-5 sm:w-6 sm:h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div className="min-w-0">
                  <h2 className={`text-xl sm:text-2xl font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Subscription Plans Management
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Manage subscription plans and pricing for schools
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingPlan(null);
                  setFormData({
                    planName: '',
                    description: '',
                    amount: 0,
                    features: [],
                    isActive: true,
                    planType: '',
                    duration: 'monthly',
                  });
                }}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-colors w-full sm:w-auto touch-manipulation min-h-[44px] ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Plus className="w-4 h-4 flex-shrink-0" />
                Add New Plan
              </button>
            </div>
          </div>

          {/* Plans List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 border ${
                    plan.isActive
                      ? isDarkMode ? 'border-green-500/30' : 'border-green-200'
                      : isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {plan.planName}
                      </h3>
                      {plan.planType && (
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Type: {plan.planType}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        plan.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {plan.description && (
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {plan.description}
                    </p>
                  )}

                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <p className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        ₹{plan.amount.toLocaleString('en-IN')}
                      </p>
                      {plan.duration && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          plan.duration === 'yearly'
                            ? isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
                            : isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {plan.duration === 'yearly' ? 'Yearly' : 'Monthly'}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      per user
                    </p>
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <div className="mb-4">
                      <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Features:
                      </p>
                      <ul className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Check className="w-3 h-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleEdit(plan)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(plan.id!)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        plan.isActive
                          ? isDarkMode
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                          : isDarkMode
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-green-100 hover:bg-green-200 text-green-800'
                      }`}
                      title={plan.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {plan.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id!)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDarkMode
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-red-100 hover:bg-red-200 text-red-800'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit Form Modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
              <div className={`relative w-full max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${
                isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <div className="sticky top-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-inherit z-10">
                  <h3 className={`text-lg sm:text-xl font-bold truncate pr-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingPlan(null);
                      setFormData({
                        planName: '',
                        description: '',
                        amount: 0,
                        features: [],
                        isActive: true,
                        planType: '',
                        duration: 'monthly',
                      });
                    }}
                    className={`p-2 rounded-lg transition-colors flex-shrink-0 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Plan Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.planName || ''}
                      onChange={(e) => handleInputChange('planName', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="e.g., TeachoVE, Both, Premium"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Plan Type
                    </label>
                    <input
                      type="text"
                      value={formData.planType || ''}
                      onChange={(e) => handleInputChange('planType', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="e.g., TeachoVE, Both"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Plan description..."
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.amount || 0}
                      onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter amount"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Duration <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.duration || 'monthly'}
                      onChange={(e) => handleInputChange('duration', e.target.value as 'monthly' | 'yearly')}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Features
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                        className={`flex-1 px-4 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Add a feature..."
                      />
                      <button
                        onClick={handleAddFeature}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          isDarkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.features?.map((feature, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                          }`}
                        >
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {feature}
                          </span>
                          <button
                            onClick={() => handleRemoveFeature(index)}
                            className={`p-1 rounded ${
                              isDarkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-200 text-red-600'
                            }`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive !== false}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Active Plan
                    </label>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setEditingPlan(null);
                        setFormData({
                          planName: '',
                          description: '',
                          amount: 0,
                          features: [],
                          isActive: true,
                          planType: '',
                        });
                      }}
                      className={`px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-colors touch-manipulation min-h-[44px] ${
                        isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={saving}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 touch-manipulation min-h-[44px] ${
                        saving
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {editingPlan ? 'Update Plan' : 'Create Plan'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MasterAdminLayout>
  );
};

export default SubscriptionPlans;
