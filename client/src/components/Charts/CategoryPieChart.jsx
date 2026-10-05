import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = [
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // emerald
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#ef4444', // red
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#f97316', // orange
];

const CategoryPieChart = ({ data = [], currency = '$' }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-gray-900/95 border border-gray-700 p-2.5 rounded-lg shadow-xl text-xs">
          <p className="font-semibold text-white mb-0.5">{item.name}</p>
          <p className="text-indigo-400 font-bold">
            {currency}{item.value.toFixed(2)} ({percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-gray-800/80">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">Expense Distribution</h3>
        <p className="text-xs text-gray-400">Category-wise breakdown for this period</p>
      </div>

      {data.length === 0 || total === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-500 text-sm">
          <p>No category expenses to display</p>
          <span className="text-xs text-gray-600 mt-1">Add transactions to visualize categories</span>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="h-56 w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {data.map((item, index) => {
              const color = COLORS[index % COLORS.length];
              const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between text-xs py-1 border-b border-gray-800/50">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-gray-300 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-gray-400 font-mono">{pct}%</span>
                    <span className="font-semibold text-white font-mono">{currency}{item.value.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPieChart;
