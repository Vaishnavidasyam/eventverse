import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Search, ArrowRight, Calendar, MapPin } from 'lucide-react';
import { eventsAPI } from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const OrganizerAttendeesPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getMyEvents();
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Attendee Management</h1>
          <p className="text-text-muted">Select an event to view, manage, and check-in attendees</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg bg-bg-card border border-card-border focus:border-primary focus:outline-none text-sm text-text-primary"
          />
        </div>
      </motion.div>

      {filteredEvents.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-muted">No events found. Create an event to register attendees.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event._id} className="p-6 hover:border-text-muted transition-all">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {event.isApproved ? 'Approved' : 'Pending Approval'}
                  </span>
                  <h2 className="text-xl font-bold mt-2 text-text-primary line-clamp-1">{event.title}</h2>
                </div>
                <div className="bg-bg-card border border-card-border h-10 w-10 rounded-xl flex items-center justify-center text-purple-400">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-2 text-sm text-text-muted mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.venue?.city || 'Virtual'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-card-border pt-4">
                <div>
                  <p className="text-2xl font-bold text-text-primary">{event.attendees?.length || 0}</p>
                  <p className="text-xs text-text-muted">Total Registered</p>
                </div>
                <Button
                  onClick={() => navigate(`/events/${event._id}/attendees`)}
                  icon={ArrowRight}
                >
                  Manage
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizerAttendeesPage;
