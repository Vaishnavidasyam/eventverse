const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/messages/contacts
// @desc    Get available contacts to message based on role
// @access  Private
router.get('/contacts', protect, async (req, res) => {
  try {
    let contacts = [];

    if (req.user.role === 'organizer') {
      const events = await Event.find({ organizer: req.user.id }).select('_id');
      const eventIds = events.map(e => e._id);
      const bookings = await Booking.find({ event: { $in: eventIds } }).populate('user', 'name email');
      const userIds = [...new Set(bookings.map(b => b.user?._id?.toString()).filter(Boolean))];
      const attendees = userIds.map(id => bookings.find(b => b.user?._id?.toString() === id)?.user).filter(Boolean);
      const admins = await User.find({ role: 'admin' }).select('name email');
      contacts = [...attendees, ...admins];
    } else if (req.user.role === 'admin') {
      contacts = await User.find({ role: 'organizer' }).select('name email');
    } else {
      const bookings = await Booking.find({ user: req.user.id }).populate('event');
      const orgIds = [...new Set(bookings.filter(b => b.event?.organizer).map(b => b.event.organizer.toString()))];
      const organizers = await User.find({ _id: { $in: orgIds }, role: 'organizer' }).select('name email');
      const admins = await User.find({ role: 'admin' }).select('name email');
      contacts = [...organizers, ...admins];
    }

    res.json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/messages/conversations
// @desc    Get user's conversations (unique users they've messaged + last message)
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.user.id }, { receiver: req.user.id }]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', req.user.id] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);

    const conversations = await Message.populate(messages, {
      path: 'lastMessage.sender lastMessage.receiver',
      select: 'name email avatar'
    });

    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/messages/:conversationId
// @desc    Get messages for a conversation
// @access  Private
router.get('/:conversationId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { conversationId: req.params.conversationId, receiver: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { receiver, content, conversationId } = req.body;

    const message = await Message.create({
      sender: req.user.id,
      receiver,
      content,
      conversationId
    });

    await message.populate('sender', 'name email');
    await message.populate('receiver', 'name email');

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
