const orderService = require('../services/orderService');

// Create order
const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    const order = await orderService.createOrder(req.user.userId, orderData);

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server khi tạo đơn hàng'
    });
  }
};

// Get user orders
const getMyOrders = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      page: req.query.page || 1,
      limit: req.query.limit || 10
    };

    const result = await orderService.getMyOrders(req.user.userId, filters);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy danh sách đơn hàng'
    });
  }
};

// Get order details
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id, req.user.userId);

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy thông tin đơn hàng'
    });
  }
};

// Get all orders (Admin only)
const getAllOrders = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      payment_status: req.query.payment_status,
      page: req.query.page || 1,
      limit: req.query.limit || 20
    };

    const result = await orderService.getAllOrders(filters);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy danh sách đơn hàng'
    });
  }
};

// Get order by ID (Admin only - no user restriction)
const getOrderByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id, null); // null = no user restriction for admin

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy thông tin đơn hàng'
    });
  }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập trạng thái'
      });
    }

    const order = await orderService.updateOrderStatus(id, status);

    res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server khi cập nhật trạng thái đơn hàng'
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus
};
