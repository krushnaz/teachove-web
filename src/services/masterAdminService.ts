import { API_CONFIG } from '../config/api';
import { apiHelper } from '../utils/apiHelper';

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

interface SubscriptionPlan {
  id?: string;
  planName: string;
  description?: string;
  amount: number;
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
        return {
          totalEarnings: response.data.totalEarnings || 0,
          totalSubscriptions: response.data.totalSubscriptions || 0,
          paidSubscriptions: response.data.paidSubscriptions || 0,
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
}

// Create and export a singleton instance
export const masterAdminService = new MasterAdminService();

// Export the class for testing purposes
export default MasterAdminService;
