import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { masterAdminSubscriptionService, SubscriptionRequest } from '../../../services/masterAdminSubscriptionService';
import { masterAdminService, type EarningsPeriod, type EarningsByPeriodResponse } from '../../../services/masterAdminService';
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [earningsPeriod, setEarningsPeriod] = useState<EarningsPeriod>('monthly');
  const [earningsData, setEarningsData] = useState<EarningsByPeriodResponse | null>(null);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

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
      const response = await masterAdminSubscriptionService.getAllSubscriptionRequests();
      const validSubscriptions = (response.subscriptions || []).filter(
        (sub: SubscriptionRequest) => sub != null && (sub.id || sub.subscriptionId)
      );
      setSubscriptions(validSubscriptions);
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast.error(error.message || 'Failed to load subscription requests');
      setSubscriptions([]);
    } finally {
      setLoading(false);
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

        {/* Search Bar */}
        <div className="relative">
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

        {/* Subscriptions Table */}
        <div className={`rounded-xl border overflow-hidden ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {filteredSchoolGroups.length === 0 ? (
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
          )}
        </div>
      </div>
    </MasterAdminLayout>
  );
};

export default SubscriptionPurchases;
