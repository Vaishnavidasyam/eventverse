import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Filter, Search, MapPin, Clock, Users, MoreVertical, Grid, List } from 'lucide-react';
import { eventsAPI } from '../lib/api';
import { formatDate, formatTime } from '../lib/utils';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('month');
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ day: null, isPadding: true });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === date.toDateString();
      });
      
      days.push({
        day,
        date,
        events: dayEvents,
        isToday: date.toDateString() === new Date().toDateString(),
        isPadding: false
      });
    }
    
    return days;
  };

  const getWeekDays = () => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  };

  const handleDragStart = (e, event) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetDate) => {
    e.preventDefault();
    if (draggedEvent) {
      try {
        await eventsAPI.update(draggedEvent._id, {
          date: targetDate.toISOString()
        });
        toast.success('Event rescheduled successfully');
        fetchEvents();
      } catch (error) {
        console.error('Error rescheduling event:', error);
        toast.error('Failed to reschedule event');
      }
      setDraggedEvent(null);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = getWeekDays();

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="text-3xl font-bold mb-1">Event Calendar</h1>
                <p className="text-slate-400">Drag and drop events to reschedule</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700">
                <Button
                  variant="ghost-dark"
                  size="sm"
                  onClick={() => setView('month')}
                  className={view === 'month' ? 'bg-purple-500/10 text-purple-400' : ''}
                  icon={Grid}
                >
                  Month
                </Button>
                <Button
                  variant="ghost-dark"
                  size="sm"
                  onClick={() => setView('list')}
                  className={view === 'list' ? 'bg-purple-500/10 text-purple-400' : ''}
                  icon={List}
                >
                  List
                </Button>
              </div>
              <Button variant="primary" icon={Plus}>
                Create Event
              </Button>
            </div>
          </div>

          {/* Calendar Navigation */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost-dark"
                onClick={() => navigateMonth(-1)}
                icon={ChevronLeft}
              />
              <h2 className="text-2xl font-bold">
                {currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </h2>
              <Button
                variant="ghost-dark"
                onClick={() => navigateMonth(1)}
                icon={ChevronRight}
              />
            </div>
          </Card>

          {view === 'month' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                {/* Week Days Header */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center font-semibold text-slate-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      className={`min-h-[120px] rounded-xl p-2 border transition-all ${
                        day.isPadding
                          ? 'bg-transparent border-transparent'
                          : day.isToday
                          ? 'bg-purple-500/10 border-purple-500/30'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => !day.isPadding && handleDrop(e, day.date)}
                    >
                      {!day.isPadding && (
                        <>
                          <div className={`text-sm font-semibold mb-2 ${
                            day.isToday ? 'text-purple-400' : 'text-slate-300'
                          }`}>
                            {day.day}
                          </div>
                          <div className="space-y-1">
                            {day.events.slice(0, 3).map((event) => (
                              <div
                                key={event._id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, event)}
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setShowEventModal(true);
                                }}
                                className="text-xs p-2 rounded bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 cursor-grab hover:from-purple-500/30 hover:to-indigo-500/30 transition-all truncate"
                              >
                                {event.title}
                              </div>
                            ))}
                            {day.events.length > 3 && (
                              <div className="text-xs text-slate-400 pl-2">
                                +{day.events.length - 3} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'list' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <div className="space-y-4">
                  {events
                    .filter(event => new Date(event.date).getMonth() === currentDate.getMonth())
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((event, index) => (
                      <motion.div
                        key={event._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventModal(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{event.title}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                event.isApproved
                                  ? 'bg-green-500/10 text-green-400'
                                  : 'bg-yellow-500/10 text-yellow-400'
                              }`}>
                                {event.isApproved ? 'Approved' : 'Pending'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                <span>{formatDate(event.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(event.time)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{event.venue?.city}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{event.attendees?.length || 0}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost-dark" size="sm" icon={MoreVertical} />
                        </div>
                      </motion.div>
                    ))}
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-2xl p-8 max-w-lg w-full border border-slate-700"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">{selectedEvent.title}</h3>
                <p className="text-slate-400">{selectedEvent.category}</p>
              </div>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <MoreVertical className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm text-slate-400">Date</p>
                  <p className="font-medium">{formatDate(selectedEvent.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm text-slate-400">Time</p>
                  <p className="font-medium">{formatTime(selectedEvent.time)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm text-slate-400">Venue</p>
                  <p className="font-medium">{selectedEvent.venue?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm text-slate-400">Attendees</p>
                  <p className="font-medium">{selectedEvent.attendees?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="primary" className="flex-1">
                View Details
              </Button>
              <Button variant="secondary" onClick={() => setShowEventModal(false)}>
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
