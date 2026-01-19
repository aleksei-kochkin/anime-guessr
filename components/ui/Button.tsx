import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'filter' | 'filter-active';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className = '', children, ...props }, ref) => {
    const baseStyles = 'font-medium transition-all duration-200 cursor-pointer rounded-lg';
    
    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg',
      secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md',
      ghost: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-lg',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg',
      filter: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md',
      'filter-active': 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg',
    };

    const sizeStyles = {
      sm: 'px-3 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2 text-base',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    const disabledStyles = props.disabled ? 'opacity-50 cursor-not-allowed hover:shadow-none' : '';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${disabledStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
