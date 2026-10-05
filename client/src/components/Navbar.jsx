import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Wallet, LogOut, User, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenTransactionModal, alertCount = 0 }) => {
  const { user, logout, currency } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-gray-800/80 bg-[#0b0f19]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              PathPilot <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Expense Tracker</span>
            </span>
          </div>
        </Link>

        {/* User actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Currency Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-900 border border-gray-800 text-xs font-mono text-gray-300">
                <span className="text-gray-500">Currency:</span>
                <span className="font-bold text-indigo-400">{currency}</span>
              </div>

              {/* Quick Add Button */}
              <button
                id="quick-add-btn"
                onClick={onOpenTransactionModal}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Add</span>
              </button>

              {/* AI Insights Link */}
              <button
                onClick={() => navigate('/reports')}
                className="relative p-2 rounded-xl text-gray-400 hover:text-indigo-400 hover:bg-gray-800/60 transition-colors"
                title="AI Insights"
              >
                <Sparkles className="w-5 h-5" />
                {alertCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-gray-900" />
                )}
              </button>

              {/* Profile avatar & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 rounded-xl text-gray-300 hover:bg-gray-800/80 transition-colors text-xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                    {user.name ? user.name[0].toUpperCase() : 'S'}
                  </div>
                  <span className="hidden md:inline font-medium text-gray-200">{user.name?.split(' ')[0]}</span>
                </Link>

                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-rose-400 hover:bg-gray-800/60 rounded-xl transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
