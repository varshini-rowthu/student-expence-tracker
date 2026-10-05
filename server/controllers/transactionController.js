import Transaction from '../models/Transaction.js';
import { isMongoConnected } from '../config/db.js';
import { memoryStore } from '../config/dataStore.js';

// @desc    Get all transactions with multi-field filtering (FR3)
// @route   GET /api/transactions
export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { startDate, endDate, category_id, type, payment_method } = req.query;

    if (isMongoConnected()) {
      const filter = { user_id: userId };

      if (type) filter.type = type;
      if (category_id) filter.category_id = category_id;
      if (payment_method) filter.payment_method = payment_method;

      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filter.date.$lte = end;
        }
      }

      const transactions = await Transaction.find(filter).sort({ date: -1 });

      return res.status(200).json({
        success: true,
        message: 'Transactions retrieved successfully.',
        data: transactions,
      });
    } else {
      const transactions = memoryStore.getTransactions(userId, {
        startDate,
        endDate,
        category_id,
        type,
        payment_method,
      });

      return res.status(200).json({
        success: true,
        message: 'Transactions retrieved successfully.',
        data: transactions,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add a transaction (FR3)
// @route   POST /api/transactions
export const addTransaction = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { amount, type, category_id, category_name, date, payment_method, note } = req.body;

    // Strict SRS Validation
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Transaction amount must be a positive number greater than 0.',
        data: null,
      });
    }

    const txDate = date ? new Date(date) : new Date();
    if (isNaN(txDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'A valid date must be provided.',
        data: null,
      });
    }

    const validMethods = ['Cash', 'UPI', 'Card', 'Other'];
    const pMethod = validMethods.includes(payment_method) ? payment_method : 'Cash';
    const txType = type === 'income' ? 'income' : 'expense';

    if (isMongoConnected()) {
      const newTxn = await Transaction.create({
        user_id: userId,
        amount: Number(amount),
        type: txType,
        category_id: category_id || null,
        category_name: category_name || 'General',
        date: txDate,
        payment_method: pMethod,
        note: note ? note.trim() : '',
      });

      return res.status(201).json({
        success: true,
        message: 'Transaction recorded successfully.',
        data: newTxn,
      });
    } else {
      const newTxn = memoryStore.createTransaction({
        user_id: userId,
        amount: Number(amount),
        type: txType,
        category_id: category_id || null,
        category_name: category_name || 'General',
        date: txDate.toISOString(),
        payment_method: pMethod,
        note: note ? note.trim() : '',
      });

      return res.status(201).json({
        success: true,
        message: 'Transaction recorded successfully.',
        data: newTxn,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update a transaction (FR3)
// @route   PUT /api/transactions/:id
export const updateTransaction = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { amount, type, category_id, category_name, date, payment_method, note } = req.body;

    const updates = {};
    if (amount !== undefined) {
      if (Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive number greater than 0.',
          data: null,
        });
      }
      updates.amount = Number(amount);
    }
    if (type) updates.type = type === 'income' ? 'income' : 'expense';
    if (category_id !== undefined) updates.category_id = category_id;
    if (category_name !== undefined) updates.category_name = category_name;
    if (date) {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date provided.',
          data: null,
        });
      }
      updates.date = d;
    }
    if (payment_method) updates.payment_method = payment_method;
    if (note !== undefined) updates.note = note.trim();

    if (isMongoConnected()) {
      const updated = await Transaction.findOneAndUpdate(
        { _id: id, user_id: userId },
        updates,
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found or unauthorized.',
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Transaction updated successfully.',
        data: updated,
      });
    } else {
      const updated = memoryStore.updateTransaction(id, userId, updates);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found or unauthorized.',
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Transaction updated successfully.',
        data: updated,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction (FR3)
// @route   DELETE /api/transactions/:id
export const deleteTransaction = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    if (isMongoConnected()) {
      const deleted = await Transaction.findOneAndDelete({ _id: id, user_id: userId });
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found or unauthorized.',
          data: null,
        });
      }
    } else {
      const deleted = memoryStore.deleteTransaction(id, userId);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found or unauthorized.',
          data: null,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction removed successfully.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export transactions to CSV (FR3)
// @route   GET /api/transactions/export/csv
export const exportCSV = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let list;

    if (isMongoConnected()) {
      list = await Transaction.find({ user_id: userId }).sort({ date: -1 });
    } else {
      list = memoryStore.getTransactions(userId);
    }

    // CSV Headers
    const headers = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Payment Method', 'Note'];
    const rows = list.map((t) => [
      t._id || t.id,
      new Date(t.date).toISOString().split('T')[0],
      t.type,
      `"${(t.category_name || '').replace(/"/g, '""')}"`,
      t.amount,
      t.payment_method,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=student_transactions_${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
