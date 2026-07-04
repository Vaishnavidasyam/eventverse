import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, Star, Heart, Share2, ArrowLeft } from 'lucide-react';
import { eventsAPI } from '../lib/api';
import { formatCurrency, formatDate, formatTime } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getById(id);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book tickets');
      navigate('/login');
      return;
    }
    navigate(`/booking/${id}`);
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <p className="text-text-muted">Event not found</p>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/events" className="inline-flex items-center text-secondary hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Banner */}
              <div className="glass-card overflow-hidden mb-6">
                <div className="h-64 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <span className="text-8xl">🎉</span>
                </div>
              </div>

              {/* Event Info */}
              <div className="glass-card p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                    <p className="text-purple-400 capitalize">{event.category}</p>
                  </div>
                  <div className="flex items-center space-x-2 glass-card-light px-3 py-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{event.rating || 4.5}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Date</p>
                      <p className="font-semibold">{formatDate(event.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Time</p>
                      <p className="font-semibold">{formatTime(event.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="font-semibold">{event.venue?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Capacity</p>
                      <p className="font-semibold">{event.venue?.capacity} guests</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="font-semibold mb-3">About this event</h3>
                  <p className="text-gray-300 leading-relaxed">{event.description}</p>
                </div>
              </div>

              {/* Venue Details */}
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Venue Information</h3>
                <div className="space-y-3">
                  <p className="text-gray-300">
                    <span className="text-gray-400">Name:</span> {event.venue?.name}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-400">Address:</span> {event.venue?.address}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-400">City:</span> {event.venue?.city}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24"
            >
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Ticket Options</h3>
                
                {event.ticketTypes?.map((ticket, index) => (
                  <div key={index} className="glass-card-light p-4 mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{ticket.name}</p>
                        <p className="text-sm text-gray-400">{ticket.available} available</p>
                      </div>
                      <p className="text-xl font-bold gradient-text">{formatCurrency(ticket.price)}</p>
                    </div>
                    {ticket.description && (
                      <p className="text-sm text-gray-400">{ticket.description}</p>
                    )}
                  </div>
                ))}

                <div className="flex items-center justify-between mb-4 pt-4 border-t border-white/10">
                  <span className="text-gray-400">Available Seats</span>
                  <span className="font-semibold">{event.availableSeats} / {event.totalSeats}</span>
                </div>

                <button
                  onClick={handleBookNow}
                  disabled={event.availableSeats === 0}
                  className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {event.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
                </button>

                <div className="flex space-x-3 mt-4">
                  <button className="flex-1 btn-secondary py-3 flex items-center justify-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Save
                  </button>
                  <button className="flex-1 btn-secondary py-3 flex items-center justify-center">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </button>
                </div>
              </div>

              {/* Organizer Info */}
              <div className="glass-card p-6 mt-6">
                <h3 className="font-semibold mb-4">Organizer</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xl font-bold">
                    {event.organizer?.name?.charAt(0) || 'O'}
                  </div>
                  <div>
                    <p className="font-semibold">{event.organizer?.name || 'Event Organizer'}</p>
                    <p className="text-sm text-gray-400">Verified Organizer</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
