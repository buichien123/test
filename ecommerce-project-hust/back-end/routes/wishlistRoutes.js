const express = require('express');
const router = express.Router();
const {
  getWishlist,
  checkWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  getWishlistCount
} = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.get('/', authenticate, getWishlist);
router.get('/count', authenticate, getWishlistCount);
router.get('/check/:productId', authenticate, checkWishlist);
router.post('/add', authenticate, addToWishlist);
router.post('/remove', authenticate, removeFromWishlist);
router.post('/toggle', authenticate, toggleWishlist);
router.delete('/clear', authenticate, clearWishlist);

module.exports = router;

