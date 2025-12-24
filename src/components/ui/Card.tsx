
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({ children, className = '', variant = 'default' }) => {
  const baseClasses = "rounded-xl border shadow-sm transition-all duration-300";
  const variantClasses = {
    default: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
    elevated: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transform hover:scale-[1.01]",
    outlined: "bg-transparent border-slate-300 dark:border-slate-600",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

// Required for TypeScript isolatedModules
export {};