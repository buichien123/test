-- ============================================
-- COMPLETE DATABASE SCHEMA WITH SEEDER
-- E-commerce Database với tất cả tính năng và dữ liệu mẫu
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- ============================================
-- BASIC TABLES
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  role ENUM('customer', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  image_url VARCHAR(255),
  category_id INT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_category_id (category_id),
  INDEX idx_status (status)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  notes TEXT,
  coupon_id INT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_payment_status (payment_status)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  variant_id INT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_product_id (product_id)
);

-- ============================================
-- EXTENDED TABLES
-- ============================================

-- Product Variants/Attributes table
CREATE TABLE IF NOT EXISTS product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  variant_type VARCHAR(50) NOT NULL COMMENT 'color, size, storage, etc',
  variant_value VARCHAR(100) NOT NULL,
  price_adjustment DECIMAL(10, 2) DEFAULT 0 COMMENT 'Price difference from base price',
  stock INT DEFAULT 0,
  sku VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id)
);

-- Product Images table (multiple images per product)
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id)
);

-- Coupons/Discount Codes table
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type ENUM('percentage', 'fixed') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2) DEFAULT NULL,
  usage_limit INT DEFAULT NULL COMMENT 'Total usage limit',
  used_count INT DEFAULT 0,
  user_limit INT DEFAULT 1 COMMENT 'Usage limit per user',
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_status (status)
);

-- Note: Foreign key for coupon_id in orders table will be added after coupons table is created

-- Coupon Usage tracking
CREATE TABLE IF NOT EXISTS coupon_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coupon_id INT NOT NULL,
  user_id INT NOT NULL,
  order_id INT,
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_coupon_user (coupon_id, user_id)
);

-- Shopping Cart table (Backend cart management)
CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  variant_id INT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart_item (user_id, product_id, variant_id),
  INDEX idx_user_id (user_id)
);

-- Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_user_id (user_id)
);

-- Payment Transactions (VNPay)
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'vnpay',
  transaction_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
  vnpay_transaction_no VARCHAR(255),
  vnpay_response_code VARCHAR(10),
  payment_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_transaction_id (transaction_id)
);

-- Product Reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  order_id INT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_product_id (product_id),
  INDEX idx_user_id (user_id)
);

-- Statistics/Reports tables
CREATE TABLE IF NOT EXISTS daily_statistics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_orders INT DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  total_users INT DEFAULT 0,
  total_products_sold INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (date)
);

-- Product Relations (many-to-many for related products)
CREATE TABLE IF NOT EXISTS product_relations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  related_product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (related_product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_relation (product_id, related_product_id),
  INDEX idx_product_id (product_id)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_wishlist (user_id, product_id),
  INDEX idx_user_id (user_id)
);

-- ============================================
-- SEEDER DATA
-- ============================================

-- Temporarily disable foreign key checks to allow data insertion
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- USERS SEEDER
-- ============================================
-- Password: 123456 (hashed with bcrypt)
INSERT INTO users (username, email, password, full_name, phone, address, role) VALUES
('admin', 'admin@example.com', '$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W', 'Quản trị viên', '0901234567', '123 Đường ABC, Quận 1, TP.HCM', 'admin'),
('customer1', 'customer1@example.com', '$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W', 'Nguyễn Văn A', '0901111111', '456 Đường XYZ, Quận 2, TP.HCM', 'customer'),
('customer2', 'customer2@example.com', '$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W', 'Trần Thị B', '0902222222', '789 Đường DEF, Quận 3, TP.HCM', 'customer'),
('customer3', 'customer3@example.com', '$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W', 'Lê Văn C', '0903333333', '321 Đường GHI, Quận 4, TP.HCM', 'customer'),
('customer4', 'customer4@example.com', '$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W', 'Phạm Thị D', '0904444444', '654 Đường JKL, Quận 5, TP.HCM', 'customer')
ON DUPLICATE KEY UPDATE username=username;

-- ============================================
-- CATEGORIES SEEDER
-- ============================================
INSERT INTO categories (name, description, image_url) VALUES
('Điện thoại', 'Các loại điện thoại thông minh', 'https://picsum.photos/400/400?random=1'),
('Laptop', 'Máy tính xách tay', 'https://picsum.photos/400/400?random=2'),
('Tablet', 'Máy tính bảng', 'https://picsum.photos/400/400?random=3'),
('Phụ kiện', 'Phụ kiện điện tử', 'https://picsum.photos/400/400?random=4'),
('Đồng hồ thông minh', 'Smartwatch và đồng hồ thông minh', 'https://picsum.photos/400/400?random=5'),
('Tai nghe', 'Tai nghe không dây và có dây', 'https://picsum.photos/400/400?random=6')
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- PRODUCTS SEEDER
-- ============================================
INSERT INTO products (name, description, price, stock, category_id, image_url, status) VALUES
('iPhone 15 Pro', 'Điện thoại thông minh cao cấp với chip A17 Pro, camera 48MP, màn hình Super Retina XDR 6.1 inch', 24990000, 50, 1, 'https://picsum.photos/400/400?random=10', 'active'),
('Samsung Galaxy S24 Ultra', 'Flagship Android với camera 200MP, bút S Pen, màn hình Dynamic AMOLED 2X 6.8 inch', 29990000, 30, 1, 'https://picsum.photos/400/400?random=11', 'active'),
('Xiaomi 14 Pro', 'Điện thoại Android với chip Snapdragon 8 Gen 3, camera Leica 50MP', 19990000, 40, 1, 'https://picsum.photos/400/400?random=12', 'active'),
('OPPO Find X7', 'Flagship với camera Hasselblad, sạc nhanh 100W', 18990000, 25, 1, 'https://picsum.photos/400/400?random=13', 'active'),
('MacBook Pro M3', 'Laptop chuyên nghiệp với chip M3, màn hình Liquid Retina XDR 14 inch, 18GB RAM', 45990000, 20, 2, 'https://picsum.photos/400/400?random=20', 'active'),
('Dell XPS 15', 'Laptop cao cấp với màn hình OLED 15.6 inch, Intel Core i7, 16GB RAM', 32990000, 15, 2, 'https://picsum.photos/400/400?random=21', 'active'),
('ASUS ROG Zephyrus G16', 'Laptop gaming với RTX 4060, Intel Core i9, màn hình 16 inch 165Hz', 39990000, 12, 2, 'https://picsum.photos/400/400?random=22', 'active'),
('Lenovo ThinkPad X1 Carbon', 'Laptop doanh nhân siêu nhẹ, Intel Core i7, 16GB RAM', 28990000, 18, 2, 'https://picsum.photos/400/400?random=23', 'active'),
('iPad Pro 12.9 inch', 'Tablet chuyên nghiệp với chip M2, màn hình Liquid Retina XDR 12.9 inch', 27990000, 25, 3, 'https://picsum.photos/400/400?random=30', 'active'),
('Samsung Galaxy Tab S9 Ultra', 'Tablet Android cao cấp với màn hình 14.6 inch, bút S Pen', 22990000, 20, 3, 'https://picsum.photos/400/400?random=31', 'active'),
('iPad Air 11 inch', 'Tablet đa năng với chip M2, màn hình Liquid Retina 11 inch', 18990000, 30, 3, 'https://picsum.photos/400/400?random=32', 'active'),
('Tai nghe AirPods Pro 2', 'Tai nghe không dây chống ồn chủ động, chip H2', 5990000, 100, 4, 'https://picsum.photos/400/400?random=40', 'active'),
('Chuột Logitech MX Master 3S', 'Chuột không dây chuyên nghiệp với cảm biến 8K DPI', 2990000, 80, 4, 'https://picsum.photos/400/400?random=41', 'active'),
('Bàn phím cơ Keychron K8', 'Bàn phím cơ không dây, switch Gateron, RGB', 2490000, 60, 4, 'https://picsum.photos/400/400?random=42', 'active'),
('Ốp lưng iPhone 15 Pro', 'Ốp lưng trong suốt chống sốc, MagSafe', 490000, 200, 4, 'https://picsum.photos/400/400?random=43', 'active'),
('Apple Watch Series 9', 'Đồng hồ thông minh với chip S9, màn hình Always-On Retina', 10990000, 40, 5, 'https://picsum.photos/400/400?random=50', 'active'),
('Samsung Galaxy Watch 6', 'Smartwatch Android với màn hình AMOLED, pin 2 ngày', 6990000, 35, 5, 'https://picsum.photos/400/400?random=51', 'active'),
('Sony WH-1000XM5', 'Tai nghe chống ồn chủ động, pin 30 giờ', 8990000, 50, 6, 'https://picsum.photos/400/400?random=60', 'active'),
('Bose QuietComfort 45', 'Tai nghe chống ồn cao cấp, âm thanh sống động', 7990000, 45, 6, 'https://picsum.photos/400/400?random=61', 'active')
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- PRODUCT VARIANTS SEEDER
-- ============================================
INSERT INTO product_variants (product_id, variant_type, variant_value, price_adjustment, stock, sku) VALUES
(1, 'storage', '128GB', 0, 20, 'IP15P-128'),
(1, 'storage', '256GB', 2000000, 20, 'IP15P-256'),
(1, 'storage', '512GB', 5000000, 10, 'IP15P-512'),
(1, 'color', 'Titanium Xanh', 0, 15, 'IP15P-TX'),
(1, 'color', 'Titanium Trắng', 0, 15, 'IP15P-TT'),
(1, 'color', 'Titanium Đen', 0, 20, 'IP15P-TĐ'),
(2, 'storage', '256GB', 0, 15, 'S24U-256'),
(2, 'storage', '512GB', 3000000, 10, 'S24U-512'),
(2, 'storage', '1TB', 8000000, 5, 'S24U-1TB'),
(2, 'color', 'Titanium Đen', 0, 10, 'S24U-TĐ'),
(2, 'color', 'Titanium Vàng', 0, 10, 'S24U-TV'),
(2, 'color', 'Titanium Tím', 0, 10, 'S24U-TT'),
(5, 'storage', '512GB SSD', 0, 10, 'MBP-M3-512'),
(5, 'storage', '1TB SSD', 5000000, 7, 'MBP-M3-1TB'),
(5, 'storage', '2TB SSD', 12000000, 3, 'MBP-M3-2TB'),
(5, 'ram', '18GB RAM', 0, 10, 'MBP-M3-18GB'),
(5, 'ram', '36GB RAM', 8000000, 10, 'MBP-M3-36GB'),
(9, 'storage', '256GB', 0, 10, 'IPADP-256'),
(9, 'storage', '512GB', 3000000, 8, 'IPADP-512'),
(9, 'storage', '1TB', 8000000, 7, 'IPADP-1TB'),
(9, 'color', 'Bạc', 0, 12, 'IPADP-BAC'),
(9, 'color', 'Xám', 0, 13, 'IPADP-XAM'),
(13, 'color', 'Trắng', 0, 50, 'APP2-TRANG'),
(13, 'color', 'Đen', 0, 50, 'APP2-DEN'),
(15, 'size', '41mm', 0, 20, 'AW9-41'),
(15, 'size', '45mm', 2000000, 20, 'AW9-45'),
(15, 'color', 'Midnight', 0, 15, 'AW9-MID'),
(15, 'color', 'Starlight', 0, 15, 'AW9-STA'),
(15, 'color', 'Product Red', 0, 10, 'AW9-RED')
ON DUPLICATE KEY UPDATE sku=sku;

-- ============================================
-- PRODUCT IMAGES SEEDER
-- ============================================
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
(1, 'https://picsum.photos/800/800?random=100', TRUE, 1),
(1, 'https://picsum.photos/800/800?random=101', FALSE, 2),
(1, 'https://picsum.photos/800/800?random=102', FALSE, 3),
(2, 'https://picsum.photos/800/800?random=110', TRUE, 1),
(2, 'https://picsum.photos/800/800?random=111', FALSE, 2),
(5, 'https://picsum.photos/800/800?random=200', TRUE, 1),
(5, 'https://picsum.photos/800/800?random=201', FALSE, 2),
(5, 'https://picsum.photos/800/800?random=202', FALSE, 3),
(9, 'https://picsum.photos/800/800?random=300', TRUE, 1),
(9, 'https://picsum.photos/800/800?random=301', FALSE, 2),
(13, 'https://picsum.photos/800/800?random=400', TRUE, 1),
(13, 'https://picsum.photos/800/800?random=401', FALSE, 2),
(15, 'https://picsum.photos/800/800?random=500', TRUE, 1),
(15, 'https://picsum.photos/800/800?random=501', FALSE, 2)
ON DUPLICATE KEY UPDATE image_url=image_url;

-- ============================================
-- COUPONS SEEDER
-- ============================================
INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, user_limit, start_date, end_date, status) VALUES
('WELCOME10', 'Giảm 10% cho khách hàng mới', 'percentage', 10, 100000, 500000, 100, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 'active'),
('SAVE50K', 'Giảm 50.000đ cho đơn hàng từ 500.000đ', 'fixed', 50000, 500000, NULL, 200, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 'active'),
('VIP20', 'Giảm 20% cho đơn hàng từ 2.000.000đ', 'percentage', 20, 2000000, 1000000, 50, 1, NOW(), DATE_ADD(NOW(), INTERVAL 6 MONTH), 'active'),
('SUMMER2024', 'Giảm 15% mùa hè 2024', 'percentage', 15, 1000000, 750000, 100, 2, NOW(), DATE_ADD(NOW(), INTERVAL 3 MONTH), 'active'),
('FREESHIP', 'Miễn phí vận chuyển', 'fixed', 30000, 200000, NULL, 500, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 'active'),
('NEWYEAR2024', 'Chào năm mới - Giảm 25%', 'percentage', 25, 3000000, 2000000, 30, 1, NOW(), DATE_ADD(NOW(), INTERVAL 2 MONTH), 'active')
ON DUPLICATE KEY UPDATE code=code;

-- Add foreign key for coupon_id in orders table (after coupons are created)
-- Check if constraint already exists before adding
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'orders'
    AND CONSTRAINT_NAME = 'fk_orders_coupon'
);

SET @sql = IF(@constraint_exists = 0,
  'ALTER TABLE orders ADD CONSTRAINT fk_orders_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- ORDERS SEEDER
-- ============================================
INSERT INTO orders (user_id, total_amount, status, shipping_address, phone, notes, coupon_id, discount_amount, payment_status, created_at) VALUES
(2, 24990000, 'delivered', '456 Đường XYZ, Quận 2, TP.HCM', '0901111111', 'Giao hàng vào buổi sáng', NULL, 0, 'paid', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(2, 32990000, 'shipped', '456 Đường XYZ, Quận 2, TP.HCM', '0901111111', NULL, 3, 6598000, 'paid', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 5990000, 'processing', '789 Đường DEF, Quận 3, TP.HCM', '0902222222', 'Cần kiểm tra kỹ', 1, 599000, 'paid', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 18990000, 'pending', '789 Đường DEF, Quận 3, TP.HCM', '0902222222', NULL, NULL, 0, 'unpaid', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 10990000, 'delivered', '321 Đường GHI, Quận 4, TP.HCM', '0903333333', NULL, 2, 50000, 'paid', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(4, 27990000, 'delivered', '321 Đường GHI, Quận 4, TP.HCM', '0903333333', 'Đã nhận hàng', NULL, 0, 'paid', DATE_SUB(NOW(), INTERVAL 10 DAY))
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- ORDER ITEMS SEEDER
-- ============================================
INSERT INTO order_items (order_id, product_id, variant_id, quantity, price) VALUES
(1, 1, 2, 1, 26990000),
(2, 6, NULL, 1, 32990000),
(3, 13, 20, 1, 5990000),
(4, 11, NULL, 1, 18990000),
(5, 15, 22, 1, 10990000),
(6, 9, 15, 1, 27990000)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- COUPON USAGE SEEDER
-- ============================================
INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount, used_at) VALUES
(3, 2, 2, 6598000, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 3, 3, 599000, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 4, 5, 50000, DATE_SUB(NOW(), INTERVAL 20 DAY))
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- CART SEEDER
-- ============================================
INSERT INTO cart (user_id, product_id, variant_id, quantity) VALUES
(2, 5, 12, 1),
(2, 13, 20, 2),
(3, 9, 15, 1),
(3, 15, 22, 1),
(4, 2, 7, 1),
(4, 6, NULL, 1)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

-- ============================================
-- PRODUCT REVIEWS SEEDER
-- ============================================
INSERT INTO product_reviews (product_id, user_id, order_id, rating, comment, status, created_at) VALUES
(1, 2, 1, 5, 'Sản phẩm tuyệt vời! Camera rất sắc nét, hiệu năng mạnh mẽ. Đáng giá từng đồng!', 'approved', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(1, 2, 1, 5, 'Pin tốt, sử dụng cả ngày không lo hết pin. Rất hài lòng!', 'approved', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(6, 2, 2, 4, 'Laptop đẹp, màn hình sắc nét. Nhưng giá hơi cao.', 'approved', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(13, 3, 3, 5, 'Tai nghe chống ồn tốt, âm thanh hay. Rất đáng mua!', 'approved', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(15, 4, 5, 5, 'Đồng hồ đẹp, nhiều tính năng hữu ích. Pin tốt.', 'approved', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(9, 4, 6, 4, 'iPad Pro màn hình đẹp, hiệu năng tốt. Phù hợp cho công việc.', 'approved', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(2, 4, NULL, 3, 'Sản phẩm ổn nhưng giá hơi cao so với đối thủ.', 'pending', DATE_SUB(NOW(), INTERVAL 2 DAY))
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- WISHLIST SEEDER
-- ============================================
INSERT INTO wishlist (user_id, product_id) VALUES
(2, 2),
(2, 9),
(3, 5),
(3, 15),
(4, 1),
(4, 13),
(5, 2),
(5, 9),
(5, 15)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- PRODUCT RELATIONS SEEDER
-- ============================================
INSERT INTO product_relations (product_id, related_product_id) VALUES
(1, 2),
(1, 13),
(1, 15),
(1, 14),
(2, 1),
(2, 16),
(2, 13),
(5, 6),
(5, 7),
(5, 12),
(5, 13),
(9, 10),
(9, 11),
(9, 13),
(9, 15),
(13, 1),
(13, 2),
(13, 9),
(13, 15)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- PAYMENTS SEEDER
-- ============================================
INSERT INTO payments (order_id, payment_method, transaction_id, amount, status, vnpay_transaction_no, vnpay_response_code, payment_date, created_at) VALUES
(1, 'vnpay', 'TXN001', 24990000, 'success', 'VNPAY123456789', '00', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
(2, 'vnpay', 'TXN002', 26392000, 'success', 'VNPAY123456790', '00', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 'vnpay', 'TXN003', 5391000, 'success', 'VNPAY123456791', '00', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 'vnpay', 'TXN004', 10940000, 'success', 'VNPAY123456792', '00', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
(6, 'vnpay', 'TXN005', 27990000, 'success', 'VNPAY123456793', '00', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY))
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- DAILY STATISTICS SEEDER (Sample data for last 30 days)
-- ============================================
INSERT INTO daily_statistics (date, total_orders, total_revenue, total_users, total_products_sold) VALUES
(DATE_SUB(CURDATE(), INTERVAL 30 DAY), 2, 35980000, 1, 2),
(DATE_SUB(CURDATE(), INTERVAL 25 DAY), 1, 18990000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 20 DAY), 1, 10990000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 15 DAY), 1, 24990000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 10 DAY), 1, 27990000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 5 DAY), 1, 26392000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, 5391000, 1, 1)
ON DUPLICATE KEY UPDATE 
  total_orders=VALUES(total_orders),
  total_revenue=VALUES(total_revenue),
  total_users=VALUES(total_users),
  total_products_sold=VALUES(total_products_sold);

-- ============================================
-- UPDATE COUPON USED COUNT
-- ============================================
UPDATE coupons SET used_count = (
  SELECT COUNT(*) FROM coupon_usage WHERE coupon_usage.coupon_id = coupons.id
) WHERE id IN (1, 2, 3);

-- ============================================
-- RE-ENABLE FOREIGN KEY CHECKS
-- ============================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
SELECT 'Database schema and seeder data created successfully!' AS message;
