import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

const BudgetProgressBar = ({
  categoryName = 'Overall Budget',
  limitAmount = 0,
  spent = 0,
  currency = '$',
  warnThreshold = 80,
  critThreshold = 100,
  daysLeft = 0,
  onEdit,
  onDelete,
}) => {
  const percentage = limitAmount > 0 ? Number(((spent / limitAmount) * 100).toFixed(1)) : 0;
  const remaining = Number((limitAmount - spent).toFixed(2));

  // Determine alert status
  const isCritical = percentage >= critThreshold;
  const isWarning = !isCritical && percentage >= warnThreshold;

  // Bar progress clamp for visualization (up to 100% width display, but showing actual % number)
  const barWidth = Math.min(percentage, 100);

  return (
    <div className={`glass-card p-5 rounded-2xl border transition-all duration-200 ${
      isCritical
        ? 'border-rose-500/50 bg-rose-950/20'
        : isWarning
        ? 'border-amber-500/50 bg-amber-950/20'
        : 'border-gray-800/80 hover:border-gray-700/80'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-white text-base">{categoryName}</h4>
            {isCritical && (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertCircle className="w-3 h-3" /> Exceeded
              </span>
            )}
            {isWarning && (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="w-3 h-3" /> Warning ({percentage}%)
              </span>
            )}
            {!isCritical && !isWarning && percentage > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="w-3 h-3" /> Healthy
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {remaining >= 0 ? `${currency}${remaining.toFixed(2)} remaining` : `${currency}${Math.abs(remaining).toFixed(2)} over budget`} • {daysLeft} days left in cycle
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-2.5 py-1 text-xs text-gray-400 hover:text-white rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 transition-colors"
            >
              Adjust
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
              title="Delete budget"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-1.5">
        <div className="w-full bg-gray-800/80 rounded-full h-3 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCritical
                ? 'bg-rose-500'
                : isWarning
                ? 'bg-amber-400'
                : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
            }`}
            style={{ width: `${barWidth}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-gray-400">
            Spent: <strong className="text-white">{currency}{spent.toFixed(2)}</strong>
          </span>
          <span className={`font-bold ${isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-gray-300'}`}>
            {percentage}% used
          </span>
          <span className="text-gray-400">
            Limit: <strong className="text-white">{currency}{limitAmount.toFixed(2)}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetProgressBar;
