import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Calendar, 
  Sparkles, 
  Bell, 
  MessageSquare, 
  Settings, 
  User, 
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Users,
  Ticket,
  DollarSign,
  Shield,
  Tag
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import Button from '../ui/Button';

const Sidebar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [expandedSection, setExpandedSection] = useState(null);

  const menuItems = [
    {
      section: 'Main',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: Sparkles, label: 'AI Planner', path: '/ai-planner' },
      ]
    },
    {
      section: 'Events',
      items: [
        { icon: Ticket, label: 'My Bookings', path: '/my-bookings' },
        { icon: Search, label: 'Discover Events', path: '/events' },
      ]
    },
    {
      section: 'Communication',
      items: [
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
      ]
    },
    {
      section: 'Account',
      items: [
        { icon: User, label: 'Profile', path: '/profile' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ]
    }
  ];

  const organizerItems = [
    {
      section: 'Management',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/organizer/dashboard' },
        { icon: Calendar, label: 'My Events', path: '/organizer/events' },
        { icon: Users, label: 'Attendees', path: '/organizer/attendees' },
        { icon: Tag, label: 'Categories', path: '/organizer/categories' },
        { icon: DollarSign, label: 'Revenue', path: '/organizer/revenue' },
      ]
    },
    {
      section: 'Communication',
      items: [
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
      ]
    }
  ];

  const adminItems = [
    {
      section: 'Admin',
      items: [
        { icon: Shield, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Ticket, label: 'Events', path: '/admin/events' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
      ]
    },
    {
      section: 'Communication',
      items: [
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
      ]
    }
  ];

  const getMenuItems = () => {
    if (user?.role === 'admin') return adminItems;
    if (user?.role === 'organizer') return organizerItems;
    return menuItems;
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen z-40 bg-bg-sidebar/50 backdrop-blur-xl border-r border-card-border"
    >
      {/* Logo */}
      <div className="p-4 border-b border-card-border">
        <div className="flex items-center justify-between">
          <motion.div 
            animate={{ opacity: collapsed ? 0 : 1 }}
            className="flex items-center space-x-2"
          >
            <img src="/logo.png" alt="EventVerse AI" className="h-8 w-auto" />
            {!collapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                EventVerse
              </span>
            )}
          </motion.div>
          <Button
            variant="ghost"
            size="sm"
            icon={collapsed ? ChevronRight : ChevronLeft}
            onClick={onToggle}
            className="p-2"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {getMenuItems().map((section) => (
          <div key={section.section}>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3"
                >
                  {section.section}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {section.items.map((item) => (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25'
                      : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-card-border">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center space-x-3"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {user?.email || ''}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
                className="p-2 text-text-muted hover:text-danger"
              />
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleLogout}
              className="w-full flex justify-center p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
