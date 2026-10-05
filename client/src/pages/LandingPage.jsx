import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  PieChart,
  Bell,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-[#0b0f19] to-[#0b0f19] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Assisted Personal Finance for Students
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Stop Guessing Where Your <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              College Money Goes
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-400 leading-relaxed">
            Record expenses in seconds, manage category-wise monthly budgets, receive smart usage alerts at 80% & 100%, and get intelligent AI spending insights that actually adapt to your lifestyle.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              Start Free (No Credit Card)
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-2xl bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700/80 font-semibold text-sm transition-all"
            >
              Demo Student Login
            </Link>
          </div>

          {/* Quick Metrics Pill */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Free Tier / Zero Cost
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Offline Memory Fallback
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Full SRS Compliance
            </span>
          </div>
        </div>
      </section>

      {/* 5 Core SRS Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Built Directly From The SRS Specification
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            Every screen, API endpoint, and data model rigorously maps to the SRS Functional Requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FR1 & FR2 */}
          <div className="glass-card p-6 rounded-3xl border border-gray-800/80 hover:border-indigo-500/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">FR1 & FR2</span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">Student Auth & Profile</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Secure JWT sessions, onboarding flow, preferred currency selection, monthly allowance tracking, and complete GDPR/CCPA data export/deletion.
            </p>
          </div>

          {/* FR3 */}
          <div className="glass-card p-6 rounded-3xl border border-gray-800/80 hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">FR3</span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">Expense & Income Tracker</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Log transactions in seconds with positive validation, default & custom categories, UPI / Cash / Card support, multi-filtering, and instant CSV export.
            </p>
          </div>

          {/* FR4 */}
          <div className="glass-card p-6 rounded-3xl border border-gray-800/80 hover:border-amber-500/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">FR4</span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">Budget Thresholds & Alerts</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Set overall and category spending limits. Dynamic calculations compute percentage used, days remaining, and trigger alerts at 80% and 100%.
            </p>
          </div>

          {/* FR5 */}
          <div className="glass-card p-6 rounded-3xl border border-gray-800/80 hover:border-sky-500/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
              <PieChart className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">FR5</span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">Interactive Visual Dashboard</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Real-time daily, weekly, and monthly totals. Interactive Recharts donut expense breakdown, velocity charts, and fast recent activity feed.
            </p>
          </div>

          {/* FR6 & FR7 */}
          <div className="glass-card p-6 rounded-3xl border border-gray-800/80 hover:border-purple-500/40 transition-all md:col-span-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">FR6 & FR7</span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">AI Insights & Adaptive Feedback Learning</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Simulated rule-based AI engine analyzes dominant spending categories, week-over-week trends, and budget burn rates with an 800ms delay. Dismissal feedback mechanism (not useful, incorrect, already known) ensures tips intelligently adapt.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800/80 text-center text-xs text-gray-500">
        <p>PathPilot Student Expense Tracker • Developed as per Academic Software Requirements Specification</p>
      </footer>
    </div>
  );
};

export default LandingPage;
