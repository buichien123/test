const pool = require('../config/database');

// Get user's wishlist with pagination
const getWishlist = async (userId, page = 1, limit = 12) => {
  const offset = (page - 1) * limit;
  
  // Get total count
  const [countResult] = await pool.execute(
    `SELECT COUNT(*) as total
    FROM wishlist w
    INNER JOIN products p ON w.product_id = p.id
    WHERE w.user_id = ? AND p.status = 'active'`,
    [userId]
  );
  const total = countResult[0].total;

  // Get items with pagination
  // Convert to integers to ensure proper type
  let limitInt = parseInt(limit, 10);
  let offsetInt = parseInt(offset, 10);
  
  // Validate and set defaults
  if (isNaN(limitInt) || limitInt < 1) {
    limitInt = 12;
  }
  if (isNaN(offsetInt) || offsetInt < 0) {
    offsetInt = 0;
  }
  
  // Use template literal for LIMIT/OFFSET to avoid MySQL2 prepared statement issues
  const [items] = await pool.execute(
    `SELECT 
      w.id,
      w.product_id,
      w.created_at,
      p.name,
      p.description,
      p.price,
      p.stock,
      p.image_url,
      p.status,
      c.name as category_name
    FROM wishlist w
    INNER JOIN products p ON w.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE w.user_id = ? AND p.status = 'active'
    ORDER BY w.created_at DESC
    LIMIT ${limitInt} OFFSET ${offsetInt}`,
    [userId]
  );

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Check if product is in wishlist
const isInWishlist = async (userId, productId) => {
  const [items] = await pool.execute(
    'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );

  return items.length > 0;
};

// Add product to wishlist
const addToWishlist = async (userId, productId) => {
  // Check if product exists and is active
  const [products] = await pool.execute(
    'SELECT id, status FROM products WHERE id = ?',
    [productId]
  );

  if (products.length === 0) {
    throw new Error('Sản phẩm không tồn tại');
  }

  if (products[0].status !== 'active') {
    throw new Error('Sản phẩm không khả dụng');
  }

  // Check if already in wishlist
  const alreadyInWishlist = await isInWishlist(userId, productId);
  if (alreadyInWishlist) {
    throw new Error('Sản phẩm đã có trong danh sách yêu thích');
  }

  // Add to wishlist
  await pool.execute(
    'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
    [userId, productId]
  );

  return { success: true, message: 'Đã thêm vào danh sách yêu thích' };
};

// Remove product from wishlist
const removeFromWishlist = async (userId, productId) => {
  const [result] = await pool.execute(
    'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Sản phẩm không có trong danh sách yêu thích');
  }

  return { success: true, message: 'Đã xóa khỏi danh sách yêu thích' };
};

// Toggle wishlist (add if not exists, remove if exists)
const toggleWishlist = async (userId, productId) => {
  const inWishlist = await isInWishlist(userId, productId);
  
  if (inWishlist) {
    return await removeFromWishlist(userId, productId);
  } else {
    return await addToWishlist(userId, productId);
  }
};

// Clear wishlist
const clearWishlist = async (userId) => {
  await pool.execute(
    'DELETE FROM wishlist WHERE user_id = ?',
    [userId]
  );

  return { success: true, message: 'Đã xóa tất cả khỏi danh sách yêu thích' };
};

// Get wishlist count
const getWishlistCount = async (userId) => {
  const [result] = await pool.execute(
    'SELECT COUNT(*) as count FROM wishlist WHERE user_id = ?',
    [userId]
  );

  return result[0].count;
};

module.exports = {
  getWishlist,
  isInWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  getWishlistCount
};

