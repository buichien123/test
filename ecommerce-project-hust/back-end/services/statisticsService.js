const pool = require('../config/database');
const moment = require('moment');

const getDashboardStats = async () => {
  // Total revenue (all time, only paid orders)
  const [totalRevenue] = await pool.execute(
    `SELECT 
     COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as total_revenue
     FROM orders`
  );

  // Today's revenue and orders
  const [todayStats] = await pool.execute(
    `SELECT 
     COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as today_revenue,
     COUNT(*) as today_orders
     FROM orders 
     WHERE DATE(created_at) = CURDATE()`
  );

  // Total users (all users including admin)
  const [users] = await pool.execute(
    'SELECT COUNT(*) as total_users FROM users'
  );

  // Total products (all products)
  const [products] = await pool.execute(
    'SELECT COUNT(*) as total_products FROM products'
  );

  // Active products
  const [activeProducts] = await pool.execute(
    'SELECT COUNT(*) as active_products FROM products WHERE status = "active"'
  );

  // Total orders (all orders)
  const [orders] = await pool.execute(
    'SELECT COUNT(*) as total_orders FROM orders'
  );

  return {
    users: users[0].total_users || 0,
    products: products[0].total_products || 0,
    orders: orders[0].total_orders || 0,
    revenue: parseFloat(totalRevenue[0].total_revenue || 0),
    today_orders: todayStats[0].today_orders || 0,
    today_revenue: parseFloat(todayStats[0].today_revenue || 0),
    active_products: activeProducts[0].active_products || 0
  };
};

const getRevenueStats = async (startDate, endDate) => {
  const [stats] = await pool.execute(
    `SELECT 
     DATE(created_at) as date,
     COUNT(*) as order_count,
     SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as revenue,
     SUM(CASE WHEN payment_status = 'paid' THEN discount_amount ELSE 0 END) as total_discount
     FROM orders 
     WHERE DATE(created_at) BETWEEN ? AND ?
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    [startDate, endDate]
  );

  return stats;
};

const getProductStats = async () => {
  // Top selling products
  const [topProducts] = await pool.execute(
    `SELECT 
     p.id, p.name, p.price,
     SUM(oi.quantity) as total_sold,
     SUM(oi.quantity * oi.price) as total_revenue
     FROM products p
     JOIN order_items oi ON p.id = oi.product_id
     JOIN orders o ON oi.order_id = o.id
     WHERE o.payment_status = 'paid'
     GROUP BY p.id, p.name, p.price
     ORDER BY total_sold DESC
     LIMIT 10`
  );

  // Low stock products
  const [lowStock] = await pool.execute(
    'SELECT * FROM products WHERE stock < 10 AND status = "active" ORDER BY stock ASC LIMIT 10'
  );

  return {
    top_selling: topProducts,
    low_stock: lowStock
  };
};

const getCategoryStats = async () => {
  const [stats] = await pool.execute(
    `SELECT 
     c.id, c.name,
     COUNT(DISTINCT p.id) as product_count,
     SUM(oi.quantity) as total_sold,
     SUM(oi.quantity * oi.price) as revenue
     FROM categories c
     LEFT JOIN products p ON c.id = p.category_id
     LEFT JOIN order_items oi ON p.id = oi.product_id
     LEFT JOIN orders o ON oi.order_id = o.id AND o.payment_status = 'paid'
     GROUP BY c.id, c.name
     ORDER BY revenue DESC`
  );

  return stats;
};

const getCustomerStats = async () => {
  // Top customers
  const [topCustomers] = await pool.execute(
    `SELECT 
     u.id, u.username, u.email, u.full_name,
     COUNT(o.id) as order_count,
     SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END) as total_spent
     FROM users u
     JOIN orders o ON u.id = o.user_id
     WHERE u.role = 'customer'
     GROUP BY u.id, u.username, u.email, u.full_name
     ORDER BY total_spent DESC
     LIMIT 10`
  );

  return topCustomers;
};

const updateDailyStatistics = async () => {
  const today = moment().format('YYYY-MM-DD');

  const [stats] = await pool.execute(
    `SELECT 
     COUNT(*) as total_orders,
     SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue,
     COUNT(DISTINCT user_id) as total_users,
     SUM((SELECT SUM(quantity) FROM order_items WHERE order_id = orders.id)) as total_products_sold
     FROM orders 
     WHERE DATE(created_at) = ?`,
    [today]
  );

  const stat = stats[0];

  await pool.execute(
    `INSERT INTO daily_statistics (date, total_orders, total_revenue, total_users, total_products_sold)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
     total_orders = VALUES(total_orders),
     total_revenue = VALUES(total_revenue),
     total_users = VALUES(total_users),
     total_products_sold = VALUES(total_products_sold),
     updated_at = NOW()`,
    [today, stat.total_orders || 0, stat.total_revenue || 0, stat.total_users || 0, stat.total_products_sold || 0]
  );
};

module.exports = {
  getDashboardStats,
  getRevenueStats,
  getProductStats,
  getCategoryStats,
  getCustomerStats,
  updateDailyStatistics
};

