import { apiClient } from '../config/axios';
import { API_CONFIG } from '../config/api';

// Can-add-students response (for add-student guard)
export interface CanAddStudentsResponse {
  canAdd: boolean;
  currentStudents: number;
  totalSubscribedSlots: number;
  remainingSlots: number;
  message: string;
}

// Current subscription details (for sidebar & subscription page)
export interface CurrentSubscriptionDetails {
  schoolId: string;
  totalSeats: number;
  expiryAt: { _seconds?: number } | string | null;
  isActive: boolean;
  remainingDays: number;
  planName?: string | null;
  purchasedAt?: { _seconds?: number } | null;
  lastPurchasedAt?: { _seconds?: number } | null;
  summary?: {
    totalSubscribedSlots: number;
    currentStudentCount: number;
    remainingSlots: number;
    nearestExpiryRemainingDays: number | null;
    activeSubscriptionCount: number;
  };
}

// Subscription plan (from master-admin plans API)
export interface SubscriptionPlan {
  id: string;
  planName: string;
  description?: string;
  amount: number;
  features: string[];
  isActive: boolean;
  planType?: string;
  duration: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

// Interfaces based on the API response
export interface SubscriptionRequest {
  id: string;
  subscription_cost_per_user: number;
  subscription_id: string;
  school_id: string;
  request_created_at: {
    _seconds: number;
    _nanoseconds: number;
  };
  subscription_type: 'Both' | 'TeachoVE';
  total_subscription_cost: number;
  num_of_users: number;
  amount?: number;
  razorpay_signature?: string;
  remaining_amount?: number;
  payment_status: 'successful' | 'pending' | 'failed';
  approve_status: 'approved' | 'denied' | 'pending';
  razorpay_order_id?: string;
  currency?: string;
  payment_verified?: boolean;
  razorpay_payment_id?: string;
  payment_method: string;
  payment_created_at?: {
    _seconds: number;
    _nanoseconds: number;
  } | null;
  last_updated?: {
    _seconds: number;
    _nanoseconds: number;
  };
  updated_at?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface SubscriptionResponse {
  subscriptions: SubscriptionRequest[];
}

export interface CreateSubscriptionRequest {
  num_of_users: number;
  approve_status: 'pending';
  payment_status: 'pending';
  subscription_cost_per_user: number;
  school_id: string;
  payment_method: string;
  razorpay_payment_id?: string;
  amount?: number;
  currency?: string;
  subscription_type?: 'Both' | 'TeachoVE';
  remaining_amount?: number;
  plan_id?: string;
  plan_name?: string;
  duration?: string;
}

export interface CreateSubscriptionResponse {
  message: string;
  subscriptionId: string;
}

export interface SubscriptionCost {
  amount: number;
  plan: string;
  email?: string;
  createdAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface SubscriptionCostResponse {
  teachove: SubscriptionCost;
  both: SubscriptionCost;
}

class SubscriptionService {
  /**
   * Get all subscription requests for a school
   */
  async getSubscriptionsBySchool(schoolId: string): Promise<SubscriptionRequest[]> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.GET_BY_SCHOOL.replace(':schoolId', schoolId);
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw new Error('Failed to fetch subscription requests');
    }
  }

  /**
   * Create a new subscription request
   */
  async createSubscription(data: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.CREATE;
      const response = await apiClient.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription request');
    }
  }

  /**
   * Get subscription costs for different plans
   */
  async getSubscriptionCosts(): Promise<SubscriptionCostResponse> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.GET_COST;
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription costs:', error);
      throw new Error('Failed to fetch subscription costs');
    }
  }

  /**
   * Check if school can add more students (subscription limit).
   * Use before opening Add Student form; show limit UI when canAdd is false.
   */
  async getCanAddStudents(schoolId: string): Promise<CanAddStudentsResponse | null> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.CAN_ADD_STUDENTS.replace(':schoolId', schoolId);
      const response = await apiClient.get<CanAddStudentsResponse>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching can-add-students:', error);
      return null;
    }
  }

  /**
   * Get current subscription details for school (active plan, expiry, seats)
   */
  async getCurrentSubscriptionDetails(schoolId: string): Promise<CurrentSubscriptionDetails | null> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.GET_CURRENT.replace(':schoolId', schoolId);
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      return null;
    }
  }

  /**
   * Get active subscription plans (from master-admin API)
   * Returns array of plans for display; backend returns { data: { [planType]: plan } }
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.SUBSCRIPTION_PLANS.GET_CURRENT;
      type PlanEntry = { id: string; planName?: string; plan?: string; amount: number; description?: string; features?: string[]; planType?: string; duration?: string; isActive?: boolean };
      const response = await apiClient.get<{ success?: boolean; data?: Record<string, PlanEntry> }>(endpoint);
      const raw = response.data?.data ?? response.data;
      const data = raw && typeof raw === 'object' ? (raw as Record<string, PlanEntry>) : null;
      if (!data) return [];
      const plans: SubscriptionPlan[] = [];
      Object.keys(data).forEach((key) => {
        const p = data[key];
        if (p && (p.isActive !== false)) {
          plans.push({
            id: p.id,
            planName: p.planName ?? p.plan ?? key,
            description: p.description,
            amount: Number(p.amount) || 0,
            features: Array.isArray(p.features) ? p.features : [],
            isActive: p.isActive ?? true,
            planType: p.planType,
            duration: p.duration || 'monthly',
          });
        }
      });
      return plans;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  }

  /**
   * Download invoice for a subscription payment
   */
  async downloadInvoice(schoolId: string, paymentId: string): Promise<void> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.DOWNLOAD_INVOICE;
      const response = await apiClient.post(endpoint, {
        schoolId,
        paymentId
      }, {
        responseType: 'blob' // Important for file downloads
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${paymentId}.pdf`; // You can customize the filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw new Error('Failed to download invoice');
    }
  }

  /**
   * Create Razorpay order for payment
   */
  async createRazorpayOrder(data: {
    amount: number;
    subscriptionId: string;
    userId: string;
    schoolId: string;
  }): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.PAYMENT_GATEWAY.RAZORPAY.CREATE_ORDER;
      console.log('Creating Razorpay order with data:', data);
      console.log('API endpoint:', endpoint);
      
      const response = await apiClient.post(endpoint, data);
      console.log('Order creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating Razorpay order:', error);
      console.error('Request data sent:', data);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw new Error(`Failed to create payment order: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Verify Razorpay payment
   */
  async verifyRazorpayPayment(data: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    subscriptionId: string;
    totalPaidAmount: number;
    remainingAmount: number;
  }): Promise<any> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.PAYMENT_GATEWAY.RAZORPAY.VERIFY_PAYMENT;
      console.log('Verifying payment with data:', data);
      console.log('API endpoint:', endpoint);
      
      const response = await apiClient.post(endpoint, data);
      console.log('Verification response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error verifying Razorpay payment:', error);
      console.error('Request data sent:', data);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      }
      throw new Error(`Failed to verify payment: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Convert Firebase timestamp to JavaScript Date
   */
  convertFirebaseTimestamp(timestamp: { _seconds: number; _nanoseconds: number }): Date {
    return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
  }

  /**
   * Format subscription data for display
   */
  formatSubscriptionData(subscription: SubscriptionRequest) {
    return {
      ...subscription,
      requestCreatedAt: subscription.request_created_at 
        ? this.convertFirebaseTimestamp(subscription.request_created_at)
        : null,
      paymentCreatedAt: subscription.payment_created_at 
        ? this.convertFirebaseTimestamp(subscription.payment_created_at)
        : null,
      lastUpdated: subscription.last_updated 
        ? this.convertFirebaseTimestamp(subscription.last_updated)
        : subscription.updated_at 
        ? this.convertFirebaseTimestamp(subscription.updated_at)
        : null,
    };
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService; 