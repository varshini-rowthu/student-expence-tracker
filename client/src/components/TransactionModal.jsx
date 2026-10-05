import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, CreditCard, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TransactionModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const { currency, showToast } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category_id: '',
    category_name: 'Food & Dining',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'UPI',
    note: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      // Fetch user categories
      api.get('/categories')
        .then((res) => {
          if (res.data?.success) {
            setCategories(res.data.data);
            if (!initialData && res.data.data.length > 0) {
              setFormData((prev) => ({
                ...prev,
                category_id: res.data.data[0]._id || res.data.data[0].id,
                category_name: res.data.data[0].name,
              }));
            }
          }
        })
        .catch((err) => console.warn('Categories load error:', err.message));

      if (initialData) {
        setFormData({
          amount: initialData.amount,
          type: initialData.type || 'expense',
          category_id: initialData.category_id || '',
          category_name: initialData.category_name || '',
          date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          payment_method: initialData.payment_method || 'Cash',
          note: initialData.note || '',
        });
      } else {
        setFormData({
          amount: '',
          type: 'expense',
          category_id: '',
          category_name: 'Food & Dining',
          date: new Date().toISOString().split('T')[0],
          payment_method: 'UPI',
          note: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.amount || Number(formData.amount) <= 0) {
      errs.amount = 'Amount must be a positive number greater than 0';
    }
    if (!formData.date) {
      errs.date = 'Please select a valid date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const catObj = categories.find((c) => (c._id || c.id) === catId);
    setFormData((prev) => ({
      ...prev,
      category_id: catId,
      category_name: catObj ? catObj.name : 'General',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (initialData && (initialData._id || initialData.id)) {
        const id = initialData._id || initialData.id;
        await api.put(`/transactions/${id}`, formData);
        showToast('Transaction updated successfully', 'success');
      } else {
        await api.post('/transactions', formData);
        showToast('Transaction added successfully', 'success');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save transaction';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-gray-700/80 bg-[#111827] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h3 className="text-base font-bold text-white">
            {initialData ? 'Edit Record' : 'Record Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Toggle: Expense or Income */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-900 rounded-xl border border-gray-800">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense' })}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                formData.type === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income' })}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                formData.type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Income (+)
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Amount ({currency}) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                {currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full pl-8 pr-4 py-2.5 bg-gray-900/90 border rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.amount ? 'border-rose-500' : 'border-gray-700/80'
                }`}
              />
            </div>
            {errors.amount && <p className="text-rose-400 text-xs mt-1">{errors.amount}</p>}
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Category *</label>
            <div className="relative">
              <select
                value={formData.category_id}
                onChange={handleCategoryChange}
                className="w-full px-3.5 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                {categories.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Date and Payment Method in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.date && <p className="text-rose-400 text-xs mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Payment Method *</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Debit / Credit Card</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Canteen lunch, Java book, Metro pass..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Buttons */}
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
              {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
