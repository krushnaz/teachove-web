import React, { useMemo } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { SubscriptionRequest } from '../../../services/masterAdminSubscriptionService';
import { School } from '../../../services/masterAdminSchoolService';
import {
  formatPlanDate,
  getPlanAmount,
  getPlanType,
  getSchoolPurchasedPlanSummary,
  getSchoolSubscriptions,
  sortSubscriptionsNewestFirst,
} from '../../../utils/schoolPlanHelpers';
import { Calendar, CheckCircle, Clock, Crown, Users, XCircle } from 'lucide-react';

interface SchoolSubscriptionSectionProps {
  school: School;
  subscriptions: SubscriptionRequest[];
  loading?: boolean;
}

const SchoolSubscriptionSection: React.FC<SchoolSubscriptionSectionProps> = ({
  school,
  subscriptions,
  loading = false,
}) => {
  const { isDarkMode } = useDarkMode();
  const schoolId = school.id || school.schoolId || '';

  const schoolSubs = useMemo(
    () => sortSubscriptionsNewestFirst(getSchoolSubscriptions(schoolId, subscriptions)),
    [schoolId, subscriptions]
  );

  const planSummary = useMemo(
    () => getSchoolPurchasedPlanSummary(schoolId, subscriptions),
    [schoolId, subscriptions]
  );

  const card = isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const title = isDarkMode ? 'text-white' : 'text-gray-900';

  const statusChip = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'successful' || s === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="h-3 w-3" />
          {status}
        </span>
      );
    }
    if (s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <XCircle className="h-3 w-3" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <div>
        <h3 className={`mb-4 text-lg font-semibold ${title}`}>Current Plan</h3>
        <div className={`rounded-xl border p-5 ${card}`}>
          {school.isFreeTrial ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <span className={`text-lg font-semibold ${title}`}>Free Trial</span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  Active
                </span>
              </div>
              <p className={`text-sm ${muted}`}>
                This school bypasses subscription limits. Purchased plans below still apply when free trial is turned off.
              </p>
            </div>
          ) : planSummary.status === 'none' ? (
            <div className="text-center py-6">
              <Crown className={`mx-auto mb-3 h-10 w-10 ${muted}`} />
              <p className={`font-medium ${title}`}>No purchased plan</p>
              <p className={`mt-1 text-sm ${muted}`}>This school has not purchased a subscription yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className={`text-xs font-medium uppercase tracking-wide ${muted}`}>Plan</p>
                <p className={`mt-1 text-lg font-semibold ${title}`}>{planSummary.planLabel}</p>
              </div>
              <div>
                <p className={`text-xs font-medium uppercase tracking-wide ${muted}`}>Status</p>
                <p className="mt-1">
                  {planSummary.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                      <CheckCircle className="h-3 w-3" /> Active
                    </span>
                  ) : planSummary.status === 'pending' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      <Clock className="h-3 w-3" /> Pending
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      <XCircle className="h-3 w-3" /> Expired
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className={`text-xs font-medium uppercase tracking-wide ${muted}`}>Student Seats</p>
                <p className={`mt-1 flex items-center gap-1.5 font-medium ${title}`}>
                  <Users className="h-4 w-4 text-indigo-500" />
                  {planSummary.seats ?? '-'}
                </p>
              </div>
              <div>
                <p className={`text-xs font-medium uppercase tracking-wide ${muted}`}>Expires On</p>
                <p className={`mt-1 flex items-center gap-1.5 ${title}`}>
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  {formatPlanDate(planSummary.expiryAt)}
                </p>
              </div>
              {planSummary.latestSubscription && (
                <>
                  <div>
                    <p className={`text-xs font-medium uppercase tracking-wide ${muted}`}>Last Payment</p>
                    <p className={`mt-1 font-medium ${title}`}>
                      ₹{getPlanAmount(planSummary.latestSubscription).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium uppercase tracking-wide ${muted}`}>Purchased On</p>
                    <p className={`mt-1 ${title}`}>
                      {formatPlanDate(
                        planSummary.latestSubscription.purchaseDate ||
                          planSummary.latestSubscription.request_created_at
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <div>
        <h3 className={`mb-4 text-lg font-semibold ${title}`}>Purchase History</h3>
        <div className={`overflow-hidden rounded-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {schoolSubs.length === 0 ? (
            <div className={`py-12 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <Crown className={`mx-auto mb-3 h-10 w-10 ${muted}`} />
              <p className={muted}>No subscription purchases recorded for this school.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className={isDarkMode ? 'border-b border-gray-700 bg-gray-900' : 'border-b border-gray-200 bg-gray-50'}>
                  <tr>
                    {['Plan', 'Seats', 'Amount', 'Payment', 'Approval', 'Purchased', 'Expires'].map((h) => (
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
                  {schoolSubs.map((sub) => {
                    const subId = sub.id || sub.subscriptionId;
                    return (
                      <tr key={subId} className={isDarkMode ? 'bg-gray-800/40' : 'bg-white'}>
                        <td className={`px-4 py-3 text-sm font-medium ${title}`}>{getPlanType(sub)}</td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {sub.num_of_users ?? '-'}
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          ₹{getPlanAmount(sub).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3">{statusChip(sub.payment_status || 'pending')}</td>
                        <td className="px-4 py-3">{statusChip(sub.approve_status || 'pending')}</td>
                        <td className={`px-4 py-3 text-sm ${muted}`}>
                          {formatPlanDate(sub.purchaseDate || sub.request_created_at)}
                        </td>
                        <td className={`px-4 py-3 text-sm ${muted}`}>{formatPlanDate(sub.expiryAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolSubscriptionSection;
