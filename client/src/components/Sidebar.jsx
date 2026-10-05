import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Sparkles,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, currency } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: Receipt },
    { to: '/budgets', label: 'Budgets & Limits', icon: PiggyBank },
    { to: '/reports', label: 'AI Insights & Reports', icon: Sparkles, badge: 'AI' },
    { to: '/profile', label: 'Profile & Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-800/80 bg-[#0d121f]/90 p-4 shrink-0 min-h-[calc(100vh-4rem)]">
        <div className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Student Financial Quick Card */}
        <div className="mt-auto pt-4 border-t border-gray-800/60">
          <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
              <span>Monthly Target</span>
              <span className="font-mono text-gray-300">{currency}{user?.defaultMonthlyBudget || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Allowance</span>
              <span className="font-mono text-emerald-400 font-semibold">{currency}{user?.monthlyAllowance || 0}</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Offline Safe
              </span>
              <span>v1.0 MVP</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d121f]/95 border-t border-gray-800 px-2 py-2 flex items-center justify-around backdrop-blur-lg">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-indigo-400' : 'text-gray-400 hover:text-gray-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{link.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
