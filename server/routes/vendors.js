const express = require('express');
const { body, validationResult } = require('express-validator');
const Vendor = require('../models/Vendor');
const Review = require('../models/Review');
const { protect, authorize, organizerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/vendors
// @desc    Get all vendors with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, city, search, minPrice, maxPrice } = req.query;

    let query = { isVerified: true, isActive: true };

    if (category) query.category = category;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    let vendors = await Vendor.find(query)
      .populate('owner', 'name email')
      .sort({ rating: -1 });

    // Filter by price
    if (minPrice || maxPrice) {
      vendors = vendors.filter(vendor => {
        if (minPrice && vendor.priceRange.max < minPrice) return false;
        if (maxPrice && vendor.priceRange.min > maxPrice) return false;
        return true;
      });
    }

    res.json({
      success: true,
      count: vendors.length,
      vendors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/vendors/categories
// @desc    Get vendor categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { name: 'photographer', icon: '📷', label: 'Photographers' },
      { name: 'decorator', icon: '🎨', label: 'Decorators' },
      { name: 'caterer', icon: '🍽️', label: 'Caterers' },
      { name: 'dj', icon: '🎧', label: 'DJs' },
      { name: 'makeup', icon: '💄', label: 'Makeup Artists' },
      { name: 'security', icon: '🛡️', label: 'Security Services' },
      { name: 'other', icon: '📦', label: 'Other Services' }
    ];

    for (let cat of categories) {
      cat.count = await Vendor.countDocuments({ 
        category: cat.name, 
        isVerified: true, 
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

// @route   GET /api/vendors/:id
// @desc    Get single vendor
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('reviews');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({
      success: true,
      vendor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/vendors
// @desc    Create new vendor
// @access  Private (Organizer, Admin)
router.post('/', protect, organizerOrAdmin, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').isIn(['photographer', 'decorator', 'caterer', 'dj', 'makeup', 'security', 'other']),
  body('description').notEmpty().withMessage('Description is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('priceRange.min').isNumeric().withMessage('Min price must be a number'),
  body('priceRange.max').isNumeric().withMessage('Max price must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vendorData = {
      ...req.body,
      owner: req.user.id
    };

    const vendor = await Vendor.create(vendorData);

    res.status(201).json({
      success: true,
      vendor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/vendors/:id
// @desc    Update vendor
// @access  Private (Organizer, Admin)
router.put('/:id', protect, organizerOrAdmin, async (req, res) => {
  try {
    let vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Check ownership
    if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this vendor' });
    }

    vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      vendor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/vendors/:id
// @desc    Delete vendor
// @access  Private (Organizer, Admin)
router.delete('/:id', protect, organizerOrAdmin, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Check ownership
    if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this vendor' });
    }

    await vendor.deleteOne();

    res.json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/vendors/:id/reviews
// @desc    Add review to vendor
// @access  Private (User)
router.post('/:id/reviews', protect, authorize('user'), [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Create review
    const review = await Review.create({
      user: req.user.id,
      vendor: req.params.id,
      rating,
      comment
    });

    // Update vendor rating
    vendor.reviews.push(review._id);
    vendor.totalReviews += 1;
    
    // Calculate new average rating
    const allReviews = await Review.find({ vendor: req.params.id });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    vendor.rating = Math.round(avgRating * 10) / 10;

    await vendor.save();

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
