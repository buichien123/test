const couponService = require('../services/couponService');

// Get all coupons (Admin)
const getCoupons = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      page: req.query.page || 1,
      limit: req.query.limit || 20
    };

    const result = await couponService.getAllCoupons(filters);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

// Validate coupon (Public)
const validateCoupon = async (req, res) => {
  try {
    const { code, total_amount } = req.query;
    const userId = req.user?.userId;

    if (!code || !total_amount) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã giảm giá và tổng tiền'
      });
    }

    const coupon = await couponService.validateCoupon(code, userId, parseFloat(total_amount));
    const discount = await couponService.applyCoupon(coupon, parseFloat(total_amount));

    res.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value
      },
      discount: discount.discount_amount,
      final_amount: discount.final_amount
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Mã giảm giá không hợp lệ'
    });
  }
};

// Create coupon (Admin)
const createCoupon = async (req, res) => {
  try {
    const couponData = req.body;
    const coupon = await couponService.createCoupon(couponData);

    res.status(201).json({
      success: true,
      message: 'Tạo mã giảm giá thành công',
      coupon
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

// Update coupon (Admin)
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const couponData = req.body;
    const coupon = await couponService.updateCoupon(id, couponData);

    res.json({
      success: true,
      message: 'Cập nhật mã giảm giá thành công',
      coupon
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

// Delete coupon (Admin)
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await couponService.deleteCoupon(id);

    res.json({
      success: true,
      message: 'Xóa mã giảm giá thành công'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

module.exports = {
  getCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon
};

