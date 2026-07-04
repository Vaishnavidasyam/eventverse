import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Ticket, DollarSign, Heart, Download, QrCode, Bell, TrendingUp, Clock, MapPin, Users, ArrowRight, Sparkles } from 'lucide-react';
import { usersAPI, bookingsAPI, eventsAPI } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const UserDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Try to get dashboard data from users API
      try {
        const response = await usersAPI.getDashboard();
        setStats(response.data.stats);
        setBookings(response.data.bookings || []);
        setSavedEvents(response.data.savedEvents || []);
      } catch (userError) {
        console.warn('Users dashboard API not available, fetching separately:', userError);
        // Fallback: fetch bookings and events separately
        try {
          const bookingsRes = await bookingsAPI.getAll();
          setBookings(bookingsRes.data.bookings || []);
        } catch (bookingError) {
          console.warn('Bookings API not available:', bookingError);
        }
      }

      // Fetch upcoming events from backend
      try {
        const eventsRes = await eventsAPI.getAll();
        setUpcomingEvents(eventsRes.data.events?.slice(0, 6) || []);
      } catch (eventError) {
        console.warn('Events API error:', eventError);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Concerts', value: 30 },
    { name: 'Workshops', value: 20 },
    { name: 'Festivals', value: 25 },
    { name: 'Conferences', value: 15 },
    { name: 'Others', value: 10 },
  ];

  const COLORS = ['#818cf8', '#c084fc', '#f472b6', '#34d399', '#fbbf24'];

  const spendingData = [
    { month: 'Jan', amount: 15000 },
    { month: 'Feb', amount: 23000 },
    { month: 'Mar', amount: 18000 },
    { month: 'Apr', amount: 32000 },
    { month: 'May', amount: 29000 },
    { month: 'Jun', amount: 41000 },
  ];

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Welcome Back!
              </h1>
              <p className="text-slate-300 text-lg">Here's what's happening with your events</p>
            </div>
            <Button variant="primary" icon={Sparkles}>
              Explore Events
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{bookings.length}</span>
            </div>
            <p className="text-slate-300 text-sm font-medium">Events Booked</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{bookings.reduce((sum, b) => sum + (b.quantity || 0), 0)}</span>
            </div>
            <p className="text-slate-300 text-sm font-medium">Tickets Owned</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{formatCurrency(bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0))}</span>
            </div>
            <p className="text-slate-300 text-sm font-medium">Money Spent</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats?.rewardsPoints || 2450}</span>
            </div>
            <p className="text-slate-300 text-sm font-medium">Rewards Points</p>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
                  <Button variant="ghost-dark" size="sm" icon={ArrowRight} iconPosition="right">
                    View All
                  </Button>
                </div>
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No upcoming events</p>
                    <Button variant="primary" className="mt-4" icon={Sparkles}>
                      <span className="text-white">Discover Events</span>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {upcomingEvents.slice(0, 3).map((event) => (
                      <div key={event._id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-8 w-8 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white mb-1 truncate">{event.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-white">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatDate(event.date)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{event.venue?.city}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white">{formatCurrency(event.ticketTypes?.[0]?.price || 0)}</p>
                            <p className="text-xs text-white">{event.ticketTypes?.[0]?.name || 'General'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* My Bookings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">My Bookings</h2>
                  <Button variant="ghost-dark" size="sm" icon={ArrowRight} iconPosition="right">
                    View All
                  </Button>
                </div>
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Ticket className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No bookings yet</p>
                    <Button variant="primary" className="mt-4" icon={Sparkles}>
                      Book Your First Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.slice(0, 4).map((booking) => (
                      <div key={booking._id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-2">{booking.event?.title || 'Unknown Event'}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(booking.event?.date)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{booking.quantity} × {booking.ticketType}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                              </span>
                              {booking.qrCode && (
                                <Button variant="secondary" size="sm" icon={QrCode}>
                                  View QR
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-2xl font-bold text-purple-400">{formatCurrency(booking.totalPrice)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Spending Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-bold text-white mb-6">Spending Overview</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={spendingData}>
                    <defs>
                      <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" />
                    <YAxis stroke="rgba(255,255,255,0.3)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorSpending)" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Saved Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Saved Events</h2>
                  <Heart className="h-5 w-5 text-pink-400" />
                </div>
                {savedEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-8 w-8 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">No saved events yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedEvents.slice(0, 4).map((event) => (
                      <div key={event._id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-pink-500/50 transition-all cursor-pointer">
                        <h3 className="font-medium text-white text-sm truncate">{event.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">{formatDate(event.date)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Categories Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-bold text-white mb-6">Event Categories</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {chartData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-slate-400">{item.name}</span>
                      </div>
                      <span className="font-medium text-white">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
