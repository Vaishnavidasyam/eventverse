import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, Filter, Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { eventsAPI, categoriesAPI } from '../lib/api';
import { EVENT_CATEGORIES } from '../config/constants';
import { formatCurrency, formatDate } from '../lib/utils';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState(EVENT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    search: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      const apiCategories = response.data.categories || [];
      
      if (apiCategories.length > 0) {
        const transformedCategories = apiCategories.map(cat => ({
          name: cat.name,
          icon: cat.icon || '📅',
          label: cat.label,
          color: cat.color || 'from-purple-500 to-indigo-500'
        }));
        setCategories(transformedCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(EVENT_CATEGORIES);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getAll(filters);
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-white">Discover Events</h1>
          <p className="text-white">Find your next unforgettable experience</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="select-field"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="text"
                placeholder="City"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        </motion.div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white text-lg">No events found matching your criteria</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/events/${event._id}`}>
                  <div className="glass-card overflow-hidden group hover:scale-105 transition-transform duration-300">
                    <div className="relative h-48 bg-gradient-to-br from-purple-600 to-blue-600">
                      {event.bannerImage || event.imageUrl ? (
                        <img
                          src={event.bannerImage || event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center" style={{ display: event.bannerImage || event.imageUrl ? 'none' : 'flex' }}>
                        <span className="text-6xl">{categories.find(c => c.name === event.category)?.icon || '🎉'}</span>
                      </div>
                      <div className="absolute top-3 right-3 glass-card-light px-3 py-1 flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-semibold">{event.rating || 4.5}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-sm text-white mb-2 capitalize">{event.category}</div>
                      <h3 className="font-bold text-lg mb-2 line-clamp-1 text-white">{event.title}</h3>
                      <div className="space-y-2 text-sm text-white">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{event.venue?.city}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold gradient-text">
                            {event.ticketTypes?.[0] ? formatCurrency(event.ticketTypes[0].price) : 'Free'}
                          </span>
                          <span className="text-sm text-white ml-1">
                            {event.availableSeats > 0 ? `${event.availableSeats} seats` : 'Sold Out'}
                          </span>
                        </div>
                        <span className="text-sm text-purple-400 group-hover:text-purple-300">View →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
