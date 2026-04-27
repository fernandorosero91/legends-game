/**
 * 🎮 LEGENDS: Button Component
 * Componente de botón reutilizable con variantes y estados
 */

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import type { ButtonProps } from '@/types/ui';

const Button = forwardRef<HTMLButtonElement, ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>>(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      onClick,
      children,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Clases base del botón
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-purple-500 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    // Clases por variante
    const variantClasses = {
      primary: 'bg-purple-500 text-white hover:bg-purple-400 active:bg-purple-600 disabled:hover:bg-purple-500',
      secondary: 'border-2 border-purple-500 text-purple-400 bg-transparent hover:bg-purple-500/10 active:bg-purple-500/20 disabled:hover:bg-transparent',
      ghost: 'bg-transparent text-gray-100 hover:bg-white/10 active:bg-white/20 disabled:hover:bg-transparent',
      danger: 'bg-red-500 text-white hover:bg-red-400 active:bg-red-600 disabled:hover:bg-red-500',
    };

    // Clases por tamaño
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm min-h-[2rem] min-w-[2.75rem]',
      md: 'px-6 py-3 text-base min-h-[2.5rem] min-w-[2.75rem]',
      lg: 'px-8 py-4 text-lg min-h-[3rem] min-w-[2.75rem]',
    };

    // Combinar todas las clases
    const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled || loading}
        onClick={onClick}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
