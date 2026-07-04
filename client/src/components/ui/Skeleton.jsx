import { motion } from 'framer-motion';
import { useTheme } from '../../store/ThemeContext';

const Skeleton = ({ className = '', variant = 'default', ...props }) => {
  const { isDark } = useTheme();

  const variants = {
    default: 'h-4 w-full',
    text: 'h-4 w-3/4',
    title: 'h-8 w-1/2',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24 rounded-lg',
    input: 'h-10 w-full rounded-lg',
    card: 'h-32 w-full rounded-2xl',
    image: 'h-48 w-full rounded-2xl',
  };

  const baseClasses = isDark
    ? 'bg-slate-700'
    : 'bg-slate-200';

  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`${baseClasses} ${variants[variant]} ${className} rounded`}
      {...props}
    />
  );
};

const CardSkeleton = () => (
  <div className="space-y-4">
    <Skeleton variant="image" />
    <div className="space-y-2 px-4">
      <Skeleton variant="title" />
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-1/2" />
    </div>
  </div>
);

const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" />
          <Skeleton variant="text" className="w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

const ListSkeleton = ({ items = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

Skeleton.Card = CardSkeleton;
Skeleton.Table = TableSkeleton;
Skeleton.List = ListSkeleton;

export default Skeleton;
