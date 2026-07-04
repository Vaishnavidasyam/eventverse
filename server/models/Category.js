const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '📅'
  },
  color: {
    type: String,
    default: 'from-purple-500 to-indigo-500'
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  eventCount: {
    type: Number,
    default: 0
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

categorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Category', categorySchema);
