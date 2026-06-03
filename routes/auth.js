const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, getAllUsers, getUserById } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes - Get current user (any authenticated user)
router.get('/profile', authenticate, getCurrentUser);

// Protected routes - Admin and placement_officer only
router.get('/users', authenticate, authorize('Admin', 'placement_officer'), getAllUsers);
router.get('/users/:id', authenticate, authorize('Admin', 'placement_officer'), getUserById);

// Admin only route example
router.get('/admin-only', authenticate, authorize('Admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
    user: req.user,
  });
});

// Placement officer specific route example
router.get('/placements', authenticate, authorize('Admin', 'placement_officer'), (req, res) => {
  res.json({
    success: true,
    message: 'Placement officer access granted',
    user: req.user,
  });
});

module.exports = router;
