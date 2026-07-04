import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  Heart,
  Share2,
  Ticket,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle,
  X,
  QrCode,
  Download,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../store/ThemeContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import Modal from '../../components/ui/Modal';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Simulate data fetch
    setTimeout(() => {
      setEvent({
        id: 1,
        title: 'Tech Conference 2024',
        description: 'Join us for the biggest tech conference of the year! Network with industry leaders, attend workshops, and discover the latest innovations in technology.',
        images: [
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
          'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200',
          'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200',
          'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200',
        ],
        date: '2024-03-15',
        time: '9:00 AM',
        endDate: '2024-03-15',
        endTime: '6:00 PM',
        venue: 'Convention Center',
        location: 'Mumbai, Maharashtra',
        address: '123 Marine Drive, Mumbai, Maharashtra 400002',
        price: 299,
        originalPrice: 399,
        rating: 4.8,
        reviews: 245,
        attendees: 1250,
        maxAttendees: 2000,
        category: 'Technology',
        organizer: {
          id: 1,
          name: 'Tech Events Inc',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          rating: 4.9,
          events: 45,
        },
        tickets: [
          { id: 1, type: 'General Admission', price: 299, available: 500, features: ['Entry to all sessions', 'Networking lunch', 'Conference materials'] },
          { id: 2, type: 'VIP Pass', price: 499, available: 100, features: ['All General features', 'VIP lounge access', 'Meet & greet with speakers', 'Exclusive swag bag'] },
          { id: 3, type: 'Early Bird', price: 249, available: 50, features: ['All General features', 'Early access to venue', 'Priority seating'] },
        ],
        schedule: [
          { time: '9:00 AM', title: 'Registration & Breakfast', duration: '1 hour' },
          { time: '10:00 AM', title: 'Opening Keynote: Future of AI', duration: '1 hour' },
          { time: '11:00 AM', title: 'Workshop: Machine Learning Basics', duration: '2 hours' },
          { time: '1:00 PM', title: 'Networking Lunch', duration: '1 hour' },
          { time: '2:00 PM', title: 'Panel Discussion: Tech Trends 2024', duration: '1.5 hours' },
          { time: '3:30 PM', title: 'Startup Pitch Competition', duration: '1.5 hours' },
          { time: '5:00 PM', title: 'Closing Ceremony & Awards', duration: '1 hour' },
        ],
        faqs: [
          { q: 'What is the refund policy?', a: 'Full refunds available up to 7 days before the event. 50% refund up to 3 days before. No refunds within 3 days.' },
          { q: 'Is parking available?', a: 'Yes, free parking is available at the venue. VIP pass holders get reserved parking spots.' },
          { q: 'Can I transfer my ticket?', a: 'Yes, tickets can be transferred up to 24 hours before the event through your dashboard.' },
          { q: 'What should I bring?', a: 'Bring your ID, ticket QR code, and business cards for networking. Laptop recommended for workshops.' },
        ],
        relatedEvents: [
          { id: 2, title: 'AI & Machine Learning Summit', date: '2024-04-10', price: 449, image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400' },
          { id: 3, title: 'Startup Pitch Competition', date: '2024-03-25', price: 0, image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400' },
        ],
      });
      setLoading(false);
    }, 1500);
  }, [id]);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % event.images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + event.images.length) % event.images.length);
  };

  const handleBookTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowBookingModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton variant="card" className="h-96" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton variant="card" className="h-64" />
            <Skeleton variant="card" className="h-64" />
          </div>
          <Skeleton variant="card" className="h-96" />
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="space-y-8">
      {/* Image Gallery */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-96 rounded-3xl overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            src={event.images[currentImageIndex]}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Navigation Arrows */}
        <button
          onClick={handlePrevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/40 transition-colors"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={handleNextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/40 transition-colors"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Image Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {event.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/40 transition-colors">
            <Heart className="h-5 w-5 text-white" />
          </button>
          <button className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/40 transition-colors">
            <Share2 className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Event Info Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <Badge variant="gradient" className="mb-2">
            {event.category}
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
          <div className="flex items-center space-x-4 text-white/80">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{event.rating}</span>
              <span>({event.reviews} reviews)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>{event.attendees} attending</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Event Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Time</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Capacity</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{event.maxAttendees}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About This Event</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{event.description}</p>
            </Card>
          </motion.div>

          {/* Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Event Schedule</h2>
              <div className="space-y-4">
                {event.schedule.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-indigo-500" />
                      {index < event.schedule.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center space-x-3 mb-1">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-900 dark:text-white">{item.time}</span>
                        <Badge variant="secondary" size="sm">{item.duration}</Badge>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* FAQs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {event.faqs.map((faq, index) => (
                  <div key={index} className="border-b border-slate-200 dark:border-slate-700 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div>
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">{faq.q}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{faq.a}</p>
                  </div>
                </div>
              </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Related Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Related Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {event.relatedEvents.map((relatedEvent) => (
                <Card key={relatedEvent.id} hover className="overflow-hidden">
                  <img
                    src={relatedEvent.image}
                    alt={relatedEvent.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{relatedEvent.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(relatedEvent.date)}</span>
                      <span className="font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                        ₹{relatedEvent.price}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar - Booking Card */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="sticky top-24"
          >
            <Card className="p-6 space-y-6">
              {/* Organizer */}
              <div className="flex items-center space-x-4 pb-6 border-b border-slate-200 dark:border-slate-700">
                <img
                  src={event.organizer.avatar}
                  alt={event.organizer.name}
                  className="h-12 w-12 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{event.organizer.name}</p>
                  <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{event.organizer.rating}</span>
                    <span>•</span>
                    <span>{event.organizer.events} events</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div>
                {event.originalPrice > event.price && (
                  <span className="text-slate-400 line-through text-lg">₹{event.originalPrice}</span>
                )}
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    ₹{event.price}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">starting from</span>
                </div>
              </div>

              {/* Ticket Options */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">Select Ticket</h3>
                {event.tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => handleBookTicket(ticket)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      selectedTicket?.id === ticket.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{ticket.type}</span>
                      <span className="font-bold text-indigo-500">₹{ticket.price}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{ticket.available} available</p>
                    <div className="space-y-1">
                      {ticket.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              {/* Book Button */}
              <Button
                variant="gradient"
                size="lg"
                className="w-full"
                icon={Ticket}
                onClick={() => selectedTicket && setShowBookingModal(true)}
                disabled={!selectedTicket}
              >
                Book Now
              </Button>

              {/* Guarantee */}
              <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Instant confirmation</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>7-day refund policy</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Complete Your Booking"
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Ticket Summary */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{selectedTicket.type}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{event.title}</p>
                </div>
                <span className="text-2xl font-bold text-indigo-500">₹{selectedTicket.price}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-semibold text-slate-900 dark:text-white w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(selectedTicket.available, quantity + 1))}
                  className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between text-lg">
              <span className="text-slate-600 dark:text-slate-400">Total</span>
              <span className="font-bold text-2xl bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                ₹{selectedTicket.price * quantity}
              </span>
            </div>

            {/* Payment Button */}
            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              icon={ArrowRight}
              iconPosition="right"
            >
              Proceed to Payment
            </Button>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              By proceeding, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EventDetails;
