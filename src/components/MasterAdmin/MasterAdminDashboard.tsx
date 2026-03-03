import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAuth } from '../../contexts/AuthContext';
import MasterAdminLayout from './Layout';
import { masterAdminService, type EarningsPeriod, type EarningsByPeriodResponse } from '../../services/masterAdminService';
import { 
  Shield, 
  Users, 
  School, 
  GraduationCap,
  Settings,
  Crown,
  BookOpen,
  FileQuestion,
  ArrowUpRight,
  ChevronRight,
  Calendar,
  DollarSign
} from 'lucide-react';

const EARNINGS_PERIODS: { value: EarningsPeriod; label: string }[] = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'yearly', label: 'This Year' },
  { value: 'custom', label: 'Custom' },
];

interface QuickAction {
  title: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  description: string;
  path: string;
}

const MasterAdminDashboard: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    schools: 0,
    teachers: 0,
    students: 0,
  });
  const [finance, setFinance] = useState({
    totalEarnings: 0,
    totalSubscriptions: 0,
    paidSubscriptions: 0,
  });
  const [financeLoading, setFinanceLoading] = useState(true);
  const [earningsPeriod, setEarningsPeriod] = useState<EarningsPeriod>('monthly');
  const [earningsData, setEarningsData] = useState<EarningsByPeriodResponse | null>(null);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setFinanceLoading(true);
        
        const [countsData, financeData] = await Promise.all([
          masterAdminService.getUserCounts(),
          masterAdminService.getFinanceOverview(),
        ]);
        
        setCounts(countsData);
        setFinance(financeData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
        setFinanceLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchEarnings = async () => {
      setEarningsLoading(true);
      try {
        const start = earningsPeriod === 'custom' && customStart ? customStart : undefined;
        const end = earningsPeriod === 'custom' && customEnd ? customEnd : undefined;
        const data = await masterAdminService.getEarningsByPeriod(earningsPeriod, start, end);
        setEarningsData(data);
      } catch {
        setEarningsData({ earnings: 0, count: 0, period: earningsPeriod, startDate: '', endDate: '' });
      } finally {
        setEarningsLoading(false);
      }
    };
    if (earningsPeriod !== 'custom' || (customStart && customEnd)) {
      fetchEarnings();
    } else {
      setEarningsLoading(false);
      setEarningsData(null);
    }
  }, [earningsPeriod, customStart, customEnd]);

  const quickActions: QuickAction[] = [
    {
      title: 'Manage Schools',
      icon: Settings,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500',
      description: 'Manage all schools - add, edit, delete, and activate/deactivate',
      path: '/master-admin/add-schools'
    },
    {
      title: 'Subscription Request',
      icon: Crown,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-500',
      description: 'Manage subscription requests from schools',
      path: '/master-admin/subscription-request'
    },
    {
      title: 'Vedant Education Books',
      icon: BookOpen,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-500',
      description: 'Manage Vedant Education books and resources',
      path: '/master-admin/vedant-books'
    },
    {
      title: 'Question Papers',
      icon: FileQuestion,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500',
      description: 'Manage question papers and exam materials',
      path: '/master-admin/question-papers'
    },
    {
      title: 'Academic Years',
      icon: Calendar,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-500',
      description: 'Manage academic years for the platform',
      path: '/master-admin/academic-years'
    },
    {
      title: 'Admin Access',
      icon: Shield,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500',
      description: 'Manage admin access and permissions',
      path: '/master-admin/admin-access'
    }
  ];

  const StatCard = ({ title, value, icon: Icon, colorClass, loading: isLoading }: any) => {
    if (isLoading) {
      return (
        <div className={`relative overflow-hidden rounded-2xl p-6 shadow-sm border animate-pulse ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className={`h-12 w-12 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div className={`h-4 w-16 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          </div>
          <div className={`mt-4 h-8 w-20 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>
      );
    }

    return (
      <div className={`group relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {/* Decorative Background Blob */}
        <div className={`absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-[0.08] transition-transform duration-500 group-hover:scale-150 ${colorClass.bg}`} />
        
        <div className="relative flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${colorClass.bgLight} ${colorClass.text}`}>
              <Icon size={22} />
            </div>
            {/* Trend Indicator */}
            <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
              isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'
            }`}>
              <ArrowUpRight size={12} className="mr-1" />
              Active
            </div>
          </div>
          
          <div>
            <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight font-sans ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{value}</h3>
            <p className={`text-sm font-medium mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>{title}</p>
          </div>
        </div>
      </div>
    );
  };

  const QuickActionCard = ({ action }: { action: QuickAction }) => {
    const navigate = useNavigate();
    
    return (
      <button 
        onClick={() => navigate(action.path)}
        className={`group relative flex flex-col items-start p-4 sm:p-5 rounded-xl sm:rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-transparent hover:-translate-y-1 w-full text-left overflow-hidden touch-manipulation min-h-[100px] ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
            : 'bg-white border-gray-200 hover:border-transparent'
        }`}
      >
        {/* Hover Gradient Background */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${action.bg}`} />
        
        <div className={`p-3.5 rounded-2xl mb-4 transition-transform duration-300 group-hover:scale-110 ${action.bg} bg-opacity-10 dark:bg-opacity-20`}>
          <action.icon className={`w-6 h-6 ${action.color}`} />
        </div>
        
        <div className="relative z-10">
          <h3 className={`font-bold text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {action.title}
          </h3>
          <p className={`text-xs mt-1.5 leading-relaxed ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {action.description}
          </p>
        </div>
        
        <div className="absolute right-4 top-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <ChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
        </div>
      </button>
    );
  };

  return (
    <MasterAdminLayout title="Dashboard" subtitle={`Welcome back, ${user?.name || 'Master Admin'}!`}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome back, {user?.name || 'Master Admin'}!
          </h2>
          <p className={`text-base sm:text-lg ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Manage and monitor all schools and users from this central dashboard.
          </p>
        </div>

        {/* Overview Section */}
        <div>
          <h3 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <StatCard
              title="Total Schools"
              value={counts.schools}
              icon={School}
              colorClass={{
                bg: 'bg-blue-500',
                bgLight: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50',
                text: 'text-blue-600 dark:text-blue-400'
              }}
              loading={loading}
            />
            <StatCard
              title="Total Teachers"
              value={counts.teachers}
              icon={Users}
              colorClass={{
                bg: 'bg-green-500',
                bgLight: isDarkMode ? 'bg-green-900/30' : 'bg-green-50',
                text: 'text-green-600 dark:text-green-400'
              }}
              loading={loading}
            />
            <StatCard
              title="Total Students"
              value={counts.students}
              icon={GraduationCap}
              colorClass={{
                bg: 'bg-purple-500',
                bgLight: isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50',
                text: 'text-purple-600 dark:text-purple-400'
              }}
              loading={loading}
            />
          </div>
        </div>

        {/* Finance Overview Section */}
        <div>
          <h3 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Finance Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="Total Earnings (All time)"
              value={`₹${finance.totalEarnings.toLocaleString('en-IN')}`}
              icon={DollarSign}
              colorClass={{
                bg: 'bg-emerald-500',
                bgLight: isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-50',
                text: 'text-emerald-600 dark:text-emerald-400'
              }}
              loading={financeLoading}
            />
            <div className={`rounded-xl border p-4 sm:p-5 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <p className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Earnings by period
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {EARNINGS_PERIODS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setEarningsPeriod(value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      earningsPeriod === value
                        ? 'bg-indigo-600 text-white'
                        : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {earningsPeriod === 'custom' && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className={`rounded border px-2 py-1.5 text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>to</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className={`rounded border px-2 py-1.5 text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
              )}
              {earningsLoading ? (
                <div className={`h-8 w-28 rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
              ) : earningsData ? (
                <div>
                  <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ₹{(earningsData.earnings ?? 0).toLocaleString('en-IN')}
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {earningsData.count} payment{earningsData.count !== 1 ? 's' : ''} in period
                  </p>
                </div>
              ) : (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select custom date range</p>
              )}
            </div>
          </div>
          {!financeLoading && (
            <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>Paid Subscriptions: {finance.paidSubscriptions.toLocaleString('en-IN')} of {finance.totalSubscriptions.toLocaleString('en-IN')} total</p>
            </div>
          )}
        </div>

        {/* Quick Actions Section */}
        <div>
          <h3 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} action={action} />
            ))}
          </div>
        </div>
      </div>
    </MasterAdminLayout>
  );
};

export default MasterAdminDashboard;
