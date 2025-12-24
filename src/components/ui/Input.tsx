import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({
  className = '',
  ...props
}) => {
  return (
    <input
      className={`w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 peer ${className}`}
      {...props}
    />
  );
};