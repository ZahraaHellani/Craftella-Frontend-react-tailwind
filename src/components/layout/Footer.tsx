import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-slate-600 dark:text-slate-400">
          © {new Date().getFullYear()} Craftella. All rights reserved.
        </div>
      </div>
    </footer>
  );
};