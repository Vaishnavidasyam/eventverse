const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private (User)
router.get('/dashboard', protect, authorize('user'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's bookings
    const bookings = await Booking.find({ user: userId })
      .populate('event')
      .sort({ createdAt: -1 });

    // Get saved events
    const user = await User.findById(userId).populate('savedEvents');
    const savedEvents = user.savedEvents;

    // Calculate stats
    const totalBookings = bookings.length;
    const totalSpent = bookings
      .filter(b => b.paymentStatus === 'completed')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const upcomingEvents = bookings.filter(b => 
      b.status === 'confirmed' && 
      new Date(b.event.date) > new Date()
    );

    res.json({
      success: true,
      stats: {
        totalBookings,
        totalSpent,
        upcomingEvents: upcomingEvents.length,
        ticketsPurchased: bookings.reduce((sum, b) => sum + b.quantity, 0)
      },
      bookings,
      savedEvents,
      upcomingEvents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users/save-event/:eventId
// @desc    Save an event to wishlist
// @access  Private (User)
router.post('/save-event/:eventId', protect, authorize('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const eventId = req.params.eventId;

    if (!user.savedEvents.includes(eventId)) {
      user.savedEvents.push(eventId);
      await user.save();
    }

    res.json({ success: true, message: 'Event saved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/users/save-event/:eventId
// @desc    Remove event from wishlist
// @access  Private (User)
router.delete('/save-event/:eventId', protect, authorize('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.savedEvents = user.savedEvents.filter(id => id.toString() !== req.params.eventId);
    await user.save();

    res.json({ success: true, message: 'Event removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/analytics
// @desc    Get user analytics data
// @access  Private (User)
router.get('/analytics', protect, authorize('user'), async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId }).populate('event');

    // Monthly spending
    const monthlySpending = {};
    bookings.forEach(booking => {
      if (booking.paymentStatus === 'completed') {
        const month = new Date(booking.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlySpending[month] = (monthlySpending[month] || 0) + booking.totalPrice;
      }
    });

    // Event categories attended
    const categories = {};
    bookings.forEach(booking => {
      if (booking.event) {
        categories[booking.event.category] = (categories[booking.event.category] || 0) + 1;
      }
    });

    // Booking trends
    const bookingTrends = bookings.map(b => ({
      date: b.createdAt,
      amount: b.totalPrice
    }));

    res.json({
      success: true,
      analytics: {
        monthlySpending,
        categories,
        bookingTrends
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/organizers
// @desc    Get organizers available for chat (from user's booked events + all organizers)
// @access  Private (User)
router.get('/organizers', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ user: userId }).populate('event');
    const eventOrganizerIds = [...new Set(bookings
      .filter(b => b.event?.organizer)
      .map(b => b.event.organizer.toString())
    )];

    const organizers = await User.find({
      role: 'organizer',
      _id: { $in: eventOrganizerIds }
    }).select('name email');

    res.json({ success: true, organizers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
