import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Calendar, Users, DollarSign, TrendingUp, TrendingDown, MoreVertical, Edit, Trash2, Eye, ArrowUpRight, ArrowDownRight, Filter, Search } from 'lucide-react';
import { eventsAPI } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalAttendees, setTotalAttendees] = useState(0);

  useEffect(() => {
    fetchEvents();
    fetchRevenueData();
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

  const fetchRevenueData = async () => {
    try {
      const response = await eventsAPI.getRevenue();
      setRevenueData(response.data.revenueData || []);
      setCategoryData(response.data.categoryData || []);
      setTotalRevenue(response.data.totalRevenue || 0);
      setTotalAttendees(response.data.totalAttendees || 0);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      // Set default empty data if API fails
      setRevenueData([]);
      setCategoryData([]);
    }
  };

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length;
  const completedEvents = events.filter(e => new Date(e.date) < new Date()).length;

  const filteredEvents = events.filter(event => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'upcoming' && new Date(event.date) >= new Date()) ||
      (filterStatus === 'completed' && new Date(event.date) < new Date());
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleDeleteEvent = async (eventId) => {
    try {
      await eventsAPI.delete(eventId);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Organizer Dashboard</h1>
          <p className="text-text-muted">Manage your events and track performance</p>
        </div>
        <Button
          onClick={() => navigate('/create-event')}
          icon={Plus}
        >
          Create Event
        </Button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center text-green-400 text-sm">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+12%</span>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{events.length}</p>
          <p className="text-text-muted text-sm">Total Events</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center text-green-400 text-sm">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+8%</span>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{totalAttendees}</p>
          <p className="text-text-muted text-sm">Total Attendees</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center text-green-400 text-sm">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+24%</span>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{formatCurrency(totalRevenue)}</p>
          <p className="text-text-muted text-sm">Total Revenue</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center text-red-400 text-sm">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              <span>-3%</span>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{upcomingEvents}</p>
          <p className="text-text-muted text-sm">Upcoming Events</p>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#818cf8" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Events by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                    <span className="text-text-secondary">{item.name}</span>
                  </div>
                  <span className="font-semibold text-text-primary">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Events List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold">My Events</h2>
            <div className="flex items-center gap-3">
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
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-text-muted mb-4">Create your first event to get started</p>
              <Button onClick={() => navigate('/create-event')} icon={Plus}>
                Create Event
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event._id} className="glass-card-light p-4 hover:border-text-muted transition-colors">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-lg text-text-primary">{event.title}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          event.isApproved 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {event.isApproved ? 'Approved' : 'Pending'}
                        </span>
                        {new Date(event.date) >= new Date() && (
                          <span className="text-xs px-3 py-1 rounded-full font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Upcoming
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-muted mb-3">{formatDate(event.date)} • {event.venue?.city}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-purple-400">
                          <Users className="h-4 w-4" />
                          <span>{event.attendees?.length || 0} attendees</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-400">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatCurrency(event.totalRevenue || 0)} revenue</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-muted">
                          <Calendar className="h-4 w-4" />
                          <span>{event.availableSeats || 0} seats left</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
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
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this event?')) {
                            handleDeleteEvent(event._id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default OrganizerDashboard;
