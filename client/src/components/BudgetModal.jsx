import React, { useState, useEffect } from 'react';
import { X, PiggyBank } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const BudgetModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const { currency, showToast } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [formData, setFormData] = useState({
    category_id: '',
    category_name: 'Overall Monthly Budget',
    month: defaultMonth,
    limit_amount: '',
  });

  useEffect(() => {
    if (isOpen) {
      api.get('/categories')
        .then((res) => {
          if (res.data?.success) {
            setCategories(res.data.data);
          }
        })
        .catch((err) => console.warn('Categories load error:', err.message));

      if (initialData) {
        setFormData({
          category_id: initialData.category_id || '',
          category_name: initialData.category_name || (initialData.category_id ? 'Category' : 'Overall Monthly Budget'),
          month: initialData.month || defaultMonth,
          limit_amount: initialData.limit_amount || '',
        });
      } else {
        setFormData({
          category_id: '',
          category_name: 'Overall Monthly Budget',
          month: defaultMonth,
          limit_amount: '',
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.limit_amount || Number(formData.limit_amount) <= 0) {
      showToast('Please specify a positive budget limit amount', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/budgets', formData);
      showToast('Budget configured successfully', 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save budget';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (e) => {
    const val = e.target.value;
    if (!val) {
      setFormData({
        ...formData,
        category_id: null,
        category_name: 'Overall Monthly Budget',
      });
    } else {
      const found = categories.find((c) => (c._id || c.id) === val);
      setFormData({
        ...formData,
        category_id: val,
        category_name: found ? found.name : 'Category',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-gray-700/80 bg-[#111827] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <PiggyBank className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Set Budget Target</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Budget Scope *
            </label>
            <select
              value={formData.category_id || ''}
              onChange={handleCategorySelect}
              className="w-full px-3.5 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">🎯 Overall Total Monthly Budget</option>
              <optgroup label="Specific Categories">
                {categories.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <p className="text-[11px] text-gray-500 mt-1">
              Select overall to cap total monthly spending or choose a specific category like Food.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Target Month *
              </label>
              <input
                type="month"
                required
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Limit Amount ({currency}) *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                placeholder="e.g. 250"
                value={formData.limit_amount}
                onChange={(e) => setFormData({ ...formData, limit_amount: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              {loading ? 'Saving...' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
