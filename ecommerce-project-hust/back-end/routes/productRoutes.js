const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addRelatedProducts
} = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes (with optional auth for admin features)
router.get('/', (req, res, next) => {
  // Optional authentication - don't fail if no token
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Ignore token errors for public route
    }
  }
  next();
}, getProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', authenticate, authorize('admin'), createProduct);
router.put('/:id', authenticate, authorize('admin'), updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);
router.post('/:id/related', authenticate, authorize('admin'), addRelatedProducts);

module.exports = router;
