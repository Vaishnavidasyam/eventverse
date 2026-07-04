const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { protect, authorize, organizerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, city, search, date, minPrice, maxPrice, featured } = req.query;

    let query = { isApproved: true, isActive: true };

    if (category) query.category = category;
    if (city) query['venue.city'] = new RegExp(city, 'i');
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    if (date) {
      const queryDate = new Date(date);
      query.date = {
        $gte: queryDate,
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000)
      };
    }
    if (featured) query.isFeatured = true;

    let events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 });

    // Filter by price
    if (minPrice || maxPrice) {
      events = events.filter(event => {
        const prices = event.ticketTypes.map(t => t.price);
        const minEventPrice = Math.min(...prices);
        const maxEventPrice = Math.max(...prices);
        
        if (minPrice && maxEventPrice < minPrice) return false;
        if (maxPrice && minEventPrice > maxPrice) return false;
        return true;
      });
    }

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/events/categories
// @desc    Get event categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { name: 'wedding', icon: '💒', count: 0 },
      { name: 'birthday', icon: '🎂', count: 0 },
      { name: 'concert', icon: '🎵', count: 0 },
      { name: 'conference', icon: '🎤', count: 0 },
      { name: 'workshop', icon: '📚', count: 0 },
      { name: 'festival', icon: '🎪', count: 0 },
      { name: 'sports', icon: '⚽', count: 0 },
      { name: 'corporate', icon: '💼', count: 0 }
    ];

    for (let cat of categories) {
      cat.count = await Event.countDocuments({ 
        category: cat.name, 
        isApproved: true, 
        isActive: true 
      });
    }

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/events/featured
// @desc    Get featured events
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const events = await Event.find({ 
      isFeatured: true, 
      isApproved: true, 
      isActive: true 
    })
      .populate('organizer', 'name email')
      .sort({ date: 1 })
      .limit(10);

    res.json({
      success: true,
      events
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email phone')
      .populate('vendors')
      .populate('reviews');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private (Organizer, Admin)
router.post('/', protect, organizerOrAdmin, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('venue.name').notEmpty().withMessage('Venue name is required'),
  body('venue.address').notEmpty().withMessage('Venue address is required'),
  body('venue.city').notEmpty().withMessage('Venue city is required'),
  body('venue.capacity').isNumeric().withMessage('Venue capacity must be a number'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('totalSeats').isNumeric().withMessage('Total seats must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    console.log('Received event data:', JSON.stringify(req.body, null, 2));

    const eventData = {
      ...req.body,
      organizer: req.user.id,
      availableSeats: req.body.totalSeats
    };

    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Organizer, Admin)
router.put('/:id', protect, organizerOrAdmin, async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Organizer, Admin)
router.delete('/:id', protect, organizerOrAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/events/organizer/my-events
// @desc    Get organizer's events
// @access  Private (Organizer)
router.get('/organizer/my-events', protect, authorize('organizer'), async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      events
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/events/organizer/revenue
// @desc    Get organizer's revenue analytics
// @access  Private (Organizer)
router.get('/organizer/revenue', protect, authorize('organizer'), async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    
    const events = await Event.find({ organizer: req.user.id });
    const eventIds = events.map(e => e._id);
    
    // Get all bookings for organizer's events
    const bookings = await Booking.find({ 
      event: { $in: eventIds },
      paymentStatus: 'completed',
      status: { $ne: 'cancelled' }
    }).populate('event');

    // Calculate monthly revenue
    const monthlyRevenue = {};
    const monthlyBookings = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = months[d.getMonth()];
      monthlyRevenue[monthKey] = 0;
      monthlyBookings[monthKey] = 0;
    }

    bookings.forEach(booking => {
      const date = new Date(booking.createdAt);
      const monthKey = months[date.getMonth()];
      if (monthlyRevenue.hasOwnProperty(monthKey)) {
        monthlyRevenue[monthKey] += booking.totalPrice;
        monthlyBookings[monthKey] += 1;
      }
    });

    const revenueData = Object.keys(monthlyRevenue).map(month => ({
      month,
      revenue: monthlyRevenue[month],
      bookings: monthlyBookings[month]
    }));

    // Calculate category distribution
    const categoryStats = {};
    events.forEach(event => {
      categoryStats[event.category] = (categoryStats[event.category] || 0) + 1;
    });

    const categoryColors = {
      wedding: '#818cf8',
      birthday: '#c084fc',
      concert: '#f472b6',
      conference: '#34d399',
      workshop: '#fbbf24',
      festival: '#f97316',
      sports: '#ef4444',
      corporate: '#06b6d4'
    };

    const categoryData = Object.keys(categoryStats).map(category => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: categoryStats[category],
      color: categoryColors[category] || '#818cf8'
    }));

    // Calculate total stats
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalBookings = bookings.length;
    const totalAttendees = bookings.reduce((sum, b) => sum + b.quantity, 0);

    res.json({
      success: true,
      revenueData,
      categoryData,
      totalRevenue,
      totalBookings,
      totalAttendees
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
