const pool = require('../config/database');
const moment = require('moment');

const getAllCoupons = async (filters = {}) => {
  const { status, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM coupons WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  // Check and update expired coupons
  await pool.execute(
    'UPDATE coupons SET status = "expired" WHERE end_date < NOW() AND status = "active"'
  );

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
  query += ` ORDER BY created_at DESC LIMIT ${limitInt} OFFSET ${offsetInt}`;

  const [coupons] = await pool.execute(query, params);

  const [countResult] = await pool.execute(
    status ? 'SELECT COUNT(*) as total FROM coupons WHERE status = ?' : 'SELECT COUNT(*) as total FROM coupons',
    status ? [status] : []
  );

  return {
    coupons,
    pagination: {
      page: parseInt(page),
      limit: limitInt,
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limitInt)
    }
  };
};

const getCouponByCode = async (code) => {
  const [coupons] = await pool.execute(
    'SELECT * FROM coupons WHERE code = ? AND status = "active"',
    [code]
  );

  if (coupons.length === 0) {
    throw new Error('Mã giảm giá không tồn tại hoặc đã hết hạn');
  }

  const coupon = coupons[0];

  // Check if expired
  if (moment(coupon.end_date).isBefore(moment())) {
    throw new Error('Mã giảm giá đã hết hạn');
  }

  if (moment(coupon.start_date).isAfter(moment())) {
    throw new Error('Mã giảm giá chưa có hiệu lực');
  }

  // Check usage limit
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    throw new Error('Mã giảm giá đã hết lượt sử dụng');
  }

  return coupon;
};

const validateCoupon = async (code, userId, totalAmount) => {
  const coupon = await getCouponByCode(code);

  // Check minimum purchase amount
  if (coupon.min_purchase_amount && totalAmount < coupon.min_purchase_amount) {
    throw new Error(`Đơn hàng tối thiểu ${coupon.min_purchase_amount.toLocaleString('vi-VN')}đ để sử dụng mã này`);
  }

  // Check user usage limit
  if (coupon.user_limit) {
    const [usage] = await pool.execute(
      'SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = ? AND user_id = ?',
      [coupon.id, userId]
    );

    if (usage[0].count >= coupon.user_limit) {
      throw new Error('Bạn đã sử dụng hết lượt cho mã giảm giá này');
    }
  }

  return coupon;
};

const applyCoupon = async (coupon, totalAmount) => {
  let discountAmount = 0;

  if (coupon.discount_type === 'percentage') {
    discountAmount = (totalAmount * coupon.discount_value) / 100;
    
    // Apply max discount if set
    if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
      discountAmount = coupon.max_discount_amount;
    }
  } else {
    discountAmount = coupon.discount_value;
  }

  // Don't allow negative amounts
  if (discountAmount > totalAmount) {
    discountAmount = totalAmount;
  }

  return {
    discount_amount: discountAmount,
    final_amount: totalAmount - discountAmount
  };
};

const useCoupon = async (couponId, userId, orderId, discountAmount) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Record usage
    await connection.execute(
      'INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount) VALUES (?, ?, ?, ?)',
      [couponId, userId, orderId, discountAmount]
    );

    // Update coupon used count
    await connection.execute(
      'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?',
      [couponId]
    );

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const createCoupon = async (couponData) => {
  const {
    code,
    description,
    discount_type,
    discount_value,
    min_purchase_amount,
    max_discount_amount,
    usage_limit,
    user_limit,
    start_date,
    end_date
  } = couponData;

  const [result] = await pool.execute(
    `INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase_amount, 
     max_discount_amount, usage_limit, user_limit, start_date, end_date) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [code, description, discount_type, discount_value, min_purchase_amount || 0, 
     max_discount_amount, usage_limit, user_limit || 1, start_date, end_date]
  );

  const [coupons] = await pool.execute('SELECT * FROM coupons WHERE id = ?', [result.insertId]);
  return coupons[0];
};

const updateCoupon = async (id, couponData) => {
  const {
    code,
    description,
    discount_type,
    discount_value,
    min_purchase_amount,
    max_discount_amount,
    usage_limit,
    user_limit,
    start_date,
    end_date,
    status
  } = couponData;

  const [result] = await pool.execute(
    `UPDATE coupons SET code = ?, description = ?, discount_type = ?, discount_value = ?, 
     min_purchase_amount = ?, max_discount_amount = ?, usage_limit = ?, user_limit = ?, 
     start_date = ?, end_date = ?, status = ? WHERE id = ?`,
    [code, description, discount_type, discount_value, min_purchase_amount || 0,
     max_discount_amount, usage_limit, user_limit, start_date, end_date, status, id]
  );

  if (result.affectedRows === 0) {
    throw new Error('Không tìm thấy mã giảm giá');
  }

  const [coupons] = await pool.execute('SELECT * FROM coupons WHERE id = ?', [id]);
  return coupons[0];
};

const deleteCoupon = async (id) => {
  const [result] = await pool.execute('DELETE FROM coupons WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    throw new Error('Không tìm thấy mã giảm giá');
  }

  return { success: true };
};

module.exports = {
  getAllCoupons,
  getCouponByCode,
  validateCoupon,
  applyCoupon,
  useCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon
};

