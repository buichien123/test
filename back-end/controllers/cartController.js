const cartService = require('../services/cartService');

// Get cart
const getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user.userId);

    res.json({
      success: true,
      ...cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

// Add to cart
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity, variant_id } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    const cart = await cartService.addToCart(
      req.user.userId,
      product_id,
      parseInt(quantity),
      variant_id || null
    );

    res.json({
      success: true,
      message: 'Thêm vào giỏ hàng thành công',
      ...cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

// Update cart item
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng không hợp lệ'
      });
    }

    const cart = await cartService.updateCartItem(
      req.user.userId,
      parseInt(id),
      parseInt(quantity)
    );

    res.json({
      success: true,
      message: 'Cập nhật giỏ hàng thành công',
      ...cart
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const cart = await cartService.removeFromCart(req.user.userId, parseInt(id));

    res.json({
      success: true,
      message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
      ...cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    await cartService.clearCart(req.user.userId);

    res.json({
      success: true,
      message: 'Xóa giỏ hàng thành công'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};

