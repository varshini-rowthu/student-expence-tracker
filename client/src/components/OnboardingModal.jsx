import React, { useState } from 'react';
import { Sparkles, DollarSign, Wallet, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CURRENCIES = [
  { symbol: '$', code: 'USD', name: 'US Dollar ($)' },
  { symbol: '₹', code: 'INR', name: 'Indian Rupee (₹)' },
  { symbol: '€', code: 'EUR', name: 'Euro (€)' },
  { symbol: '£', code: 'GBP', name: 'British Pound (£)' },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar (C$)' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar (A$)' },
];

const DEFAULT_INTERESTS = [
  'Food & Dining',
  'Books & Study Material',
  'Transportation',
  'Entertainment & Leisure',
  'Utilities & Internet',
  'Groceries & Dorm Supplies',
];

const OnboardingModal = ({ isOpen, onClose }) => {
  const { user, updateProfile, showToast } = useAuth();
  const [currency, setCurrency] = useState(user?.currency || '$');
  const [allowance, setAllowance] = useState(user?.monthlyAllowance || '');
  const [defaultBudget, setDefaultBudget] = useState(user?.defaultMonthlyBudget || '');
  const [selectedInterests, setSelectedInterests] = useState(
    user?.spendingCategories?.length ? user.spendingCategories : DEFAULT_INTERESTS.slice(0, 4)
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const toggleInterest = (cat) => {
    if (selectedInterests.includes(cat)) {
      setSelectedInterests(selectedInterests.filter((c) => c !== cat));
    } else {
      setSelectedInterests([...selectedInterests, cat]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        currency,
        monthlyAllowance: Number(allowance) || 0,
        defaultMonthlyBudget: Number(defaultBudget) || 0,
        spendingCategories: selectedInterests,
      });
      showToast('Welcome aboard! Your student profile is ready.', 'success');
      onClose();
    } catch (err) {
      showToast('Could not save preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-indigo-500/30 bg-[#0d121f] shadow-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Student Profile Setup</h2>
            <p className="text-xs text-gray-400">Configure your currency and baseline monthly budget</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Currency selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">Preferred Currency</label>
            <div className="grid grid-cols-3 gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c.symbol)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    currency === c.symbol
                      ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-sm'
                      : 'border-gray-800 bg-gray-900/60 text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="font-bold text-sm">{c.symbol}</span>
                  <span>{c.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Allowance & Default Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Monthly Allowance / Income ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 800"
                value={allowance}
                onChange={(e) => setAllowance(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-gray-500">Scholarship, parents, campus job</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Default Monthly Budget ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 600"
                value={defaultBudget}
                onChange={(e) => setDefaultBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-gray-500">Max limit you plan to spend</span>
            </div>
          </div>

          {/* Categories of interest */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Spending Categories of Interest
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_INTERESTS.map((interest) => {
                const active = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                      active
                        ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-300'
                        : 'border-gray-800 bg-gray-900/60 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 text-indigo-400" />}
                    <span>{interest}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              {loading ? 'Saving Setup...' : 'Complete Onboarding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;
