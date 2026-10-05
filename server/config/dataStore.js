import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'mockDatabase.json');

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Food & Dining', color: '#f59e0b', icon: 'Utensils', isDefault: true, user_id: null },
  { id: 'cat-2', name: 'Books & Study Material', color: '#3b82f6', icon: 'BookOpen', isDefault: true, user_id: null },
  { id: 'cat-3', name: 'Housing & Rent', color: '#8b5cf6', icon: 'Home', isDefault: true, user_id: null },
  { id: 'cat-4', name: 'Transportation', color: '#10b981', icon: 'Bus', isDefault: true, user_id: null },
  { id: 'cat-5', name: 'Entertainment & Leisure', color: '#ec4899', icon: 'Film', isDefault: true, user_id: null },
  { id: 'cat-6', name: 'Utilities & Internet', color: '#06b6d4', icon: 'Wifi', isDefault: true, user_id: null },
  { id: 'cat-7', name: 'Healthcare & Medicine', color: '#ef4444', icon: 'HeartPulse', isDefault: true, user_id: null },
  { id: 'cat-8', name: 'Personal Care & Groceries', color: '#14b8a6', icon: 'ShoppingBag', isDefault: true, user_id: null },
  { id: 'cat-9', name: 'College Fees & Tech', color: '#6366f1', icon: 'Laptop', isDefault: true, user_id: null },
  { id: 'cat-10', name: 'Part-Time Income & Allowance', color: '#22c55e', icon: 'Wallet', isDefault: true, user_id: null },
];

class MemoryDataStore {
  constructor() {
    this.users = [];
    this.categories = [...DEFAULT_CATEGORIES];
    this.transactions = [];
    this.budgets = [];
    this.feedbacks = [];
    this.loadFromFile();
    this.seedDemoUserIfEmpty();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        this.users = data.users || [];
        this.categories = data.categories?.length ? data.categories : [...DEFAULT_CATEGORIES];
        this.transactions = data.transactions || [];
        this.budgets = data.budgets || [];
        this.feedbacks = data.feedbacks || [];
      }
    } catch (err) {
      console.warn('Could not load fallback database file, using clean memory state:', err.message);
    }
  }

  saveToFile() {
    try {
      const data = {
        users: this.users,
        categories: this.categories,
        transactions: this.transactions,
        budgets: this.budgets,
        feedbacks: this.feedbacks,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Could not persist fallback database to file:', err.message);
    }
  }

  seedDemoUserIfEmpty() {
    if (this.users.length === 0) {
      const demoId = 'user-demo-student';
      const hashedPassword = bcrypt.hashSync('student123', 10);
      const demoUser = {
        id: demoId,
        _id: demoId,
        name: 'Alex Johnson',
        email: 'alex@student.edu',
        password: hashedPassword,
        currency: '$',
        monthlyAllowance: 800,
        defaultMonthlyBudget: 600,
        alertThresholdWarning: 80,
        alertThresholdCritical: 100,
        spendingCategories: ['Food & Dining', 'Books & Study Material', 'Transportation', 'Entertainment & Leisure'],
        created_at: new Date().toISOString(),
      };
      this.users.push(demoUser);

      // Seed current month budgets
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      this.budgets.push({
        id: 'budget-overall',
        _id: 'budget-overall',
        user_id: demoId,
        category_id: null,
        category_name: 'Overall Monthly Budget',
        month: currentMonth,
        limit_amount: 600,
        created_at: new Date().toISOString(),
      });

      this.budgets.push({
        id: 'budget-food',
        _id: 'budget-food',
        user_id: demoId,
        category_id: 'cat-1',
        category_name: 'Food & Dining',
        month: currentMonth,
        limit_amount: 220,
        created_at: new Date().toISOString(),
      });

      this.budgets.push({
        id: 'budget-books',
        _id: 'budget-books',
        user_id: demoId,
        category_id: 'cat-2',
        category_name: 'Books & Study Material',
        month: currentMonth,
        limit_amount: 100,
        created_at: new Date().toISOString(),
      });

      // Seed sample realistic student transactions for current month & past week
      const daysAgo = (days) => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.toISOString();
      };

      const seedTxns = [
        { id: 'txn-1', user_id: demoId, category_id: 'cat-10', category_name: 'Part-Time Income & Allowance', type: 'income', amount: 800, date: daysAgo(20), payment_method: 'UPI', note: 'Monthly Campus Work & Allowance' },
        { id: 'txn-2', user_id: demoId, category_id: 'cat-1', category_name: 'Food & Dining', type: 'expense', amount: 35.5, date: daysAgo(1), payment_method: 'Card', note: 'Campus Cafeteria Lunch & Snacks' },
        { id: 'txn-3', user_id: demoId, category_id: 'cat-2', category_name: 'Books & Study Material', type: 'expense', amount: 75.0, date: daysAgo(3), payment_method: 'Card', note: 'Algorithm & Data Structures Textbook' },
        { id: 'txn-4', user_id: demoId, category_id: 'cat-1', category_name: 'Food & Dining', type: 'expense', amount: 18.25, date: daysAgo(4), payment_method: 'UPI', note: 'Groceries & Instant Noodles' },
        { id: 'txn-5', user_id: demoId, category_id: 'cat-4', category_name: 'Transportation', type: 'expense', amount: 45.0, date: daysAgo(5), payment_method: 'Cash', note: 'Monthly Metro Student Pass' },
        { id: 'txn-6', user_id: demoId, category_id: 'cat-5', category_name: 'Entertainment & Leisure', type: 'expense', amount: 14.99, date: daysAgo(7), payment_method: 'Card', note: 'Streaming & Music Subscription' },
        { id: 'txn-7', user_id: demoId, category_id: 'cat-1', category_name: 'Food & Dining', type: 'expense', amount: 62.0, date: daysAgo(9), payment_method: 'UPI', note: 'Weekend Dinner with Study Group' },
        { id: 'txn-8', user_id: demoId, category_id: 'cat-6', category_name: 'Utilities & Internet', type: 'expense', amount: 30.0, date: daysAgo(12), payment_method: 'UPI', note: 'Dorm Wi-Fi Share' },
        { id: 'txn-9', user_id: demoId, category_id: 'cat-8', category_name: 'Personal Care & Groceries', type: 'expense', amount: 28.5, date: daysAgo(14), payment_method: 'Cash', note: 'Toiletries and Laundry' },
        { id: 'txn-10', user_id: demoId, category_id: 'cat-1', category_name: 'Food & Dining', type: 'expense', amount: 42.0, date: daysAgo(16), payment_method: 'Card', note: 'Grocery haul from supermarket' },
      ];

      seedTxns.forEach((txn) => {
        this.transactions.push({
          ...txn,
          _id: txn.id,
          created_at: txn.date,
        });
      });

      this.saveToFile();
    }
  }

  // User methods
  findUserByEmail(email) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find((u) => u.id === id || u._id === id);
  }

  createUser(userData) {
    const id = 'user-' + Date.now();
    const newUser = {
      id,
      _id: id,
      ...userData,
      currency: userData.currency || '$',
      monthlyAllowance: userData.monthlyAllowance || 0,
      defaultMonthlyBudget: userData.defaultMonthlyBudget || 0,
      alertThresholdWarning: userData.alertThresholdWarning || 80,
      alertThresholdCritical: userData.alertThresholdCritical || 100,
      spendingCategories: userData.spendingCategories || [],
      created_at: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.saveToFile();
    return newUser;
  }

  updateUser(id, updateData) {
    const idx = this.users.findIndex((u) => u.id === id || u._id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], ...updateData, updated_at: new Date().toISOString() };
    this.saveToFile();
    return this.users[idx];
  }

  deleteUser(id) {
    this.users = this.users.filter((u) => u.id !== id && u._id !== id);
    this.transactions = this.transactions.filter((t) => t.user_id !== id);
    this.budgets = this.budgets.filter((b) => b.user_id !== id);
    this.categories = this.categories.filter((c) => c.user_id !== id);
    this.feedbacks = this.feedbacks.filter((f) => f.user_id !== id);
    this.saveToFile();
    return true;
  }

  // Categories
  getCategories(userId) {
    return this.categories.filter((c) => c.user_id === null || c.user_id === userId);
  }

  createCategory(categoryData) {
    const id = 'cat-' + Date.now();
    const newCat = {
      id,
      _id: id,
      ...categoryData,
      isDefault: false,
      created_at: new Date().toISOString(),
    };
    this.categories.push(newCat);
    this.saveToFile();
    return newCat;
  }

  deleteCategory(catId, userId) {
    const cat = this.categories.find((c) => (c.id === catId || c._id === catId) && c.user_id === userId);
    if (!cat) return false;
    this.categories = this.categories.filter((c) => c.id !== catId && c._id !== catId);
    this.saveToFile();
    return true;
  }

  // Transactions
  getTransactions(userId, filters = {}) {
    let list = this.transactions.filter((t) => t.user_id === userId);

    if (filters.type) {
      list = list.filter((t) => t.type === filters.type);
    }
    if (filters.category_id) {
      list = list.filter((t) => t.category_id === filters.category_id);
    }
    if (filters.payment_method) {
      list = list.filter((t) => t.payment_method === filters.payment_method);
    }
    if (filters.startDate) {
      list = list.filter((t) => new Date(t.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      list = list.filter((t) => new Date(t.date) <= new Date(filters.endDate));
    }

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  createTransaction(txnData) {
    const id = 'txn-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const newTxn = {
      id,
      _id: id,
      ...txnData,
      amount: Number(txnData.amount),
      created_at: new Date().toISOString(),
    };
    this.transactions.unshift(newTxn);
    this.saveToFile();
    return newTxn;
  }

  updateTransaction(id, userId, updateData) {
    const idx = this.transactions.findIndex((t) => (t.id === id || t._id === id) && t.user_id === userId);
    if (idx === -1) return null;
    this.transactions[idx] = {
      ...this.transactions[idx],
      ...updateData,
      amount: updateData.amount !== undefined ? Number(updateData.amount) : this.transactions[idx].amount,
      updated_at: new Date().toISOString(),
    };
    this.saveToFile();
    return this.transactions[idx];
  }

  deleteTransaction(id, userId) {
    const idx = this.transactions.findIndex((t) => (t.id === id || t._id === id) && t.user_id === userId);
    if (idx === -1) return false;
    this.transactions.splice(idx, 1);
    this.saveToFile();
    return true;
  }

  // Budgets
  getBudgets(userId, month) {
    return this.budgets.filter((b) => b.user_id === userId && (!month || b.month === month));
  }

  setBudget(budgetData) {
    const { user_id, category_id, month, limit_amount, category_name } = budgetData;
    const existingIdx = this.budgets.findIndex(
      (b) => b.user_id === user_id && b.category_id === (category_id || null) && b.month === month
    );

    if (existingIdx !== -1) {
      this.budgets[existingIdx].limit_amount = Number(limit_amount);
      if (category_name) this.budgets[existingIdx].category_name = category_name;
      this.budgets[existingIdx].updated_at = new Date().toISOString();
      this.saveToFile();
      return this.budgets[existingIdx];
    } else {
      const id = 'budget-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      const newBudget = {
        id,
        _id: id,
        user_id,
        category_id: category_id || null,
        category_name: category_name || (category_id ? 'Category' : 'Overall Monthly Budget'),
        month,
        limit_amount: Number(limit_amount),
        created_at: new Date().toISOString(),
      };
      this.budgets.push(newBudget);
      this.saveToFile();
      return newBudget;
    }
  }

  deleteBudget(id, userId) {
    const idx = this.budgets.findIndex((b) => (b.id === id || b._id === id) && b.user_id === userId);
    if (idx === -1) return false;
    this.budgets.splice(idx, 1);
    this.saveToFile();
    return true;
  }

  // Feedback Learning
  createFeedback(feedbackData) {
    const id = 'fb-' + Date.now();
    const newFb = {
      id,
      _id: id,
      ...feedbackData,
      created_at: new Date().toISOString(),
    };
    this.feedbacks.push(newFb);
    this.saveToFile();
    return newFb;
  }

  getFeedbacks(userId) {
    return this.feedbacks.filter((f) => f.user_id === userId);
  }
}

export const memoryStore = new MemoryDataStore();
