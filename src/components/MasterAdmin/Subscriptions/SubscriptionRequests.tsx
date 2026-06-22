import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { masterAdminSubscriptionService, SubscriptionRequest, SalesRequest, SchoolCustomPlan } from '../../../services/masterAdminSubscriptionService';
import { masterAdminService, type EarningsPeriod, type EarningsByPeriodResponse } from '../../../services/masterAdminService';
import { masterAdminSchoolService, School } from '../../../services/masterAdminSchoolService';
import {
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Crown,
  Building,
  Calendar,
  ChevronRight,
  Layers,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-toastify';
import MasterAdminLayout from '../Layout';

const EARNINGS_PERIODS: { value: EarningsPeriod; label: string }[] = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'yearly', label: 'This Year' },
  { value: 'custom', label: 'Custom' },
];

export interface SchoolSubscriptionGroup {
  schoolId: string;
  schoolName: string;
  subscriptions: SubscriptionRequest[];
}

const SubscriptionPurchases: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<SubscriptionRequest[]>([]);
  const [salesRequests, setSalesRequests] = useState<SalesRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [earningsPeriod, setEarningsPeriod] = useState<EarningsPeriod>('monthly');
  const [earningsData, setEarningsData] = useState<EarningsByPeriodResponse | null>(null);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [activeTab, setActiveTab] = useState<'subscriptions' | 'sales' | 'custom_plans'>('subscriptions');
  const [updatingSalesId, setUpdatingSalesId] = useState<string | null>(null);
  const [schoolCustomPlans, setSchoolCustomPlans] = useState<SchoolCustomPlan[]>([]);
  const [cancellingPlanId, setCancellingPlanId] = useState<string | null>(null);

  // Custom Pricing State
  const [schools, setSchools] = useState<School[]>([]);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [customSchoolName, setCustomSchoolName] = useState('');
  const [customSalesRequestId, setCustomSalesRequestId] = useState('');
  const [customPlanName, setCustomPlanName] = useState('Custom Enterprise Plan');
  const [customSeats, setCustomSeats] = useState(100);
  const [customDuration, setCustomDuration] = useState('monthly');
  const [customAmount, setCustomAmount] = useState('');
  const [customPlanType, setCustomPlanType] = useState('Both');
  const [customSubmitting, setCustomSubmitting] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const list = await masterAdminSchoolService.getSchools();
      setSchools(list || []);
    } catch (e) {
      console.error('Failed to load schools:', e);
    }
  };

  const openCustomPlanModal = (opts?: {
    schoolId?: string;
    schoolName?: string;
    seats?: number;
    salesRequestId?: string;
  }) => {
    setSelectedSchoolId(opts?.schoolId || '');
    setCustomSchoolName(opts?.schoolName || '');
    setCustomSalesRequestId(opts?.salesRequestId || '');
    setCustomSeats(opts?.seats || 100);
    setCustomPlanName('Custom Enterprise Plan');
    setCustomDuration('monthly');
    setCustomAmount('');
    setCustomPlanType('Both');
    setCustomModalOpen(true);
  };

  const resetCustomPlanForm = () => {
    setSelectedSchoolId('');
    setCustomSchoolName('');
    setCustomSalesRequestId('');
    setCustomPlanName('Custom Enterprise Plan');
    setCustomSeats(100);
    setCustomDuration('monthly');
    setCustomAmount('');
    setCustomPlanType('Both');
  };

  const handleCreateCustomSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchoolId) {
      toast.error('Please select a school');
      return;
    }
    if (!customSeats || customSeats <= 0) {
      toast.error('Please enter a valid student count');
      return;
    }
    if (customAmount === '' || Number(customAmount) < 0) {
      toast.error('Please enter a valid price amount');
      return;
    }

    setCustomSubmitting(true);
    try {
      const school = schools.find((s) => (s.schoolId || s.id) === selectedSchoolId);
      const res = await masterAdminSubscriptionService.createCustomSubscription({
        schoolId: selectedSchoolId,
        schoolName: customSchoolName || school?.schoolName || '',
        seats: Number(customSeats),
        duration: customDuration,
        amount: Number(customAmount),
        planType: customPlanType,
        planName: customPlanName.trim() || 'Custom Enterprise Plan',
        salesRequestId: customSalesRequestId || undefined,
      });

      if (res.success) {
        toast.success('Custom plan created! School admin can now purchase it.');
        setCustomModalOpen(false);
        resetCustomPlanForm();
        fetchSubscriptions();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create custom plan');
    } finally {
      setCustomSubmitting(false);
    }
  };

  const handleCancelCustomPlan = async (planId: string) => {
    setCancellingPlanId(planId);
    try {
      const success = await masterAdminSubscriptionService.cancelSchoolCustomPlan(planId);
      if (success) {
        toast.success('Custom plan cancelled');
        setSchoolCustomPlans((prev) => prev.filter((p) => p.id !== planId));
      } else {
        toast.error('Failed to cancel custom plan');
      }
    } catch {
      toast.error('Failed to cancel custom plan');
    } finally {
      setCancellingPlanId(null);
    }
  };

  useEffect(() => {
    const fetchEarnings = async () => {
      setEarningsLoading(true);
      try {
        const start = earningsPeriod === 'custom' && customStart ? customStart : undefined;
        const end = earningsPeriod === 'custom' && customEnd ? customEnd : undefined;
        const data = await masterAdminService.getEarningsByPeriod(earningsPeriod, start, end);
        setEarningsData(data);
      } catch (e) {
        setEarningsData({ earnings: 0, count: 0, period: earningsPeriod, startDate: '', endDate: '' });
      } finally {
        setEarningsLoading(false);
      }
    };
    if (earningsPeriod !== 'custom' || (customStart && customEnd)) {
      fetchEarnings();
    } else {
      setEarningsLoading(false);
      setEarningsData(null);
    }
  }, [earningsPeriod, customStart, customEnd]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const [response, salesResponse, customPlansResponse] = await Promise.all([
        masterAdminSubscriptionService.getAllSubscriptionRequests(),
        masterAdminSubscriptionService.getSalesRequests(),
        masterAdminSubscriptionService.getSchoolCustomPlans(),
      ]);
      const validSubscriptions = (response.subscriptions || []).filter(
        (sub: SubscriptionRequest) => sub != null && (sub.id || sub.subscriptionId)
      );
      setSubscriptions(validSubscriptions);
      setSalesRequests(salesResponse || []);
      setSchoolCustomPlans(customPlansResponse || []);
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast.error(error.message || 'Failed to load subscription requests');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSalesStatus = async (id: string, newStatus: string) => {
    setUpdatingSalesId(id);
    try {
      const success = await masterAdminSubscriptionService.updateSalesRequestStatus(id, newStatus);
      if (success) {
        toast.success(`Inquiry marked as ${newStatus}`);
        setSalesRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
      } else {
        toast.error('Failed to update inquiry status');
      }
    } catch (e) {
      toast.error('Error updating status');
    } finally {
      setUpdatingSalesId(null);
    }
  };

  // Group subscriptions by school (one entry per school)
  const schoolGroups = useMemo(() => {
    const valid = subscriptions.filter(
      sub => sub != null && (sub.school_id || sub.schoolName)
    );
    const bySchool = new Map<string, SubscriptionRequest[]>();
    for (const sub of valid) {
      const key = (sub.school_id || sub.schoolName || 'unknown').trim();
      if (!bySchool.has(key)) bySchool.set(key, []);
      bySchool.get(key)!.push(sub);
    }
    const groups: SchoolSubscriptionGroup[] = [];
    bySchool.forEach((subs, schoolId) => {
      const first = subs[0];
      groups.push({
        schoolId,
        schoolName: first?.schoolName || schoolId,
        subscriptions: subs.sort((a, b) => {
          const aSec = a.request_created_at?._seconds ?? 0;
          const bSec = b.request_created_at?._seconds ?? 0;
          return bSec - aSec;
        }),
      });
    });
    return groups.sort((a, b) => a.schoolName.localeCompare(b.schoolName));
  }, [subscriptions]);

  const filteredSchoolGroups = useMemo(() => {
    if (!searchTerm.trim()) return schoolGroups;
    const term = searchTerm.toLowerCase();
    return schoolGroups.filter(
      g =>
        g.schoolName?.toLowerCase().includes(term) ||
        g.schoolId?.toLowerCase().includes(term)
    );
  }, [schoolGroups, searchTerm]);

  const filteredSalesRequests = useMemo(() => {
    if (!searchTerm.trim()) return salesRequests;
    const term = searchTerm.toLowerCase();
    return salesRequests.filter(
      r =>
        r.schoolName?.toLowerCase().includes(term) ||
        r.contactPerson?.toLowerCase().includes(term) ||
        r.email?.toLowerCase().includes(term) ||
        r.phone?.toLowerCase().includes(term)
    );
  }, [salesRequests, searchTerm]);

  const handleSchoolClick = (group: SchoolSubscriptionGroup) => {
    navigate(`/master-admin/subscription-request/school/${encodeURIComponent(group.schoolId)}`, {
      state: { schoolName: group.schoolName, subscriptions: group.subscriptions },
    });
  };

  const getStatusChip = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="w-3 h-3" />
          Approved
        </span>
      );
    } else if (statusLower === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <XCircle className="w-3 h-3" />
          {status === 'rejected' ? 'Rejected' : 'Denied'}
        </span>
      );
    }
  };

  const formatDate = (timestamp?: { _seconds: number; _nanoseconds?: number } | null) => {
    if (!timestamp || timestamp._seconds == null) return '-';
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <MasterAdminLayout title="Subscription Purchases">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </MasterAdminLayout>
    );
  }

  return (
    <MasterAdminLayout title="Subscription Purchases" subtitle="Manage all subscription purchases from schools">
      <div className="space-y-4 sm:space-y-6">
        {/* Earnings by period */}
        <div className={`rounded-xl border p-4 sm:p-5 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Earnings</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {EARNINGS_PERIODS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setEarningsPeriod(value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    earningsPeriod === value
                      ? isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'
                      : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {earningsPeriod === 'custom' && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>From</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <label className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>To</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          )}
          <div className="mt-4 flex items-baseline gap-2">
            {earningsLoading ? (
              <div className={`h-8 w-24 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            ) : earningsData ? (
              <>
                <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{(earningsData.earnings ?? 0).toLocaleString('en-IN')}
                </span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({earningsData.count} payment{earningsData.count !== 1 ? 's' : ''})
                </span>
              </>
            ) : (
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Select a custom date range
              </span>
            )}
          </div>
        </div>

        {/* Search Bar & Action Button */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search by school name, plan, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
              }`}
            />
          </div>
          <button
            type="button"
            onClick={() => openCustomPlanModal()}
            className="px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Crown className="w-4 h-4" />
            Add Custom Plan
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'subscriptions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            School Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'sales'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Sales Enquiries (&gt;500 students)
            {salesRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
                {salesRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('custom_plans')}
            className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'custom_plans'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Custom Plan Offers
            {schoolCustomPlans.filter(p => p.status === 'pending_purchase').length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                {schoolCustomPlans.filter(p => p.status === 'pending_purchase').length}
              </span>
            )}
          </button>
        </div>

        {/* Subscriptions / Sales Table */}
        <div className={`rounded-xl border overflow-hidden ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {activeTab === 'subscriptions' ? (
            filteredSchoolGroups.length === 0 ? (
              <div className={`text-center py-12 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <Crown className={`w-12 h-12 mx-auto mb-4 ${
                  isDarkMode ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <p className={`text-lg font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {searchTerm ? 'No schools found matching your search' : 'No subscription requests found'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${
                    isDarkMode ? 'bg-gray-900 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'
                  }`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        School
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Subscriptions
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Total Amount
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Latest Status
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Active / Expired
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Purchase Date
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Expiry Date
                      </th>
                      <th className={`px-6 py-4 w-10 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`} />
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                  }`}>
                    {filteredSchoolGroups.map((group) => {
                      const totalAmount = group.subscriptions.reduce((sum, sub) => {
                        const costPerUser = sub.subscription_cost_per_user ?? 0;
                        const numUsers = sub.num_of_users ?? 0;
                        return sum + (sub.amount ?? costPerUser * numUsers);
                      }, 0);
                      const latest = group.subscriptions[0];
                      const latestStatus = latest?.approve_status ?? 'pending';
                      const isActive = latest?.active ?? false;
                      const purchaseDate = latest?.purchaseDate ?? latest?.request_created_at;
                      const expiryAt = latest?.expiryAt ?? null;
                      const planTypes = Array.from(new Set(group.subscriptions.map(s => s.subscription_type || 'N/A').filter(Boolean))).join(', ');
                      return (
                        <tr
                          key={group.schoolId}
                          onClick={() => handleSchoolClick(group)}
                          className={`cursor-pointer transition-colors hover:${
                            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                          }`}
                        >
                          <td className={`px-4 sm:px-6 py-3 sm:py-4 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Building className={`w-4 h-4 flex-shrink-0 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`} />
                              <span className="font-medium">{group.schoolName}</span>
                            </div>
                          </td>
                          <td className={`px-4 sm:px-6 py-3 sm:py-4 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                <Layers className="w-3.5 h-3.5" />
                                {group.subscriptions.length} plan{group.subscriptions.length !== 1 ? 's' : ''}
                              </span>
                              {planTypes && (
                                <span className="text-xs truncate max-w-[140px]" title={planTypes}>
                                  {planTypes}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            ₹{totalAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            {getStatusChip(latestStatus)}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            {expiryAt ? (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                isActive
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {isActive ? 'Active' : 'Expired'}
                              </span>
                            ) : (
                              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>—</span>
                            )}
                          </td>
                          <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <div className="flex items-center gap-1">
                              <Calendar className={`w-4 h-4 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`} />
                              {formatDate(purchaseDate)}
                            </div>
                          </td>
                          <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <div className="flex items-center gap-1">
                              <Calendar className={`w-4 h-4 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`} />
                              {formatDate(expiryAt)}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <ChevronRight className={`w-5 h-5 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === 'sales' ? (
            filteredSalesRequests.length === 0 ? (
              <div className={`text-center py-12 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <Clock className={`w-12 h-12 mx-auto mb-4 ${
                  isDarkMode ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <p className={`text-lg font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {searchTerm ? 'No sales inquiries matching search' : 'No sales inquiries found'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${
                    isDarkMode ? 'bg-gray-900 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'
                  }`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>School</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Contact Person</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Students</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Contact Info</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Requirements</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Date Received</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status / Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {filteredSalesRequests.map((req) => (
                      <tr key={req.id} className={isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}>
                        <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{req.schoolName}</td>
                        <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{req.contactPerson}</td>
                        <td className={`px-6 py-4 whitespace-nowrap font-bold text-indigo-600 dark:text-indigo-400`}>{req.expectedStudentCount} seats</td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <div>📞 {req.phone}</div>
                          <div className="text-xs text-gray-500 mt-0.5">✉️ {req.email}</div>
                        </td>
                        <td className={`px-6 py-4 text-sm max-w-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <div className="line-clamp-3" title={req.message}>{req.message || '—'}</div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-2">
                            {req.status === 'plan_created' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                                <Crown className="w-3.5 h-3.5" /> Plan Created
                              </span>
                            ) : req.status === 'contacted' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle className="w-3.5 h-3.5" /> Called / Contacted
                              </span>
                            ) : (
                              <button
                                onClick={() => handleUpdateSalesStatus(req.id, 'contacted')}
                                disabled={updatingSalesId === req.id}
                                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                              >
                                <Clock className="w-3.5 h-3.5 animate-pulse" /> Pending Call
                              </button>
                            )}
                            {req.status !== 'plan_created' && (
                              <button
                                type="button"
                                onClick={() => openCustomPlanModal({
                                  schoolId: req.schoolId,
                                  schoolName: req.schoolName,
                                  seats: req.expectedStudentCount,
                                  salesRequestId: req.id,
                                })}
                                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors"
                              >
                                Create Custom Plan
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            schoolCustomPlans.length === 0 ? (
              <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <Crown className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No custom plan offers yet
                </p>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Create a custom plan from a sales enquiry or using Add Custom Plan.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${isDarkMode ? 'bg-gray-900 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'}`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>School</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Plan</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Seats</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Amount</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Duration</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {schoolCustomPlans.map((plan) => (
                      <tr key={plan.id} className={isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}>
                        <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {plan.schoolName || plan.schoolId}
                        </td>
                        <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{plan.planName}</td>
                        <td className={`px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400`}>{plan.seats}</td>
                        <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>₹{plan.amount.toLocaleString('en-IN')}</td>
                        <td className={`px-6 py-4 capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{plan.duration}</td>
                        <td className="px-6 py-4">
                          {plan.status === 'pending_purchase' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                              <Clock className="w-3.5 h-3.5" /> Awaiting Purchase
                            </span>
                          ) : plan.status === 'purchased' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              <CheckCircle className="w-3.5 h-3.5" /> Purchased
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              <XCircle className="w-3.5 h-3.5" /> {plan.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {plan.status === 'pending_purchase' && (
                            <button
                              type="button"
                              onClick={() => handleCancelCustomPlan(plan.id)}
                              disabled={cancellingPlanId === plan.id}
                              className="px-3.5 py-1.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 text-xs font-bold"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* Create Custom Pricing Modal */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCustomModalOpen(false)} />
          <form 
            onSubmit={handleCreateCustomSubscription}
            className="relative max-w-lg w-full rounded-2xl shadow-2xl bg-white text-gray-900 p-6 sm:p-8 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Add Custom Plan</h3>
                <p className="text-sm mt-1 text-gray-500">
                  Create a school-specific plan. The school admin can purchase it from their subscription page.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setCustomModalOpen(false)} 
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">
                  Select School *
                </label>
                <select
                  required
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Choose School --</option>
                  {schools.map((school) => {
                    const id = school.schoolId || school.id || '';
                    return (
                      <option key={id} value={id}>
                        {school.schoolName} ({id.substring(0, 6)}...)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  value={customPlanName}
                  onChange={(e) => setCustomPlanName(e.target.value)}
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
                    value={customSeats}
                    onChange={(e) => setCustomSeats(Number(e.target.value))}
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
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
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
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
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
                    value={customPlanType}
                    onChange={(e) => setCustomPlanType(e.target.value)}
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
                onClick={() => setCustomModalOpen(false)} 
                className="flex-1 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={customSubmitting}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {customSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : 'Create Plan for School'}
              </button>
            </div>
          </form>
        </div>
      )}
    </MasterAdminLayout>
  );
};

export default SubscriptionPurchases;
