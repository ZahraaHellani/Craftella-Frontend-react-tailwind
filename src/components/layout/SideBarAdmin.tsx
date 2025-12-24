import React from 'react';
import { Link } from 'react-router-dom';

export const SidebarAdmin: React.FC = () => {
  return (
    <div className="w-64 bg-white dark:bg-slate-800 h-screen fixed top-0 left-0 border-r border-slate-200 dark:border-slate-700">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-emerald-500 flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="ml-2 text-xl font-bold text-slate-800 dark:text-slate-100">Craftella Admin</span>
        </div>

        <nav className="space-y-2">
          <Link
            to="/admin/dashboard"
            className="block px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/users"
            className="block px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Users
          </Link>
          <Link
            to="/admin/products"
            className="block px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Products
          </Link>
          <Link
            to="/admin/orders"
            className="block px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Orders
          </Link>
          <Link
            to="/admin/events"
            className="block px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Events
          </Link>
          <Link
            to="/admin/notifications"
            className="block px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Notifications
          </Link>
        </nav>
      </div>
    </div>
  );
};