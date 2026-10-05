import React, { useState, useEffect } from 'react';
import {
  Receipt,
  PlusCircle,
  Download,
  Filter,
  Trash2,
  Edit2,
  TrendingDown,
  TrendingUp,
  Search,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TransactionModal from '../components/TransactionModal';

const TransactionsPage = () => {
  const { currency, showToast } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState({
    type: '',
    category_id: '',
    payment_method: '',
    startDate: '',
    endDate: '',
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState(null);

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

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.payment_method) params.payment_method = filters.payment_method;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await api.get('/transactions', { params });
      if (res.data?.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      showToast('Could not load transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const handleExportCSV = async () => {
    try {
      const res = await api.get('/transactions/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student_expenses_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Transactions exported to CSV successfully!', 'success');
    } catch (err) {
      showToast('Failed to export CSV file', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this record?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      showToast('Record deleted successfully', 'info');
      fetchTransactions();
    } catch (err) {
      showToast('Failed to delete transaction', 'error');
    }
  };

  const handleEdit = (txn) => {
    setEditingTxn(txn);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTxn(null);
    setIsModalOpen(true);
  };

  const resetFilters = () => {
    setFilters({
      type: '',
      category_id: '',
      payment_method: '',
      startDate: '',
      endDate: '',
    });
    setSearchQuery('');
  };

  const filteredList = transactions.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.note && t.note.toLowerCase().includes(q)) ||
      (t.category_name && t.category_name.toLowerCase().includes(q)) ||
      (t.payment_method && t.payment_method.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-400" />
            Transactions & Records
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Log, filter, and audit your student income and expenditures
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-700/80 text-xs font-semibold transition-all hover:text-white"
            title="Download CSV as per FR3"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Panel (FR3) */}
      <div className="glass-card p-4 rounded-2xl border border-gray-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>Multi-Criteria Filters</span>
          </div>
          {(filters.type || filters.category_id || filters.payment_method || filters.startDate || filters.endDate || searchQuery) && (
            <button
              onClick={resetFilters}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
            >
              <X className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search keyword */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search note or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Type filter */}
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Flow Types</option>
            <option value="expense">Expenses Only (-)</option>
            <option value="income">Income Only (+)</option>
          </select>

          {/* Category filter */}
          <select
            value={filters.category_id}
            onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Payment Method filter */}
          <select
            value={filters.payment_method}
            onChange={(e) => setFilters({ ...filters, payment_method: e.target.value })}
            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Other">Other</option>
          </select>

          {/* Date Range Start */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              title="Start Date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-2 py-1.5 bg-gray-900 border border-gray-800 rounded-xl text-[11px] text-white focus:outline-none"
            />
            <span className="text-gray-500 text-xs">to</span>
            <input
              type="date"
              title="End Date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-2 py-1.5 bg-gray-900 border border-gray-800 rounded-xl text-[11px] text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-card rounded-2xl border border-gray-800/80 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-400 text-xs">Loading ledger entries...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Receipt className="w-8 h-8 text-gray-500 mx-auto" />
            <p className="text-sm font-semibold text-gray-300">No matching transactions found</p>
            <p className="text-xs text-gray-500">Try modifying filter criteria or record a new transaction.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/60 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description / Note</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50 text-xs">
                {filteredList.map((t) => {
                  const isExpense = t.type === 'expense';
                  return (
                    <tr key={t._id || t.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="py-3 px-4 text-gray-300 font-mono">
                        {new Date(t.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                            isExpense ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {isExpense ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                          </div>
                          <span className="font-medium text-white truncate max-w-xs">
                            {t.note || t.category_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-gray-800 border border-gray-700/50 text-gray-300 font-medium">
                          {t.category_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 font-mono">{t.payment_method}</td>
                      <td className={`py-3 px-4 text-right font-bold font-mono ${
                        isExpense ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {isExpense ? '-' : '+'}{currency}{Number(t.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(t)}
                            className="p-1 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded-lg transition-colors"
                            title="Edit record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(t._id || t.id)}
                            className="p-1 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        initialData={editingTxn}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTxn(null);
        }}
        onSuccess={fetchTransactions}
      />
    </div>
  );
};

export default TransactionsPage;
