const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRevenueStats,
  getProductStats,
  getCategoryStats,
  getCustomerStats
} = require('../controllers/statisticsController');
const { authenticate, authorize } = require('../middleware/auth');

// All statistics routes require admin
router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/overview', getDashboardStats); // Alias for frontend compatibility
router.get('/revenue', getRevenueStats);
router.get('/products', getProductStats);
router.get('/categories', getCategoryStats);
router.get('/customers', getCustomerStats);

module.exports = router;

