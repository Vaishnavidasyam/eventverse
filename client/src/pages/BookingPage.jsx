import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, CreditCard, ArrowLeft, Check, Download, Share2, Ticket, QrCode, ChevronRight, ChevronLeft } from 'lucide-react';
import { eventsAPI, bookingsAPI } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import QRCode from 'react-qr-code';

const BookingPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [booking, setBooking] = useState({
    ticketType: '',
    quantity: 1,
    seats: [],
    couponCode: '',
  });
  const [processing, setProcessing] = useState(false);
  const [completedBooking, setCompletedBooking] = useState(null);

  const steps = [
    { id: 1, title: 'Select Tickets', icon: Ticket },
    { id: 2, title: 'Review Order', icon: Users },
    { id: 3, title: 'Payment', icon: CreditCard },
    { id: 4, title: 'Confirmation', icon: Check },
  ];

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getById(eventId);
      setEvent(response.data.event);
      if (response.data.event.ticketTypes?.length > 0) {
        setBooking({ ...booking, ticketType: response.data.event.ticketTypes[0].name });
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const selectedTicket = event?.ticketTypes?.find(t => t.name === booking.ticketType);

  const calculateTotal = () => {
    if (!selectedTicket) return 0;
    let total = selectedTicket.price * booking.quantity;
    if (booking.couponCode === 'SAVE10') {
      total *= 0.9;
    }
    return total;
  };

  const calculateDiscount = () => {
    if (!selectedTicket) return 0;
    if (booking.couponCode === 'SAVE10') {
      return selectedTicket.price * booking.quantity * 0.1;
    }
    return 0;
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const bookingData = {
        eventId,
        ticketType: booking.ticketType,
        quantity: booking.quantity,
        seats: booking.seats.slice(0, booking.quantity),
        couponCode: booking.couponCode,
      };

      const response = await bookingsAPI.create(bookingData);
      setCompletedBooking(response.data.booking);
      toast.success('Booking successful!');
      handleNext();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadQR = () => {
    if (completedBooking?.qrCode) {
      const link = document.createElement('a');
      link.href = completedBooking.qrCode;
      link.download = `ticket-${completedBooking.bookingId}.png`;
      link.click();
      toast.success('QR Code downloaded!');
    }
  };

  const handleShare = async () => {
    if (navigator.share && completedBooking) {
      try {
        await navigator.share({
          title: `Booking for ${event?.title}`,
          text: `I've booked ${booking.quantity} tickets for ${event?.title}!`,
          url: window.location.href,
        });
      } catch (err) {
        toast.error('Failed to share');
      }
    } else {
      toast.error('Sharing not supported on this browser');
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Event not found</p>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-6">Book Tickets</h1>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        currentStep >= step.id
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                    </div>
                    <span className="text-xs mt-2 text-slate-400 hidden sm:block">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 rounded-full ${
                        currentStep > step.id ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-slate-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Event Summary Card */}
          <Card className="mb-6 glass">
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-4xl flex-shrink-0">
                🎉
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{event.title}</h2>
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.venue?.name}, {event.venue?.city}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 text-lg">Select Tickets</h3>

                  {/* Ticket Type */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3 text-slate-300">Ticket Type</label>
                    <div className="space-y-3">
                      {event.ticketTypes?.map((ticket) => (
                        <button
                          key={ticket.name}
                          onClick={() => setBooking({ ...booking, ticketType: ticket.name })}
                          className={`w-full p-4 rounded-xl border-2 transition-all ${
                            booking.ticketType === ticket.name
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">{ticket.name}</p>
                              <p className="text-sm text-slate-400">{ticket.available} available</p>
                            </div>
                            <p className="font-bold text-lg">{formatCurrency(ticket.price)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3 text-slate-300">Quantity</label>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => setBooking({ ...booking, quantity: Math.max(1, booking.quantity - 1) })}
                        className="w-12 h-12"
                      >
                        -
                      </Button>
                      <span className="text-3xl font-bold w-16 text-center">{booking.quantity}</span>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => setBooking({ ...booking, quantity: Math.min(selectedTicket?.available || 1, booking.quantity + 1) })}
                        className="w-12 h-12"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Coupon Code */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3 text-slate-300">Coupon Code (Optional)</label>
                    <input
                      type="text"
                      value={booking.couponCode}
                      onChange={(e) => setBooking({ ...booking, couponCode: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="Enter coupon code"
                    />
                    {booking.couponCode === 'SAVE10' && (
                      <p className="text-sm text-green-400 mt-2">✓ 10% discount applied!</p>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 text-lg">Review Order</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between py-3 border-b border-slate-700">
                      <span className="text-slate-400">Event</span>
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-700">
                      <span className="text-slate-400">Ticket Type</span>
                      <span className="font-medium">{booking.ticketType}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-700">
                      <span className="text-slate-400">Quantity</span>
                      <span className="font-medium">{booking.quantity}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-700">
                      <span className="text-slate-400">Price per ticket</span>
                      <span className="font-medium">{selectedTicket ? formatCurrency(selectedTicket.price) : '-'}</span>
                    </div>
                    {calculateDiscount() > 0 && (
                      <div className="flex justify-between py-3 border-b border-slate-700 text-green-400">
                        <span>Discount</span>
                        <span>-{formatCurrency(calculateDiscount())}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        {formatCurrency(calculateTotal())}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 text-lg">Payment</h3>
                  
                  <div className="space-y-3 mb-6">
                    <button className="w-full p-4 rounded-xl border-2 border-purple-500 bg-purple-500/10 flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-purple-400" />
                      <span className="font-medium">Razorpay</span>
                      <Check className="h-5 w-5 text-purple-400 ml-auto" />
                    </button>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Amount to Pay</span>
                      <span className="text-2xl font-bold">{formatCurrency(calculateTotal())}</span>
                    </div>
                    <p className="text-sm text-slate-500">Secure payment powered by Razorpay</p>
                  </div>
                </Card>
              </motion.div>
            )}

            {currentStep === 4 && completedBooking && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <Check className="h-10 w-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">Booking Confirmed!</h3>
                  <p className="text-slate-400 mb-6">Your tickets have been booked successfully</p>

                  <div className="bg-slate-800/50 rounded-xl p-6 mb-6 max-w-sm mx-auto">
                    <div className="mb-4">
                      <QRCode
                        value={completedBooking.qrCode || completedBooking.bookingId}
                        size={200}
                        className="mx-auto"
                      />
                    </div>
                    <p className="font-mono text-lg font-bold">{completedBooking.bookingId}</p>
                    <p className="text-sm text-slate-400 mt-1">Show this QR code at the venue</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="secondary"
                      onClick={handleDownloadQR}
                      icon={Download}
                    >
                      Download QR
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleShare}
                      icon={Share2}
                    >
                      Share
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => navigate('/dashboard')}
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-6">
              <Button
                variant="secondary"
                onClick={handleBack}
                disabled={currentStep === 1}
                icon={ChevronLeft}
                iconPosition="left"
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={currentStep === 3 ? handlePayment : handleNext}
                disabled={!selectedTicket || processing}
                loading={processing}
                icon={ChevronRight}
                iconPosition="right"
              >
                {currentStep === 3 ? `Pay ${formatCurrency(calculateTotal())}` : 'Continue'}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BookingPage;
