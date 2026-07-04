const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  ticketType: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  seats: [{
    type: String
  }],
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  qrCode: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String
  },
  paymentId: {
    type: String
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'checked-in'],
    default: 'confirmed'
  },
  discountApplied: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String
  },
  isCheckedIn: {
    type: Boolean,
    default: false
  },
  checkInTime: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
