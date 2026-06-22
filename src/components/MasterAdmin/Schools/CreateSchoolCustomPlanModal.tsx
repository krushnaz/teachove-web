import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { masterAdminSubscriptionService } from '../../../services/masterAdminSubscriptionService';

interface CreateSchoolCustomPlanModalProps {
  open: boolean;
  onClose: () => void;
  schoolId: string;
  schoolName: string;
  onSuccess: () => void;
}

const CreateSchoolCustomPlanModal: React.FC<CreateSchoolCustomPlanModalProps> = ({
  open,
  onClose,
  schoolId,
  schoolName,
  onSuccess,
}) => {
  const [planName, setPlanName] = useState('Custom Enterprise Plan');
  const [seats, setSeats] = useState(100);
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('monthly');
  const [planType, setPlanType] = useState('Both');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setPlanName('Custom Enterprise Plan');
    setSeats(100);
    setAmount('');
    setDuration('monthly');
    setPlanType('Both');
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seats || seats <= 0) {
      toast.error('Please enter a valid student count');
      return;
    }
    if (amount === '' || Number(amount) < 0) {
      toast.error('Please enter a valid price amount');
      return;
    }

    setSubmitting(true);
    try {
      const res = await masterAdminSubscriptionService.createCustomSubscription({
        schoolId,
        schoolName,
        seats: Number(seats),
        duration,
        amount: Number(amount),
        planType,
        planName: planName.trim() || 'Custom Enterprise Plan',
      });

      if (res.success) {
        toast.success('Custom plan created! School admin can now purchase it.');
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create custom plan');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <form
        onSubmit={handleSubmit}
        className="relative max-w-lg w-full rounded-2xl shadow-2xl bg-white text-gray-900 p-6 sm:p-8 space-y-4"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Add Custom Plan</h3>
            <p className="text-sm mt-1 text-gray-500">
              Create a plan for <span className="font-semibold text-gray-800">{schoolName}</span>. The school admin can purchase it from their subscription page.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">
              Plan Name *
            </label>
            <input
              type="text"
              required
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Custom Enterprise Plan"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">
                Student Count (Seats) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. 100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">
                Price Amount (INR) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. 5000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">
                Duration *
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="monthly">Monthly (30 Days)</option>
                <option value="yearly">Yearly (365 Days)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">
                Plan Type *
              </label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Both">Both (TeachoVE & StudoVE)</option>
                <option value="TeachoVE">TeachoVE Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 font-semibold text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Create Plan for School'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSchoolCustomPlanModal;
