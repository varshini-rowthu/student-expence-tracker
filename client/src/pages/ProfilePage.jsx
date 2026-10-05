import React, { useState, useEffect } from 'react';
import {
  User,
  Settings,
  DollarSign,
  Bell,
  Tag,
  Trash2,
  Plus,
  AlertTriangle,
  ShieldAlert,
  Save,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CURRENCIES = [
  { symbol: '$', code: 'USD', name: 'US Dollar ($)' },
  { symbol: '₹', code: 'INR', name: 'Indian Rupee (₹)' },
  { symbol: '€', code: 'EUR', name: 'Euro (€)' },
  { symbol: '£', code: 'GBP', name: 'British Pound (£)' },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar (C$)' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar (A$)' },
];

const ProfilePage = () => {
  const { user, updateProfile, deleteAccount, showToast } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currency: user?.currency || '$',
    monthlyAllowance: user?.monthlyAllowance || 0,
    defaultMonthlyBudget: user?.defaultMonthlyBudget || 0,
    alertThresholdWarning: user?.alertThresholdWarning || 80,
    alertThresholdCritical: user?.alertThresholdCritical || 100,
  });

  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');
  const [saving, setSaving] = useState(false);
  const [catLoading, setCatLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.warn('Error fetching categories:', err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile(formData);
    setSaving(false);
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      showToast('Please specify a category name', 'error');
      return;
    }

    setCatLoading(true);
    try {
      await api.post('/categories', {
        name: newCatName.trim(),
        color: newCatColor,
        icon: 'Tag',
      });
      showToast('Custom category created', 'success');
      setNewCatName('');
      fetchCategories();
    } catch (err) {
      showToast('Could not create category', 'error');
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      showToast('Custom category deleted', 'info');
      fetchCategories();
    } catch (err) {
      showToast('Cannot delete default system category', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmText = prompt(
      'WARNING: This will permanently purge your student profile, all transactions, budgets, and feedback logs.\nType "DELETE" to confirm:'
    );
    if (confirmText === 'DELETE') {
      await deleteAccount();
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          Student Profile & Platform Preferences
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Manage currency, allowance baselines, alert thresholds, and custom categories (FR2, FR3, FR4)
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleProfileSave} className="glass-card p-6 rounded-3xl border border-gray-800 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
          <User className="w-4 h-4 text-indigo-400" />
          Personal & Financial Baseline
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700/80 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
            <input
              type="email"
              disabled
              value={formData.email}
              className="w-full px-3.5 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-gray-500 text-xs cursor-not-allowed"
            />
          </div>
        </div>

        {/* Currency selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">Preferred Currency</label>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setFormData({ ...formData, currency: c.symbol })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  formData.currency === c.symbol
                    ? 'border-indigo-500 bg-indigo-600/20 text-white'
                    : 'border-gray-800 bg-gray-900/60 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="font-bold text-sm">{c.symbol}</span>
                <span>{c.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Allowance & Default Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Monthly Allowance / Income ({formData.currency})
            </label>
            <input
              type="number"
              min="0"
              value={formData.monthlyAllowance}
              onChange={(e) => setFormData({ ...formData, monthlyAllowance: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700/80 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Default Monthly Budget Target ({formData.currency})
            </label>
            <input
              type="number"
              min="0"
              value={formData.defaultMonthlyBudget}
              onChange={(e) => setFormData({ ...formData, defaultMonthlyBudget: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700/80 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Alert Threshold Customization (FR4) */}
        <div className="pt-4 border-t border-gray-800 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Budget Alert Notification Thresholds (FR4)
            </h3>
          </div>
          <p className="text-xs text-gray-400">
            Define at what percentage of budget consumption the system should trigger warning and critical banners.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-amber-300 mb-1">
                Warning Threshold (%)
              </label>
              <input
                type="number"
                min="50"
                max="99"
                value={formData.alertThresholdWarning}
                onChange={(e) => setFormData({ ...formData, alertThresholdWarning: e.target.value })}
                className="w-full px-3.5 py-2 bg-gray-900 border border-gray-700/80 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[11px] text-gray-500">Default: 80%</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-rose-300 mb-1">
                Critical Threshold (%)
              </label>
              <input
                type="number"
                min="100"
                max="200"
                value={formData.alertThresholdCritical}
                onChange={(e) => setFormData({ ...formData, alertThresholdCritical: e.target.value })}
                className="w-full px-3.5 py-2 bg-gray-900 border border-gray-700/80 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <span className="text-[11px] text-gray-500">Default: 100% (Exceeded)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Profile Preferences'}</span>
          </button>
        </div>
      </form>

      {/* Custom Categories Manager (FR3) */}
      <div className="glass-card p-6 rounded-3xl border border-gray-800 space-y-5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-400" />
            Spending Categories (Default & Custom)
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Default categories are provided; you can add custom categories as required by FR3.
          </p>
        </div>

        {/* Add custom category form */}
        <form onSubmit={handleCreateCategory} className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="New category name (e.g. Gym, Gaming, Tech)..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 min-w-[200px] px-3.5 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <input
            type="color"
            value={newCatColor}
            onChange={(e) => setNewCatColor(e.target.value)}
            className="w-10 h-9 rounded-xl bg-transparent border border-gray-700 cursor-pointer p-0.5"
            title="Pick category color"
          />

          <button
            type="submit"
            disabled={catLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold border border-gray-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </form>

        {/* Existing categories list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
          {categories.map((c) => (
            <div
              key={c._id || c.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-gray-900/60 border border-gray-800 text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: c.color || '#6366f1' }}
                />
                <span className="text-gray-300 truncate font-medium">{c.name}</span>
              </div>

              {!c.isDefault && (
                <button
                  onClick={() => handleDeleteCategory(c._id || c.id)}
                  className="text-gray-500 hover:text-rose-400 p-1 transition-colors"
                  title="Remove custom category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone: Account Deletion (FR2) */}
      <div className="glass-card p-6 rounded-3xl border border-rose-900/40 bg-rose-950/10 space-y-3">
        <div className="flex items-center gap-2 text-rose-400">
          <ShieldAlert className="w-5 h-5" />
          <h2 className="text-base font-bold text-white">Danger Zone (FR2 Account Deletion)</h2>
        </div>
        <p className="text-xs text-gray-400">
          As mandated by FR2 and GDPR/CCPA regulations, deleting your account immediately purges all transaction ledgers, budget envelopes, and AI feedback history permanently.
        </p>

        <button
          type="button"
          onClick={handleDeleteAccount}
          className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all"
        >
          Delete Account & Purge Data
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
