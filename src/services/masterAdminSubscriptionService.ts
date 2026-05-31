import { apiHelper } from '../utils/apiHelper';

export interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds?: number;
}

export interface SubscriptionRequest {
  id: string;
  subscriptionId: string;
  school_id: string;
  schoolName?: string;
  schoolEmail?: string;
  schoolPhone?: string;
  num_of_users: number;
  approve_status: 'approved' | 'pending' | 'rejected' | 'denied';
  payment_status: 'pending' | 'paid' | 'failed' | 'successful';
  subscription_cost_per_user?: number;
  subscription_type?: 'TeachoVE' | 'Both' | string;
  payment_method: string;
  amount?: number;
  currency?: string;
  razorpay_payment_id?: string;
  remaining_amount?: number;
  request_created_at?: FirestoreTimestamp;
  payment_created_at?: FirestoreTimestamp | null;
  updated_at?: FirestoreTimestamp;
  /** School-level proportionate status (from schoolSubscriptions) */
  active?: boolean;
  /** School-level proportionate expiry (from schoolSubscriptions) */
  expiryAt?: FirestoreTimestamp | null;
  totalSeats?: number;
  /** Purchase date for this subscription (request_created_at or payment_created_at) */
  purchaseDate?: FirestoreTimestamp | null;
}

export interface SubscriptionResponse {
  success: boolean;
  count: number;
  subscriptions: SubscriptionRequest[];
}

export interface SingleSubscriptionResponse {
  success: boolean;
  subscription: SubscriptionRequest;
}

export interface SalesRequest {
  id: string;
  schoolId: string;
  schoolName: string;
  contactPerson: string;
  phone: string;
  email: string;
  expectedStudentCount: number;
  message: string;
  status: 'pending' | 'contacted' | string;
  createdAt?: number;
}

class MasterAdminSubscriptionService {
  // Get all subscription requests
  async getAllSubscriptionRequests(): Promise<SubscriptionResponse> {
    try {
      const response = await apiHelper.get('/master-admin/subscriptions') as SubscriptionResponse;
      
      if (response.success) {
        return response;
      }
      
      throw new Error('Failed to fetch subscription requests');
    } catch (error: any) {
      console.error('Error fetching subscription requests:', error);
      throw new Error(error.message || 'Failed to fetch subscription requests');
    }
  }

  // Fetch all sales requests for >500 students custom plans
  async getSalesRequests(): Promise<SalesRequest[]> {
    try {
      const response = await apiHelper.get('/subscriptions/sales-requests') as { success: boolean; data: SalesRequest[] };
      return response.success ? response.data : [];
    } catch (error: any) {
      console.error('Error fetching sales requests:', error);
      return [];
    }
  }

  // Update sales request status
  async updateSalesRequestStatus(id: string, status: string): Promise<boolean> {
    try {
      const response = await apiHelper.put(`/subscriptions/sales-requests/${id}/status`, { status }) as { success: boolean };
      return response.success;
    } catch (error: any) {
      console.error('Error updating sales request status:', error);
      return false;
    }
  }

  // Get subscription by ID
  async getSubscriptionById(subscriptionId: string): Promise<SingleSubscriptionResponse> {
    try {
      const response = await apiHelper.get(`/master-admin/subscriptions/${subscriptionId}`) as SingleSubscriptionResponse;
      
      if (response.success) {
        return response;
      }
      
      throw new Error('Failed to fetch subscription');
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      throw new Error(error.message || 'Failed to fetch subscription');
    }
  }

  // Update subscription status
  async updateSubscriptionStatus(subscriptionId: string, approveStatus: 'approved' | 'pending' | 'rejected' | 'denied'): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiHelper.put(`/master-admin/subscriptions/${subscriptionId}/status`, {
        approveStatus
      }) as { success: boolean; message?: string };
      
      if (response.success) {
        return response as { success: boolean; message: string };
      }
      
      throw new Error(response.message || 'Failed to update subscription status');
    } catch (error: any) {
      console.error('Error updating subscription status:', error);
      throw new Error(error.message || 'Failed to update subscription status');
    }
  }

  // Delete subscription request
  async deleteSubscriptionRequest(subscriptionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiHelper.delete(`/master-admin/subscriptions/${subscriptionId}`) as { success: boolean; message: string };
      
      if (response.success) {
        return response;
      }
      
      throw new Error('Failed to delete subscription request');
    } catch (error: any) {
      console.error('Error deleting subscription request:', error);
      throw new Error(error.message || 'Failed to delete subscription request');
    }
  }

  // Create custom subscription
  async createCustomSubscription(data: {
    schoolId: string;
    seats: number;
    duration: string;
    amount: number;
    planType: string;
  }): Promise<{ success: boolean; message: string; subscriptionId: string }> {
    try {
      const response = await apiHelper.post('/master-admin/subscriptions/custom', data) as {
        success: boolean;
        message: string;
        subscriptionId: string;
      };
      if (response.success) {
        return response;
      }
      throw new Error(response.message || 'Failed to create custom subscription');
    } catch (error: any) {
      console.error('Error creating custom subscription:', error);
      throw new Error(error.message || 'Failed to create custom subscription');
    }
  }
}

export const masterAdminSubscriptionService = new MasterAdminSubscriptionService();
