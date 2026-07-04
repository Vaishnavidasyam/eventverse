import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Camera, CheckCircle, XCircle, RefreshCw, AlertCircle, Search, User, Calendar, Clock } from 'lucide-react';
import { bookingsAPI, eventsAPI } from '../lib/api';
import { formatDateTime } from '../lib/utils';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const QRCheckinPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [booking, setBooking] = useState(null);
  const [checkInResult, setCheckInResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
    }
  };

  const startScanning = () => {
    setScanning(true);
    // In production, this would initialize the QR scanner
    // For now, we'll simulate scanning
    toast.info('Camera access required for QR scanning');
  };

  const stopScanning = () => {
    setScanning(false);
  };

  const handleManualCheckIn = async () => {
    if (!manualCode.trim()) {
      toast.error('Please enter a booking ID');
      return;
    }

    if (!selectedEvent) {
      toast.error('Please select an event');
      return;
    }

    setLoading(true);
    try {
      const response = await bookingsAPI.getByBookingId(manualCode);
      const foundBooking = response.data.booking;

      if (!foundBooking) {
        setCheckInResult({ success: false, message: 'Booking not found' });
        toast.error('Booking not found');
        setLoading(false);
        return;
      }

      if (foundBooking.event !== selectedEvent._id) {
        setCheckInResult({ success: false, message: 'Booking does not belong to this event' });
        toast.error('Booking does not belong to this event');
        setLoading(false);
        return;
      }

      if (foundBooking.isCheckedIn) {
        setCheckInResult({ success: false, message: 'Already checked in', booking: foundBooking });
        toast.warning('Already checked in');
        setBooking(foundBooking);
        setLoading(false);
        return;
      }

      // Perform check-in
      await bookingsAPI.checkIn(foundBooking._id);
      setCheckInResult({ success: true, message: 'Check-in successful', booking: foundBooking });
      setBooking(foundBooking);
      toast.success('Check-in successful!');
      setManualCode('');
    } catch (error) {
      console.error('Error checking in:', error);
      setCheckInResult({ success: false, message: error.response?.data?.message || 'Check-in failed' });
      toast.error(error.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleScanResult = async (code) => {
    setManualCode(code);
    await handleManualCheckIn();
  };

  const resetCheckIn = () => {
    setBooking(null);
    setCheckInResult(null);
    setManualCode('');
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">QR Check-in System</h1>
            <p className="text-text-muted">Scan QR codes or enter booking IDs for event check-in</p>
          </div>
        </div>

        {/* Event Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <label className="block text-sm font-medium mb-2 text-text-secondary">Select Event</label>
          <select
            value={selectedEvent?._id || ''}
            onChange={(e) => {
              const event = events.find(ev => ev._id === e.target.value);
              setSelectedEvent(event);
              resetCheckIn();
            }}
            className="w-full px-4 py-3 rounded-xl bg-bg-card border border-card-border focus:border-primary focus:outline-none text-text-primary transition-colors"
          >
            <option value="">Select an event</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title} - {new Date(event.date).toLocaleDateString()}
              </option>
            ))}
          </select>
          </Card>
        </motion.div>

        {selectedEvent && (
          <>
            {/* Scanner Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">QR Scanner</h2>
                {!scanning ? (
                  <Button variant="primary" onClick={startScanning} icon={Camera}>
                    Start Scanner
                  </Button>
                ) : (
                  <Button variant="danger" onClick={stopScanning} icon={XCircle}>
                    Stop Scanner
                  </Button>
                )}
              </div>

              {scanning ? (
                <div className="bg-bg-card/50 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-primary/50">
                  <Camera className="h-16 w-16 text-primary mb-4 animate-pulse" />
                  <p className="text-text-muted text-center">Position QR code within the frame</p>
                  <p className="text-xs text-text-muted mt-2">Camera access required</p>
                </div>
              ) : (
                <div className="bg-bg-card/30 rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px] border border-card-border">
                  <QrCode className="h-12 w-12 text-text-muted mb-4" />
                  <p className="text-text-muted text-center">Scanner inactive</p>
                </div>
              )}
              </Card>
            </motion.div>

            {/* Manual Entry */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Manual Entry</h2>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualCheckIn()}
                    placeholder="Enter booking ID or scan QR code"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-card border border-card-border focus:border-primary focus:outline-none text-text-primary transition-colors"
                  />
                </div>
                <Button
                  onClick={handleManualCheckIn}
                  loading={loading}
                  icon={CheckCircle}
                >
                  Check In
                </Button>
              </div>
              </Card>
            </motion.div>

            {/* Check-in Result */}
            {checkInResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className={`p-6 border-2 ${
                  checkInResult.success
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-red-500/50 bg-red-500/5'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      checkInResult.success
                        ? 'bg-green-500/20'
                        : 'bg-red-500/20'
                    }`}>
                      {checkInResult.success ? (
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${
                        checkInResult.success ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {checkInResult.message}
                      </h3>

                      {booking && (
                        <div className="glass-card-light p-4 mt-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-text-muted" />
                            <div>
                              <p className="text-xs text-text-muted">Name</p>
                              <p className="font-medium text-text-primary">{booking.user?.name || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-text-muted" />
                            <div>
                              <p className="text-xs text-text-muted">Booking ID</p>
                              <p className="font-medium font-mono text-text-primary">{booking.bookingId}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-text-muted" />
                            <div>
                              <p className="text-xs text-text-muted">Ticket Type</p>
                              <p className="font-medium text-text-primary">{booking.ticketType} x {booking.quantity}</p>
                            </div>
                          </div>
                          {booking.isCheckedIn && (
                            <div className="flex items-center gap-3">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <div>
                                <p className="text-xs text-text-muted">Checked In At</p>
                                <p className="font-medium text-green-400">{formatDateTime(booking.checkInTime)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={resetCheckIn}
                      icon={RefreshCw}
                    >
                      Reset
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Recent Check-ins */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Recent Check-ins</h2>
              <div className="space-y-3">
                <div className="glass-card-light p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">John Doe</p>
                      <p className="text-sm text-text-muted">Booking: EVT-12345</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-400">Checked in</p>
                    <p className="text-xs text-text-muted">2 mins ago</p>
                  </div>
                </div>
                <div className="glass-card-light p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">Jane Smith</p>
                      <p className="text-sm text-text-muted">Booking: EVT-12346</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-400">Checked in</p>
                    <p className="text-xs text-text-muted">5 mins ago</p>
                  </div>
                </div>
                <div className="glass-card-light p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">Mike Johnson</p>
                      <p className="text-sm text-text-muted">Booking: EVT-12347</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-400">Checked in</p>
                    <p className="text-xs text-text-muted">8 mins ago</p>
                  </div>
                </div>
              </div>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default QRCheckinPage;
