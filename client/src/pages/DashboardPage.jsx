import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Receipt,
  Sparkles,
  PiggyBank,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import SpendingTrendChart from '../components/Charts/SpendingTrendChart';
import CategoryPieChart from '../components/Charts/CategoryPieChart';
import BudgetProgressBar from '../components/Charts/BudgetProgressBar';
import TransactionModal from '../components/TransactionModal';
import OnboardingModal from '../components/OnboardingModal';

const DashboardPage = () => {
  const { user, currency, showToast } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, budgetRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/budgets'),
      ]);

      if (dashRes.data?.success) {
        setStats(dashRes.data.data);
      }
      if (budgetRes.data?.success) {
        setBudgets(budgetRes.data.data.budgets || []);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Check if new user needs profile onboarding
    if (user && (!user.monthlyAllowance || !user.defaultMonthlyBudget)) {
      setShowOnboarding(true);
    }
  }, [user]);

  const handleDeleteTxn = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      showToast('Transaction removed', 'info');
      fetchDashboardData();
    } catch (err) {
      showToast('Could not delete transaction', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-xs">Loading spending metrics...</p>
        </div>
      </div>
    );
  }

  const {
    todaySpending = 0,
    weekSpending = 0,
    monthSpending = 0,
    monthlyBudgetLimit = 0,
    remainingBudget = 0,
    budgetUsedPercent = 0,
    daysLeftInMonth = 0,
    alertLevel = 'normal',
    alertMessage = null,
    recentTransactions = [],
    categoryBreakdown = [],
    dailyTrend = [],
    weeklyTrends = [],
  } = stats || {};

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Welcome Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Welcome, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Here is your financial status for this month • <strong className="text-indigo-400">{daysLeftInMonth} days left</strong> in current cycle
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTxnModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Threshold Alert Notification Banner (FR4 & FR5) */}
      {alertLevel !== 'normal' && alertMessage && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3.5 backdrop-blur-md animate-fade-in ${
          alertLevel === 'critical'
            ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
        }`}>
          {alertLevel === 'critical' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider">
              {alertLevel === 'critical' ? 'Critical Budget Alert (100% Exceeded)' : 'Budget Usage Warning (80% Reached)'}
            </h4>
            <p className="text-xs mt-0.5 opacity-90">{alertMessage}</p>
          </div>
          <Link
            to="/budgets"
            className="text-xs underline font-semibold shrink-0 hover:opacity-80"
          >
            Manage Limits →
          </Link>
        </div>
      )}

      {/* Metric Cards (FR5: Today, This Week, This Month, Remaining Monthly Budget) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Spending"
          amount={`${currency}${todaySpending.toFixed(2)}`}
          subtitle="Expenses logged today"
          icon={Clock}
          color="indigo"
        />

        <StatCard
          title="This Week's Spending"
          amount={`${currency}${weekSpending.toFixed(2)}`}
          subtitle="Outflow in current week"
          icon={Calendar}
          color="sky"
        />

        <StatCard
          title="This Month's Spending"
          amount={`${currency}${monthSpending.toFixed(2)}`}
          subtitle={`${budgetUsedPercent}% of monthly cap`}
          icon={TrendingDown}
          color={budgetUsedPercent >= 100 ? 'rose' : budgetUsedPercent >= 80 ? 'amber' : 'emerald'}
        />

        <StatCard
          title="Remaining Budget"
          amount={`${currency}${remainingBudget.toFixed(2)}`}
          subtitle={`Out of ${currency}${monthlyBudgetLimit.toFixed(2)} target`}
          icon={PiggyBank}
          color={remainingBudget < 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Visual Charts Row (FR5: Category Donut & Spending Trends) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingTrendChart
          dailyData={dailyTrend}
          weeklyData={weeklyTrends}
          currency={currency}
        />

        <CategoryPieChart
          data={categoryBreakdown}
          currency={currency}
        />
      </div>

      {/* Active Monthly Budgets Section (FR4 & FR5) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Active Budget Envelopes</h3>
            <p className="text-xs text-gray-400">Real-time status of your overall and category limits</p>
          </div>
          <Link
            to="/budgets"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            View All Envelopes <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {budgets.length === 0 ? (
          <div className="glass-card p-6 rounded-2xl border border-gray-800 text-center space-y-2">
            <PiggyBank className="w-8 h-8 text-gray-500 mx-auto" />
            <p className="text-sm font-semibold text-gray-300">No monthly budgets configured yet</p>
            <p className="text-xs text-gray-500">Set spending limits to automatically trigger 80% and 100% warnings.</p>
            <Link
              to="/budgets"
              className="inline-block mt-2 px-4 py-1.5 rounded-xl bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold hover:bg-indigo-600/50 transition-colors"
            >
              Configure Budgets
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.slice(0, 4).map((b) => (
              <BudgetProgressBar
                key={b.id || b._id}
                categoryName={b.category_name}
                limitAmount={b.limit_amount}
                spent={b.spent}
                currency={currency}
                warnThreshold={stats?.warnThreshold || 80}
                critThreshold={stats?.critThreshold || 100}
                daysLeft={daysLeftInMonth}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions Feed (FR5: 5-10 most recent transactions) */}
      <div className="glass-card rounded-2xl border border-gray-800/80 overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
          </div>
          <Link
            to="/transactions"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            See Full History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            No transactions logged yet. Click "Record Expense" above to add your first entry!
          </div>
        ) : (
          <div className="divide-y divide-gray-800/60">
            {recentTransactions.map((t) => {
              const isExpense = t.type === 'expense';
              return (
                <div key={t._id || t.id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isExpense ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {isExpense ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {t.note || t.category_name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-gray-800 text-gray-300 font-medium">
                          {t.category_name}
                        </span>
                        <span>•</span>
                        <span>{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>•</span>
                        <span>{t.payment_method}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`text-sm font-bold font-mono ${
                      isExpense ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {isExpense ? '-' : '+'}{currency}{Number(t.amount).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteTxn(t._id || t.id)}
                      className="text-gray-500 hover:text-rose-400 text-xs p-1 transition-colors"
                      title="Delete entry"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxnModalOpen}
        onClose={() => setIsTxnModalOpen(false)}
        onSuccess={fetchDashboardData}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
};

export default DashboardPage;
