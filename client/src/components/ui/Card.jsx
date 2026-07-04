import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  variant = 'default', 
  className = '', 
  hover = false,
  glass = false,
  ...props 
}) => {

  const variants = {
    default: 'bg-bg-card/50 border border-card-border',
    elevated: 'bg-bg-card/50 border border-card-border shadow-xl',
    gradient: 'bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20',
  };

  const baseClasses = 'rounded-2xl transition-all duration-300';
  
  const glassClasses = glass 
    ? 'backdrop-blur-xl bg-bg-card/10 border-card-border' 
    : '';

  const hoverClasses = hover 
    ? 'hover:shadow-2xl hover:scale-[1.02] cursor-pointer' 
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${baseClasses} ${variants[variant]} ${glassClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 border-b ${className}`}>
    {children}
  </div>
);

const CardBody = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 border-t ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
