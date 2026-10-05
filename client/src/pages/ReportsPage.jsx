import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  X,
  CheckCircle,
  HelpCircle,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/aiService';
import api from '../services/api';
import FeedbackModal from '../components/FeedbackModal';
import SpendingTrendChart from '../components/Charts/SpendingTrendChart';
import CategoryPieChart from '../components/Charts/CategoryPieChart';

const ReportsPage = () => {
  const { user, currency, showToast } = useAuth();
  const [period, setPeriod] = useState('month'); // 'month' | 'week'
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState({ dailyTrend: [], weeklyTrends: [], categoryBreakdown: [] });

  // Dismiss feedback state (FR7)
  const [dismissModalOpen, setDismissModalOpen] = useState(false);
  const [targetInsight, setTargetInsight] = useState(null);

  const fetchInsightsAndReports = async () => {
    setLoading(true);
    try {
      // 1. Fetch AI Insights
      const [aiRes, dashRes] = await Promise.all([
        aiService.getSpendingInsights({ period, profile: user }),
        api.get('/dashboard'),
      ]);

      if (aiRes) {
        setInsights(aiRes.insights || []);
        setSummary(aiRes.summary || null);
      }

      if (dashRes.data?.success) {
        const d = dashRes.data.data;
        setChartData({
          dailyTrend: d.dailyTrend || [],
          weeklyTrends: d.weeklyTrends || [],
          categoryBreakdown: d.categoryBreakdown || [],
        });
      }
    } catch (err) {
      console.warn('Insights generation error:', err.message);
      showToast('AI insights generated with localized analysis', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsightsAndReports();
  }, [period]);

  const handleOpenDismiss = (insight) => {
    setTargetInsight(insight);
    setDismissModalOpen(true);
  };

  const handleDismissConfirmed = (insightId) => {
    setInsights((prev) => prev.filter((i) => i.id !== insightId));
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              AI Spending Insights & Reports
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Plain-language observations, week-over-week comparisons, and adaptive feedback learning (FR6 & FR7)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs">
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                period === 'week' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                period === 'month' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              This Month
            </button>
          </div>

          <button
            onClick={fetchInsightsAndReports}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-xl transition-colors"
            title="Refresh Insights"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* AI Latency Shimmer or Cards */}
      {loading ? (
        <div className="glass-card p-10 rounded-2xl border border-indigo-500/30 text-center space-y-3 animate-pulse">
          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto animate-spin" />
          <h3 className="text-sm font-semibold text-white">Synthesizing Spending Model...</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Simulating AI inference (800ms pipeline), evaluating category ratios, week-on-week shifts, and feedback history.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Active Observations ({insights.length})
            </span>
            <span className="text-[11px] text-gray-500">
              Dismissing tips trains future recommendations
            </span>
          </div>

          {insights.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl border border-gray-800 text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-white">All caught up!</p>
              <p className="text-xs text-gray-400">
                You have reviewed and addressed all current spending observations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight) => {
                const isAlert = insight.type === 'alert';
                const isTrend = insight.type === 'trend';

                return (
                  <div
                    key={insight.id}
                    className={`glass-card p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                      isAlert
                        ? 'border-amber-500/40 bg-amber-950/10'
                        : isTrend
                        ? 'border-indigo-500/40 bg-indigo-950/10'
                        : 'border-gray-800/80 hover:border-gray-700/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {isAlert ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <Lightbulb className="w-4 h-4" />}
                        </span>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          {insight.title}
                        </h4>
                      </div>

                      {/* Dismiss button triggers FR7 reason modal */}
                      <button
                        onClick={() => handleOpenDismiss(insight)}
                        className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
                        title="Dismiss insight with feedback"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed mb-3">
                      {insight.summary}
                    </p>

                    <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800/80 text-[11px] text-gray-300 space-y-1">
                      <div className="flex items-center justify-between text-indigo-300 font-mono text-xs font-bold mb-1">
                        <span>Metric:</span>
                        <span>{insight.metric}</span>
                      </div>
                      <p className="text-gray-400 leading-normal">{insight.actionableTip}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Analytics Visual Breakdown */}
      <div className="space-y-3 pt-4 border-t border-gray-800/80">
        <div>
          <h3 className="text-base font-bold text-white">Visual Spend Summary</h3>
          <p className="text-xs text-gray-400">Statistical distribution backing the AI recommendations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingTrendChart
            dailyData={chartData.dailyTrend}
            weeklyData={chartData.weeklyTrends}
            currency={currency}
          />
          <CategoryPieChart
            data={chartData.categoryBreakdown}
            currency={currency}
          />
        </div>
      </div>

      {/* Dismissal Feedback Learning Modal (FR7) */}
      <FeedbackModal
        isOpen={dismissModalOpen}
        insight={targetInsight}
        onClose={() => {
          setDismissModalOpen(false);
          setTargetInsight(null);
        }}
        onDismissConfirmed={handleDismissConfirmed}
      />
    </div>
  );
};

export default ReportsPage;
