const express = require('express');
const router = express.Router();
const {
  syncStudents,
  getSyncHistory,
  getSyncLogDetails,
  testSync,
} = require('../controllers/syncController');
const { authenticate, authorize } = require('../middleware/auth');

// Public test endpoint (remove in production)
router.post('/test', testSync);

// Protected routes - Admin and placement_officer only
router.post(
  '/students',
  authenticate,
  authorize('Admin', 'placement_officer'),
  syncStudents
);

router.get(
  '/history',
  authenticate,
  authorize('Admin', 'placement_officer'),
  getSyncHistory
);

router.get(
  '/:id',
  authenticate,
  authorize('Admin', 'placement_officer'),
  getSyncLogDetails
);

module.exports = router;
