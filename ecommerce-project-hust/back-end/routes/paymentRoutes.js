const express = require('express');
const router = express.Router();
const {
  createPayment,
  paymentCallback
} = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.post('/create', authenticate, createPayment);
router.get('/callback', paymentCallback);

module.exports = router;

