const pool = require('../config/database');
const couponService = require('./couponService');
const emailService = require('./emailService');

const createOrder = async (userId, orderData) => {
  const { items, shipping_address, phone, notes, coupon_code } = orderData;

  if (!items || items.length === 0) {
    throw new Error('Giỏ hàng trống');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let totalAmount = 0;
    let discountAmount = 0;
    let couponId = null;

    // Calculate total and validate stock
    for (const item of items) {
      let product, variant = null;

      if (item.variant_id) {
        const [variants] = await connection.execute(
          'SELECT pv.*, p.price as base_price, p.stock as base_stock FROM product_variants pv JOIN products p ON pv.product_id = p.id WHERE pv.id = ? AND p.id = ? AND p.status = "active"',
          [item.variant_id, item.product_id]
        );

        if (variants.length === 0) {
          throw new Error(`Biến thể sản phẩm không tồn tại`);
        }

        variant = variants[0];
        product = { price: parseFloat(variant.base_price) + parseFloat(variant.price_adjustment || 0), stock: variant.stock };

        if (variant.stock < item.quantity) {
          throw new Error(`Sản phẩm không đủ hàng trong kho`);
        }
      } else {
        const [products] = await connection.execute(
          'SELECT price, stock FROM products WHERE id = ? AND status = "active"',
          [item.product_id]
        );

        if (products.length === 0) {
          throw new Error(`Sản phẩm ID ${item.product_id} không tồn tại`);
        }

        product = products[0];
        if (product.stock < item.quantity) {
          throw new Error(`Sản phẩm ID ${item.product_id} không đủ hàng trong kho`);
        }
      }

      const itemPrice = parseFloat(product.price);
      totalAmount += itemPrice * item.quantity;
    }

    // Apply coupon if provided
    if (coupon_code) {
      try {
        const coupon = await couponService.validateCoupon(coupon_code, userId, totalAmount);
        const discount = await couponService.applyCoupon(coupon, totalAmount);
        discountAmount = discount.discount_amount;
        couponId = coupon.id;
        totalAmount = discount.final_amount;
      } catch (error) {
        throw new Error(`Mã giảm giá không hợp lệ: ${error.message}`);
      }
    }

    // Create order
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (user_id, total_amount, discount_amount, coupon_id, shipping_address, phone, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, totalAmount, discountAmount, couponId, shipping_address, phone, notes || null]
    );

    const orderId = orderResult.insertId;

    // Create order items and update stock
    for (const item of items) {
      let product, variant = null;
      let itemPrice;

      if (item.variant_id) {
        const [variants] = await connection.execute(
          'SELECT pv.*, p.price as base_price FROM product_variants pv JOIN products p ON pv.product_id = p.id WHERE pv.id = ?',
          [item.variant_id]
        );
        variant = variants[0];
        itemPrice = parseFloat(variant.base_price) + parseFloat(variant.price_adjustment || 0);

        await connection.execute(
          'INSERT INTO order_items (order_id, product_id, variant_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.product_id, item.variant_id, item.quantity, itemPrice]
        );

        await connection.execute(
          'UPDATE product_variants SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.variant_id]
        );
      } else {
        const [products] = await connection.execute(
          'SELECT price FROM products WHERE id = ?',
          [item.product_id]
        );
        product = products[0];
        itemPrice = parseFloat(product.price);

        await connection.execute(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, itemPrice]
        );
      }

      await connection.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Record coupon usage
    if (couponId) {
      await couponService.useCoupon(couponId, userId, orderId, discountAmount);
    }

    await connection.commit();

    // Get full order details
    const order = await getOrderById(orderId, userId);

    // Send confirmation email
    try {
      const [users] = await pool.execute('SELECT email, full_name, username FROM users WHERE id = ?', [userId]);
      if (users.length > 0) {
        await emailService.sendOrderConfirmationEmail(
          users[0].email,
          order,
          users[0].full_name || users[0].username
        );
      }
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
    }

    return order;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getMyOrders = async (userId, filters = {}) => {
  const { status, page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;

  // Convert and validate limit and offset
  let limitInt = parseInt(limit, 10);
  let offsetInt = parseInt(offset, 10);
  
  if (isNaN(limitInt) || limitInt < 1) {
    limitInt = 10;
  }
  if (isNaN(offsetInt) || offsetInt < 0) {
    offsetInt = 0;
  }

  let query = `
    SELECT o.*, 
    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
    (SELECT payment_method FROM payments WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as last_payment_method,
    (SELECT status FROM payments WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as last_payment_status
    FROM orders o 
    WHERE o.user_id = ?
  `;
  const params = [userId];

  if (status) {
    query += ' AND o.status = ?';
    params.push(status);
  }

  // Use template literal for LIMIT/OFFSET after validation
  query += ` ORDER BY o.created_at DESC LIMIT ${limitInt} OFFSET ${offsetInt}`;

  const [orders] = await pool.execute(query, params);

  const [countResult] = await pool.execute(
    status 
      ? 'SELECT COUNT(*) as total FROM orders WHERE user_id = ? AND status = ?'
      : 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
    status ? [userId, status] : [userId]
  );

  return {
    orders,
    pagination: {
      page: parseInt(page),
      limit: limitInt,
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limitInt)
    }
  };
};

const getOrderById = async (orderId, userId = null) => {
  let query = 'SELECT o.*, u.username, u.email, u.full_name, c.code as coupon_code FROM orders o JOIN users u ON o.user_id = u.id LEFT JOIN coupons c ON o.coupon_id = c.id WHERE o.id = ?';
  const params = [orderId];

  if (userId) {
    query += ' AND o.user_id = ?';
    params.push(userId);
  }

  const [orders] = await pool.execute(query, params);

  if (orders.length === 0) {
    throw new Error('Không tìm thấy đơn hàng');
  }

  const order = orders[0];

  // Get order items
  const [items] = await pool.execute(
    `SELECT oi.*, p.name as product_name, p.image_url, 
     pv.variant_type, pv.variant_value
     FROM order_items oi 
     JOIN products p ON oi.product_id = p.id 
     LEFT JOIN product_variants pv ON oi.variant_id = pv.id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  order.items = items;

  // Get payment info
  const [payments] = await pool.execute(
    'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC',
    [orderId]
  );

  order.payments = payments;

  return order;
};

const getAllOrders = async (filters = {}) => {
  const { status, payment_status, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  let query = `
    SELECT o.*, u.username, u.email, u.full_name,
    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
    FROM orders o 
    JOIN users u ON o.user_id = u.id 
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += ' AND o.status = ?';
    params.push(status);
  }

  if (payment_status) {
    query += ' AND o.payment_status = ?';
    params.push(payment_status);
  }

  // Convert and validate limit and offset
  let limitInt = parseInt(limit, 10);
  let offsetInt = parseInt(offset, 10);
  
  if (isNaN(limitInt) || limitInt < 1) {
    limitInt = 10;
  }
  if (isNaN(offsetInt) || offsetInt < 0) {
    offsetInt = 0;
  }

  // Use template literal for LIMIT/OFFSET after validation
  query += ` ORDER BY o.created_at DESC LIMIT ${limitInt} OFFSET ${offsetInt}`;

  const [orders] = await pool.execute(query, params);

  const [countResult] = await pool.execute(
    'SELECT COUNT(*) as total FROM orders',
    []
  );

  return {
    orders,
    pagination: {
      page: parseInt(page),
      limit: limitInt,
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limitInt)
    }
  };
};

const updateOrderStatus = async (orderId, status) => {
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error('Trạng thái không hợp lệ');
  }

  const [result] = await pool.execute(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, orderId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Không tìm thấy đơn hàng');
  }

  return await getOrderById(orderId);
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};

