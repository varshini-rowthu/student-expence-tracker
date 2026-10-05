import React from 'react';

const StatCard = ({ title, amount, subtitle, icon: Icon, trend, color = 'indigo' }) => {
  const colorStyles = {
    indigo: 'from-indigo-600/20 to-indigo-600/5 text-indigo-400 border-indigo-500/20',
    emerald: 'from-emerald-600/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-600/20 to-amber-600/5 text-amber-400 border-amber-500/20',
    rose: 'from-rose-600/20 to-rose-600/5 text-rose-400 border-rose-500/20',
    sky: 'from-sky-600/20 to-sky-600/5 text-sky-400 border-sky-500/20',
  };

  return (
    <div className={`glass-card p-5 rounded-2xl border bg-gradient-to-br ${colorStyles[color] || colorStyles.indigo} transition-all duration-200 hover:scale-[1.01]`}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-gray-900/60 border border-gray-700/50">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold text-white tracking-tight">{amount}</span>
        {trend && (
          <span className={`text-xs font-semibold ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
