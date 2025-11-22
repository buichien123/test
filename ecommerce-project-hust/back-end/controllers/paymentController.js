const paymentService = require('../services/paymentService');
const orderService = require('../services/orderService');

const buildFrontendCallbackUrl = (params = {}) => {
  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
  const url = new URL(`${frontendBase.replace(/\/$/, '')}/payment/callback`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return (
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1'
  );
};

const createPayment = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã đơn hàng'
      });
    }

    // Get order
    const order = await orderService.getOrderById(order_id, req.user.userId);

    if (order.payment_status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã được thanh toán'
      });
    }

    // Create payment URL
    const clientIp = getClientIp(req);

    const payment = await paymentService.createPaymentUrl(
      order_id,
      parseFloat(order.total_amount),
      `Thanh toan don hang #${order_id}`,
      clientIp
    );

    res.json({
      success: true,
      ...payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

// Payment callback
const paymentCallback = async (req, res) => {
  try {
    const result = await paymentService.verifyPaymentCallback(req.query);

    const redirectUrl = buildFrontendCallbackUrl({
      status: result.success ? 'success' : 'failed',
      order_id: result.order_id,
      message: result.message,
      code: result.response_code
    });

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Payment callback error:', error);
    const redirectUrl = buildFrontendCallbackUrl({
      status: 'error',
      message: 'Không thể xác thực thanh toán'
    });
    res.redirect(redirectUrl);
  }
};

module.exports = {
  createPayment,
  paymentCallback
};

