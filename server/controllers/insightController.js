import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import InsightFeedback from '../models/InsightFeedback.js';
import User from '../models/User.js';
import { isMongoConnected } from '../config/db.js';
import { memoryStore } from '../config/dataStore.js';

// @desc    Generate AI-assisted spending insights (FR6)
// @route   POST /api/insights/generate
export const generateInsights = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { period = 'month' } = req.body;

    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let transactions = [];
    let budgets = [];
    let feedbacks = [];
    let user = null;

    if (isMongoConnected()) {
      transactions = await Transaction.find({ user_id: userId }).sort({ date: -1 });
      budgets = await Budget.find({ user_id: userId, month: currentMonthStr });
      feedbacks = await InsightFeedback.find({ user_id: userId });
      user = await User.findById(userId);
    } else {
      transactions = memoryStore.getTransactions(userId);
      budgets = memoryStore.getBudgets(userId, currentMonthStr);
      feedbacks = memoryStore.getFeedbacks(userId);
      user = memoryStore.findUserById(userId);
    }

    const currency = user?.currency || '$';
    const expenses = transactions.filter((t) => t.type === 'expense');

    // 1. Highest spending category for selected period
    let periodExpenses = expenses;
    if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      periodExpenses = expenses.filter((e) => new Date(e.date) >= startOfMonth);
    } else if (period === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      periodExpenses = expenses.filter((e) => new Date(e.date) >= startOfWeek);
    }

    const categoryTotals = {};
    periodExpenses.forEach((e) => {
      const cat = e.category_name || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount);
    });

    let highestCategory = 'None';
    let highestAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > highestAmount) {
        highestAmount = amt;
        highestCategory = cat;
      }
    });

    // 2. Week-on-week comparison (This Week vs Last Week)
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - 7);
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(now);
    startOfLastWeek.setDate(now.getDate() - 14);
    startOfLastWeek.setHours(0, 0, 0, 0);

    const thisWeekSpent = expenses
      .filter((e) => new Date(e.date) >= startOfThisWeek)
      .reduce((s, e) => s + Number(e.amount), 0);

    const lastWeekSpent = expenses
      .filter((e) => new Date(e.date) >= startOfLastWeek && new Date(e.date) < startOfThisWeek)
      .reduce((s, e) => s + Number(e.amount), 0);

    const diff = thisWeekSpent - lastWeekSpent;
    const percentChange = lastWeekSpent > 0 ? ((diff / lastWeekSpent) * 100).toFixed(1) : 0;

    // 3. Suggestions for budgets close to being exceeded
    const overallBudget = budgets.find((b) => !b.category_id);
    const totalMonthSpent = periodExpenses.reduce((s, e) => s + Number(e.amount), 0);
    const overallLimit = overallBudget?.limit_amount || user?.defaultMonthlyBudget || 0;
    const overallUsage = overallLimit > 0 ? (totalMonthSpent / overallLimit) * 100 : 0;

    const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();

    // Check dismissed feedback categories to avoid repeating (FR7)
    const dismissedCategories = new Set(feedbacks.map((f) => f.insight_category));

    // Construct Rule-Based AI Insights
    const generatedInsights = [];

    // Insight 1: Highest spending observation
    if (highestAmount > 0 && !dismissedCategories.has('highest_spend')) {
      const percentageOfTotal = totalMonthSpent > 0 ? ((highestAmount / totalMonthSpent) * 100).toFixed(0) : 0;
      generatedInsights.push({
        id: 'insight-highest-' + Date.now(),
        category: 'highest_spend',
        type: 'observation',
        title: `Primary Spending Driver: ${highestCategory}`,
        summary: `You have spent ${currency}${highestAmount.toFixed(2)} on ${highestCategory}, accounting for ${percentageOfTotal}% of your recorded expenses.`,
        actionableTip: `Tip: Review your ${highestCategory} purchases this week. Look for bundle student discounts or split purchases with dorm mates to save an estimated ${currency}${(highestAmount * 0.15).toFixed(2)}.`,
        severity: 'info',
        metric: `${currency}${highestAmount.toFixed(2)} (${percentageOfTotal}%)`,
      });
    }

    // Insight 2: Week-on-week trend comparison
    if (!dismissedCategories.has('weekly_trend')) {
      const isHigher = diff > 0;
      generatedInsights.push({
        id: 'insight-trend-' + Date.now(),
        category: 'weekly_trend',
        type: 'trend',
        title: isHigher ? 'Increased Spending Trend' : 'Frugal Spending Trend',
        summary: isHigher
          ? `Your spending this week (${currency}${thisWeekSpent.toFixed(2)}) rose by ${Math.abs(percentChange)}% compared to the previous 7 days (${currency}${lastWeekSpent.toFixed(2)}).`
          : `Great job! You spent ${currency}${thisWeekSpent.toFixed(2)} this week, saving ${Math.abs(percentChange)}% less than last week's ${currency}${lastWeekSpent.toFixed(2)}.`,
        actionableTip: isHigher
          ? 'Notice: Pace yourself during mid-month to prevent running dry before the final week.'
          : 'Pace: Keep this conservative spending velocity to leave surplus for your savings cushion.',
        severity: isHigher ? 'warning' : 'success',
        metric: `${isHigher ? '+' : '-'}${Math.abs(percentChange)}% vs prior week`,
      });
    }

    // Insight 3: Budget overflow mitigation suggestions
    if (overallLimit > 0 && overallUsage >= 75 && !dismissedCategories.has('budget_risk')) {
      const dailyAllowanceLeft = daysLeft > 0 ? ((overallLimit - totalMonthSpent) / daysLeft).toFixed(2) : 0;
      generatedInsights.push({
        id: 'insight-budget-' + Date.now(),
        category: 'budget_risk',
        type: 'alert',
        title: overallUsage >= 100 ? 'Budget Limit Exceeded' : 'Approaching Monthly Budget Threshold',
        summary: overallUsage >= 100
          ? `Your spending has reached ${overallUsage.toFixed(1)}% of your monthly limit with ${daysLeft} days still remaining in this billing cycle.`
          : `You have utilized ${overallUsage.toFixed(1)}% of your ${currency}${overallLimit} budget with ${daysLeft} days left in the month.`,
        actionableTip: daysLeft > 0 && dailyAllowanceLeft > 0
          ? `Recommendation: Restrict your non-essential daily burn rate to ${currency}${dailyAllowanceLeft}/day to stay solvent through month end.`
          : `Recommendation: Freeze discretionary entertainment and dining out until the next monthly allowance resets.`,
        severity: overallUsage >= 100 ? 'critical' : 'warning',
        metric: `${overallUsage.toFixed(1)}% Used (${daysLeft} days left)`,
      });
    }

    // Insight 4: Student-specific actionable tip
    if (!dismissedCategories.has('student_habits')) {
      generatedInsights.push({
        id: 'insight-habit-' + Date.now(),
        category: 'student_habits',
        type: 'habit',
        title: 'Student Financial Wellness Tip',
        summary: 'Smart tracking helps students minimize debt and eliminate surprise month-end deficits.',
        actionableTip: 'Ensure all campus subscriptions (Spotify student, GitHub student pack, college print credit) are linked to avoid double-charging.',
        severity: 'info',
        metric: 'Student Wellness',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'AI spending insights generated successfully.',
      data: {
        insights: generatedInsights,
        summary: {
          highestCategory,
          highestAmount,
          thisWeekSpent,
          lastWeekSpent,
          percentChange,
          totalMonthSpent,
          overallUsage: Number(overallUsage.toFixed(1)),
          daysLeft,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit dismissal feedback to train/adapt insight engine (FR7)
// @route   POST /api/insights/feedback
export const submitFeedback = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { insightId, reason, insight_category, note } = req.body;

    const validReasons = ['not_useful', 'incorrect', 'already_known', 'other'];
    if (!reason || !validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: 'Valid feedback reason is required (not_useful, incorrect, already_known, other).',
        data: null,
      });
    }

    if (isMongoConnected()) {
      const feedback = await InsightFeedback.create({
        user_id: userId,
        insight_id: insightId,
        reason,
        insight_category: insight_category || '',
        note: note || '',
      });

      return res.status(201).json({
        success: true,
        message: 'Feedback recorded. Future insights will adapt based on your preference.',
        data: feedback,
      });
    } else {
      const feedback = memoryStore.createFeedback({
        user_id: userId,
        insight_id: insightId,
        reason,
        insight_category: insight_category || '',
        note: note || '',
      });

      return res.status(201).json({
        success: true,
        message: 'Feedback recorded. Future insights will adapt based on your preference.',
        data: feedback,
      });
    }
  } catch (error) {
    next(error);
  }
};
