import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const SpendingTrendChart = ({ dailyData = [], weeklyData = [], currency = '$' }) => {
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'weekly'

  const activeData = viewMode === 'daily'
    ? dailyData.map((d) => ({ name: d.day, amount: d.amount, date: d.date }))
    : weeklyData.map((w) => ({ name: w.week, amount: w.amount }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 border border-gray-700 p-3 rounded-lg shadow-xl text-xs">
          <p className="text-gray-400 font-semibold mb-1">{label}</p>
          <p className="text-indigo-400 text-sm font-bold">
            {currency}{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-gray-800/80">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-semibold text-white">Spending Trends</h3>
          <p className="text-xs text-gray-400">
            {viewMode === 'daily' ? 'Past 7 days spending velocity' : 'Month-to-date weekly progression'}
          </p>
        </div>
        <div className="flex items-center bg-gray-900/80 p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              viewMode === 'daily'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Daily (7 Days)
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              viewMode === 'weekly'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly (By Week)
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        {activeData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            No spending recorded for this interval
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} tickLine={false} tickFormatter={(val) => `${currency}${val}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#818cf8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#spendingGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SpendingTrendChart;
