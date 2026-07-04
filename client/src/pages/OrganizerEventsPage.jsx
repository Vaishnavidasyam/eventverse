import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Calendar, Search, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { eventsAPI } from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const OrganizerEventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventsAPI.delete(eventId);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'upcoming' && new Date(event.date) >= new Date()) ||
      (filterStatus === 'completed' && new Date(event.date) < new Date());
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
          <h1 className="text-3xl font-bold mb-2">My Events</h1>
          <p className="text-text-muted">View, update and manage events you have created</p>
        </div>
        <Button onClick={() => navigate('/create-event')} icon={Plus}>
          Create Event
        </Button>
      </motion.div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg bg-bg-card border border-card-border focus:border-primary focus:outline-none text-sm text-text-primary"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg bg-bg-card border border-card-border focus:border-primary focus:outline-none text-sm text-text-primary"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-muted mb-4">No events found. Start by creating a new event.</p>
          <Button onClick={() => navigate('/create-event')} icon={Plus}>
            Create Event
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div key={event._id} className="glass-card-light p-4 hover:border-text-muted transition-colors">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      event.isApproved 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {event.isApproved ? 'Approved' : 'Pending'}
                    </span>
                    {new Date(event.date) >= new Date() && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Upcoming
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-text-primary mb-1">{event.title}</h2>
                  <p className="text-sm text-text-muted">
                    {new Date(event.date).toLocaleDateString()} • {event.venue?.name || 'Virtual'}, {event.venue?.city}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-card-border pt-4 md:pt-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Eye}
                    onClick={() => navigate(`/events/${event._id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Edit}
                    onClick={() => navigate(`/create-event?edit=${event._id}`)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    icon={Trash2}
                    onClick={() => handleDeleteEvent(event._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizerEventsPage;
