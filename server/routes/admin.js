const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const Vendor = require('../models/Vendor');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard analytics
// @access  Private (Admin)
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOrganizers = await User.countDocuments({ role: 'organizer' });
    const totalEvents = await Event.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalVendors = await Vendor.countDocuments();

    // Calculate total revenue
    const events = await Event.find();
    const totalRevenue = events.reduce((sum, event) => sum + (event.totalRevenue || 0), 0);

    // Get pending approvals
    const pendingEvents = await Event.countDocuments({ isApproved: false });
    const pendingVendors = await Vendor.countDocuments({ isVerified: false });

    // User growth (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Popular categories
    const categoryStats = {};
    const allEvents = await Event.find({ isApproved: true });
    allEvents.forEach(event => {
      categoryStats[event.category] = (categoryStats[event.category] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrganizers,
        totalEvents,
        totalBookings,
        totalVendors,
        totalRevenue,
        pendingEvents,
        pendingVendors,
        newUsers,
        growthRate: ((newUsers / totalUsers) * 100).toFixed(2)
      },
      categoryStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/block
// @desc    Block/unblock user
// @access  Private (Admin)
router.put('/users/:id/block', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: user.isBlocked ? 'User blocked successfully' : 'User unblocked successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Verify user
// @access  Private (Admin)
router.put('/users/:id/verify', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    res.json({
      success: true,
      message: 'User verified successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/organizers
// @desc    Get all organizers
// @access  Private (Admin)
router.get('/organizers', protect, authorize('admin'), async (req, res) => {
  try {
    const organizers = await User.find({ role: 'organizer' }).sort({ createdAt: -1 });

    res.json({
      success: true,
      organizers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/organizers/:id/approve
// @desc    Approve organizer
// @access  Private (Admin)
router.put('/organizers/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const organizer = await User.findById(req.params.id);

    if (!organizer || organizer.role !== 'organizer') {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    organizer.isVerified = true;
    await organizer.save();

    res.json({
      success: true,
      message: 'Organizer approved successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/events
// @desc    Get all events for admin
// @access  Private (Admin)
router.get('/events', protect, authorize('admin'), async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      events
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/events/:id/approve
// @desc    Approve event
// @access  Private (Admin)
router.put('/events/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.isApproved = true;
    await event.save();

    res.json({
      success: true,
      message: 'Event approved successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/events/:id
// @desc    Remove event
// @access  Private (Admin)
router.delete('/events/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event removed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/vendors
// @desc    Get all vendors for admin
// @access  Private (Admin)
router.get('/vendors', protect, authorize('admin'), async (req, res) => {
  try {
    const vendors = await Vendor.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      vendors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/vendors/:id/verify
// @desc    Verify vendor
// @access  Private (Admin)
router.put('/vendors/:id/verify', protect, authorize('admin'), async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.isVerified = true;
    await vendor.save();

    res.json({
      success: true,
      message: 'Vendor verified successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/reports
// @desc    Get platform reports
// @access  Private (Admin)
router.get('/reports', protect, authorize('admin'), async (req, res) => {
  try {
    const { type, period } = req.query;

    let data = {};

    if (type === 'revenue') {
      const events = await Event.find();
      data.revenueByEvent = events.map(e => ({
        title: e.title,
        revenue: e.totalRevenue
      }));
    }

    if (type === 'attendance') {
      const events = await Event.find().populate('attendees');
      data.attendanceByEvent = events.map(e => ({
        title: e.title,
        attendees: e.attendees.length,
        capacity: e.totalSeats
      }));
    }

    if (type === 'bookings') {
      const bookings = await Booking.find();
      data.bookingsByMonth = {};
      bookings.forEach(b => {
        const month = new Date(b.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
        data.bookingsByMonth[month] = (data.bookingsByMonth[month] || 0) + 1;
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
