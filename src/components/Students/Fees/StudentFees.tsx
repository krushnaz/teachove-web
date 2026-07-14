import React, { useEffect, useState } from 'react';
import { CalendarDays, CreditCard, IndianRupee, ReceiptText, Download } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { studentFeesService, Payment } from '../../../services/studentFeesService';
import { toast } from 'react-toastify';
import {
  TeacherPageShell,
  TeacherPageHeader,
  TeacherHeaderActions,
  TeacherStatsGrid,
  TeacherStatCard,
  TeacherPanel,
  TeacherCardGrid,
  TeacherItemCard,
  TeacherButton,
  TeacherLoading,
  TeacherError,
  TeacherEmpty,
} from '../shared';

const StudentFees: React.FC = () => {
  const { user, schoolDetails } = useAuth();
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
      
      const response = await studentFeesService.getAllStudentFees(
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

  if (loading) return <TeacherLoading message="Loading payment history..." />;
  if (error) return <TeacherError title="Error Loading Payments" message={error} onRetry={fetchPayments} />;

  return (
    <TeacherPageShell>
      <TeacherPageHeader
        title="Fee Payments"
        description={`View your payment history for academic year ${academicYear}`}
        action={
          payments.length > 0 ? (
            <TeacherHeaderActions>
              <TeacherButton
                onClick={handleDownloadReceipt}
                loading={downloadingReceipt}
                icon={Download}
                compact
              >
                Download Receipt
              </TeacherButton>
            </TeacherHeaderActions>
          ) : undefined
        }
      />

      <TeacherStatsGrid cols={3}>
        <TeacherStatCard title="Academic Year" value={academicYear || '-'} icon={CalendarDays} color="indigo" />
        <TeacherStatCard title="Total Payments" value={payments.length} icon={ReceiptText} color="blue" />
        <TeacherStatCard title="Total Paid" value={formatCurrency(getTotalPaid())} icon={IndianRupee} color="emerald" />
      </TeacherStatsGrid>

      {payments.length === 0 ? (
        <TeacherPanel>
          <TeacherEmpty
            icon={ReceiptText}
            title="No Payments Found"
            description="No payment records available for this academic year."
          />
        </TeacherPanel>
      ) : (
        <>
          <TeacherCardGrid cols={1}>
            {payments.map((payment, index) => (
              <TeacherItemCard key={payment.paymentId}>
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
                      #{payments.length - index}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                          {payment.feeType || 'School Fee'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <CreditCard size={12} />
                          {payment.paymentMode}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <p>Date: {formatDate(payment.date)}</p>
                        {payment.transactionId && <p>Transaction ID: {payment.transactionId}</p>}
                        {payment.remarks && <p>Remarks: {payment.remarks}</p>}
                        <p className="text-xs text-gray-500 dark:text-gray-400">Payment ID: {payment.paymentId}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TeacherItemCard>
            ))}
          </TeacherCardGrid>

          <TeacherPanel>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Use <span className="font-semibold">Download Receipt</span> from the header to download a complete
              payment receipt with all transactions. For payment-related queries, contact the school office.
            </p>
          </TeacherPanel>
        </>
      )}
    </TeacherPageShell>
  );
};

export default StudentFees;

