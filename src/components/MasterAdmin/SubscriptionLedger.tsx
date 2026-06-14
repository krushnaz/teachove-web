import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../contexts/DarkModeContext';
import MasterAdminLayout from './Layout';
import {
  masterAdminService,
  SubscriptionLedgerEntry,
  SubscriptionLedgerSummary,
} from '../../services/masterAdminService';
import {
  Search,
  RefreshCw,
  Receipt,
  Building2,
  Calendar,
  IndianRupee,
  ChevronRight,
} from 'lucide-react';

const LIMIT_OPTIONS = [50, 100, 200];

function formatCurrency(value?: number): string {
  return `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const SummaryCard: React.FC<{
  label: string;
  value: string;
  accent: string;
  loading: boolean;
  isDarkMode: boolean;
}> = ({ label, value, accent, loading, isDarkMode }) => (
  <div
    className={`rounded-xl border p-4 ${
      isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
    }`}
  >
    <p className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      {label}
    </p>
    {loading ? (
      <div className={`mt-2 h-7 w-24 animate-pulse rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
    ) : (
      <p className={`mt-1 text-xl font-bold ${accent}`}>{value}</p>
    )}
  </div>
);

const SubscriptionLedger: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<SubscriptionLedgerEntry[]>([]);
  const [summary, setSummary] = useState<SubscriptionLedgerSummary>({
    totalGross: 0,
    totalGatewayFee: 0,
    totalGstOnGatewayFee: 0,
    totalNet: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(100);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const data = await masterAdminService.getSubscriptionLedger(limit);
      setEntries(data.items);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error loading ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [limit]);

  const filteredEntries = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) => {
      const haystack = [
        entry.schoolName,
        entry.planName,
        entry.razorpay_payment_id,
        entry.razorpay_order_id,
        entry.subscriptionId,
        entry.schoolId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [entries, searchTerm]);

  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const title = isDarkMode ? 'text-white' : 'text-gray-900';

  return (
    <MasterAdminLayout
      title="Transaction Ledger"
      subtitle="All confirmed subscription payments recorded in the subscription ledger."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            label="Gross Collected"
            value={formatCurrency(summary.totalGross)}
            accent="text-emerald-600 dark:text-emerald-400"
            loading={loading}
            isDarkMode={isDarkMode}
          />
          <SummaryCard
            label="Gateway Fees"
            value={formatCurrency(summary.totalGatewayFee)}
            accent="text-amber-600 dark:text-amber-400"
            loading={loading}
            isDarkMode={isDarkMode}
          />
          <SummaryCard
            label="GST on Fees"
            value={formatCurrency(summary.totalGstOnGatewayFee)}
            accent="text-orange-600 dark:text-orange-400"
            loading={loading}
            isDarkMode={isDarkMode}
          />
          <SummaryCard
            label="Net Received"
            value={formatCurrency(summary.totalNet)}
            accent="text-indigo-600 dark:text-indigo-400"
            loading={loading}
            isDarkMode={isDarkMode}
          />
        </div>

        <div
          className={`rounded-xl border p-4 sm:p-5 ${
            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${muted}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search school, plan, payment ID..."
                className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-500'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-900 text-white'
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                {LIMIT_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    Last {value}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={fetchLedger}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
          <p className={`mt-3 text-xs ${muted}`}>
            Showing {filteredEntries.length} of {entries.length} loaded transactions
            {searchTerm ? ' (filtered)' : ''}.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-24 animate-pulse rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
              />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div
            className={`rounded-xl border-2 border-dashed p-12 text-center ${
              isDarkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'
            }`}
          >
            <Receipt className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p className="font-semibold">No ledger entries found</p>
            <p className="mt-1 text-sm">Transactions appear here after successful Razorpay payments.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 lg:hidden">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`rounded-xl border p-4 ${
                    isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`font-semibold ${title}`}>{entry.schoolName || '-'}</p>
                      <p className={`mt-0.5 text-sm ${muted}`}>{entry.planName || 'Plan'}</p>
                    </div>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(entry.paidAmount)}
                    </p>
                  </div>
                  <div className={`mt-3 grid grid-cols-2 gap-2 text-xs ${muted}`}>
                    <span>Seats: {entry.seats ?? '-'}</span>
                    <span>Net: {formatCurrency(entry.netAmount)}</span>
                    <span className="col-span-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(entry.purchasedAt)}
                    </span>
                  </div>
                  {entry.razorpay_payment_id && (
                    <p className={`mt-2 truncate text-[10px] ${muted}`}>
                      Payment: {entry.razorpay_payment_id}
                    </p>
                  )}
                  {entry.schoolId && (
                    <button
                      type="button"
                      onClick={() => navigate(`/master-admin/schools/${entry.schoolId}`)}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                    >
                      View school
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div
              className={`hidden overflow-hidden rounded-xl border lg:block ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead className={isDarkMode ? 'border-b border-gray-700 bg-gray-900' : 'border-b border-gray-200 bg-gray-50'}>
                    <tr>
                      {[
                        'Date',
                        'School',
                        'Plan',
                        'Seats',
                        'Gross',
                        'Gateway Fee',
                        'GST',
                        'Net',
                        'Payment ID',
                      ].map((h) => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${muted}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                    {filteredEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        className={isDarkMode ? 'bg-gray-800/40 hover:bg-gray-800/70' : 'bg-white hover:bg-gray-50'}
                      >
                        <td className={`px-4 py-3 text-sm whitespace-nowrap ${muted}`}>
                          {formatDate(entry.purchasedAt)}
                        </td>
                        <td className="px-4 py-3">
                          {entry.schoolId ? (
                            <button
                              type="button"
                              onClick={() => navigate(`/master-admin/schools/${entry.schoolId}`)}
                              className={`inline-flex items-center gap-1.5 text-sm font-medium hover:underline ${
                                isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                              }`}
                            >
                              <Building2 className="h-3.5 w-3.5" />
                              {entry.schoolName || '-'}
                            </button>
                          ) : (
                            <span className={`text-sm ${title}`}>{entry.schoolName || '-'}</span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-sm ${title}`}>{entry.planName || '-'}</td>
                        <td className={`px-4 py-3 text-sm ${muted}`}>{entry.seats ?? '-'}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(entry.paidAmount)}
                        </td>
                        <td className={`px-4 py-3 text-sm ${muted}`}>{formatCurrency(entry.gatewayFee)}</td>
                        <td className={`px-4 py-3 text-sm ${muted}`}>{formatCurrency(entry.gstOnGatewayFee)}</td>
                        <td className={`px-4 py-3 text-sm font-medium ${title}`}>
                          {formatCurrency(entry.netAmount)}
                        </td>
                        <td className={`px-4 py-3 text-xs font-mono ${muted}`}>
                          {entry.razorpay_payment_id || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!loading && filteredEntries.length > 0 && (
          <div
            className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-xs ${
              isDarkMode ? 'border-gray-700 bg-gray-800/50 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-600'
            }`}
          >
            <IndianRupee className="h-4 w-4 flex-shrink-0" />
            Summary totals reflect the loaded transactions only (latest {limit} entries).
          </div>
        )}
      </div>
    </MasterAdminLayout>
  );
};

export default SubscriptionLedger;
