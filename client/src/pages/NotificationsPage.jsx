import { motion } from 'framer-motion';
import { Bell, Check, Trash2, Calendar, Star, DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { notificationsAPI } from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'booking_confirmed': return <Calendar className="h-5 w-5 text-blue-400" />;
      case 'payment_success': return <DollarSign className="h-5 w-5 text-green-400" />;
      case 'event_reminder': return <Bell className="h-5 w-5 text-yellow-400" />;
      case 'event_update': return <Star className="h-5 w-5 text-purple-400" />;
      case 'organizer_message': return <AlertCircle className="h-5 w-5 text-orange-400" />;
      default: return <Bell className="h-5 w-5 text-slate-400" />;
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return notifDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-text-muted">Stay updated on your events and account activities</p>
          </div>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
              <p className="text-slate-400">No notifications yet. We'll notify you when something arrives.</p>
            </Card>
          ) : (
            notifications.map((n, index) => (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-2xl p-5 flex items-start gap-4 transition-all border ${
                  !n.isRead
                    ? 'bg-purple-500/5 border-purple-500/20 border-l-4 border-l-purple-500'
                    : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50'
                }`}
                onClick={() => !n.isRead && markAsRead(n._id)}
              >
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                  !n.isRead ? 'bg-purple-500/10' : 'bg-slate-700/50'
                }`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <h3 className={`font-semibold text-base truncate ${!n.isRead ? 'text-white' : 'text-slate-300'}`}>
                      {n.title}
                    </h3>
                    <span className="text-xs text-slate-500 flex-shrink-0">{formatTime(n.createdAt)}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{n.message}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationsPage;
