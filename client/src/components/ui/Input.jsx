import { motion } from 'framer-motion';
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const Input = ({ 
  label, 
  error, 
  success, 
  icon: Icon,
  type = 'text',
  className = '',
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const baseClasses = 'w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2';
  
  const themeClasses = 'bg-bg-card/50 border border-card-border text-text-primary placeholder-text-muted focus:ring-primary focus:border-transparent';

  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';
  const successClasses = success ? 'border-emerald-500 focus:ring-emerald-500' : '';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
        )}
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type={isPassword && showPassword ? 'text' : type}
          className={`${baseClasses} ${themeClasses} ${errorClasses} ${successClasses} ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
        {error && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
        )}
        {success && !error && (
          <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
        )}
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;
