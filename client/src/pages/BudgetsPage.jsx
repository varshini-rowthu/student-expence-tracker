import React, { useState, useEffect } from 'react';
import {
  PiggyBank,
  PlusCircle,
  AlertTriangle,
  AlertCircle,
  Calendar,
  CheckCircle,
  TrendingDown,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BudgetProgressBar from '../components/Charts/BudgetProgressBar';
import BudgetModal from '../components/BudgetModal';

const BudgetsPage = () => {
  const { currency, showToast } = useAuth();
  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState({
    month: '',
    daysLeft: 0,
    totalDaysInMonth: 30,
    warnThreshold: 80,
    critThreshold: 100,
    budgets: [],
  });

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/budgets', { params: { month: selectedMonth } });
      if (res.data?.success) {
        setBudgetData(res.data.data);
      }
    } catch (err) {
      showToast('Could not load budget data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth]);

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Delete this budget limit?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      showToast('Budget limit removed', 'info');
      fetchBudgets();
    } catch (err) {
      showToast('Could not delete budget', 'error');
    }
  };

  const handleEditBudget = (b) => {
    setEditingBudget(b);
    setIsModalOpen(true);
  };

  const handleAddBudget = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const overall = budgetData.budgets.find((b) => b.isOverall);
  const categoryBudgets = budgetData.budgets.filter((b) => !b.isOverall);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <PiggyBank className="w-6 h-6 text-indigo-400" />
            Budget Envelopes & Limits
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Set spending caps, evaluate percentage consumption, and enforce threshold alerts (FR4)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Picker */}
          <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-800">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none font-medium cursor-pointer"
            />
          </div>

          <button
            onClick={handleAddBudget}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Set Limit</span>
          </button>
        </div>
      </div>

      {/* Cycle Indicator Pill */}
      <div className="glass-card p-4 rounded-2xl border border-gray-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold font-mono">
            {budgetData.daysLeft}d
          </div>
          <div>
            <p className="font-semibold text-white">
              {budgetData.daysLeft} Days Remaining in {selectedMonth}
            </p>
            <p className="text-gray-400 text-[11px]">
              Cycle ends on the final day of the calendar month
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Warning Trigger: {budgetData.warnThreshold}%
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Critical Overrun: {budgetData.critThreshold}%
          </span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-400 text-xs">Calculating envelope statistics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Monthly Budget Envelope */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
              Overall Total Spending Cap
            </h2>

            {overall ? (
              <BudgetProgressBar
                categoryName="Overall Monthly Target"
                limitAmount={overall.limit_amount}
                spent={overall.spent}
                currency={currency}
                warnThreshold={budgetData.warnThreshold}
                critThreshold={budgetData.critThreshold}
                daysLeft={budgetData.daysLeft}
                onEdit={() => handleEditBudget(overall)}
                onDelete={() => handleDeleteBudget(overall.id || overall._id)}
              />
            ) : (
              <div className="glass-card p-6 rounded-2xl border border-dashed border-gray-700/80 text-center space-y-2">
                <p className="text-xs font-semibold text-gray-300">
                  No overall monthly budget configured for {selectedMonth}
                </p>
                <button
                  onClick={handleAddBudget}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600/30 text-indigo-300 text-xs font-bold border border-indigo-500/30 hover:bg-indigo-600/50 transition-all"
                >
                  Set Overall Monthly Limit
                </button>
              </div>
            )}
          </div>

          {/* Category-Wise Envelopes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                Category Envelopes ({categoryBudgets.length})
              </h2>
            </div>

            {categoryBudgets.length === 0 ? (
              <div className="glass-card p-8 rounded-2xl border border-gray-800 text-center space-y-2">
                <PiggyBank className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-xs font-semibold text-gray-300">No individual category limits active</p>
                <p className="text-[11px] text-gray-500">
                  You can set specific allowances for Food & Dining, Books, Transportation, etc.
                </p>
                <button
                  onClick={handleAddBudget}
                  className="mt-2 px-4 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold border border-gray-700 transition-colors"
                >
                  Add Category Budget
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryBudgets.map((b) => (
                  <BudgetProgressBar
                    key={b.id || b._id}
                    categoryName={b.category_name}
                    limitAmount={b.limit_amount}
                    spent={b.spent}
                    currency={currency}
                    warnThreshold={budgetData.warnThreshold}
                    critThreshold={budgetData.critThreshold}
                    daysLeft={budgetData.daysLeft}
                    onEdit={() => handleEditBudget(b)}
                    onDelete={() => handleDeleteBudget(b.id || b._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        initialData={editingBudget}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSuccess={fetchBudgets}
      />
    </div>
  );
};

export default BudgetsPage;
