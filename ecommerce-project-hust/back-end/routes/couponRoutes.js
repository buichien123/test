const express = require('express');
const router = express.Router();
const {
  getCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon
} = require('../controllers/couponController');
const { authenticate, authorize } = require('../middleware/auth');

// Public route (with optional auth)
router.get('/validate', validateCoupon);

// Admin routes
router.get('/', authenticate, authorize('admin'), getCoupons);
router.post('/', authenticate, authorize('admin'), createCoupon);
router.put('/:id', authenticate, authorize('admin'), updateCoupon);
router.delete('/:id', authenticate, authorize('admin'), deleteCoupon);

module.exports = router;

