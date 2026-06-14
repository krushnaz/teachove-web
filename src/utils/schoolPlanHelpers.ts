import { School } from '../services/masterAdminSchoolService';
import { FirestoreTimestamp, SubscriptionRequest } from '../services/masterAdminSubscriptionService';

export type PlanStatus = 'free_trial' | 'active' | 'expired' | 'pending' | 'none';

export interface SchoolPlanSummary {
  status: PlanStatus;
  planLabel: string;
  planType?: string;
  seats?: number;
  expiryAt?: FirestoreTimestamp | null;
  amount?: number;
  latestSubscription?: SubscriptionRequest;
}

export function timestampToDate(ts?: FirestoreTimestamp | null): Date | null {
  if (!ts?._seconds) return null;
  return new Date(ts._seconds * 1000);
}

export function formatPlanDate(ts?: FirestoreTimestamp | null): string {
  const date = timestampToDate(ts);
  if (!date) return '-';
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getPlanType(sub: SubscriptionRequest): string {
  return (
    sub.subscription_type ||
    (sub as SubscriptionRequest & { plan_name?: string }).plan_name ||
    'Plan'
  );
}

export function getSchoolSubscriptions(schoolId: string, all: SubscriptionRequest[]): SubscriptionRequest[] {
  const id = schoolId.trim();
  return all.filter((sub) => (sub.school_id || '').trim() === id);
}

export function sortSubscriptionsNewestFirst(subs: SubscriptionRequest[]): SubscriptionRequest[] {
  return [...subs].sort(
    (a, b) => (b.request_created_at?._seconds ?? 0) - (a.request_created_at?._seconds ?? 0)
  );
}

export function getSchoolPurchasedPlanSummary(
  schoolId: string,
  subscriptions: SubscriptionRequest[]
): SchoolPlanSummary {
  const schoolSubs = sortSubscriptionsNewestFirst(getSchoolSubscriptions(schoolId, subscriptions));
  const latest = schoolSubs[0];

  if (!latest) {
    return { status: 'none', planLabel: 'No Plan' };
  }

  const planType = getPlanType(latest);
  const paymentPending =
    (latest.payment_status || '').toLowerCase() === 'pending' ||
    (latest.approve_status || '').toLowerCase() === 'pending';

  if (latest.active) {
    return {
      status: 'active',
      planLabel: planType,
      planType,
      seats: latest.totalSeats ?? latest.num_of_users,
      expiryAt: latest.expiryAt,
      amount: latest.amount,
      latestSubscription: latest,
    };
  }

  if (paymentPending && !schoolSubs.some((s) => s.active)) {
    return {
      status: 'pending',
      planLabel: planType,
      planType,
      seats: latest.num_of_users,
      amount: latest.amount,
      latestSubscription: latest,
    };
  }

  return {
    status: 'expired',
    planLabel: planType,
    planType,
    seats: latest.totalSeats ?? latest.num_of_users,
    expiryAt: latest.expiryAt,
    latestSubscription: latest,
  };
}

export function getSchoolPlanSummary(school: School, subscriptions: SubscriptionRequest[]): SchoolPlanSummary {
  const schoolId = school.id || school.schoolId || '';

  if (school.isFreeTrial) {
    return { status: 'free_trial', planLabel: 'Free Trial' };
  }

  return getSchoolPurchasedPlanSummary(schoolId, subscriptions);
}

export function buildSchoolPlanMap(
  schools: School[],
  subscriptions: SubscriptionRequest[]
): Map<string, SchoolPlanSummary> {
  const map = new Map<string, SchoolPlanSummary>();
  schools.forEach((school) => {
    const id = school.id || school.schoolId || '';
    if (id) map.set(id, getSchoolPurchasedPlanSummary(id, subscriptions));
  });
  return map;
}

export function getPlanAmount(sub: SubscriptionRequest): number {
  const costPerUser = sub.subscription_cost_per_user ?? 0;
  const users = sub.num_of_users ?? 0;
  return sub.amount ?? costPerUser * users;
}
