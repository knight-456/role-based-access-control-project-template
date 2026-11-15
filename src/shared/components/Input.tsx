import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const inputId = id || props.name;

  const containerClass = theme.classNames?.input?.container || 'w-full';
  const labelClass = theme.classNames?.input?.label || 'block text-xs font-medium text-gray-700 mb-1';
  const inputClass =
    theme.classNames?.input?.input ||
    'w-full px-3.5 py-2 border rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#28518F] focus:border-transparent transition-colors';

  return (
    <div className={containerClass}>
      {label && (
        <label htmlFor={inputId} className={labelClass}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={{ borderRadius: theme.borderRadius.md, ...style }}
        className={`${inputClass} ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'} ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
};
