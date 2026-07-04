import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

export function formatDate(date) {
  if (!date) return 'Not specified';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  } catch {
    return 'Invalid date';
  }
}

export function formatDateTime(date) {
  if (!date) return 'Not specified';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch {
    return 'Invalid date';
  }
}

export function formatTime(date) {
  if (!date) return '--:--';
  
  // Handle string time format (e.g., "14:30")
  if (typeof date === 'string' && date.includes(':')) {
    const [hours, minutes] = date.split(':');
    const hour = parseInt(hours);
    const minute = parseInt(minutes);
    if (isNaN(hour) || isNaN(minute)) return '--:--';
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(2000, 0, 1, hour % 24, minute));
  }
  
  // Handle Date object
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '--:--';
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(dateObj);
  } catch {
    return '--:--';
  }
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str, num) {
  if (str.length <= num) return str;
  return str.slice(0, num) + '...';
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
