import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';

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

interface SubscriptionForm {
  title: string;
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
  const [formData, setFormData] = useState<SubscriptionForm>({
    title: '',
    subscriptionType: 'TeachoVE only',
    numOfUsers: 1
  });

  // Mock data for demonstration - replace with actual API calls
  useEffect(() => {
    const mockRequests: SubscriptionRequest[] = [
      {
        subscriptionId: 'sub_001',
        numOfUsers: 50,
        approveStatus: 'approved',
        paymentStatus: 'paid',
        requestCreatedAt: '2025-08-20T10:00:00Z',
        paymentCreatedAt: '2025-08-21T14:30:00Z',
        subscriptionCost: 25.0,
        schoolId: 'school_001',
        paymentMethod: 'Razorpay',
        razorpayPaymentId: 'pay_123456789',
        amount: 1250.0,
        currency: 'INR',
        subscriptionType: 'TeachoVE + StudoVE',
        remainingAmount: 0
      },
      {
        subscriptionId: 'sub_002',
        numOfUsers: 25,
        approveStatus: 'pending',
        paymentStatus: 'pending',
        requestCreatedAt: '2025-08-22T09:00:00Z',
        subscriptionCost: 25.0,
        schoolId: 'school_001',
        paymentMethod: 'Pending',
        subscriptionType: 'TeachoVE only'
      },
      {
        subscriptionId: 'sub_003',
        numOfUsers: 100,
        approveStatus: 'denied',
        paymentStatus: 'failed',
        requestCreatedAt: '2025-08-18T16:00:00Z',
        subscriptionCost: 25.0,
        schoolId: 'school_001',
        paymentMethod: 'Failed',
        subscriptionType: 'TeachoVE + StudoVE'
      }
    ];
    
    setRequests(mockRequests);
    setLoading(false);
  }, []);

  const subscriptionPlans = {
    'TeachoVE only': {
      description: 'Access to TeachoVE School Management System only',
      cost: 0,
      features: ['School Management', 'Student Records', 'Teacher Management', 'Attendance Tracking', 'Exam Management', 'Fee Management']
    },
    'TeachoVE + StudoVE': {
      description: 'Access to both TeachoVE (free) and StudoVE Student/Parent App',
      cost: 25,
      features: ['All TeachoVE Features', 'Student Mobile App', 'Parent Mobile App', 'Real-time Notifications', 'Online Fee Payment', 'Progress Tracking']
    }
  };

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
      title: '',
      subscriptionType: 'TeachoVE only',
      numOfUsers: 1
    });
  };

  const handleViewDetails = (request: SubscriptionRequest) => {
    setSelectedRequest(request);
    setIsViewDetailsOpen(true);
  };

  const handleSendRequest = async () => {
    if (!formData.title || !formData.numOfUsers) {
      // Show error toast
      return;
    }

    try {
      // Mock API call - replace with actual API
      const newRequest: SubscriptionRequest = {
        subscriptionId: `sub_${Date.now()}`,
        numOfUsers: formData.numOfUsers,
        approveStatus: 'pending',
        paymentStatus: 'pending',
        requestCreatedAt: new Date().toISOString(),
        subscriptionCost: subscriptionPlans[formData.subscriptionType].cost,
        schoolId: user?.schoolId || '',
        paymentMethod: 'Pending',
        subscriptionType: formData.subscriptionType
      };

      setRequests(prev => [newRequest, ...prev]);
      setIsNewRequestSidebarOpen(false);
      setFormData({
        title: '',
        subscriptionType: 'TeachoVE only',
        numOfUsers: 1
      });

      // Show success toast
    } catch (error) {
      console.error('Error creating subscription request:', error);
      // Show error toast
    }
  };

  const handleDownloadInvoice = (request: SubscriptionRequest) => {
    // Mock invoice download - replace with actual implementation
    console.log('Downloading invoice for:', request.subscriptionId);
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

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="p-6">
          <div className="text-center">
            <p className="text-lg">Loading subscription requests...</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <p className="text-2xl font-bold text-purple-600">
                  {requests.reduce((sum, r) => sum + r.numOfUsers, 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
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
                      Users
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
                          
                          {request.paymentStatus === 'paid' && (
                            <button
                              onClick={() => handleDownloadInvoice(request)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode 
                                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                                  : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                              }`}
                              title="Download Invoice"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
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
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="Enter request title"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Subscription Type *
                      </label>
                      <select
                        value={formData.subscriptionType}
                        onChange={(e) => setFormData({...formData, subscriptionType: e.target.value as 'TeachoVE only' | 'TeachoVE + StudoVE'})}
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
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.numOfUsers}
                        onChange={(e) => setFormData({...formData, numOfUsers: parseInt(e.target.value) || 1})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>

                    {/* Cost Breakdown */}
                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Cost Breakdown
                      </h4>
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Send Request
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
                  {selectedRequest.paymentStatus === 'paid' && (
                    <button
                      onClick={() => handleDownloadInvoice(selectedRequest)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Download Invoice
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