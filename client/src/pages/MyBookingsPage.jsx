import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Download, Share2, X, ArrowRight, Ticket, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { bookingsAPI } from '../lib/api';
import { formatCurrency, formatDate, formatDateTime } from '../lib/utils';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import QRCode from 'react-qr-code';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getAll();
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = (booking) => {
    if (booking.qrCode) {
      const link = document.createElement('a');
      link.href = booking.qrCode;
      link.download = `ticket-${booking.bookingId}.png`;
      link.click();
      toast.success('QR Code downloaded!');
    }
  };

  const handleShare = async (booking) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Booking for ${booking.event?.title}`,
          text: `I've booked ${booking.quantity} tickets for ${booking.event?.title}!`,
          url: window.location.href,
        });
      } catch (err) {
        toast.error('Failed to share');
      }
    } else {
      toast.error('Sharing not supported on this browser');
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      setCancelling(true);
      await bookingsAPI.cancel(selectedBooking._id);
      toast.success('Booking cancelled successfully');
      setShowCancelModal(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleTransfer = (booking) => {
    toast.info('Transfer feature coming soon!');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'checked-in':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'checked-in':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
  };

  const isEventUpcoming = (eventDate) => {
    return new Date(eventDate) > new Date();
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
              <p className="text-text-muted">Manage your event tickets</p>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-2 rounded-full bg-slate-800 text-slate-300">
                {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
              </span>
            </div>
          </div>

          {bookings.length === 0 ? (
            <Card className="p-12 text-center">
              <Ticket className="h-16 w-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-slate-400 mb-6">Start exploring events and book your first ticket!</p>
              <Button onClick={() => navigate('/events')}>
                Browse Events
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                      {/* Event Image/Icon */}
                      <div className="lg:w-48 bg-gradient-to-br from-purple-600 to-blue-600 p-6 flex items-center justify-center">
                        <div className="text-6xl">🎉</div>
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{booking.event?.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(booking.status)}
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                              </span>
                              <span>•</span>
                              <span className="font-mono">{booking.bookingId}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                              {formatCurrency(booking.totalPrice)}
                            </p>
                            <p className="text-sm text-slate-400">{booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 text-purple-400" />
                            <span className="text-slate-300">{formatDate(booking.event?.date)}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <MapPin className="h-4 w-4 text-purple-400" />
                            <span className="text-slate-300">{booking.event?.venue?.name}, {booking.event?.venue?.city}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <Ticket className="h-4 w-4 text-purple-400" />
                            <span className="text-slate-300">{booking.ticketType}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <Clock className="h-4 w-4 text-purple-400" />
                            <span className="text-slate-300">Booked on {formatDateTime(booking.createdAt)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowQRModal(true);
                            }}
                            icon={Ticket}
                          >
                            View Ticket
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDownloadQR(booking)}
                            icon={Download}
                          >
                            Download
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleShare(booking)}
                            icon={Share2}
                          >
                            Share
                          </Button>
                          {booking.status === 'confirmed' && isEventUpcoming(booking.event?.date) && (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleTransfer(booking)}
                                icon={ArrowRight}
                              >
                                Transfer
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowCancelModal(true);
                                }}
                                icon={X}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost-dark"
                            size="sm"
                            onClick={() => navigate(`/events/${booking.event?._id}`)}
                          >
                            View Event
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-slate-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Your Ticket</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="bg-white rounded-xl p-4 inline-block mb-4">
                <QRCode
                  value={selectedBooking.qrCode || selectedBooking.bookingId}
                  size={200}
                />
              </div>
              <p className="font-mono text-lg font-bold">{selectedBooking.bookingId}</p>
              <p className="text-sm text-slate-400 mt-1">Show this QR code at the venue</p>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={() => handleDownloadQR(selectedBooking)}
                icon={Download}
                className="w-full"
              >
                Download QR Code
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleShare(selectedBooking)}
                icon={Share2}
                className="w-full"
              >
                Share Ticket
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-slate-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Cancel Booking</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                <p className="text-red-400 font-medium">This action cannot be undone</p>
              </div>

              <p className="text-slate-300 mb-2">
                Are you sure you want to cancel your booking for:
              </p>
              <p className="font-semibold mb-4">{selectedBooking.event?.title}</p>

              <div className="bg-slate-800 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Booking ID</span>
                  <span className="font-mono">{selectedBooking.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tickets</span>
                  <span>{selectedBooking.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Refund Amount</span>
                  <span className="text-green-400 font-semibold">{formatCurrency(selectedBooking.totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowCancelModal(false)}
                className="flex-1"
              >
                Keep Booking
              </Button>
              <Button
                variant="danger"
                onClick={handleCancelBooking}
                loading={cancelling}
                className="flex-1"
              >
                Cancel Booking
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
