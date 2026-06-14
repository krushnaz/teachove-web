import { API_CONFIG } from '../config/api';
import { apiHelper } from '../utils/apiHelper';

export interface ContactMessage {
  id?: string;
  schoolName: string;
  schoolEmail: string;
  mobileNumber?: string;
  message: string;
  createdAt?: string;
  status: 'pending' | 'read' | 'resolved';
}

interface UserCounts {
  schools: number;
  teachers: number;
  students: number;
}

interface FinanceOverview {
  totalEarnings: number;
  totalSubscriptions: number;
  paidSubscriptions: number;
}

export type EarningsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface EarningsByPeriodResponse {
  earnings: number;
  count: number;
  period: string;
  startDate: string;
  endDate: string;
}

export interface SubscriptionLedgerEntry {
  id: string;
  schoolId?: string | null;
  schoolName?: string;
  subscriptionId?: string;
  planId?: string | null;
  planName?: string | null;
  seats?: number;
  durationDays?: number;
  paidAmount?: number;
  gatewayFee?: number;
  gstOnGatewayFee?: number;
  netAmount?: number;
  currency?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  purchasedAt?: string | null;
}

export interface SubscriptionLedgerSummary {
  totalGross: number;
  totalGatewayFee: number;
  totalGstOnGatewayFee: number;
  totalNet: number;
}

export interface SubscriptionLedgerResponse {
  items: SubscriptionLedgerEntry[];
  count: number;
  summary: SubscriptionLedgerSummary;
}

interface SubscriptionPlan {
  id?: string;
  planName: string;
  description?: string;
  amount: number;
  seats?: number;
  features?: string[];
  isActive: boolean;
  planType?: string;
  duration?: 'monthly' | 'yearly';
  createdAt?: any;
  updatedAt?: any;
}

interface SubscriptionPlanResponse {
  success: boolean;
  plan?: SubscriptionPlan;
  plans?: SubscriptionPlan[];
  count?: number;
  data?: any;
}

interface CurrentPlansResponse {
  success: boolean;
  data: {
    [key: string]: {
      amount: number;
      plan: string;
      description?: string;
      features?: string[];
      planType?: string;
      duration?: 'monthly' | 'yearly';
      seats?: number;
    };
  };
}

class MasterAdminService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Get user counts (schools, teachers, students)
  async getUserCounts(): Promise<UserCounts> {
    try {
      const response = await apiHelper.get('/user-count/counts');
      
      if (response.success && response.data) {
        return {
          schools: response.data.schools || 0,
          teachers: response.data.teachers || 0,
          students: response.data.students || 0,
        };
      }
      
      return {
        schools: 0,
        teachers: 0,
        students: 0,
      };
    } catch (error) {
      console.error('Error fetching user counts:', error);
      return {
        schools: 0,
        teachers: 0,
        students: 0,
      };
    }
  }

  // Get finance overview (total earnings)
  async getFinanceOverview(): Promise<FinanceOverview> {
    try {
      const response = await apiHelper.get('/master-admin/finance/total-earnings');
      
      if (response.success && response.data) {
        const d = response.data;
        return {
          totalEarnings: d.totalEarnings ?? d.totalGrossCollected ?? 0,
          totalSubscriptions: d.totalSubscriptions ?? 0,
          paidSubscriptions: d.paidSubscriptions ?? 0,
        };
      }
      
      return {
        totalEarnings: 0,
        totalSubscriptions: 0,
        paidSubscriptions: 0,
      };
    } catch (error) {
      console.error('Error fetching finance overview:', error);
      return {
        totalEarnings: 0,
        totalSubscriptions: 0,
        paidSubscriptions: 0,
      };
    }
  }

  // Get earnings by period (daily, weekly, monthly, yearly, custom)
  async getEarningsByPeriod(
    period: EarningsPeriod,
    startDate?: string,
    endDate?: string
  ): Promise<EarningsByPeriodResponse> {
    try {
      const params = new URLSearchParams({ period });
      if (period === 'custom' && startDate && endDate) {
        params.set('startDate', startDate);
        params.set('endDate', endDate);
      }
      const response = await apiHelper.get(`/master-admin/finance/earnings?${params.toString()}`);
      
      if (response.success && response.data) {
        return {
          earnings: response.data.earnings ?? 0,
          count: response.data.count ?? 0,
          period: response.data.period ?? period,
          startDate: response.data.startDate ?? '',
          endDate: response.data.endDate ?? '',
        };
      }
      
      return {
        earnings: 0,
        count: 0,
        period,
        startDate: '',
        endDate: '',
      };
    } catch (error) {
      console.error('Error fetching earnings by period:', error);
      return {
        earnings: 0,
        count: 0,
        period,
        startDate: '',
        endDate: '',
      };
    }
  }

  async getSubscriptionLedger(limit = 100): Promise<SubscriptionLedgerResponse> {
    try {
      const response = await apiHelper.get(
        `/master-admin/finance/subscription-ledger?limit=${Math.min(limit, 200)}`
      );

      if (response.success) {
        return {
          items: response.items || [],
          count: response.count ?? 0,
          summary: response.summary || {
            totalGross: 0,
            totalGatewayFee: 0,
            totalGstOnGatewayFee: 0,
            totalNet: 0,
          },
        };
      }

      return {
        items: [],
        count: 0,
        summary: { totalGross: 0, totalGatewayFee: 0, totalGstOnGatewayFee: 0, totalNet: 0 },
      };
    } catch (error) {
      console.error('Error fetching subscription ledger:', error);
      return {
        items: [],
        count: 0,
        summary: { totalGross: 0, totalGatewayFee: 0, totalGstOnGatewayFee: 0, totalNet: 0 },
      };
    }
  }

  // Get all subscription plans
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await apiHelper.get('/master-admin/subscription-plans') as SubscriptionPlanResponse;
      
      if (response.success && response.plans) {
        return response.plans;
      }
      
      throw new Error('Failed to fetch subscription plans');
    } catch (error: any) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  // Get subscription plan by ID
  async getSubscriptionPlanById(planId: string): Promise<SubscriptionPlan> {
    try {
      const response = await apiHelper.get(`/master-admin/subscription-plans/${planId}`) as SubscriptionPlanResponse;
      
      if (response.success && response.plan) {
        return response.plan;
      }
      
      throw new Error('Failed to fetch subscription plan');
    } catch (error: any) {
      console.error('Error fetching subscription plan:', error);
      throw error;
    }
  }

  // Create subscription plan
  async createSubscriptionPlan(plan: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<SubscriptionPlan> {
    try {
      const response = await apiHelper.post('/master-admin/subscription-plans', plan) as SubscriptionPlanResponse;
      
      if (response.success && response.plan) {
        return response.plan;
      }
      
      throw new Error('Failed to create subscription plan');
    } catch (error: any) {
      console.error('Error creating subscription plan:', error);
      throw error;
    }
  }

  // Update subscription plan
  async updateSubscriptionPlan(planId: string, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    try {
      const response = await apiHelper.put(`/master-admin/subscription-plans/${planId}`, plan) as SubscriptionPlanResponse;
      
      if (response.success && response.plan) {
        return response.plan;
      }
      
      throw new Error('Failed to update subscription plan');
    } catch (error: any) {
      console.error('Error updating subscription plan:', error);
      throw error;
    }
  }

  // Delete subscription plan
  async deleteSubscriptionPlan(planId: string): Promise<void> {
    try {
      const response = await apiHelper.delete(`/master-admin/subscription-plans/${planId}`) as { success: boolean; message: string };
      
      if (!response.success) {
        throw new Error('Failed to delete subscription plan');
      }
    } catch (error: any) {
      console.error('Error deleting subscription plan:', error);
      throw error;
    }
  }

  // Toggle plan active status
  async togglePlanStatus(planId: string): Promise<boolean> {
    try {
      const response = await apiHelper.patch(`/master-admin/subscription-plans/${planId}/toggle-status`) as { success: boolean; isActive: boolean };
      
      if (response.success) {
        return response.isActive;
      }
      
      throw new Error('Failed to toggle plan status');
    } catch (error: any) {
      console.error('Error toggling plan status:', error);
      throw error;
    }
  }

  // Get current subscription plans (for app display)
  async getCurrentSubscriptionPlans(): Promise<CurrentPlansResponse['data']> {
    try {
      const response = await apiHelper.get('/master-admin/subscription-plans/current') as CurrentPlansResponse;
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Failed to fetch current subscription plans');
    } catch (error: any) {
      console.error('Error fetching current subscription plans:', error);
      throw error;
    }
  }

  // Submit contact message (Public API)
  async submitContactMessage(messageData: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>): Promise<any> {
    try {
      const response = await apiHelper.post('/master-admin/contact', messageData);
      return response;
    } catch (error) {
      console.error('Error submitting contact message:', error);
      throw error;
    }
  }

  // Get all contact messages (Master Admin API)
  async getAllContactMessages(): Promise<ContactMessage[]> {
    try {
      const response = await apiHelper.get('/master-admin/contact');
      if (response.success && response.messages) {
        return response.messages;
      }
      return [];
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      return [];
    }
  }

  // Update contact message status (Master Admin API)
  async updateContactMessageStatus(id: string, status: 'pending' | 'read' | 'resolved'): Promise<any> {
    try {
      const response = await apiHelper.put(`/master-admin/contact/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating contact message status:', error);
      throw error;
    }
  }

  // Delete contact message (Master Admin API)
  async deleteContactMessage(id: string): Promise<void> {
    try {
      const response = await apiHelper.delete(`/master-admin/contact/${id}`);
      if (!response.success) {
        throw new Error('Failed to delete contact message');
      }
    } catch (error) {
      console.error('Error deleting contact message:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const masterAdminService = new MasterAdminService();

// Export the class for testing purposes
export default MasterAdminService;
