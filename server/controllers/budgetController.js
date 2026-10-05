import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { isMongoConnected } from '../config/db.js';
import { memoryStore } from '../config/dataStore.js';

// Helper: Calculate days left in month
const getDaysLeftInMonth = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Total days in specified month
  const totalDays = new Date(year, month, 0).getDate();

  // If viewing current month
  if (year === currentYear && month === currentMonth) {
    const today = now.getDate();
    return Math.max(0, totalDays - today);
  } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 0; // Past month
  } else {
    return totalDays; // Future month
  }
};

// @desc    Get all budgets for a given month with calculated % used & status (FR4)
// @route   GET /api/budgets
export const getBudgets = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const targetMonth = req.query.month || currentMonthStr;

    // Fetch user alert thresholds
    let warnThreshold = 80;
    let critThreshold = 100;

    if (isMongoConnected()) {
      const user = await User.findById(userId);
      if (user) {
        warnThreshold = user.alertThresholdWarning || 80;
        critThreshold = user.alertThresholdCritical || 100;
      }
    } else {
      const user = memoryStore.findUserById(userId);
      if (user) {
        warnThreshold = user.alertThresholdWarning || 80;
        critThreshold = user.alertThresholdCritical || 100;
      }
    }

    const [targetYear, targetMonthNum] = targetMonth.split('-').map(Number);
    const startOfMonth = new Date(targetYear, targetMonthNum - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonthNum, 0, 23, 59, 59, 999);

    let budgetRecords = [];
    let expenses = [];

    if (isMongoConnected()) {
      budgetRecords = await Budget.find({ user_id: userId, month: targetMonth });
      expenses = await Transaction.find({
        user_id: userId,
        type: 'expense',
        date: { $gte: startOfMonth, $lte: endOfMonth },
      });
    } else {
      budgetRecords = memoryStore.getBudgets(userId, targetMonth);
      expenses = memoryStore.transactions.filter(
        (t) =>
          t.user_id === userId &&
          t.type === 'expense' &&
          new Date(t.date) >= startOfMonth &&
          new Date(t.date) <= endOfMonth
      );
    }

    const daysLeft = getDaysLeftInMonth(targetMonth);
    const totalDaysInMonth = new Date(targetYear, targetMonthNum, 0).getDate();

    // Map through each budget item and compute real-time metrics
    const evaluatedBudgets = budgetRecords.map((b) => {
      let spent = 0;
      if (b.category_id) {
        spent = expenses
          .filter((e) => String(e.category_id) === String(b.category_id))
          .reduce((sum, e) => sum + Number(e.amount), 0);
      } else {
        // Overall budget sums all expenses
        spent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      }

      const limit = Number(b.limit_amount);
      const remaining = Number((limit - spent).toFixed(2));
      const percentageUsed = limit > 0 ? Number(((spent / limit) * 100).toFixed(1)) : 0;

      let status = 'normal'; // normal (< warnThreshold), warning (warnThreshold to critThreshold), critical (>= critThreshold)
      if (percentageUsed >= critThreshold) {
        status = 'critical';
      } else if (percentageUsed >= warnThreshold) {
        status = 'warning';
      }

      return {
        id: b._id || b.id,
        _id: b._id || b.id,
        user_id: b.user_id,
        category_id: b.category_id,
        category_name: b.category_name,
        month: b.month,
        limit_amount: limit,
        spent: Number(spent.toFixed(2)),
        remaining,
        percentageUsed,
        status,
        daysLeft,
        totalDaysInMonth,
        isOverall: !b.category_id,
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Budgets evaluated successfully.',
      data: {
        month: targetMonth,
        daysLeft,
        totalDaysInMonth,
        warnThreshold,
        critThreshold,
        budgets: evaluatedBudgets,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set or update a monthly budget (overall or category) (FR4)
// @route   POST /api/budgets
export const setBudget = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { category_id, category_name, month, limit_amount } = req.body;

    if (!limit_amount || Number(limit_amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid budget limit greater than 0.',
        data: null,
      });
    }

    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const budgetMonth = month || currentMonthStr;

    if (isMongoConnected()) {
      const filter = {
        user_id: userId,
        category_id: category_id || null,
        month: budgetMonth,
      };

      const update = {
        category_name: category_name || (category_id ? 'Category' : 'Overall Monthly Budget'),
        limit_amount: Number(limit_amount),
      };

      const budget = await Budget.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true,
        runValidators: true,
      });

      return res.status(200).json({
        success: true,
        message: 'Budget saved successfully.',
        data: budget,
      });
    } else {
      const budget = memoryStore.setBudget({
        user_id: userId,
        category_id: category_id || null,
        category_name: category_name || (category_id ? 'Category' : 'Overall Monthly Budget'),
        month: budgetMonth,
        limit_amount: Number(limit_amount),
      });

      return res.status(200).json({
        success: true,
        message: 'Budget saved successfully.',
        data: budget,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
export const deleteBudget = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    if (isMongoConnected()) {
      const deleted = await Budget.findOneAndDelete({ _id: id, user_id: userId });
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found or unauthorized.',
          data: null,
        });
      }
    } else {
      const deleted = memoryStore.deleteBudget(id, userId);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found or unauthorized.',
          data: null,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Budget removed successfully.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
