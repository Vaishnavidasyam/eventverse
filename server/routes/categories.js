const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const Event = require('../models/Event');
const { protect, authorize, organizerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ isSystem: -1, label: 1 });

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/categories/organizer
// @desc    Get organizer's custom categories
// @access  Private (Organizer)
router.get('/organizer', protect, authorize('organizer'), async (req, res) => {
  try {
    const categories = await Category.find({ 
      organizer: req.user.id,
      isActive: true 
    }).sort({ createdAt: -1 });

    // Get event counts for each category
    const categoryIds = categories.map(c => c._id);
    const eventCounts = await Event.aggregate([
      { $match: { category: { $in: categoryIds.map(id => id.toString()) } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const categoriesWithCounts = categories.map(cat => {
      const countData = eventCounts.find(e => e._id === cat.name);
      return {
        ...cat.toObject(),
        eventCount: countData ? countData.count : 0
      };
    });

    res.json({
      success: true,
      categories: categoriesWithCounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Private (Organizer, Admin)
router.get('/:id', protect, organizerOrAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check ownership for custom categories
    if (!category.isSystem && category.organizer?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this category' });
    }

    // Get event count
    const eventCount = await Event.countDocuments({ category: category.name });

    res.json({
      success: true,
      category: {
        ...category.toObject(),
        eventCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Private (Organizer, Admin)
router.post('/', protect, organizerOrAdmin, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('label').notEmpty().withMessage('Label is required'),
  body('icon').optional(),
  body('color').optional(),
  body('description').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, label, icon, color, description } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: name.toLowerCase() });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const categoryData = {
      name: name.toLowerCase(),
      label,
      icon: icon || '📅',
      color: color || 'from-purple-500 to-indigo-500',
      description,
      organizer: req.user.id,
      isSystem: false
    };

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private (Organizer, Admin)
router.put('/:id', protect, organizerOrAdmin, async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Cannot modify system categories
    if (category.isSystem) {
      return res.status(403).json({ message: 'Cannot modify system categories' });
    }

    // Check ownership
    if (category.organizer?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this category' });
    }

    const { name, label, icon, color, description, isActive } = req.body;

    // If changing name, check if new name already exists
    if (name && name.toLowerCase() !== category.name) {
      const existingCategory = await Category.findOne({ name: name.toLowerCase() });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
    }

    category = await Category.findByIdAndUpdate(req.params.id, {
      ...(name && { name: name.toLowerCase() }),
      ...(label && { label }),
      ...(icon && { icon }),
      ...(color && { color }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive })
    }, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private (Organizer, Admin)
router.delete('/:id', protect, organizerOrAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Cannot delete system categories
    if (category.isSystem) {
      return res.status(403).json({ message: 'Cannot delete system categories' });
    }

    // Check ownership
    if (category.organizer?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this category' });
    }

    // Check if category has events
    const eventCount = await Event.countDocuments({ category: category.name });
    if (eventCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with existing events. Please reassign or delete events first.' 
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
