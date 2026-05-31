import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import {
  subscriptionService,
  SubscriptionPlan,
  CurrentSubscriptionDetails,
} from '../../../services/subscriptionService';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PRIMARY_COLOR = '#2F3C7E';

// Normalized subscription item for UI (from API purchase list)
interface SubscriptionRequest {
  subscriptionId: string;
  id?: string;
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
  subscriptionType?: string;
  planName?: string;
  duration?: string;
  remainingAmount?: number;
  totalCost: number;
  planDescription?: string;
  planFeatures?: string[];
}

function parseTimestamp(ts: any): string {
  if (!ts) return new Date().toISOString();
  if (typeof ts === 'string') return ts;
  if (ts._seconds != null) return new Date(ts._seconds * 1000).toISOString();
  if (ts.toDate && typeof ts.toDate === 'function') return ts.toDate().toISOString();
  return new Date(ts).toISOString();
}

function convertApiToSubscriptionRequest(api: any): SubscriptionRequest {
  const paymentStatus =
    api.payment_status === 'successful' || api.payment_status === 'paid' ? 'paid'
      : api.payment_status === 'pending' ? 'pending' : 'failed';
  const numOfUsers = Number(api.num_of_users ?? api.numOfUsers ?? 0);
  const costPerUser = Number(api.subscription_cost_per_user ?? api.subscriptionCost ?? 0);
  const totalCost = numOfUsers * costPerUser;
  const amount = Number(api.amount ?? 0);
  const remainingAmount = Number(api.remaining_amount ?? api.remainingAmount ?? totalCost);
  return {
    subscriptionId: api.subscription_id ?? api.subscriptionId ?? api.id ?? '',
    id: api.id,
    numOfUsers,
    approveStatus: api.approve_status ?? 'pending',
    paymentStatus,
    requestCreatedAt: parseTimestamp(api.request_created_at ?? api.requestedAt),
    paymentCreatedAt: api.payment_created_at ? parseTimestamp(api.payment_created_at) : undefined,
    subscriptionCost: costPerUser,
    schoolId: api.school_id ?? api.schoolId ?? '',
    paymentMethod: api.payment_method ?? api.paymentMethod ?? 'Razorpay',
    razorpayPaymentId: api.razorpay_payment_id ?? api.razorpayPaymentId,
    amount,
    currency: api.currency,
    subscriptionType: api.subscription_type ?? api.subscriptionType,
    planName: api.plan_name ?? api.planName,
    duration: api.duration,
    remainingAmount,
    totalCost,
    planDescription: api.plan_description ?? api.planDescription,
    planFeatures: api.plan_features ?? api.planFeatures,
  };
}

function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
  toast.className = `fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg text-white shadow-lg transform transition-all duration-300 translate-x-full ${bgColor}`;
  toast.innerHTML = `<div class="flex items-center space-x-2"><span class="text-lg">${icon}</span><span>${message}</span></div>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.remove('translate-x-full'), 100);
  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 4000);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const SubscriptionRequests: React.FC = () => {
  const { user, schoolDetails } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscriptionDetails | null>(null);
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [purchaseSheetOpen, setPurchaseSheetOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [seatCount, setSeatCount] = useState('10');
  const [sheetProcessing, setSheetProcessing] = useState(false);
  const [isCreatingPurchase, setIsCreatingPurchase] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null);

  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);

  // Sales modal state
  const [salesModalOpen, setSalesModalOpen] = useState(false);
  const [salesSchoolName, setSalesSchoolName] = useState(user?.schoolName || schoolDetails?.schoolName || '');
  const [salesName, setSalesName] = useState(user?.name || '');
  const [salesPhone, setSalesPhone] = useState(user?.phoneNo || schoolDetails?.phoneNo || '');
  const [salesEmail, setSalesEmail] = useState(user?.email || '');
  const [salesStudentCount, setSalesStudentCount] = useState('500');
  const [salesMessage, setSalesMessage] = useState('');
  const [salesSubmitting, setSalesSubmitting] = useState(false);

  // Sync state when user or schoolDetails context is loaded
  useEffect(() => {
    if (user) {
      setSalesSchoolName(user.schoolName || schoolDetails?.schoolName || '');
      setSalesName(user.name || '');
      setSalesPhone(user.phoneNo || schoolDetails?.phoneNo || '');
      setSalesEmail(user.email || '');
    }
  }, [user, schoolDetails]);

  const handleSalesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salesSchoolName || !salesName || !salesPhone || !salesEmail || !salesStudentCount) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setSalesSubmitting(true);
    try {
      await subscriptionService.createSalesRequest({
        schoolId,
        schoolName: salesSchoolName,
        contactPerson: salesName,
        phone: salesPhone,
        email: salesEmail,
        expectedStudentCount: Number(salesStudentCount),
        message: salesMessage
      });
      showToast('Your inquiry has been successfully sent to sales! Our team will contact you shortly.', 'success');
      setSalesModalOpen(false);
      setSalesMessage('');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit sales inquiry', 'error');
    } finally {
      setSalesSubmitting(false);
    }
  };

  const schoolId = user?.schoolId ?? '';

  const hasCurrent = Boolean(
    currentSubscription?.isActive &&
    currentSubscription?.expiryAt &&
    (currentSubscription?.totalSeats ?? 0) > 0
  );
  const hasExpiredPlan = Boolean(
    currentSubscription &&
    (currentSubscription.totalSeats ?? 0) > 0 &&
    !currentSubscription.isActive
  );
  const currentPlanName = (currentSubscription?.planName ?? '').trim().toLowerCase();

  const loadData = useCallback(async () => {
    if (!schoolId) return;
    try {
      setErrorMessage(null);
      const [plansRes, currentRes, subsRes] = await Promise.all([
        subscriptionService.getSubscriptionPlans(),
        subscriptionService.getCurrentSubscriptionDetails(schoolId),
        subscriptionService.getSubscriptionsBySchool(schoolId),
      ]);
      const sortedPlans = [...plansRes].sort((a, b) => {
        const seatsA = a.seats || 0;
        const seatsB = b.seats || 0;
        if (seatsA === 0 && seatsB > 0) return 1;
        if (seatsA > 0 && seatsB === 0) return -1;
        if (seatsA > 0 && seatsB > 0) return seatsA - seatsB;
        return (a.amount || 0) - (b.amount || 0);
      });
      setPlans(sortedPlans);
      setCurrentSubscription(currentRes ?? null);
      const list = Array.isArray(subsRes) ? subsRes : (subsRes as any)?.subscriptions ?? [];
      setRequests(list.map(convertApiToSubscriptionRequest));
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Failed to load');
      showToast('Failed to load subscriptions', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [schoolId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (window.Razorpay) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const openPurchaseSheet = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    if (plan.seats && plan.seats > 0) {
      setSeatCount(String(plan.seats));
    } else if (hasExpiredPlan && plan.planName.trim().toLowerCase() === currentPlanName && currentSubscription?.totalSeats) {
      setSeatCount(String(currentSubscription.totalSeats));
    } else if (!seatCount || seatCount === '0') {
      setSeatCount('10');
    }
    setPurchaseSheetOpen(true);
  };

  const closePurchaseSheet = () => {
    setPurchaseSheetOpen(false);
    setSelectedPlan(null);
    setSheetProcessing(false);
    setIsCreatingPurchase(false);
  };

  const handlePurchaseSeatsForPlan = async () => {
    if (!selectedPlan || !schoolId) return;
    const isPackage = Boolean(selectedPlan.seats && selectedPlan.seats > 0);
    const seats = isPackage ? (selectedPlan.seats || 0) : (parseInt(seatCount.trim(), 10) || 0);
    if (seats <= 0) {
      showToast('Enter a valid number of students', 'error');
      return;
    }

    setIsCreatingPurchase(true);
    setSheetProcessing(true);
    try {
      const payAmount = isPackage ? selectedPlan.amount : (seats * selectedPlan.amount);
      const unitCost = isPackage ? (selectedPlan.amount / seats) : selectedPlan.amount;

      const res = await subscriptionService.createSubscription({
        num_of_users: seats,
        approve_status: 'pending',
        payment_status: 'pending',
        subscription_cost_per_user: unitCost,
        school_id: schoolId,
        payment_method: 'Razorpay',
        plan_id: selectedPlan.id,
        plan_name: selectedPlan.planName,
        duration: selectedPlan.duration,
        amount: payAmount,
        subscription_type: (selectedPlan.planType === 'Both' || selectedPlan.planName?.toLowerCase().includes('studove')) ? 'Both' : 'TeachoVE',
      });
      const subscriptionId = res.subscriptionId;

      if (!subscriptionId) {
        throw new Error('Failed to create purchase request');
      }

      await startRazorpayPayment(
        subscriptionId,
        payAmount,
        0,
        payAmount,
        'Subscription Payment - ' + (selectedPlan.planName || 'TeachoVE')
      );
      await loadData();
      closePurchaseSheet();
      showToast('Payment flow completed. Verifying...', 'info');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to start purchase', 'error');
    } finally {
      setIsCreatingPurchase(false);
      setSheetProcessing(false);
    }
  };

  const startRazorpayPayment = async (
    subscriptionId: string,
    payAmount: number,
    alreadyPaid: number,
    totalCost: number,
    description: string
  ) => {
    if (payAmount <= 0 || !window.Razorpay) {
      showToast('Invalid amount or payment not ready', 'error');
      return;
    }
    setProcessingPayment(subscriptionId);
    try {
      const orderRes = await subscriptionService.createRazorpayOrder({
        amount: payAmount,
        subscriptionId,
        userId: schoolId,
        schoolId,
      });
      const orderId = orderRes.id ?? orderRes.order_id;
      if (!orderId) throw new Error('Failed to create payment order');

      const keyId = orderRes.key_id ?? process.env.REACT_APP_RAZORPAY_KEY_ID;
      const options = {
        key: keyId,
        amount: Math.round(payAmount * 100),
        currency: 'INR',
        name: 'TeachoVE',
        description,
        order_id: orderId,
        prefill: { name: 'School Admin', email: user?.email },
        theme: { color: PRIMARY_COLOR },
        handler: async (response: any) => {
          const paymentId = response.razorpay_payment_id ?? response.paymentId;
          const orderIdResp = response.razorpay_order_id ?? response.orderId ?? orderId;
          const signature = response.razorpay_signature ?? response.signature ?? '';
          if (!paymentId) {
            showToast('Payment ID missing', 'error');
            setProcessingPayment(null);
            return;
          }
          const totalPaidAmount = alreadyPaid + payAmount;
          const remainingAmount = Math.max(0, totalCost - totalPaidAmount);
          try {
            await subscriptionService.verifyRazorpayPayment({
              razorpay_payment_id: paymentId,
              razorpay_order_id: orderIdResp,
              razorpay_signature: signature,
              subscriptionId,
              totalPaidAmount,
              remainingAmount,
            });
            showToast('Payment verified successfully!', 'success');
            await loadData();
          } catch (e) {
            showToast('Verification failed. Please contact support.', 'error');
          }
          setProcessingPayment(null);
        },
        modal: { ondismiss: () => { setProcessingPayment(null); showToast('Payment cancelled', 'info'); } },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to open payment', 'error');
      setProcessingPayment(null);
    }
  };

  const handlePayNow = (req: SubscriptionRequest) => {
    const payAmount = (req.remainingAmount ?? req.totalCost) || 0;
    if (payAmount <= 0) return;
    startRazorpayPayment(
      req.subscriptionId,
      payAmount,
      req.amount ?? 0,
      req.totalCost,
      (req.planName ?? req.subscriptionType ?? 'Subscription') + ' Payment'
    );
  };

  const handleDownloadInvoice = async (req: SubscriptionRequest) => {
    if (downloadingInvoice === req.subscriptionId) return;
    setDownloadingInvoice(req.subscriptionId);
    try {
      await subscriptionService.downloadInvoice(schoolId, req.subscriptionId);
      showToast('Invoice downloaded', 'success');
    } catch (e) {
      showToast('Failed to download invoice', 'error');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const getApprovalChip = (status: string) => {
    const isApproved = status === 'approved';
    const isPending = status === 'pending';
    const color = isApproved ? 'bg-green-100 text-green-800 border-green-200' : isPending ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-red-100 text-red-800 border-red-200';
    const text = isApproved ? 'Approved' : isPending ? 'Pending Approval' : 'Rejected';
    return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}>{text}</span>;
  };

  const getPaymentChip = (status: string) => {
    const isPaid = status === 'paid';
    const isPending = status === 'pending';
    const color = isPaid ? 'bg-green-100 text-green-800 border-green-200' : isPending ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-gray-100 text-gray-800 border-gray-200';
    const text = isPaid ? 'Paid' : isPending ? 'Pending Payment' : status || 'Pending';
    return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}>{text}</span>;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-6 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Subscriptions</h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your subscription plans
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`p-2 rounded-xl border ${isDarkMode ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}`}
            title="Refresh"
          >
            {refreshing ? (
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            )}
          </button>
        </div>

        {errorMessage && requests.length === 0 && (
          <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} mb-6`}>
            <p className={`${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{errorMessage}</p>
            <button onClick={() => loadData()} className="mt-3 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Retry</button>
          </div>
        )}

        {/* Plans Section */}
        <section className={`p-6 rounded-xl border shadow-sm mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-indigo-500">◆</span>
            <h2 className="text-lg font-bold">Plans</h2>
          </div>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {hasCurrent
              ? 'Your current subscription is active till the valid date. You can add more students anytime.'
              : 'Select a plan to purchase your first subscription.'}
          </p>
          {(() => {
            const packagePlans = plans.filter(p => p.seats && p.seats > 0);
            if (packagePlans.length === 0) {
              return (
                <div className="space-y-3">
                  {/* Custom Plan / Contact Sales Card when no fixed plans are listed */}
                  <div className={`p-6 rounded-xl border-2 border-dashed ${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex gap-4 items-start flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-lg flex-shrink-0">✨</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white">Custom / Enterprise Plan</h4>
                          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            For schools with more than 500 students or special capacity requirements.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSalesModalOpen(true)}
                        className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-colors whitespace-nowrap"
                      >
                        Contact Sales
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            const purchasedPlanObj = packagePlans.find(p => hasCurrent && p.planName.trim().toLowerCase() === currentPlanName);
            const otherPlans = packagePlans.filter(p => !(hasCurrent && p.planName.trim().toLowerCase() === currentPlanName));

            return (
              <div className="space-y-3">
                {/* Active Purchased Plan at the very top */}
                {purchasedPlanObj ? (
                  <div
                    className={`p-5 rounded-xl border-2 bg-indigo-50/20 border-indigo-400 dark:border-indigo-600/50 dark:bg-indigo-950/10`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex gap-3 items-start flex-1">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">✓</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-indigo-900 dark:text-indigo-250 text-base">{purchasedPlanObj.planName}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white border border-indigo-700 uppercase">Active Current Plan</span>
                            {purchasedPlanObj.planType && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 uppercase">{purchasedPlanObj.planType}</span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 font-semibold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                            ₹{purchasedPlanObj.amount} Flat Rate • {purchasedPlanObj.seats} Students Limit • {purchasedPlanObj.duration === 'yearly' ? 'Yearly' : 'Monthly'}
                          </p>

                          {/* Integrated active subscription details inside card */}
                          {currentSubscription && (
                            <div className="flex flex-wrap gap-2 mt-3 text-xs">
                              <span className="px-2.5 py-1 rounded-lg bg-indigo-100/50 dark:bg-gray-800/80 font-bold border border-indigo-200/20 text-indigo-900 dark:text-indigo-200">
                                Seats Enrolled: {currentSubscription.totalSeats} students
                              </span>
                              {currentSubscription.expiryAt && (
                                <span className="px-2.5 py-1 rounded-lg bg-indigo-100/50 dark:bg-gray-800/80 font-bold border border-indigo-200/20 text-indigo-900 dark:text-indigo-200">
                                  Valid Upto: {typeof currentSubscription.expiryAt === 'object' && '_seconds' in currentSubscription.expiryAt
                                    ? formatDate(new Date((currentSubscription.expiryAt as any)._seconds * 1000).toISOString())
                                    : formatDate(String(currentSubscription.expiryAt))}
                                </span>
                              )}
                              {currentSubscription.remainingDays > 0 && (
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 font-extrabold border border-emerald-200/30">
                                  {currentSubscription.remainingDays} days remaining
                                </span>
                              )}
                            </div>
                          )}

                          {purchasedPlanObj.description && <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">{purchasedPlanObj.description}</p>}
                          {purchasedPlanObj.features && purchasedPlanObj.features.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {purchasedPlanObj.features.slice(0, 4).map((f, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-full text-[11px] border border-indigo-100 dark:border-indigo-900/50 text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-black/10">{f}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : hasCurrent ? (
                  <div
                    className={`p-5 rounded-xl border-2 bg-indigo-50/20 border-indigo-400 dark:border-indigo-600/50 dark:bg-indigo-950/10`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex gap-3 items-start flex-1">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">✓</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-indigo-900 dark:text-indigo-250 text-base">
                              {currentSubscription?.planName || 'Custom Enterprise Plan'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white border border-indigo-700 uppercase">Active Current Plan</span>
                            {currentSubscription?.planType && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 uppercase">{currentSubscription.planType}</span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 font-semibold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                            Custom pricing configured by Master Admin
                          </p>

                          {/* Integrated active subscription details inside card */}
                          {currentSubscription && (
                            <div className="flex flex-wrap gap-2 mt-3 text-xs">
                              <span className="px-2.5 py-1 rounded-lg bg-indigo-100/50 dark:bg-gray-800/80 font-bold border border-indigo-200/20 text-indigo-900 dark:text-indigo-200">
                                Seats Enrolled: {currentSubscription.totalSeats} students
                              </span>
                              {currentSubscription.expiryAt && (
                                <span className="px-2.5 py-1 rounded-lg bg-indigo-100/50 dark:bg-gray-800/80 font-bold border border-indigo-200/20 text-indigo-900 dark:text-indigo-200">
                                  Valid Upto: {typeof currentSubscription.expiryAt === 'object' && '_seconds' in currentSubscription.expiryAt
                                    ? formatDate(new Date((currentSubscription.expiryAt as any)._seconds * 1000).toISOString())
                                    : formatDate(String(currentSubscription.expiryAt))}
                                </span>
                              )}
                              {currentSubscription.remainingDays > 0 && (
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 font-extrabold border border-emerald-200/30">
                                  {currentSubscription.remainingDays} days remaining
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Other plans list */}
                {otherPlans.map((plan) => {
                  const isRepurchasePlan = hasExpiredPlan && plan.planName.trim().toLowerCase() === currentPlanName;
                  const buttonLabel = hasCurrent 
                    ? 'Upgrade Plan' 
                    : isRepurchasePlan 
                      ? 'Repurchase' 
                      : 'Purchase';
                  return (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex gap-3 items-start flex-1">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">◆</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold">{plan.planName}</span>
                              {plan.planType && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 uppercase">{plan.planType}</span>
                              )}
                            </div>
                            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {plan.seats && plan.seats > 0 ? (
                                <>₹{plan.amount} Flat Rate • {plan.seats} Students Limit</>
                              ) : (
                                <>₹{plan.amount} / student</>
                              )} • {plan.duration === 'yearly' ? 'Yearly' : 'Monthly'}
                            </p>
                            {plan.description && <p className="text-xs mt-1 text-gray-500 dark:text-gray-400 line-clamp-2">{plan.description}</p>}
                            {plan.features?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {plan.features.slice(0, 3).map((f, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-full text-xs border border-gray-200 dark:border-gray-600">{f}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => openPurchaseSheet(plan)}
                          className="w-full sm:w-auto text-center px-4 py-2 rounded-xl border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 whitespace-nowrap"
                        >
                          {buttonLabel}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Custom Plan / Contact Sales Card */}
          <div className="mt-4">
            <div className={`p-4 rounded-xl border-2 border-dashed ${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50 border-gray-300'}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-3 items-start flex-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">✨</div>
                  <div className="flex-1">
                    <span className="font-bold text-gray-900 dark:text-white">Custom / Enterprise Plan</span>
                    <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      For schools with more than 500 students or special capacity requirements.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSalesModalOpen(true)}
                  className="w-full sm:w-auto text-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-colors whitespace-nowrap"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Purchase history */}
        {requests.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>◆</span>
              <h2 className="text-base font-bold">Purchase history</h2>
            </div>
            <div className="space-y-5">
              {requests.map((req) => {
                const isPaid = req.paymentStatus === 'paid';
                const payAmount = (req.remainingAmount ?? req.totalCost) || 0;
                const hasPaymentDue = !isPaid && req.totalCost > 0 && payAmount > 0;
                return (
                  <div
                    key={req.subscriptionId}
                    className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                  >
                    <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold">{req.planName ?? req.subscriptionType ?? 'Subscription'}</h3>
                          <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>{req.numOfUsers} Students</span>
                            {req.duration && <span>{req.duration === 'yearly' ? 'Yearly' : 'Monthly'}</span>}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {getApprovalChip(req.approveStatus)}
                            {getPaymentChip(req.paymentStatus)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedRequest(req); setDetailModalOpen(true); }}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="View details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          {isPaid && (
                            <button
                              onClick={() => handleDownloadInvoice(req)}
                              disabled={downloadingInvoice === req.subscriptionId}
                              className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                              {downloadingInvoice === req.subscriptionId ? '...' : 'View Invoice'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Request details</p>
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                        <div className="flex justify-between text-sm py-1.5"><span>Total amount</span><span className="font-semibold">₹{req.totalCost.toFixed(2)}</span></div>
                        {(req.amount ?? 0) > 0 && <div className="flex justify-between text-sm py-1.5"><span>Amount paid</span><span className="text-green-600">₹{(req.amount ?? 0).toFixed(2)}</span></div>}
                        {hasPaymentDue && <div className="flex justify-between text-sm py-1.5"><span>Amount due</span><span className="font-semibold text-indigo-600">₹{payAmount.toFixed(2)}</span></div>}
                      </div>
                      <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Created {formatDate(req.requestCreatedAt)} • {req.paymentMethod}
                      </p>
                    </div>
                    {hasPaymentDue && (
                      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handlePayNow(req)}
                          disabled={processingPayment === req.subscriptionId}
                          className="w-full py-3 rounded-xl border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {processingPayment === req.subscriptionId ? (
                            <><div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> Processing...</>
                          ) : (
                            <>Pay Now — ₹{payAmount.toFixed(2)}</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Purchase sheet (plan → seats → pay) */}
      {purchaseSheetOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closePurchaseSheet} />
          <div className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-xl`}>
            <div className="sticky top-0 flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="px-5 pb-6">
              {sheetProcessing ? (
                <div className="py-8 text-center">
                  <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="font-semibold">Processing payment…</p>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Opening Razorpay…</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <h3 className="text-lg font-bold">
                      {hasCurrent ? 'Upgrade / Buy More Seats' : hasExpiredPlan && selectedPlan.planName.trim().toLowerCase() === currentPlanName ? 'Repurchase subscription' : 'Purchase subscription'}
                    </h3>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                      {selectedPlan.duration === 'yearly' ? 'Yearly' : 'Monthly'}
                    </span>
                  </div>
                  <div className={`p-4 rounded-xl border mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <p className="font-bold">{selectedPlan.planName}</p>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      ₹{selectedPlan.amount} per student • {selectedPlan.duration === 'yearly' ? 'Yearly' : 'Monthly'}
                    </p>
                    {selectedPlan.description && <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">{selectedPlan.description}</p>}
                    {selectedPlan.features?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedPlan.features.slice(0, 6).map((f, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-xs border border-gray-200 dark:border-gray-600">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {hasCurrent && currentSubscription && (
                    <p className={`text-xs mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Current subscription: {currentSubscription.totalSeats} students • valid upto {currentSubscription.expiryAt && (typeof currentSubscription.expiryAt === 'object' && '_seconds' in currentSubscription.expiryAt ? formatDate(new Date((currentSubscription.expiryAt as any)._seconds * 1000).toISOString()) : formatDate(String(currentSubscription.expiryAt)))}
                      {(currentSubscription.remainingDays ?? 0) > 0 && ` • ${currentSubscription.remainingDays} days left`}. When you add students, expiry extends proportionately.
                    </p>
                  )}
                  {selectedPlan.seats && selectedPlan.seats > 0 ? (
                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'} mb-3`}>
                      <span className="text-sm font-medium">Included Students: </span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedPlan.seats} Students</span>
                    </div>
                  ) : (
                    <>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {hasCurrent ? 'Add student count' : 'Student count'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={seatCount}
                        onChange={(e) => setSeatCount(e.target.value)}
                        className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        placeholder="e.g. 10"
                      />
                    </>
                  )}
                  <div className={`mt-4 p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${isDarkMode ? 'bg-indigo-900/20 border-indigo-700' : 'bg-indigo-50 border-indigo-200'}`}>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Payable</p>
                      <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        ₹{(selectedPlan.seats && selectedPlan.seats > 0
                          ? selectedPlan.amount
                          : ((parseInt(seatCount, 10) || 0) * selectedPlan.amount)
                        ).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={handlePurchaseSeatsForPlan}
                      disabled={isCreatingPurchase || (!selectedPlan.seats && (parseInt(seatCount, 10) || 0) <= 0)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isCreatingPurchase ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Pay now</span> : hasCurrent ? 'Pay for more students' : 'Pay now'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detailModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetailModalOpen(false)} />
          <div className={`relative max-w-lg w-full rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-white'} p-6`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold">{selectedRequest.planName ?? selectedRequest.subscriptionType ?? 'Subscription'}</h3>
              <button onClick={() => setDetailModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">✕</button>
            </div>
            {selectedRequest.duration && <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>{selectedRequest.duration === 'yearly' ? 'Yearly' : 'Monthly'}</p>}
            <div className="flex gap-2 mb-4">{getApprovalChip(selectedRequest.approveStatus)}{getPaymentChip(selectedRequest.paymentStatus)}</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Students</span><span>{selectedRequest.numOfUsers}</span></div>
              <div className="flex justify-between font-semibold"><span>Total amount</span><span>₹{selectedRequest.totalCost.toFixed(2)}</span></div>
              {(selectedRequest.amount ?? 0) > 0 && <div className="flex justify-between text-green-600"><span>Amount paid</span><span>₹{(selectedRequest.amount ?? 0).toFixed(2)}</span></div>}
              {((selectedRequest.remainingAmount ?? 0) > 0) && <div className="flex justify-between text-indigo-600 font-semibold"><span>Amount due</span><span>₹{(selectedRequest.remainingAmount ?? 0).toFixed(2)}</span></div>}
              <div className="flex justify-between"><span>Created</span><span>{formatDateTime(selectedRequest.requestCreatedAt)}</span></div>
            </div>
            <div className="mt-6 flex gap-2">
              {selectedRequest.paymentStatus !== 'paid' && (selectedRequest.remainingAmount ?? 0) > 0 && (
                <button onClick={() => handlePayNow(selectedRequest)} disabled={processingPayment === selectedRequest.subscriptionId} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50">
                  Pay Now ₹{(selectedRequest.remainingAmount ?? 0).toFixed(2)}
                </button>
              )}
              {selectedRequest.paymentStatus === 'paid' && (
                <button onClick={() => handleDownloadInvoice(selectedRequest)} disabled={downloadingInvoice === selectedRequest.subscriptionId} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50">
                  View Invoice
                </button>
              )}
              <button onClick={() => setDetailModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Sales Dialog Modal */}
      {salesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSalesModalOpen(false)} />
          <form 
            onSubmit={handleSalesSubmit}
            className="relative max-w-lg w-full rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 p-6 sm:p-8 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Contact Sales Team</h3>
                <p className="text-sm mt-1 text-gray-500">
                  Submit your requirement
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setSalesModalOpen(false)} 
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">
                  School Name *
                </label>
                <input
                  type="text"
                  required
                  value={salesSchoolName}
                  onChange={(e) => setSalesSchoolName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Green Valley Public School"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={salesName}
                    onChange={(e) => setSalesName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">
                    Expected Student Count *
                  </label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={salesStudentCount}
                    onChange={(e) => setSalesStudentCount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. 750"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={salesPhone}
                    onChange={(e) => setSalesPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={salesEmail}
                    onChange={(e) => setSalesEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. admin@school.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-gray-500">
                  Custom Requirements / Message
                </label>
                <textarea
                  rows={3}
                  value={salesMessage}
                  onChange={(e) => setSalesMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Tell us about your school needs..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setSalesModalOpen(false)} 
                className="flex-1 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={salesSubmitting}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {salesSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : 'Submit Inquiry'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SubscriptionRequests;
