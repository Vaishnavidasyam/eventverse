import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Ticket, 
  DollarSign, 
  Heart, 
  Star,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { useTheme } from '../../store/ThemeContext';
import { eventsAPI } from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';

const Dashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getAll();
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    upcomingEvents: 3,
    savedEvents: 2,
    pendingPayment: 1,
    totalBookings: 12,
    ticketsOwned: 24,
    moneySpent: 1847,
    rewardsPoints: 2450,
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '₹0';
    return price === 0 ? 'Free' : `₹${price.toLocaleString()}`;
  };

  const getEventPrice = (event) => {
    if (!event.ticketTypes || event.ticketTypes.length === 0) return 0;
    return Math.min(...event.ticketTypes.map(t => t.price));
  };

  const getAttendeeCount = (event) => {
    return event.attendees ? event.attendees.length : 0;
  };

  const getEventImage = (event) => {
    const img = event.bannerImage || event.imageUrl || event.images?.[0];
    if (img && img !== '') return img;
    const title = event.title?.toLowerCase() || '';
    if (title.includes('yoga') || title.includes('wellness')) {
      return 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=1200';
    }
    if (title.includes('music') || title.includes('festival')) {
      return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200';
    }
    if (title.includes('tech') || title.includes('conference')) {
      return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200';
    }
    if (title.includes('art') || title.includes('exhibition')) {
      return 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200';
    }
    return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200';
  };

  const DEFAULT_EVENT_IMG = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200';

  const handleImageError = (e) => {
    e.target.src = DEFAULT_EVENT_IMG;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton variant="card" className="h-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="card" className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card 
          variant="gradient" 
          className="relative overflow-hidden h-64"
          hover={false}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200')] bg-cover bg-center opacity-30" />
          
          <div className="relative h-full flex items-center justify-between px-8">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl font-bold text-white">
                  Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
                </h1>
                <p className="text-white/80 text-lg mt-2">
                  {stats.totalBookings} events booked · {stats.ticketsOwned} tickets owned · ₹{stats.moneySpent} spent · {stats.rewardsPoints} rewards points
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center space-x-4"
              >
                <Button variant="secondary" size="lg" icon={Calendar}>
                  View Calendar
                </Button>
                <Button variant="secondary" size="lg" icon={Sparkles}>
                  AI Planner
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <p className="text-white/80 text-sm mb-2">Today's Recommendation</p>
                <p className="text-white font-semibold text-lg">Summer Music Festival</p>
                <p className="text-white/60 text-sm mt-1">Based on your interests</p>
                <Button variant="secondary" size="sm" className="mt-4 w-full">
                  View Details
                </Button>
              </div>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { icon: Calendar, label: 'Events Booked', value: stats.totalBookings, color: 'text-indigo-500' },
          { icon: Ticket, label: 'Tickets Owned', value: stats.ticketsOwned, color: 'text-blue-500' },
          { icon: DollarSign, label: 'Money Spent', value: `₹${stats.moneySpent}`, color: 'text-emerald-500' },
          { icon: TrendingUp, label: 'Rewards Points', value: stats.rewardsPoints, color: 'text-purple-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Card hover className="p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  {stat.value}
                </span>
              </div>
              <p className="text-slate-300">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Discover Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Discover Events</h2>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" icon={Filter}>
              Filters
            </Button>
            <Button variant="ghost" size="sm" icon={Search}>
              Search
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            event && (
              <motion.div
                key={event.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
              <Card hover className="overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getEventImage(event)}
                    alt={event.title}
                    onError={handleImageError}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <Badge variant="gradient" size="sm">
                      {event.category}
                    </Badge>
                  </div>
                  
                  {event.isFeatured && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="danger" size="sm">
                        🔥 Hot
                      </Badge>
                    </div>
                  )}

                  <button className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/40 transition-colors">
                    <Heart className="h-5 w-5 text-white" />
                  </button>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center space-x-2 text-white">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{event.rating || 0}</span>
                      <span className="text-white/80 text-sm">({getAttendeeCount(event)} attending)</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-white line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-2 text-white text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{event.venue?.name || event.venue}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-white text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(event.date)} at {event.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                        {formatPrice(getEventPrice(event))}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-white dark:border-slate-800"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-white">
                        {event.totalSeats > 0 ? Math.round(((event.totalSeats - (event.availableSeats || event.totalSeats)) / event.totalSeats) * 100) : 0}% full
                      </span>
                    </div>
                  </div>

                  <Button 
                    variant="gradient" 
                    className="w-full"
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={() => navigate(`/booking/${event._id}`)}
                  >
                    Book Now
                  </Button>
                </div>
              </Card>
            </motion.div>
            )
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
