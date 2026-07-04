import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter, CheckCircle, XCircle, Clock, Users, Download, QrCode, RefreshCw, MoreVertical, Eye, Mail, Phone } from 'lucide-react';
import { bookingsAPI, eventsAPI } from '../lib/api';
import { formatCurrency, formatDateTime } from '../lib/utils';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const AttendeeManagementPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [checkingIn, setCheckingIn] = useState(null);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventRes, bookingsRes] = await Promise.all([
        eventsAPI.getById(eventId),
        bookingsAPI.getByEvent(eventId)
      ]);
      setEvent(eventRes.data.event);
      setBookings(bookingsRes.data.bookings || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load attendee data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      setCheckingIn(bookingId);
      await bookingsAPI.checkIn(bookingId);
      toast.success('Check-in successful!');
      fetchData();
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error(error.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckingIn(null);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.bookingId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'checked-in' && booking.isCheckedIn) ||
      (filterStatus === 'pending' && !booking.isCheckedIn);
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bookings.length,
    checkedIn: bookings.filter(b => b.isCheckedIn).length,
    pending: bookings.filter(b => !b.isCheckedIn).length,
    revenue: bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
  };

  const handleViewQR = (booking) => {
    setSelectedBooking(booking);
    setShowQRModal(true);
  };

  const handleExport = () => {
    const csv = [
      ['Booking ID', 'Name', 'Email', 'Phone', 'Ticket Type', 'Quantity', 'Total Price', 'Status', 'Check-in Time'].join(','),
      ...filteredBookings.map(b => [
        b.bookingId,
        b.user?.name || '',
        b.user?.email || '',
        b.user?.phone || '',
        b.ticketType,
        b.quantity,
        b.totalPrice,
        b.isCheckedIn ? 'Checked In' : 'Pending',
        b.checkInTime ? formatDateTime(b.checkInTime) : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendees-${event?.title || 'event'}-${Date.now()}.csv`;
    link.click();
    toast.success('Attendee list exported!');
  };

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
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-bg-hover rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold mb-1">Attendee Management</h1>
              <p className="text-text-muted">{event?.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchData}
              icon={RefreshCw}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              icon={Download}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.total}</p>
            <p className="text-text-muted text-sm">Total Attendees</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.checkedIn}</p>
            <p className="text-text-muted text-sm">Checked In</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.pending}</p>
            <p className="text-text-muted text-sm">Pending Check-in</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <QrCode className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{formatCurrency(stats.revenue)}</p>
            <p className="text-text-muted text-sm">Total Revenue</p>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search by name, email, or booking ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg bg-bg-card border border-card-border focus:border-primary focus:outline-none text-sm text-text-primary"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-lg bg-bg-card border border-card-border focus:border-primary focus:outline-none text-sm text-text-primary"
              >
                <option value="all">All Status</option>
                <option value="checked-in">Checked In</option>
                <option value="pending">Pending Check-in</option>
              </select>
            </div>
          </Card>
        </motion.div>

        {/* Attendees List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Attendees ({filteredBookings.length})</h2>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No attendees found</h3>
                <p className="text-text-muted">No bookings match your search criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking, index) => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card-light p-4 hover:border-text-muted transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                            {booking.user?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-text-primary">{booking.user?.name || 'Unknown'}</h3>
                            <p className="text-sm text-text-muted">{booking.bookingId}</p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            booking.isCheckedIn
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                          }`}>
                            {booking.isCheckedIn ? 'Checked In' : 'Pending'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                          <div className="flex items-center gap-2 text-text-secondary">
                            <Mail className="h-4 w-4 text-text-muted" />
                            <span>{booking.user?.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-text-secondary">
                            <Phone className="h-4 w-4 text-text-muted" />
                            <span>{booking.user?.phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-purple-400">
                            <Users className="h-4 w-4" />
                            <span>{booking.quantity}x {booking.ticketType}</span>
                          </div>
                        </div>

                        {booking.checkInTime && (
                          <p className="text-sm text-green-400">
                            Checked in at {formatDateTime(booking.checkInTime)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewQR(booking)}
                          icon={QrCode}
                        >
                          QR
                        </Button>
                        {!booking.isCheckedIn && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleCheckIn(booking._id)}
                            loading={checkingIn === booking._id}
                            icon={CheckCircle}
                          >
                            Check In
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* QR Code Modal */}
      {showQRModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-secondary rounded-2xl p-8 max-w-md w-full border border-card-border"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-primary">Attendee QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 hover:bg-bg-hover rounded-lg transition-colors text-text-muted"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="bg-white rounded-xl p-6 inline-block mb-4">
                {selectedBooking.qrCode ? (
                  <img src={selectedBooking.qrCode} alt="QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-bg-card">
                    <QrCode className="h-16 w-16 text-text-muted" />
                  </div>
                )}
              </div>
              <p className="font-mono text-lg font-bold text-text-primary">{selectedBooking.bookingId}</p>
              <p className="text-sm text-text-muted mt-1">{selectedBooking.user?.name}</p>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={() => {
                  if (!selectedBooking.isCheckedIn) {
                    handleCheckIn(selectedBooking._id);
                    setShowQRModal(false);
                  }
                }}
                disabled={selectedBooking.isCheckedIn}
                icon={CheckCircle}
                className="w-full"
              >
                {selectedBooking.isCheckedIn ? 'Already Checked In' : 'Check In'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowQRModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AttendeeManagementPage;
