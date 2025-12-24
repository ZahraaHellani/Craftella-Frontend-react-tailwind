import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg'; // Add this line
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md', // Default size
  className = '',
  ...props
}) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary";
  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };
  const variantClasses = {
    primary: "bg-primary hover:bg-violet-700 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02]",
    secondary: "bg-secondary hover:bg-emerald-700 text-white shadow-md hover:shadow-lg",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};