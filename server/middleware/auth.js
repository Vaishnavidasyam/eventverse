const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (req.user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};

// Admin only
const adminOnly = authorize('admin');

// Organizer and Admin
const organizerOrAdmin = authorize('organizer', 'admin');

// User, Organizer, and Admin
const allRoles = authorize('user', 'organizer', 'admin');

module.exports = {
  protect,
  authorize,
  adminOnly,
  organizerOrAdmin,
  allRoles
};
