import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  User, 
  Settings,
  LogOut,
  Sparkles,
  Menu
} from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';
import { useAuth } from '../../store/AuthContext';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const TopNavigation = ({ onMenuClick }) => {
  const { toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'Booking confirmed', message: 'Your ticket for Tech Conference 2024 has been confirmed', time: '2 min ago', unread: true },
    { id: 2, title: 'Event reminder', message: 'AI Workshop starts in 1 hour', time: '1 hour ago', unread: true },
    { id: 3, title: 'Price drop alert', message: 'Music Festival tickets are now 20% off', time: '3 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="fixed top-0 right-0 left-0 z-30 bg-bg-sidebar/50 backdrop-blur-xl border-b border-card-border">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            icon={Menu}
            onClick={onMenuClick}
            className="lg:hidden"
          />
          
          {/* Search */}
          <div className="hidden md:flex items-center space-x-2">
            <motion.div
              animate={{ width: searchOpen ? 300 : 200 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search events, venues..."
                className="w-full pl-10 pr-4 py-2 rounded-xl text-sm transition-all duration-300 bg-bg-card/50 border border-card-border text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </motion.div>
            <Button
              variant="gradient"
              size="sm"
              icon={Sparkles}
              className="hidden lg:flex"
            >
              AI Search
            </Button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            icon={Sun}
            onClick={toggleTheme}
            className="hidden sm:flex"
          />

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              icon={Bell}
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative"
            >
              {unreadCount > 0 && (
                <Badge
                  variant="danger"
                  size="sm"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden bg-bg-card border border-card-border"
                >
                  <div className="p-4 border-b border-card-border">
                    <h3 className="font-semibold text-text-primary">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-card-border last:border-0 cursor-pointer hover:bg-bg-hover transition-colors ${
                          notification.unread ? 'bg-primary/10' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`h-2 w-2 rounded-full mt-2 ${
                            notification.unread ? 'bg-primary' : 'bg-text-muted'
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-text-primary">
                              {notification.title}
                            </p>
                            <p className="text-xs text-text-secondary mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-text-muted mt-2">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-card-border">
                    <Button variant="ghost" size="sm" className="w-full">
                      View All Notifications
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </Button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl overflow-hidden bg-bg-card border border-card-border"
                >
                  <div className="p-4 border-b border-card-border">
                    <p className="font-medium text-text-primary">{user?.name || 'User'}</p>
                    <p className="text-xs text-text-muted">{user?.email || ''}</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-bg-hover transition-colors text-left">
                      <User className="h-4 w-4 text-text-muted" />
                      <span className="text-sm text-text-secondary">Profile</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-bg-hover transition-colors text-left">
                      <Settings className="h-4 w-4 text-text-muted" />
                      <span className="text-sm text-text-secondary">Settings</span>
                    </button>
                  </div>
                  <div className="p-2 border-t border-card-border">
                    <button 
                      onClick={logout}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-danger/10 transition-colors text-left text-danger"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
