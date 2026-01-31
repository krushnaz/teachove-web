import { apiHelper } from '../utils/apiHelper';

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
  request_created_at?: {
    _seconds: number;
    _nanoseconds: number;
  };
  payment_created_at?: {
    _seconds: number;
    _nanoseconds: number;
  } | null;
  updated_at?: {
    _seconds: number;
    _nanoseconds: number;
  };
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
      }) as { success: boolean; message: string };
      
      if (response.success) {
        return response;
      }
      
      throw new Error('Failed to update subscription status');
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
}

export const masterAdminSubscriptionService = new MasterAdminSubscriptionService();
