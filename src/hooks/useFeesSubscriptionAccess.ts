import { useCallback, useEffect, useState } from 'react';
import {
  CurrentSubscriptionDetails,
  subscriptionService,
} from '../services/subscriptionService';

export function canAccessFeesModule(details: CurrentSubscriptionDetails | null): boolean {
  if (!details) return false;
  return details.isActive === true || details.isFreeTrial === true;
}

export function useFeesSubscriptionAccess(schoolId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<CurrentSubscriptionDetails | null>(null);

  const refetch = useCallback(async () => {
    if (!schoolId) {
      setDetails(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const current = await subscriptionService.getCurrentSubscriptionDetails(schoolId);
      setDetails(current);
    } catch {
      setDetails(null);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const onFocus = () => {
      if (schoolId) refetch();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [schoolId, refetch]);

  return {
    loading,
    details,
    canAccessFees: canAccessFeesModule(details),
    refetch,
  };
}
