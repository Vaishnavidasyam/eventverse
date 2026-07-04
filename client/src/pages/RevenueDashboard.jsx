import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Filter, ArrowUpRight, ArrowDownRight, BarChart3, CreditCard, Wallet, Clock } from 'lucide-react';
import { eventsAPI, bookingsAPI } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const RevenueDashboard = () => {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedEvent, setSelectedEvent] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const eventsRes = await eventsAPI.getMyEvents();
      setEvents(eventsRes.data.events || []);
      
      // Try to fetch bookings, but don't fail if endpoint doesn't exist
      try {
        const bookingsRes = await bookingsAPI.getAll();
        setBookings(bookingsRes.data.bookings || []);
      } catch (bookingError) {
        console.warn('Bookings API not available, using event data only:', bookingError);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error('Failed to load events data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate revenue metrics from event data (organizers can't access bookings API)
  const calculateMetrics = () => {
    // Use event.totalRevenue for total revenue
    const totalRevenue = events.reduce((sum, event) => sum + (event.totalRevenue || 0), 0);
    
    // Calculate total attendees/bookings from events
    const totalBookings = events.reduce((sum, event) => sum + (event.attendees?.length || 0), 0);
    
    // Calculate average ticket price from event ticket types
    let totalTicketPrice = 0;
    let totalTicketCount = 0;
    events.forEach(event => {
      if (event.ticketTypes) {
        event.ticketTypes.forEach(ticket => {
          totalTicketPrice += (ticket.price || 0) * (ticket.available || 0);
          totalTicketCount += ticket.available || 0;
        });
      }
    });
    const avgTicketPrice = totalTicketCount > 0 ? totalTicketPrice / totalTicketCount : 0;
    
    // Completed bookings = attendees count
    const completedBookings = totalBookings;
    const cancelledBookings = 0;
    const refundedAmount = 0;

    // Revenue by event
    const revenueByEvent = events.map(event => ({
      name: event.title?.substring(0, 20) || 'Unknown',
      revenue: event.totalRevenue || 0,
      bookings: event.attendees?.length || 0
    }));

    // Revenue by ticket type from events
    const revenueByTicketType = {};
    events.forEach(event => {
      if (event.ticketTypes) {
        event.ticketTypes.forEach(ticket => {
          const revenue = (ticket.price || 0) * (ticket.available || 0);
          revenueByTicketType[ticket.name] = (revenueByTicketType[ticket.name] || 0) + revenue;
        });
      }
    });

    const ticketTypeData = Object.entries(revenueByTicketType).map(([name, value]) => ({
      name,
      value
    }));

    // Monthly revenue data (mock for demo - would need actual booking dates)
    const monthlyRevenue = [
      { month: 'Jan', revenue: totalRevenue * 0.1, bookings: Math.round(totalBookings * 0.1) },
      { month: 'Feb', revenue: totalRevenue * 0.15, bookings: Math.round(totalBookings * 0.15) },
      { month: 'Mar', revenue: totalRevenue * 0.2, bookings: Math.round(totalBookings * 0.2) },
      { month: 'Apr', revenue: totalRevenue * 0.18, bookings: Math.round(totalBookings * 0.18) },
      { month: 'May', revenue: totalRevenue * 0.22, bookings: Math.round(totalBookings * 0.22) },
      { month: 'Jun', revenue: totalRevenue * 0.15, bookings: Math.round(totalBookings * 0.15) },
    ];

    // Payment method distribution (mock - organizers can't access this data)
    const paymentData = [
      { name: 'Razorpay', value: Math.round(totalBookings * 0.7), color: '#818cf8' },
      { name: 'Card', value: Math.round(totalBookings * 0.2), color: '#c084fc' },
      { name: 'UPI', value: Math.round(totalBookings * 0.1), color: '#34d399' }
    ];

    return {
      totalRevenue,
      totalBookings,
      avgTicketPrice,
      completedBookings,
      cancelledBookings,
      refundedAmount,
      revenueByEvent,
      ticketTypeData,
      monthlyRevenue,
      paymentData
    };
  };

  const metrics = calculateMetrics();

  const handleExport = () => {
    const csv = [
      ['Date', 'Event', 'Category', 'Venue', 'Total Revenue', 'Attendees', 'Status'].join(','),
      ...events.map(e => [
        formatDate(e.createdAt),
        e.title,
        e.category,
        e.venue?.city || 'Unknown',
        e.totalRevenue || 0,
        e.attendees?.length || 0,
        e.isApproved ? 'Approved' : 'Pending'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `revenue-report-${Date.now()}.csv`;
    link.click();
    toast.success('Revenue report exported!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
          <h1 className="text-3xl font-bold mb-2">Revenue Dashboard</h1>
          <p className="text-text-muted">Track your event earnings and financial performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-lg bg-bg-card border border-card-border focus:border-primary focus:outline-none text-sm text-text-primary"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            icon={Download}
          >
            Export Report
          </Button>
        </div>
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center text-green-400 text-sm">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+18%</span>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{formatCurrency(metrics.totalRevenue)}</p>
          <p className="text-text-muted text-sm">Total Revenue</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center text-green-400 text-sm">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+12%</span>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{metrics.totalBookings}</p>
          <p className="text-text-muted text-sm">Total Bookings</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center text-green-400 text-sm">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+8%</span>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{formatCurrency(metrics.avgTicketPrice)}</p>
          <p className="text-text-muted text-sm">Avg. Ticket Price</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center text-red-400 text-sm">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              <span>-2%</span>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{metrics.completedBookings}</p>
          <p className="text-text-muted text-sm">Completed Bookings</p>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.monthlyRevenue}>
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
            <h2 className="text-xl font-bold mb-4">Revenue by Event</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.revenueByEvent}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="revenue" fill="#c084fc" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Revenue by Ticket Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.ticketTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.ticketTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#818cf8', '#c084fc', '#f472b6', '#34d399'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {metrics.ticketTypeData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: ['#818cf8', '#c084fc', '#f472b6', '#34d399'][index % 4] }} />
                    <span className="text-text-secondary">{item.name}</span>
                  </div>
                  <span className="font-semibold text-text-primary">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Payment Methods</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.paymentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="value" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Recent Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Recent Events</h2>
          <div className="space-y-4">
            {events.slice(0, 10).map((event) => (
              <div key={event._id} className="flex items-center justify-between py-3 border-b border-card-border last:border-0">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    event.isApproved ? 'bg-green-500/10' : 'bg-yellow-500/10'
                  }`}>
                    {event.isApproved ? (
                      <DollarSign className="h-5 w-5 text-green-400" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{event.title}</p>
                    <p className="text-sm text-text-muted">{event.venue?.city || 'Unknown Location'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    event.isApproved ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {formatCurrency(event.totalRevenue || 0)}
                  </p>
                  <p className="text-sm text-text-muted">{event.attendees?.length || 0} attendees</p>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-center text-text-muted py-8">No events yet. Create your first event to see revenue data.</p>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default RevenueDashboard;
