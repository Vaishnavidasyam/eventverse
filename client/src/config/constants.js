export const EVENT_CATEGORIES = [
  { name: 'wedding', icon: '💒', label: 'Weddings', color: 'from-pink-500 to-rose-500' },
  { name: 'birthday', icon: '🎂', label: 'Birthdays', color: 'from-yellow-500 to-orange-500' },
  { name: 'concert', icon: '🎵', label: 'Concerts', color: 'from-purple-500 to-indigo-500' },
  { name: 'conference', icon: '🎤', label: 'Conferences', color: 'from-blue-500 to-cyan-500' },
  { name: 'workshop', icon: '📚', label: 'Workshops', color: 'from-green-500 to-emerald-500' },
  { name: 'festival', icon: '🎪', label: 'Festivals', color: 'from-red-500 to-pink-500' },
  { name: 'sports', icon: '⚽', label: 'Sports', color: 'from-orange-500 to-red-500' },
  { name: 'corporate', icon: '💼', label: 'Corporate', color: 'from-slate-500 to-gray-500' },
];

export const VENDOR_CATEGORIES = [
  { name: 'photographer', icon: '📷', label: 'Photographers' },
  { name: 'decorator', icon: '🎨', label: 'Decorators' },
  { name: 'caterer', icon: '🍽️', label: 'Caterers' },
  { name: 'dj', icon: '🎧', label: 'DJs' },
  { name: 'makeup', icon: '💄', label: 'Makeup Artists' },
  { name: 'security', icon: '🛡️', label: 'Security Services' },
  { name: 'other', icon: '📦', label: 'Other Services' },
];

export const USER_ROLES = {
  USER: 'user',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
};

export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  CHECKED_IN: 'checked-in',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED: 'booking_confirmed',
  PAYMENT_SUCCESS: 'payment_success',
  EVENT_REMINDER: 'event_reminder',
  EVENT_UPDATE: 'event_update',
  ORGANIZER_MESSAGE: 'organizer_message',
  SYSTEM: 'system',
};
