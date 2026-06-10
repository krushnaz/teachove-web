import { CanAddStudentsResponse } from '../services/subscriptionService';

export type CanAddStudentsStatus = 'can_add' | 'no_plan' | 'expired' | 'limit_reached';

export function resolveCanAddStatus(data: CanAddStudentsResponse): CanAddStudentsStatus {
  if (data.status) return data.status;
  if (data.totalSubscribedSlots === 0) return 'no_plan';
  if (data.message?.toLowerCase().includes('expired')) return 'expired';
  if (!data.canAdd) return 'limit_reached';
  return 'can_add';
}

export function resolveBlockTitle(data: CanAddStudentsResponse): string {
  if (data.title) return data.title;
  switch (resolveCanAddStatus(data)) {
    case 'no_plan':
      return 'No Subscription Plan';
    case 'expired':
      return 'Subscription Expired';
    case 'limit_reached':
      return 'Student Limit Reached';
    default:
      return 'Cannot Add Students';
  }
}

export function resolveBlockMessage(data: CanAddStudentsResponse, role: 'school' | 'teacher'): string {
  if (data.message) {
    if (role === 'teacher' && resolveCanAddStatus(data) !== 'can_add') {
      return getTeacherMessage(data);
    }
    return data.message;
  }
  return getTeacherMessage(data);
}

function getTeacherMessage(data: CanAddStudentsResponse): string {
  switch (resolveCanAddStatus(data)) {
    case 'no_plan':
      return 'Your school has not purchased a subscription plan yet. Please contact your school admin to purchase a plan.';
    case 'expired':
      return 'Your school subscription plan has ended. Please contact your school admin to renew the plan.';
    case 'limit_reached':
      return `All student slots are used (${data.currentStudents}/${data.totalSubscribedSlots}). Please contact your school admin to purchase more slots.`;
    default:
      return data.message || 'You cannot add students at this time.';
  }
}

export function showSlotUsage(data: CanAddStudentsResponse): boolean {
  return resolveCanAddStatus(data) === 'limit_reached' && data.totalSubscribedSlots > 0;
}

export function getPurchaseButtonLabel(data: CanAddStudentsResponse): string {
  switch (resolveCanAddStatus(data)) {
    case 'no_plan':
      return 'Purchase Plan';
    case 'expired':
      return 'Renew Plan';
    case 'limit_reached':
      return 'Purchase More Slots';
    default:
      return 'Go to Subscriptions';
  }
}
