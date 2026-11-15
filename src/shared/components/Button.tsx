import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  children,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const defaultVariants = {
    primary: 'bg-[#28518F] text-white hover:bg-[#1f4073] focus:ring-[#28518F]',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-400',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  // Check custom class override from theme
  const overrideClass = theme.classNames?.button?.[variant] || defaultVariants[variant];
  const baseOverride = theme.classNames?.button?.base || baseStyles;

  // Use dynamic primary style if theme.colors.primary has been customized
  const dynamicStyle: React.CSSProperties = {
    borderRadius: theme.borderRadius.md,
    ...(variant === 'primary' && theme.colors.primary !== '#28518F'
      ? {
          backgroundColor: theme.colors.primary,
          color: theme.colors.primaryText,
        }
      : {}),
    ...style,
  };

  return (
    <button
      className={`${baseOverride} ${overrideClass} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      style={dynamicStyle}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};
