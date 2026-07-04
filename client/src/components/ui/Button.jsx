import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  className = '', 
  icon: Icon,
  iconPosition = 'right',
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-primary to-secondary text-white hover:from-primary-hover hover:to-secondary shadow-lg shadow-primary/25',
    secondary: 'bg-bg-card border border-card-border text-text-secondary hover:bg-bg-hover hover:text-text-primary',
    tertiary: 'bg-bg-card text-text-primary hover:bg-bg-hover',
    danger: 'bg-gradient-to-r from-danger to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-lg shadow-danger/25',
    success: 'bg-gradient-to-r from-success to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-success/25',
    ghost: 'bg-transparent text-text-secondary hover:bg-bg-hover',
    'ghost-dark': 'bg-transparent text-text-muted hover:bg-bg-hover',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const baseClasses = 'rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {Icon && iconPosition === 'left' && !loading && <Icon className="h-4 w-4" />}
      {children}
      {Icon && iconPosition === 'right' && !loading && <Icon className="h-4 w-4" />}
    </motion.button>
  );
};

export default Button;
