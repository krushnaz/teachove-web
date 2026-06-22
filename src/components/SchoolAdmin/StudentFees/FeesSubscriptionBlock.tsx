import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Crown, ShoppingCart } from 'lucide-react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { CurrentSubscriptionDetails } from '../../../services/subscriptionService';
import { feesBtnPrimary, feesCard, feesMuted, feesSectionTitle } from './feesTheme';

interface Props {
  details: CurrentSubscriptionDetails | null;
}

const FeesSubscriptionBlock: React.FC<Props> = ({ details }) => {
  const { isDarkMode } = useDarkMode();
  const hasPlan = (details?.totalSeats ?? 0) > 0 || !!details?.planName;
  const expired = hasPlan && !details?.isActive;
  const noPlan = !hasPlan && !details?.isFreeTrial;

  const title = expired
    ? 'Subscription expired'
    : noPlan
      ? 'No active subscription'
      : 'Subscription required';

  const message = expired
    ? 'Your school subscription has expired. Renew your plan to view student fees, add payments, download reports, and manage fee records.'
    : 'Purchase a subscription plan to access student fees — view balances, record payments, and export reports.';

  const Icon = expired ? Clock : ShoppingCart;

  return (
    <div className={`p-8 md:p-12 text-center ${feesCard(isDarkMode)}`}>
      <div
        className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${
          expired
            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
        }`}
      >
        <Icon className="h-8 w-8" />
      </div>
      <h2 className={feesSectionTitle(isDarkMode)}>{title}</h2>
      <p className={`mt-3 max-w-lg mx-auto text-base ${feesMuted(isDarkMode)}`}>{message}</p>
      {details?.planName && expired && (
        <p className={`mt-2 text-sm ${feesMuted(isDarkMode)}`}>
          Previous plan: <span className="font-medium">{details.planName}</span>
        </p>
      )}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to="/school-admin/subscription-request" className={feesBtnPrimary}>
          <Crown className="w-5 h-5" />
          {expired ? 'Renew subscription' : 'Purchase plan'}
        </Link>
      </div>
      <p className={`mt-6 text-sm ${feesMuted(isDarkMode)}`}>
        After payment is verified, return here — fees will unlock automatically.
      </p>
    </div>
  );
};

export default FeesSubscriptionBlock;
