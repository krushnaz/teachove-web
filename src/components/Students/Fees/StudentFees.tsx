import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { studentFeesService, Payment } from '../../../services/studentFeesService';
import { CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';

interface StudentPaymentsResponse {
  payments: Payment[];
  academicYear: string;
  studentId: string;
}

const StudentFees: React.FC = () => {
  const { user, schoolDetails } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [academicYear, setAcademicYear] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.studentId, schoolDetails?.currentAcademicYear]);

  const fetchPayments = async () => {
    if (!user?.studentId || !user?.schoolId || !schoolDetails?.currentAcademicYear) {
      setError('Missing required information');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await studentFeesService.getStudentPayments(
        user.schoolId,
        schoolDetails.currentAcademicYear,
        user.studentId
      );
      
      setPayments(response);
      setAcademicYear(schoolDetails.currentAcademicYear);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      setError(error.message || 'Failed to load payment history');
      toast.error(error.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!user?.schoolId || !schoolDetails?.currentAcademicYear || !user?.studentId) {
      toast.error('Missing required information');
      return;
    }

    try {
      setDownloadingReceipt(true);
      
      const blob = await studentFeesService.downloadStudentPaymentReport(
        user.schoolId,
        schoolDetails.currentAcademicYear,
        user.studentId
      );
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-receipt-${user.studentId}-${academicYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Receipt downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalPaid = () => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getPaymentModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'cash':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'upi':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'card':
      case 'credit card':
      case 'debit card':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'bank transfer':
      case 'neft':
      case 'rtgs':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CircularProgress size={48} />
          <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading payment history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Error Loading Payments</h3>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{error}</p>
          <button 
            onClick={fetchPayments} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Fee Payments</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>View your payment history for academic year {academicYear}</p>
        </div>
        
        {payments.length > 0 && (
          <button
            onClick={handleDownloadReceipt}
            disabled={downloadingReceipt}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              downloadingReceipt
                ? 'bg-gray-400 cursor-not-allowed'
                : isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {downloadingReceipt ? (
              <>
                <CircularProgress size={20} className="text-white" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download Receipt</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Summary Card */}
      <div className={`rounded-xl p-6 border ${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Academic Year</p>
            <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{academicYear}</p>
          </div>
          <div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Payments</p>
            <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>{payments.length}</p>
          </div>
          <div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Amount Paid</p>
            <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>{formatCurrency(getTotalPaid())}</p>
          </div>
        </div>
      </div>

      {/* Payment List */}
      {payments.length === 0 ? (
        <div className={`rounded-xl p-12 border text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <svg className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Payments Found</h3>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No payment records available for this academic year.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {payments.map((payment, index) => (
            <div 
              key={payment.paymentId}
              className={`rounded-xl p-6 border transition-all hover:shadow-lg ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Payment Number Badge */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                  isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600'
                }`}>
                  <span className="text-lg font-bold">#{payments.length - index}</span>
                </div>

                {/* Payment Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(payment.amount)}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                    }`}>
                      {getPaymentModeIcon(payment.paymentMode)}
                      {payment.paymentMode}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="font-medium">Date:</span> {formatDate(payment.date)}
                    </p>
                    
                    {payment.transactionId && (
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="font-medium">Transaction ID:</span> {payment.transactionId}
                      </p>
                    )}
                    
                    {payment.remarks && (
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="font-medium">Remarks:</span> {payment.remarks}
                      </p>
                    )}
                    
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Payment ID: {payment.paymentId}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Footer */}
      {payments.length > 0 && (
        <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-start gap-3">
            <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>Payment Information</p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                Click the "Download Receipt" button in the header to download a complete payment receipt with all transactions. For any payment-related queries, please contact the school office.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFees;

