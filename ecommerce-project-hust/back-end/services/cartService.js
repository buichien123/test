const pool = require('../config/database');

const getCart = async (userId) => {
  const [items] = await pool.execute(
    `SELECT c.*, p.name, p.price, p.image_url, p.stock as product_stock,
     pv.variant_type, pv.variant_value, pv.price_adjustment, pv.stock as variant_stock
     FROM cart c
     JOIN products p ON c.product_id = p.id
     LEFT JOIN product_variants pv ON c.variant_id = pv.id
     WHERE c.user_id = ? AND p.status = 'active'
     ORDER BY c.created_at DESC`,
    [userId]
  );

  // Calculate totals
  const cartItems = items.map(item => {
    const basePrice = parseFloat(item.price);
    const variantPrice = item.price_adjustment ? parseFloat(item.price_adjustment) : 0;
    const itemPrice = basePrice + variantPrice;
    const availableStock = item.variant_id ? item.variant_stock : item.product_stock;

    return {
      ...item,
      item_price: itemPrice,
      total_price: itemPrice * item.quantity,
      available_stock: availableStock
    };
  });

  const total = cartItems.reduce((sum, item) => sum + item.total_price, 0);

  return {
    items: cartItems,
    total,
    item_count: cartItems.reduce((sum, item) => sum + item.quantity, 0)
  };
};

const addToCart = async (userId, productId, quantity = 1, variantId = null) => {
  // Check if product exists and is active
  const [products] = await pool.execute(
    'SELECT * FROM products WHERE id = ? AND status = "active"',
    [productId]
  );

  if (products.length === 0) {
    throw new Error('Sản phẩm không tồn tại');
  }

  // Check variant if provided
  if (variantId) {
    const [variants] = await pool.execute(
      'SELECT * FROM product_variants WHERE id = ? AND product_id = ?',
      [variantId, productId]
    );

    if (variants.length === 0) {
      throw new Error('Biến thể sản phẩm không tồn tại');
    }

    const variant = variants[0];
    if (variant.stock < quantity) {
      throw new Error('Số lượng vượt quá tồn kho');
    }
  } else {
    const product = products[0];
    if (product.stock < quantity) {
      throw new Error('Số lượng vượt quá tồn kho');
    }
  }

  // Check if item already in cart
  const [existing] = await pool.execute(
    'SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND variant_id <=> ?',
    [userId, productId, variantId]
  );

  if (existing.length > 0) {
    // Update quantity
    const newQuantity = existing[0].quantity + quantity;
    await pool.execute(
      'UPDATE cart SET quantity = ? WHERE id = ?',
      [newQuantity, existing[0].id]
    );
  } else {
    // Add new item
    await pool.execute(
      'INSERT INTO cart (user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)',
      [userId, productId, variantId, quantity]
    );
  }

  return await getCart(userId);
};

const updateCartItem = async (userId, cartItemId, quantity) => {
  if (quantity <= 0) {
    return await removeFromCart(userId, cartItemId);
  }

  // Get cart item
  const [items] = await pool.execute(
    `SELECT c.*, p.stock as product_stock, pv.stock as variant_stock
     FROM cart c
     JOIN products p ON c.product_id = p.id
     LEFT JOIN product_variants pv ON c.variant_id = pv.id
     WHERE c.id = ? AND c.user_id = ?`,
    [cartItemId, userId]
  );

  if (items.length === 0) {
    throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');
  }

  const item = items[0];
  const availableStock = item.variant_id ? item.variant_stock : item.product_stock;

  if (availableStock < quantity) {
    throw new Error('Số lượng vượt quá tồn kho');
  }

  await pool.execute(
    'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
    [quantity, cartItemId, userId]
  );

  return await getCart(userId);
};

const removeFromCart = async (userId, cartItemId) => {
  const [result] = await pool.execute(
    'DELETE FROM cart WHERE id = ? AND user_id = ?',
    [cartItemId, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');
  }

  return await getCart(userId);
};

const clearCart = async (userId) => {
  await pool.execute('DELETE FROM cart WHERE user_id = ?', [userId]);
  return { success: true };
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};

