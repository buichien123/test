const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

// Customer routes
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/my-orders/:id', authenticate, getOrderById);

// Admin routes
router.get('/all', authenticate, authorize('admin'), getAllOrders);
router.get('/:id', authenticate, authorize('admin'), getOrderByIdAdmin);
router.put('/:id/status', authenticate, authorize('admin'), updateOrderStatus);

module.exports = router;
