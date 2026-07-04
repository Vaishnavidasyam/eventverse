const express = require('express');
const { body, validationResult } = require('express-validator');
const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Generate unique booking ID
const generateBookingId = () => {
  return 'EVT' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 7).toUpperCase();
};

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (User)
router.post('/', protect, authorize('user'), [
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('ticketType').notEmpty().withMessage('Ticket type is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('seats').isArray().withMessage('Seats must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId, ticketType, quantity, seats, couponCode } = req.body;

    // Get event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check availability
    const ticketTypeInfo = event.ticketTypes.find(t => t.name === ticketType);
    if (!ticketTypeInfo) {
      return res.status(400).json({ message: 'Invalid ticket type' });
    }

    if (ticketTypeInfo.available < quantity) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }

    // Calculate price
    let totalPrice = ticketTypeInfo.price * quantity;
    let discountApplied = 0;

    // Apply coupon if provided
    if (couponCode === 'SAVE10') {
      discountApplied = totalPrice * 0.1;
      totalPrice -= discountApplied;
    }

    // Generate booking ID
    const bookingId = generateBookingId();

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      event: eventId,
      ticketType,
      quantity,
      totalPrice,
      seats,
      bookingId,
      discountApplied,
      couponCode,
      paymentStatus: 'completed',
      paymentMethod: 'razorpay',
      status: 'confirmed'
    });

    // Generate QR Code
    const qrCodeData = `${bookingId}|${req.user.id}|${eventId}`;
    const qrCode = await QRCode.toDataURL(qrCodeData);
    booking.qrCode = qrCode;
    await booking.save();

    // Update event availability
    ticketTypeInfo.available -= quantity;
    event.availableSeats -= quantity;
    event.totalRevenue += totalPrice;
    await event.save();

    // Add user to event attendees
    if (!event.attendees.includes(req.user.id)) {
      event.attendees.push(req.user.id);
      await event.save();
    }

    // Create notification
    await Notification.create({
      recipient: req.user.id,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: `Your booking for ${event.title} has been confirmed. Booking ID: ${bookingId}`,
      relatedEvent: eventId,
      relatedBooking: booking._id
    });

    res.status(201).json({
      success: true,
      booking,
      message: 'Booking successful'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bookings
// @desc    Get user's bookings (for users) or organizer's event bookings (for organizers)
// @access  Private (User, Organizer)
router.get('/', protect, async (req, res) => {
  try {
    let bookings;
    
    if (req.user.role === 'organizer') {
      // For organizers, get bookings for their events
      const events = await Event.find({ organizer: req.user.id }).select('_id');
      const eventIds = events.map(e => e._id);
      bookings = await Booking.find({ event: { $in: eventIds } })
        .populate('event')
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // For users, get their own bookings
      bookings = await Booking.find({ user: req.user.id })
        .populate('event')
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private (User)
router.get('/:id', protect, authorize('user'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check ownership
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/bookings/:id/check-in
// @desc    Check-in for an event
// @access  Private (Organizer, Admin)
router.put('/:id/check-in', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.isCheckedIn) {
      return res.status(400).json({ message: 'Already checked in' });
    }

    booking.isCheckedIn = true;
    booking.checkInTime = new Date();
    booking.status = 'checked-in';
    await booking.save();

    res.json({
      success: true,
      message: 'Check-in successful'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel booking
// @access  Private (User)
router.delete('/:id', protect, authorize('user'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check ownership
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    // Update event availability
    const event = await Event.findById(booking.event);
    const ticketType = event.ticketTypes.find(t => t.name === booking.ticketType);
    ticketType.available += booking.quantity;
    event.availableSeats += booking.quantity;
    event.totalRevenue -= booking.totalPrice;
    await event.save();

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bookings/event/:eventId
// @desc    Get all bookings for an event (Organizer)
// @access  Private (Organizer)
router.get('/event/:eventId', protect, authorize('organizer'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view these bookings' });
    }

    const bookings = await Booking.find({ event: req.params.eventId })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
