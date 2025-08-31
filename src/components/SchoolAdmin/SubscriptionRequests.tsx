import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { subscriptionService, SubscriptionRequest as ApiSubscriptionRequest, CreateSubscriptionRequest, SubscriptionCostResponse } from '../../services/subscriptionService';

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SubscriptionRequest {
  subscriptionId?: string;
  numOfUsers: number;
  approveStatus: 'approved' | 'denied' | 'pending';
  paymentStatus: 'pending' | 'paid' | 'failed';
  requestCreatedAt: string;
  paymentCreatedAt?: string;
  subscriptionCost: number;
  schoolId: string;
  paymentMethod: string;
  razorpayPaymentId?: string;
  amount?: number;
  currency?: string;
  subscriptionType?: 'TeachoVE only' | 'TeachoVE + StudoVE';
  remainingAmount?: number;
}

// Helper function to convert API response to component interface
const convertApiToComponentData = (apiData: ApiSubscriptionRequest): SubscriptionRequest => {
  console.log('Converting API data:', apiData);
  console.log('Amount field:', apiData.amount);
  console.log('Amount type:', typeof apiData.amount);
  console.log('All fields:', Object.keys(apiData));
  
  let paymentStatus: 'paid' | 'pending' | 'failed';
  if (apiData.payment_status === 'successful') {
    paymentStatus = 'paid';
  } else if (apiData.payment_status === 'pending') {
    paymentStatus = 'pending';
  } else {
    paymentStatus = 'failed';
  }
  
  const converted: SubscriptionRequest = {
    subscriptionId: apiData.subscription_id,
    numOfUsers: apiData.num_of_users,
    approveStatus: apiData.approve_status,
    paymentStatus,
    requestCreatedAt: apiData.request_created_at 
      ? new Date(apiData.request_created_at._seconds * 1000).toISOString()
      : new Date().toISOString(),
    paymentCreatedAt: apiData.payment_created_at 
      ? new Date(apiData.payment_created_at._seconds * 1000).toISOString()
      : undefined,
    subscriptionCost: apiData.subscription_cost_per_user,
    schoolId: apiData.school_id,
    paymentMethod: apiData.payment_method,
    razorpayPaymentId: apiData.razorpay_payment_id,
    amount: apiData.amount || (apiData.subscription_cost_per_user * apiData.num_of_users) || 0, // Fallback to calculated amount
    currency: apiData.currency,
    subscriptionType: apiData.subscription_type === 'Both' ? 'TeachoVE + StudoVE' : 'TeachoVE only',
    remainingAmount: apiData.remaining_amount
  };
  console.log('Converted data:', converted);
  return converted;
};

interface SubscriptionForm {
  subscriptionType: 'TeachoVE only' | 'TeachoVE + StudoVE';
  numOfUsers: number;
}

const SubscriptionRequests: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewRequestSidebarOpen, setIsNewRequestSidebarOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [formData, setFormData] = useState<SubscriptionForm>({
    subscriptionType: 'TeachoVE only',
    numOfUsers: 1
  });
  const [subscriptionCosts, setSubscriptionCosts] = useState<SubscriptionCostResponse | null>(null);
  const [costsLoading, setCostsLoading] = useState(true);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      if (window.Razorpay) return; // Already loaded
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => console.log('Razorpay script loaded');
      script.onerror = () => console.error('Failed to load Razorpay script');
      document.body.appendChild(script);
    };

    loadRazorpayScript();
  }, []);

  // Fetch subscription costs
  useEffect(() => {
    const fetchSubscriptionCosts = async () => {
      try {
        setCostsLoading(true);
        const costs = await subscriptionService.getSubscriptionCosts();
        setSubscriptionCosts(costs);
      } catch (error) {
        console.error('Error fetching subscription costs', error);
        showToast('Failed to fetch subscription costs', 'error');
      } finally {
        setCostsLoading(false);
      }
    };

    fetchSubscriptionCosts();
  }, []);

  // Fetch subscription requests from API
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user?.schoolId) return;
      
      try {
        setLoading(true);
        const apiSubscriptions = await subscriptionService.getSubscriptionsBySchool(user.schoolId);
        console.log('Raw API response:', apiSubscriptions);
        
        const convertedSubscriptions = apiSubscriptions.map(convertApiToComponentData);
        console.log('Converted subscriptions:', convertedSubscriptions);
        
        setRequests(convertedSubscriptions);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        // You can add error handling here (e.g., show error toast)
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user?.schoolId]);

  const subscriptionPlans = useMemo(() => {
    if (!subscriptionCosts) return {
      'TeachoVE only': {
        description: 'Access to TeachoVE School Management System only',
        cost: 0,
        features: ['School Management', 'Student Records', 'Teacher Management', 'Attendance Tracking', 'Exam Management', 'Fee Management']
      },
      'TeachoVE + StudoVE': {
        description: 'Access to both TeachoVE (free) and StudoVE Student/Parent App',
        cost: 99,
        features: ['All TeachoVE Features', 'Student Mobile App', 'Parent Mobile App', 'Real-time Notifications', 'Online Fee Payment', 'Progress Tracking']
      }
    };

    return {
      'TeachoVE only': {
        description: 'Access to TeachoVE School Management System only',
        cost: subscriptionCosts.teachove.amount,
        features: ['School Management', 'Student Records', 'Teacher Management', 'Attendance Tracking', 'Exam Management', 'Fee Management']
      },
      'TeachoVE + StudoVE': {
        description: 'Access to both TeachoVE (free) and StudoVE Student/Parent App',
        cost: subscriptionCosts.both.amount,
        features: ['All TeachoVE Features', 'Student Mobile App', 'Parent Mobile App', 'Real-time Notifications', 'Online Fee Payment', 'Progress Tracking']
      }
    };
  }, [subscriptionCosts]);

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = request.subscriptionType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.subscriptionId?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || request.approveStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const handleNewRequest = () => {
    setIsNewRequestSidebarOpen(true);
    setFormData({
      subscriptionType: 'TeachoVE only',
      numOfUsers: 1
    });
  };

  const handleSubscriptionTypeChange = (type: 'TeachoVE only' | 'TeachoVE + StudoVE') => {
    setFormData({
      ...formData,
      subscriptionType: type,
      // For TeachoVE only, always set numOfUsers to 1
      numOfUsers: type === 'TeachoVE only' ? 1 : formData.numOfUsers
    });
  };

  const handleViewDetails = (request: SubscriptionRequest) => {
    setSelectedRequest(request);
    setIsViewDetailsOpen(true);
  };

  const handleSendRequest = async () => {
    if (!formData.numOfUsers || !user?.schoolId) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      showToast('Creating subscription request...', 'info');

      // Calculate costs based on subscription type
      const costPerUser = subscriptionPlans[formData.subscriptionType].cost;
      const totalCost = costPerUser * formData.numOfUsers;

      // Prepare API request data
      const apiData: CreateSubscriptionRequest = {
        num_of_users: formData.numOfUsers,
        approve_status: 'pending',
        payment_status: 'pending',
        subscription_cost_per_user: costPerUser,
        school_id: user.schoolId,
        payment_method: 'razorpay',
        amount: totalCost,
        currency: 'INR',
        subscription_type: formData.subscriptionType === 'TeachoVE + StudoVE' ? 'Both' : 'TeachoVE',
        remaining_amount: 0.0
      };

      // Call the API
      const response = await subscriptionService.createSubscription(apiData);

      // Create new request object for local state
      const newRequest: SubscriptionRequest = {
        subscriptionId: response.subscriptionId,
        numOfUsers: formData.numOfUsers,
        approveStatus: 'pending',
        paymentStatus: 'pending',
        requestCreatedAt: new Date().toISOString(),
        subscriptionCost: costPerUser,
        schoolId: user.schoolId,
        paymentMethod: 'razorpay',
        amount: totalCost,
        currency: 'INR',
        subscriptionType: formData.subscriptionType,
        remainingAmount: 0
      };

      // Update local state
      setRequests(prev => [newRequest, ...prev]);
      setIsNewRequestSidebarOpen(false);
      setFormData({
        subscriptionType: 'TeachoVE only',
        numOfUsers: 1
      });

      showToast('Subscription request created successfully!', 'success');
    } catch (error) {
      console.error('Error creating subscription request:', error);
      showToast('Failed to create subscription request. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadInvoice = async (request: SubscriptionRequest) => {
    if (!request.subscriptionId || !user?.schoolId) {
      showToast('Missing information for download', 'error');
      return;
    }

    if (downloadingInvoice === request.subscriptionId) {
      return; // Prevent multiple clicks
    }

    try {
      setDownloadingInvoice(request.subscriptionId);
      showToast('Downloading invoice...', 'info');
      await subscriptionService.downloadInvoice(user.schoolId, request.subscriptionId);
      showToast('Invoice downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showToast('Failed to download invoice. Please try again.', 'error');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const handlePayNow = async (request: SubscriptionRequest) => {

    if (!request.subscriptionId || !user?.schoolId) {
      showToast('Missing information for payment', 'error');
      return;
    }

    if (processingPayment === request.subscriptionId) {
      return; // Prevent multiple clicks
    }

    if (!window.Razorpay) {
      showToast('Payment gateway is loading. Please wait a moment and try again.', 'error');
      return;
    }

    try {
      setProcessingPayment(request.subscriptionId);
      showToast('Creating payment order...', 'info');

      // Validate payment data
      console.log('Request amount:', request.amount, 'Type:', typeof request.amount);
      console.log('Full request object:', request);
      
      // Handle amount validation - check if it's a valid number
      const amount = Number(request.amount);
      if (isNaN(amount) || amount <= 0) {
        showToast(`Invalid amount for payment: ${request.amount}`, 'error');
        setProcessingPayment(null);
        return;
      }

      if (!request.subscriptionId) {
        showToast('Missing subscription information', 'error');
        setProcessingPayment(null);
        return;
      }

      // Create Razorpay order first with your backend
      const orderData = {
        amount: amount,
        subscriptionId: request.subscriptionId!,
        userId: user.schoolId,
        schoolId: user.schoolId
      };

      console.log('Creating order with data:', orderData);
      const orderResponse = await subscriptionService.createRazorpayOrder(orderData);
      console.log('Order response:', orderResponse);

      if (!orderResponse.id) {
        throw new Error('Failed to create payment order');
      }

      // Now show Razorpay with the order ID from backend
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY',
        amount: amount * 100, // Convert rupees to paise for Razorpay
        currency: 'INR',
        name: 'TeachoVE',
        description: `${request.subscriptionType || 'Subscription'} Payment`,
        order_id: orderResponse.id, // Use the order ID from your backend
        prefill: {
          name: 'School Admin',
          email: user.email,
        },
        theme: {
          color: '#3B82F6'
        },
        handler: async (response: any) => {
          console.log('=== RAZORPAY HANDLER TRIGGERED ===');
          console.log('Response type:', typeof response);
          console.log('Response is null/undefined:', response === null || response === undefined);
          
          try {
            showToast('Payment completed! Verifying with server...', 'info');
            
            if (!response) {
              throw new Error('Razorpay response is null or undefined');
            }
            
            console.log('Full Razorpay response object:', response);
            console.log('Response keys:', Object.keys(response));
            console.log('Response values:', Object.values(response));
            console.log('Response stringified:', JSON.stringify(response, null, 2));
            
            // Check for different possible field names
            const paymentId = response.razorpay_payment_id || response.payment_id || response.paymentId;
            const orderId = response.razorpay_order_id || response.order_id || response.orderId || orderResponse.id;
            const signature = response.razorpay_signature || response.signature || 'N/A';
            
            console.log('Extracted values:', { paymentId, orderId, signature });
            
            // Only require payment ID since that's what Razorpay provides
            if (!paymentId) {
              throw new Error(`Missing payment ID from Razorpay. Got: paymentId=${paymentId}`);
            }
            
            const verificationData = {
              razorpay_payment_id: paymentId,
              razorpay_order_id: orderId,
              razorpay_signature: signature,
              subscriptionId: request.subscriptionId!,
              totalPaidAmount: amount,
              remainingAmount: 0
            };
            
            console.log('Data being sent for verification:', verificationData);
            
            await subscriptionService.verifyRazorpayPayment(verificationData);

            // Update local state to reflect payment completion
            setRequests(prev => prev.map(req => 
              req.subscriptionId === request.subscriptionId 
                ? { ...req, paymentStatus: 'paid' as const }
                : req
            ));

            showToast('Payment verified successfully! Your subscription is now active.', 'success');
          } catch (error) {
            console.error('Payment verification failed:', error);
            showToast('Payment completed but verification failed. Please contact support.', 'error');
          } finally {
            setProcessingPayment(null);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(null);
            showToast('Payment cancelled', 'info');
          }
        }
      };

      // Initialize Razorpay payment with order ID
      console.log('Opening Razorpay with options:', options);
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      console.log('Razorpay.open() called');

    } catch (error) {
      console.error('Error opening payment gateway:', error);
      showToast('Failed to open payment gateway. Please try again.', 'error');
      setProcessingPayment(null);
    }
  };

  // Alternative method: Create order first, then show payment (if you prefer this approach)
  const handlePayNowWithOrder = async (request: SubscriptionRequest) => {
    if (!request.subscriptionId || !user?.schoolId) {
      showToast('Missing information for payment', 'error');
      return;
    }

    if (processingPayment === request.subscriptionId) {
      return;
    }

    // Validate amount
    const amount = Number(request.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast(`Invalid amount for payment: ${request.amount}`, 'error');
      return;
    }

    try {
      setProcessingPayment(request.subscriptionId);
      showToast('Creating payment order...', 'info');

      // First create order with your backend
      const orderData = {
        amount: amount,
        subscriptionId: String(request.subscriptionId),
        userId: String(user.schoolId),
        schoolId: String(user.schoolId)
      };

      const orderResponse = await subscriptionService.createRazorpayOrder(orderData);

      if (!orderResponse.orderId) {
        throw new Error('Failed to create payment order');
      }

      // Then show Razorpay with the order ID
      const options = {
        key: orderResponse.key || process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY',
        amount: amount * 100, // Convert rupees to paise for Razorpay
        currency: 'INR',
        name: 'TeachoVE',
        description: `${request.subscriptionType || 'Subscription'} Payment`,
        order_id: orderResponse.orderId, // Use the order ID from backend
        prefill: {
          name: 'School Admin',
          email: user.email,
        },
        theme: { color: '#3B82F6' },
        handler: async (response: any) => {
          console.log('=== RAZORPAY HANDLER TRIGGERED ===');
          console.log('Response type:', typeof response);
          console.log('Response is null/undefined:', response === null || response === undefined);
          
          try {
            showToast('Payment completed! Verifying with server...', 'info');
            
            if (!response) {
              throw new Error('Razorpay response is null or undefined');
            }
            
            console.log('Full Razorpay response object:', response);
            console.log('Response keys:', Object.keys(response));
            console.log('Response values:', Object.values(response));
            console.log('Response stringified:', JSON.stringify(response, null, 2));
            
            // Check for different possible field names
            const paymentId = response.razorpay_payment_id || response.payment_id || response.paymentId;
            const orderId = response.razorpay_order_id || response.order_id || response.orderId || 'N/A';
            const signature = response.razorpay_signature || response.signature || 'N/A';
            
            console.log('Extracted values:', { paymentId, orderId, signature });
            
            // Only require payment ID since that's what Razorpay provides
            if (!paymentId) {
              throw new Error(`Missing payment ID from Razorpay. Got: paymentId=${paymentId}`);
            }
            
            const verificationData = {
              razorpay_payment_id: paymentId,
              razorpay_order_id: orderId,
              razorpay_signature: signature,
              subscriptionId: request.subscriptionId!,
              totalPaidAmount: amount,
              remainingAmount: 0
            };
            
            console.log('Data being sent for verification:', verificationData);
            
            await subscriptionService.verifyRazorpayPayment(verificationData);

            setRequests(prev => prev.map(req => 
              req.subscriptionId === request.subscriptionId 
                ? { ...req, paymentStatus: 'paid' as const }
                : req
            ));

            showToast('Payment verified successfully! Your subscription is now active.', 'success');
          } catch (error) {
            console.error('Payment verification failed:', error);
            showToast('Payment completed but verification failed. Please contact support.', 'error');
          } finally {
            setProcessingPayment(null);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(null);
            showToast('Payment cancelled', 'info');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Error creating payment order:', error);
      showToast('Failed to create payment order. Please try again.', 'error');
      setProcessingPayment(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      denied: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotalCost = (type: string, users: number) => {
    const plan = subscriptionPlans[type as keyof typeof subscriptionPlans];
    return plan ? plan.cost * users : 0;
  };

  // Toast notification system
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white shadow-lg transform transition-all duration-300 translate-x-full ${bgColor}`;
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="text-lg">${icon}</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.remove('translate-x-full'), 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 4000);
  };

  // Shimmer loading components
  const ShimmerCard = () => (
    <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
          <div className="h-8 bg-gray-300 rounded w-16 animate-pulse"></div>
        </div>
        <div className="p-3 bg-gray-300 rounded-full w-12 h-12 animate-pulse"></div>
      </div>
    </div>
  );

  const ShimmerTableRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-12 animate-pulse"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="h-8 bg-gray-300 rounded w-8 animate-pulse"></div>
          <div className="h-8 bg-gray-300 rounded w-8 animate-pulse"></div>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="p-6">
          {/* Header Shimmer */}
          <div className="mb-8">
            <div className="h-8 bg-gray-300 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-5 bg-gray-300 rounded w-96 animate-pulse"></div>
          </div>

          {/* Button Shimmer */}
          <div className="mb-8">
            <div className="h-12 bg-gray-300 rounded-lg w-40 animate-pulse"></div>
          </div>

          {/* Stats Cards Shimmer */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            {[...Array(6)].map((_, index) => (
              <ShimmerCard key={index} />
            ))}
          </div>

          {/* Filters Shimmer */}
          <div className={`p-6 rounded-xl shadow-lg mb-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="h-10 bg-gray-300 rounded-lg w-full animate-pulse"></div>
              </div>
              <div className="sm:w-48">
                <div className="h-10 bg-gray-300 rounded-lg w-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Table Shimmer */}
          <div className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    {[...Array(8)].map((_, index) => (
                      <th key={index} className="px-6 py-3">
                        <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {[...Array(5)].map((_, index) => (
                    <ShimmerTableRow key={index} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Subscription Requests
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage your subscription requests and access plans
            </p>
          </div>
          <button
            onClick={handleNewRequest}
            className={`mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Request
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Requests
                </p>
                <p className="text-2xl font-bold text-blue-600">{requests.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Pending
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {requests.filter(r => r.approveStatus === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Approved
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.approveStatus === 'approved').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Users
                </p>
                <p className="text-2xl font-bold text-indigo-600">
                  {requests.reduce((sum, r) => sum + r.numOfUsers, 0)}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  ₹{requests.reduce((sum, r) => sum + (r.amount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-6 rounded-xl shadow-lg mb-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Subscription Requests ({filteredRequests.length})
            </h2>
          </div>
          
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                No subscription requests found
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first subscription request'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Request ID
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Type
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Users Count
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                     Paid Amount
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Payment
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Created
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredRequests.map((request) => (
                    <tr key={request.subscriptionId} className={`hover:bg-gray-50 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {request.subscriptionId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {request.subscriptionType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {request.numOfUsers}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {request.amount ? (
                            <span className="text-green-600">₹{request.amount}</span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.approveStatus)}`}>
                          {request.approveStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(request.paymentStatus)}`}>
                          {request.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {formatDate(request.requestCreatedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(request)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode 
                                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          {request.paymentStatus === 'pending' && (
                            <button
                              onClick={() => handlePayNow(request)}
                              disabled={processingPayment === request.subscriptionId}
                              className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
                                isDarkMode 
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl' 
                                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                              } transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                              title="Pay Now"
                            >
                              {processingPayment === request.subscriptionId ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                  </svg>
                                  <span>Pay Now</span>
                                </>
                              )}
                            </button>
                          )}
                          
                          {request.paymentStatus === 'paid' && (
                            <button
                              onClick={() => handleDownloadInvoice(request)}
                              disabled={downloadingInvoice === request.subscriptionId}
                              className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
                                isDarkMode 
                                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl' 
                                  : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
                              } transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                              title="Download Invoice"
                            >
                              {downloadingInvoice === request.subscriptionId ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Downloading...</span>
                                </>
                              ) : (
                                <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                                  <span>Invoice</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Request Sidebar */}
      {isNewRequestSidebarOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
            <div className={`w-screen max-w-md ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <div className={`h-full flex flex-col py-6 shadow-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className={`px-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <h2 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      New Subscription Request
                    </h2>
                    <button
                      onClick={() => setIsNewRequestSidebarOpen(false)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex-1 px-6 py-6 overflow-y-auto">
                  <form className="space-y-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Subscription Type *
                      </label>
                      <select
                        value={formData.subscriptionType}
                        onChange={(e) => handleSubscriptionTypeChange(e.target.value as 'TeachoVE only' | 'TeachoVE + StudoVE')}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        <option value="TeachoVE only">TeachoVE only</option>
                        <option value="TeachoVE + StudoVE">TeachoVE + StudoVE</option>
                      </select>
                    </div>

                    {/* Plan Details */}
                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {subscriptionPlans[formData.subscriptionType].description}
                      </h4>
                      <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {subscriptionPlans[formData.subscriptionType].features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {formData.subscriptionType === 'TeachoVE + StudoVE' && (
                        <div className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-blue-900 bg-opacity-20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                          <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                            <strong>Note:</strong> TeachoVE is free. Charges apply only for StudoVE Student/Parent App access.
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Number of Users *
                        {formData.subscriptionType === 'TeachoVE only' && (
                          <span className="ml-2 text-sm text-gray-500">(Fixed at 1 for TeachoVE only)</span>
                        )}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.numOfUsers}
                        onChange={(e) => setFormData({...formData, numOfUsers: parseInt(e.target.value) || 1})}
                        disabled={formData.subscriptionType === 'TeachoVE only'}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                    </div>

                    {/* Cost Breakdown */}
                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Cost Breakdown
                        {costsLoading && (
                          <span className="ml-2 text-sm text-gray-500">(Loading costs...)</span>
                        )}
                      </h4>
                      {costsLoading ? (
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
                          <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                          <div className="border-t pt-2">
                            <div className="h-6 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Cost per user:
                            </span>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              ₹{subscriptionPlans[formData.subscriptionType].cost}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Number of users:
                            </span>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {formData.numOfUsers}
                            </span>
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between">
                              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Total Cost:
                              </span>
                              <span className={`text-lg font-bold text-blue-600`}>
                                ₹{calculateTotalCost(formData.subscriptionType, formData.numOfUsers)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                </div>

                <div className={`px-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      onClick={() => setIsNewRequestSidebarOpen(false)}
                      className={`px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendRequest}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Creating...
                        </>
                      ) : (
                        'Send Request'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Dialog */}
      {isViewDetailsOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
            
            <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Request Details
                  </h3>
                  <button
                    onClick={() => setIsViewDetailsOpen(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Request ID
                      </h4>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedRequest.subscriptionId}
                      </p>
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Subscription Type
                      </h4>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedRequest.subscriptionType}
                      </p>
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Number of Users
                      </h4>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedRequest.numOfUsers}
                      </p>
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Cost per User
                      </h4>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        ₹{selectedRequest.subscriptionCost}
                      </p>
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Approval Status
                      </h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.approveStatus)}`}>
                        {selectedRequest.approveStatus}
                      </span>
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Payment Status
                      </h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedRequest.paymentStatus)}`}>
                        {selectedRequest.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {selectedRequest.amount && (
                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Payment Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Amount:</span>
                          <span className={`ml-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            ₹{selectedRequest.amount}
                          </span>
                        </div>
                        <div>
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Currency:</span>
                          <span className={`ml-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {selectedRequest.currency}
                          </span>
                        </div>
                        {selectedRequest.razorpayPaymentId && (
                          <div>
                            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment ID:</span>
                            <span className={`ml-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {selectedRequest.razorpayPaymentId}
                            </span>
                          </div>
                        )}
                        {selectedRequest.remainingAmount && selectedRequest.remainingAmount > 0 && (
                          <div>
                            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Remaining:</span>
                            <span className={`ml-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              ₹{selectedRequest.remainingAmount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className={`pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Created:</span>
                        <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatDate(selectedRequest.requestCreatedAt)}
                        </span>
                      </div>
                      {selectedRequest.paymentCreatedAt && (
                        <div>
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment:</span>
                          <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {formatDate(selectedRequest.paymentCreatedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between">
                  {selectedRequest.paymentStatus === 'pending' && (
                    <button
                      onClick={() => handlePayNow(selectedRequest)}
                      disabled={processingPayment === selectedRequest.subscriptionId}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {processingPayment === selectedRequest.subscriptionId ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <span>Pay Now</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  {selectedRequest.paymentStatus === 'paid' && (
                    <button
                      onClick={() => handleDownloadInvoice(selectedRequest)}
                      disabled={downloadingInvoice === selectedRequest.subscriptionId}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {downloadingInvoice === selectedRequest.subscriptionId ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Download Invoice</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={() => setIsViewDetailsOpen(false)}
                    className="ml-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionRequests; 