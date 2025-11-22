const wishlistService = require('../services/wishlistService');

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    
    const result = await wishlistService.getWishlist(userId, page, limit);

    res.json({
      success: true,
      items: result.items,
      count: result.items.length,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy danh sách yêu thích'
    });
  }
};

// Check if product is in wishlist
const checkWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp productId'
      });
    }

    const inWishlist = await wishlistService.isInWishlist(userId, parseInt(productId));

    res.json({
      success: true,
      inWishlist
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

// Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp product_id'
      });
    }

    const result = await wishlistService.addToWishlist(userId, parseInt(product_id));

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server khi thêm vào yêu thích'
    });
  }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp product_id'
      });
    }

    const result = await wishlistService.removeFromWishlist(userId, parseInt(product_id));

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server khi xóa khỏi yêu thích'
    });
  }
};

// Toggle wishlist
const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp product_id'
      });
    }

    // Check current status before toggle
    const wasInWishlist = await wishlistService.isInWishlist(userId, parseInt(product_id));
    const result = await wishlistService.toggleWishlist(userId, parseInt(product_id));
    // After toggle, status is opposite of before
    const nowInWishlist = !wasInWishlist;

    res.json({
      success: true,
      ...result,
      inWishlist: nowInWishlist
    });
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

// Clear wishlist
const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await wishlistService.clearWishlist(userId);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi xóa danh sách yêu thích'
    });
  }
};

// Get wishlist count
const getWishlistCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await wishlistService.getWishlistCount(userId);

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get wishlist count error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

module.exports = {
  getWishlist,
  checkWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  getWishlistCount
};

