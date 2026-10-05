import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import User from '../models/User.js';
import { isMongoConnected } from '../config/db.js';
import { memoryStore } from '../config/dataStore.js';

// @desc    Get dashboard metrics, charts, and recent activity (FR5)
// @route   GET /api/dashboard
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    // Time boundaries
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let transactions = [];
    let budgets = [];
    let userRecord = null;

    if (isMongoConnected()) {
      transactions = await Transaction.find({ user_id: userId }).sort({ date: -1 });
      budgets = await Budget.find({ user_id: userId, month: currentMonthStr });
      userRecord = await User.findById(userId);
    } else {
      transactions = memoryStore.getTransactions(userId);
      budgets = memoryStore.getBudgets(userId, currentMonthStr);
      userRecord = memoryStore.findUserById(userId);
    }

    const expenses = transactions.filter((t) => t.type === 'expense');
    const income = transactions.filter((t) => t.type === 'income');

    // Totals for today, this week, this month
    const todaySpending = expenses
      .filter((e) => new Date(e.date) >= startOfToday)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const weekSpending = expenses
      .filter((e) => new Date(e.date) >= startOfWeek)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const monthExpenses = expenses.filter(
      (e) => new Date(e.date) >= startOfMonth && new Date(e.date) <= endOfMonth
    );

    const monthSpending = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const monthIncome = income
      .filter((i) => new Date(i.date) >= startOfMonth && new Date(i.date) <= endOfMonth)
      .reduce((sum, i) => sum + Number(i.amount), 0);

    // Monthly Budget & Remaining
    const overallBudget = budgets.find((b) => !b.category_id);
    const monthlyBudgetLimit = overallBudget
      ? overallBudget.limit_amount
      : userRecord?.defaultMonthlyBudget || 0;

    const remainingBudget = Number((monthlyBudgetLimit - monthSpending).toFixed(2));
    const budgetUsedPercent = monthlyBudgetLimit > 0
      ? Number(((monthSpending / monthlyBudgetLimit) * 100).toFixed(1))
      : 0;

    // Days left in current month
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeftInMonth = Math.max(0, totalDaysInMonth - now.getDate());

    // 5-10 most recent transactions
    const recentTransactions = transactions.slice(0, 8);

    // Category breakdown for charts
    const categoryMap = {};
    monthExpenses.forEach((e) => {
      const cat = e.category_name || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(e.amount);
    });

    const categoryBreakdown = Object.keys(categoryMap).map((catName) => ({
      name: catName,
      value: Number(categoryMap[catName].toFixed(2)),
    }));

    // Weekly spending trend (last 7 days daily breakdown)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const spentOnDay = expenses
        .filter((e) => new Date(e.date) >= dayStart && new Date(e.date) <= dayEnd)
        .reduce((sum, e) => sum + Number(e.amount), 0);

      last7Days.push({
        day: dayName,
        date: d.toISOString().split('T')[0],
        amount: Number(spentOnDay.toFixed(2)),
      });
    }

    // Monthly spending trend (by weeks of current month)
    const weeklyTrends = [
      { week: 'Week 1', amount: 0 },
      { week: 'Week 2', amount: 0 },
      { week: 'Week 3', amount: 0 },
      { week: 'Week 4+', amount: 0 },
    ];

    monthExpenses.forEach((e) => {
      const dateNum = new Date(e.date).getDate();
      if (dateNum <= 7) weeklyTrends[0].amount += Number(e.amount);
      else if (dateNum <= 14) weeklyTrends[1].amount += Number(e.amount);
      else if (dateNum <= 21) weeklyTrends[2].amount += Number(e.amount);
      else weeklyTrends[3].amount += Number(e.amount);
    });

    weeklyTrends.forEach((w) => {
      w.amount = Number(w.amount.toFixed(2));
    });

    // Alert status
    const warnThreshold = userRecord?.alertThresholdWarning || 80;
    const critThreshold = userRecord?.alertThresholdCritical || 100;

    let alertLevel = 'normal';
    let alertMessage = null;
    if (budgetUsedPercent >= critThreshold) {
      alertLevel = 'critical';
      alertMessage = `Warning: You have utilized ${budgetUsedPercent}% of your monthly budget limit (${userRecord?.currency || '$'}${monthlyBudgetLimit}) with ${daysLeftInMonth} days remaining!`;
    } else if (budgetUsedPercent >= warnThreshold) {
      alertLevel = 'warning';
      alertMessage = `Notice: You have reached ${budgetUsedPercent}% of your monthly budget threshold with ${daysLeftInMonth} days left in the month.`;
    }

    return res.status(200).json({
      success: true,
      message: 'Dashboard data loaded successfully.',
      data: {
        currency: userRecord?.currency || '$',
        todaySpending: Number(todaySpending.toFixed(2)),
        weekSpending: Number(weekSpending.toFixed(2)),
        monthSpending: Number(monthSpending.toFixed(2)),
        monthIncome: Number(monthIncome.toFixed(2)),
        monthlyBudgetLimit,
        remainingBudget,
        budgetUsedPercent,
        daysLeftInMonth,
        totalDaysInMonth,
        alertLevel,
        alertMessage,
        recentTransactions,
        categoryBreakdown,
        dailyTrend: last7Days,
        weeklyTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};
