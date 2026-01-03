const express = require('express');
const router = express.Router();
const {
  createPayment,
  paymentCallback,
  verifyPayment
} = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.post('/create', authenticate, createPayment);
router.get('/callback', paymentCallback);
router.get('/verify', verifyPayment); // Public endpoint for frontend to verify payment

module.exports = router;

