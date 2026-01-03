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
('customer4', 'customer4@example.com', '$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W', 'Phạm Thị D', '0904444444', '654 Đường JKL, Quận 5, TP.HCM', 'customer'),
('customer5', 'customer5@example.com', '$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W', 'Hoàng Văn E', '0905555555', '111 Đường MNO, Quận 6, TP.HCM', 'customer'),
('customer6', 'customer6@example.com', '$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W', 'Vũ Thị F', '0906666666', '222 Đường PQR, Quận 7, TP.HCM', 'customer'),
('customer7', 'customer7@example.com', '$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W', 'Đỗ Văn G', '0907777777', '333 Đường STU, Quận 8, TP.HCM', 'customer'),
('customer8', 'customer8@example.com', '$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W', 'Bùi Thị H', '0908888888', '444 Đường VWX, Quận 9, TP.HCM', 'customer'),
('customer9', 'customer9@example.com', '$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W', 'Lý Văn I', '0909999999', '555 Đường YZA, Quận 10, TP.HCM', 'customer'),
('customer10', 'customer10@example.com', '$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W', 'Đinh Thị K', '0910000000', '666 Đường BCD, Quận 11, TP.HCM', 'customer'),
('customer11', 'customer11@example.com', '$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W', 'Trương Văn L', '0911111111', '777 Đường EFG, Quận 12, TP.HCM', 'customer'),
('customer12', 'customer12@example.com', '$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W', 'Phan Thị M', '0912222222', '888 Đường HIJ, Quận Bình Thạnh, TP.HCM', 'customer'),
('customer13', 'customer13@example.com', '$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W', 'Võ Văn N', '0913333333', '999 Đường KLM, Quận Tân Bình, TP.HCM', 'customer'),
('customer14', 'customer14@example.com', '$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W', 'Dương Thị O', '0914444444', '101 Đường NOP, Quận Phú Nhuận, TP.HCM', 'customer'),
('customer15', 'customer15@example.com', '$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W', 'Ngô Văn P', '0915555555', '202 Đường QRS, Quận Gò Vấp, TP.HCM', 'customer')
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
('iPhone 14 Pro Max', 'Điện thoại cao cấp với chip A16 Bionic, camera 48MP, màn hình 6.7 inch', 22990000, 35, 1, 'https://picsum.photos/400/400?random=14', 'active'),
('Samsung Galaxy S23', 'Điện thoại Android với camera 50MP, chip Snapdragon 8 Gen 2', 17990000, 45, 1, 'https://picsum.photos/400/400?random=15', 'active'),
('Google Pixel 8 Pro', 'Điện thoại với camera AI, chip Tensor G3, Android thuần', 21990000, 20, 1, 'https://picsum.photos/400/400?random=16', 'active'),
('OnePlus 12', 'Flagship với sạc nhanh 100W, màn hình 120Hz, chip Snapdragon 8 Gen 3', 16990000, 30, 1, 'https://picsum.photos/400/400?random=17', 'active'),
('MacBook Pro M3', 'Laptop chuyên nghiệp với chip M3, màn hình Liquid Retina XDR 14 inch, 18GB RAM', 45990000, 20, 2, 'https://picsum.photos/400/400?random=20', 'active'),
('Dell XPS 15', 'Laptop cao cấp với màn hình OLED 15.6 inch, Intel Core i7, 16GB RAM', 32990000, 15, 2, 'https://picsum.photos/400/400?random=21', 'active'),
('ASUS ROG Zephyrus G16', 'Laptop gaming với RTX 4060, Intel Core i9, màn hình 16 inch 165Hz', 39990000, 12, 2, 'https://picsum.photos/400/400?random=22', 'active'),
('Lenovo ThinkPad X1 Carbon', 'Laptop doanh nhân siêu nhẹ, Intel Core i7, 16GB RAM', 28990000, 18, 2, 'https://picsum.photos/400/400?random=23', 'active'),
('MacBook Air M2', 'Laptop siêu mỏng với chip M2, màn hình Retina 13.6 inch', 27990000, 25, 2, 'https://picsum.photos/400/400?random=24', 'active'),
('HP Spectre x360', 'Laptop 2-in-1 cao cấp, Intel Core i7, màn hình OLED 13.5 inch', 31990000, 10, 2, 'https://picsum.photos/400/400?random=25', 'active'),
('MSI Stealth 16', 'Laptop gaming mỏng nhẹ, RTX 4070, Intel Core i9', 42990000, 8, 2, 'https://picsum.photos/400/400?random=26', 'active'),
('iPad Pro 12.9 inch', 'Tablet chuyên nghiệp với chip M2, màn hình Liquid Retina XDR 12.9 inch', 27990000, 25, 3, 'https://picsum.photos/400/400?random=30', 'active'),
('Samsung Galaxy Tab S9 Ultra', 'Tablet Android cao cấp với màn hình 14.6 inch, bút S Pen', 22990000, 20, 3, 'https://picsum.photos/400/400?random=31', 'active'),
('iPad Air 11 inch', 'Tablet đa năng với chip M2, màn hình Liquid Retina 11 inch', 18990000, 30, 3, 'https://picsum.photos/400/400?random=32', 'active'),
('iPad Mini 6', 'Tablet nhỏ gọn với chip A15, màn hình 8.3 inch', 14990000, 40, 3, 'https://picsum.photos/400/400?random=33', 'active'),
('Xiaomi Pad 6', 'Tablet Android giá rẻ, màn hình 11 inch 144Hz', 8990000, 50, 3, 'https://picsum.photos/400/400?random=34', 'active'),
('Tai nghe AirPods Pro 2', 'Tai nghe không dây chống ồn chủ động, chip H2', 5990000, 100, 4, 'https://picsum.photos/400/400?random=40', 'active'),
('Chuột Logitech MX Master 3S', 'Chuột không dây chuyên nghiệp với cảm biến 8K DPI', 2990000, 80, 4, 'https://picsum.photos/400/400?random=41', 'active'),
('Bàn phím cơ Keychron K8', 'Bàn phím cơ không dây, switch Gateron, RGB', 2490000, 60, 4, 'https://picsum.photos/400/400?random=42', 'active'),
('Ốp lưng iPhone 15 Pro', 'Ốp lưng trong suốt chống sốc, MagSafe', 490000, 200, 4, 'https://picsum.photos/400/400?random=43', 'active'),
('Sạc không dây MagSafe', 'Sạc không dây 15W, tương thích MagSafe', 1290000, 150, 4, 'https://picsum.photos/400/400?random=44', 'active'),
('Cáp USB-C 2m', 'Cáp sạc nhanh USB-C, hỗ trợ 100W', 290000, 300, 4, 'https://picsum.photos/400/400?random=45', 'active'),
('Ống kính macro cho iPhone', 'Ống kính macro chuyên nghiệp, gắn kèm', 890000, 80, 4, 'https://picsum.photos/400/400?random=46', 'active'),
('Giá đỡ laptop', 'Giá đỡ laptop nhôm, điều chỉnh độ cao', 590000, 120, 4, 'https://picsum.photos/400/400?random=47', 'active'),
('Apple Watch Series 9', 'Đồng hồ thông minh với chip S9, màn hình Always-On Retina', 10990000, 40, 5, 'https://picsum.photos/400/400?random=50', 'active'),
('Samsung Galaxy Watch 6', 'Smartwatch Android với màn hình AMOLED, pin 2 ngày', 6990000, 35, 5, 'https://picsum.photos/400/400?random=51', 'active'),
('Apple Watch SE', 'Đồng hồ thông minh giá rẻ, chip S8', 5990000, 50, 5, 'https://picsum.photos/400/400?random=52', 'active'),
('Garmin Forerunner 265', 'Đồng hồ chạy bộ chuyên nghiệp, GPS tích hợp', 8990000, 25, 5, 'https://picsum.photos/400/400?random=53', 'active'),
('Sony WH-1000XM5', 'Tai nghe chống ồn chủ động, pin 30 giờ', 8990000, 50, 6, 'https://picsum.photos/400/400?random=60', 'active'),
('Bose QuietComfort 45', 'Tai nghe chống ồn cao cấp, âm thanh sống động', 7990000, 45, 6, 'https://picsum.photos/400/400?random=61', 'active'),
('AirPods Max', 'Tai nghe over-ear cao cấp, chống ồn chủ động', 12990000, 30, 6, 'https://picsum.photos/400/400?random=62', 'active'),
('JBL Tune 770NC', 'Tai nghe chống ồn giá rẻ, pin 50 giờ', 2990000, 60, 6, 'https://picsum.photos/400/400?random=63', 'active'),
('Sennheiser Momentum 4', 'Tai nghe cao cấp, âm thanh Hi-Fi', 9990000, 20, 6, 'https://picsum.photos/400/400?random=64', 'active')
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
(15, 'color', 'Product Red', 0, 10, 'AW9-RED'),
(5, 'storage', '256GB SSD', -2000000, 15, 'MBP-M3-256'),
(6, 'storage', '512GB SSD', 0, 10, 'DXP15-512'),
(6, 'storage', '1TB SSD', 5000000, 8, 'DXP15-1TB'),
(6, 'ram', '16GB RAM', 0, 10, 'DXP15-16GB'),
(6, 'ram', '32GB RAM', 8000000, 5, 'DXP15-32GB'),
(9, 'color', 'Space Gray', 0, 10, 'MBP-M3-SG'),
(9, 'color', 'Silver', 0, 10, 'MBP-M3-SLV'),
(13, 'storage', '256GB', 0, 15, 'MBAM2-256'),
(13, 'storage', '512GB', 3000000, 10, 'MBAM2-512'),
(13, 'storage', '1TB', 8000000, 5, 'MBAM2-1TB'),
(16, 'storage', '128GB', 0, 20, 'IPADP12-128'),
(16, 'storage', '256GB', 2000000, 15, 'IPADP12-256'),
(16, 'storage', '512GB', 5000000, 10, 'IPADP12-512'),
(16, 'storage', '1TB', 10000000, 5, 'IPADP12-1TB'),
(17, 'storage', '128GB', 0, 15, 'IPADM-128'),
(17, 'storage', '256GB', 2000000, 15, 'IPADM-256'),
(17, 'storage', '512GB', 5000000, 10, 'IPADM-512'),
(17, 'color', 'Space Gray', 0, 12, 'IPADM-SG'),
(17, 'color', 'Pink', 0, 12, 'IPADM-PK'),
(17, 'color', 'Purple', 0, 11, 'IPADM-PP'),
(28, 'size', '41mm', 0, 15, 'AWSE-41'),
(28, 'size', '44mm', 2000000, 15, 'AWSE-44'),
(28, 'color', 'Midnight', 0, 10, 'AWSE-MID'),
(28, 'color', 'Starlight', 0, 10, 'AWSE-STA'),
(28, 'color', 'Product Red', 0, 10, 'AWSE-RED'),
(30, 'color', 'Space Gray', 0, 15, 'APM-SG'),
(30, 'color', 'Silver', 0, 15, 'APM-SLV'),
(30, 'color', 'Sky Blue', 0, 0, 'APM-SB'),
(32, 'color', 'Black', 0, 30, 'JBL-BLK'),
(32, 'color', 'Blue', 0, 30, 'JBL-BLU'),
(33, 'color', 'Black', 0, 10, 'SEN-BLK'),
(33, 'color', 'Silver', 0, 10, 'SEN-SLV')
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
(15, 'https://picsum.photos/800/800?random=501', FALSE, 2),
(3, 'https://picsum.photos/800/800?random=120', TRUE, 1),
(3, 'https://picsum.photos/800/800?random=121', FALSE, 2),
(4, 'https://picsum.photos/800/800?random=130', TRUE, 1),
(4, 'https://picsum.photos/800/800?random=131', FALSE, 2),
(5, 'https://picsum.photos/800/800?random=140', TRUE, 1),
(5, 'https://picsum.photos/800/800?random=141', FALSE, 2),
(6, 'https://picsum.photos/800/800?random=150', TRUE, 1),
(6, 'https://picsum.photos/800/800?random=151', FALSE, 2),
(7, 'https://picsum.photos/800/800?random=160', TRUE, 1),
(7, 'https://picsum.photos/800/800?random=161', FALSE, 2),
(8, 'https://picsum.photos/800/800?random=170', TRUE, 1),
(8, 'https://picsum.photos/800/800?random=171', FALSE, 2),
(10, 'https://picsum.photos/800/800?random=210', TRUE, 1),
(10, 'https://picsum.photos/800/800?random=211', FALSE, 2),
(11, 'https://picsum.photos/800/800?random=220', TRUE, 1),
(11, 'https://picsum.photos/800/800?random=221', FALSE, 2),
(12, 'https://picsum.photos/800/800?random=230', TRUE, 1),
(12, 'https://picsum.photos/800/800?random=231', FALSE, 2),
(13, 'https://picsum.photos/800/800?random=240', TRUE, 1),
(13, 'https://picsum.photos/800/800?random=241', FALSE, 2),
(14, 'https://picsum.photos/800/800?random=250', TRUE, 1),
(14, 'https://picsum.photos/800/800?random=251', FALSE, 2),
(16, 'https://picsum.photos/800/800?random=310', TRUE, 1),
(16, 'https://picsum.photos/800/800?random=311', FALSE, 2),
(17, 'https://picsum.photos/800/800?random=320', TRUE, 1),
(17, 'https://picsum.photos/800/800?random=321', FALSE, 2),
(18, 'https://picsum.photos/800/800?random=330', TRUE, 1),
(18, 'https://picsum.photos/800/800?random=331', FALSE, 2),
(19, 'https://picsum.photos/800/800?random=340', TRUE, 1),
(19, 'https://picsum.photos/800/800?random=341', FALSE, 2),
(20, 'https://picsum.photos/800/800?random=350', TRUE, 1),
(20, 'https://picsum.photos/800/800?random=351', FALSE, 2),
(21, 'https://picsum.photos/800/800?random=410', TRUE, 1),
(21, 'https://picsum.photos/800/800?random=411', FALSE, 2),
(22, 'https://picsum.photos/800/800?random=420', TRUE, 1),
(22, 'https://picsum.photos/800/800?random=421', FALSE, 2),
(23, 'https://picsum.photos/800/800?random=430', TRUE, 1),
(23, 'https://picsum.photos/800/800?random=431', FALSE, 2),
(24, 'https://picsum.photos/800/800?random=440', TRUE, 1),
(24, 'https://picsum.photos/800/800?random=441', FALSE, 2),
(25, 'https://picsum.photos/800/800?random=450', TRUE, 1),
(25, 'https://picsum.photos/800/800?random=451', FALSE, 2),
(26, 'https://picsum.photos/800/800?random=460', TRUE, 1),
(26, 'https://picsum.photos/800/800?random=461', FALSE, 2),
(27, 'https://picsum.photos/800/800?random=470', TRUE, 1),
(27, 'https://picsum.photos/800/800?random=471', FALSE, 2),
(28, 'https://picsum.photos/800/800?random=480', TRUE, 1),
(28, 'https://picsum.photos/800/800?random=481', FALSE, 2),
(29, 'https://picsum.photos/800/800?random=510', TRUE, 1),
(29, 'https://picsum.photos/800/800?random=511', FALSE, 2),
(30, 'https://picsum.photos/800/800?random=520', TRUE, 1),
(30, 'https://picsum.photos/800/800?random=521', FALSE, 2),
(31, 'https://picsum.photos/800/800?random=530', TRUE, 1),
(31, 'https://picsum.photos/800/800?random=531', FALSE, 2),
(32, 'https://picsum.photos/800/800?random=540', TRUE, 1),
(32, 'https://picsum.photos/800/800?random=541', FALSE, 2),
(33, 'https://picsum.photos/800/800?random=550', TRUE, 1),
(33, 'https://picsum.photos/800/800?random=551', FALSE, 2),
(34, 'https://picsum.photos/800/800?random=560', TRUE, 1),
(34, 'https://picsum.photos/800/800?random=561', FALSE, 2),
(35, 'https://picsum.photos/800/800?random=570', TRUE, 1),
(35, 'https://picsum.photos/800/800?random=571', FALSE, 2),
(36, 'https://picsum.photos/800/800?random=580', TRUE, 1),
(36, 'https://picsum.photos/800/800?random=581', FALSE, 2)
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
(4, 27990000, 'delivered', '321 Đường GHI, Quận 4, TP.HCM', '0903333333', 'Đã nhận hàng', NULL, 0, 'paid', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(5, 19990000, 'delivered', '111 Đường MNO, Quận 6, TP.HCM', '0905555555', NULL, 1, 1999000, 'paid', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(5, 8990000, 'shipped', '111 Đường MNO, Quận 6, TP.HCM', '0905555555', NULL, NULL, 0, 'paid', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(6, 45990000, 'processing', '222 Đường PQR, Quận 7, TP.HCM', '0906666666', 'Giao hàng nhanh', 3, 9198000, 'paid', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(6, 2990000, 'delivered', '222 Đường PQR, Quận 7, TP.HCM', '0906666666', NULL, NULL, 0, 'paid', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(7, 22990000, 'delivered', '333 Đường STU, Quận 8, TP.HCM', '0907777777', NULL, 1, 2299000, 'paid', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(7, 12990000, 'shipped', '333 Đường STU, Quận 8, TP.HCM', '0907777777', NULL, NULL, 0, 'paid', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(8, 17990000, 'delivered', '444 Đường VWX, Quận 9, TP.HCM', '0908888888', NULL, 1, 1799000, 'paid', DATE_SUB(NOW(), INTERVAL 16 DAY)),
(8, 2490000, 'delivered', '444 Đường VWX, Quận 9, TP.HCM', '0908888888', NULL, NULL, 0, 'paid', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(9, 31990000, 'processing', '555 Đường YZA, Quận 10, TP.HCM', '0909999999', NULL, 3, 6398000, 'paid', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(9, 5990000, 'delivered', '555 Đường YZA, Quận 10, TP.HCM', '0909999999', NULL, NULL, 0, 'paid', DATE_SUB(NOW(), INTERVAL 11 DAY)),
(10, 14990000, 'delivered', '666 Đường BCD, Quận 11, TP.HCM', '0910000000', NULL, 1, 1499000, 'paid', DATE_SUB(NOW(), INTERVAL 13 DAY)),
(10, 6990000, 'shipped', '666 Đường BCD, Quận 11, TP.HCM', '0910000000', NULL, NULL, 0, 'paid', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(11, 42990000, 'delivered', '777 Đường EFG, Quận 12, TP.HCM', '0911111111', NULL, 3, 8598000, 'paid', DATE_SUB(NOW(), INTERVAL 17 DAY)),
(11, 2990000, 'delivered', '777 Đường EFG, Quận 12, TP.HCM', '0911111111', NULL, NULL, 0, 'paid', DATE_SUB(NOW(), INTERVAL 19 DAY)),
(12, 18990000, 'processing', '888 Đường HIJ, Quận Bình Thạnh, TP.HCM', '0912222222', NULL, 1, 1899000, 'paid', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(12, 7990000, 'delivered', '888 Đường HIJ, Quận Bình Thạnh, TP.HCM', '0912222222', NULL, NULL, 0, 'paid', DATE_SUB(NOW(), INTERVAL 21 DAY)),
(13, 21990000, 'delivered', '999 Đường KLM, Quận Tân Bình, TP.HCM', '0913333333', NULL, 1, 2199000, 'paid', DATE_SUB(NOW(), INTERVAL 22 DAY)),
(13, 490000, 'delivered', '999 Đường KLM, Quận Tân Bình, TP.HCM', '0913333333', NULL, NULL, 0, 'paid', DATE_SUB(NOW(), INTERVAL 23 DAY)),
(14, 16990000, 'shipped', '101 Đường NOP, Quận Phú Nhuận, TP.HCM', '0914444444', NULL, 1, 1699000, 'paid', DATE_SUB(NOW(), INTERVAL 24 DAY)),
(14, 8990000, 'delivered', '101 Đường NOP, Quận Phú Nhuận, TP.HCM', '0914444444', NULL, NULL, 0, 'paid', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(15, 27990000, 'delivered', '202 Đường QRS, Quận Gò Vấp, TP.HCM', '0915555555', NULL, 1, 2799000, 'paid', DATE_SUB(NOW(), INTERVAL 26 DAY)),
(15, 1290000, 'delivered', '202 Đường QRS, Quận Gò Vấp, TP.HCM', '0915555555', NULL, NULL, 0, 'paid', DATE_SUB(NOW(), INTERVAL 27 DAY))
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
(6, 9, 15, 1, 27990000),
(7, 3, NULL, 1, 19990000),
(8, 33, NULL, 1, 8990000),
(9, 9, 12, 1, 45990000),
(10, 22, NULL, 1, 2990000),
(11, 5, NULL, 1, 22990000),
(12, 30, NULL, 1, 12990000),
(13, 6, NULL, 1, 17990000),
(14, 23, NULL, 1, 2490000),
(15, 10, NULL, 1, 31990000),
(16, 13, 20, 1, 5990000),
(17, 11, NULL, 1, 14990000),
(18, 29, NULL, 1, 6990000),
(19, 12, NULL, 1, 42990000),
(20, 22, NULL, 1, 2990000),
(21, 3, NULL, 1, 18990000),
(22, 34, NULL, 1, 7990000),
(23, 7, NULL, 1, 21990000),
(24, 24, NULL, 1, 490000),
(25, 6, NULL, 1, 16990000),
(26, 33, NULL, 1, 8990000),
(27, 9, 15, 1, 27990000),
(28, 25, NULL, 1, 1290000),
(2, 13, 20, 1, 5990000),
(7, 24, NULL, 2, 980000),
(9, 13, 20, 1, 5990000),
(11, 15, 22, 1, 10990000),
(15, 13, 20, 1, 5990000),
(19, 15, 22, 1, 10990000)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- COUPON USAGE SEEDER
-- ============================================
INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount, used_at) VALUES
(3, 2, 2, 6598000, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 3, 3, 599000, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 4, 5, 50000, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(1, 5, 7, 1999000, DATE_SUB(NOW(), INTERVAL 18 DAY)),
(1, 7, 11, 2299000, DATE_SUB(NOW(), INTERVAL 14 DAY)),
(1, 8, 13, 1799000, DATE_SUB(NOW(), INTERVAL 16 DAY)),
(3, 6, 9, 9198000, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 9, 15, 6398000, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, 10, 17, 1499000, DATE_SUB(NOW(), INTERVAL 13 DAY)),
(3, 11, 19, 8598000, DATE_SUB(NOW(), INTERVAL 17 DAY)),
(1, 12, 21, 1899000, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 13, 23, 2199000, DATE_SUB(NOW(), INTERVAL 22 DAY)),
(1, 14, 25, 1699000, DATE_SUB(NOW(), INTERVAL 24 DAY)),
(1, 15, 27, 2799000, DATE_SUB(NOW(), INTERVAL 26 DAY))
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- CART SEEDER
-- ============================================
INSERT INTO cart (user_id, product_id, variant_id, quantity) VALUES
(2, 5, 12, 1),
(2, 13, 20, 2),
(2, 24, NULL, 1),
(3, 9, 15, 1),
(3, 15, 22, 1),
(3, 33, NULL, 1),
(4, 2, 7, 1),
(4, 6, NULL, 1),
(4, 29, NULL, 1),
(5, 3, NULL, 1),
(5, 13, 20, 1),
(6, 9, 12, 1),
(6, 22, NULL, 1),
(7, 5, NULL, 1),
(7, 30, NULL, 1),
(8, 6, NULL, 1),
(8, 23, NULL, 2),
(9, 10, NULL, 1),
(9, 13, 20, 1),
(10, 11, NULL, 1),
(10, 29, NULL, 1),
(11, 12, NULL, 1),
(11, 22, NULL, 1),
(12, 3, NULL, 1),
(12, 34, NULL, 1),
(13, 7, NULL, 1),
(13, 24, NULL, 3),
(14, 6, NULL, 1),
(14, 33, NULL, 1),
(15, 9, 15, 1),
(15, 25, NULL, 1)
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
(2, 4, NULL, 3, 'Sản phẩm ổn nhưng giá hơi cao so với đối thủ.', 'pending', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 5, 7, 5, 'Điện thoại rất đẹp, camera Leica chụp ảnh xuất sắc. Giá hợp lý!', 'approved', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(33, 5, 8, 5, 'Tai nghe Sony chất lượng tốt, chống ồn hiệu quả. Pin lâu!', 'approved', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(9, 6, 9, 5, 'MacBook Pro M3 hiệu năng tuyệt vời, màn hình đẹp. Đáng mua!', 'approved', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(22, 6, 10, 4, 'Chuột Logitech tốt, cảm biến chính xác. Giá hơi cao.', 'approved', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(5, 7, 11, 5, 'iPhone 14 Pro Max camera đẹp, pin tốt. Rất hài lòng!', 'approved', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(30, 7, 12, 5, 'AirPods Max âm thanh hay, chống ồn tốt. Đáng giá!', 'approved', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(6, 8, 13, 4, 'Dell XPS 15 màn hình đẹp, nhưng nóng khi chơi game.', 'approved', DATE_SUB(NOW(), INTERVAL 16 DAY)),
(23, 8, 14, 5, 'Bàn phím cơ Keychron tốt, switch mượt mà. Rất thích!', 'approved', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(10, 9, 15, 5, 'HP Spectre x360 đẹp, màn hình OLED sắc nét. Tuyệt vời!', 'approved', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(13, 9, 16, 5, 'AirPods Pro 2 chống ồn tốt, âm thanh hay. Đáng mua!', 'approved', DATE_SUB(NOW(), INTERVAL 11 DAY)),
(11, 10, 17, 4, 'iPad Air 11 inch đẹp, hiệu năng tốt. Phù hợp cho học tập.', 'approved', DATE_SUB(NOW(), INTERVAL 13 DAY)),
(29, 10, 18, 5, 'Samsung Galaxy Watch 6 đẹp, pin tốt. Nhiều tính năng!', 'approved', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(12, 11, 19, 5, 'MSI Stealth 16 gaming mượt, RTX 4070 mạnh. Tuyệt vời!', 'approved', DATE_SUB(NOW(), INTERVAL 17 DAY)),
(22, 11, 20, 4, 'Chuột Logitech tốt, nhưng giá hơi cao so với đối thủ.', 'approved', DATE_SUB(NOW(), INTERVAL 19 DAY)),
(3, 12, 21, 5, 'Xiaomi 14 Pro giá tốt, camera Leica đẹp. Rất hài lòng!', 'approved', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(34, 12, 22, 4, 'Bose QuietComfort 45 chống ồn tốt, âm thanh hay.', 'approved', DATE_SUB(NOW(), INTERVAL 21 DAY)),
(7, 13, 23, 5, 'Google Pixel 8 Pro camera AI tuyệt vời, Android thuần.', 'approved', DATE_SUB(NOW(), INTERVAL 22 DAY)),
(24, 13, 24, 5, 'Ốp lưng iPhone trong suốt, bảo vệ tốt. Giá hợp lý!', 'approved', DATE_SUB(NOW(), INTERVAL 23 DAY)),
(6, 14, 25, 5, 'Dell XPS 15 màn hình OLED đẹp, hiệu năng tốt.', 'approved', DATE_SUB(NOW(), INTERVAL 24 DAY)),
(33, 14, 26, 5, 'Sony WH-1000XM5 chống ồn tốt nhất, pin lâu. Tuyệt vời!', 'approved', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(9, 15, 27, 5, 'iPad Pro 12.9 inch màn hình đẹp, chip M2 mạnh. Đáng mua!', 'approved', DATE_SUB(NOW(), INTERVAL 26 DAY)),
(25, 15, 28, 4, 'Sạc không dây MagSafe tiện lợi, sạc nhanh. Giá hợp lý!', 'approved', DATE_SUB(NOW(), INTERVAL 27 DAY))
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- WISHLIST SEEDER
-- ============================================
INSERT INTO wishlist (user_id, product_id) VALUES
(2, 2),
(2, 9),
(2, 13),
(2, 15),
(3, 5),
(3, 6),
(3, 15),
(3, 30),
(4, 1),
(4, 13),
(4, 29),
(5, 2),
(5, 9),
(5, 15),
(5, 33),
(6, 9),
(6, 10),
(6, 12),
(7, 5),
(7, 30),
(7, 13),
(8, 6),
(8, 23),
(8, 24),
(9, 10),
(9, 13),
(9, 15),
(10, 11),
(10, 29),
(11, 12),
(11, 22),
(12, 3),
(12, 34),
(13, 7),
(13, 24),
(14, 6),
(14, 33),
(15, 9),
(15, 25)
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
(6, 'vnpay', 'TXN005', 27990000, 'success', 'VNPAY123456793', '00', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
(7, 'vnpay', 'TXN006', 17991000, 'success', 'VNPAY123456794', '00', DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
(8, 'vnpay', 'TXN007', 8990000, 'success', 'VNPAY123456795', '00', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
(9, 'vnpay', 'TXN008', 36792000, 'success', 'VNPAY123456796', '00', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(10, 'vnpay', 'TXN009', 2990000, 'success', 'VNPAY123456797', '00', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
(11, 'vnpay', 'TXN010', 20691000, 'success', 'VNPAY123456798', '00', DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY)),
(12, 'vnpay', 'TXN011', 12990000, 'success', 'VNPAY123456799', '00', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(13, 'vnpay', 'TXN012', 16191000, 'success', 'VNPAY123456800', '00', DATE_SUB(NOW(), INTERVAL 16 DAY), DATE_SUB(NOW(), INTERVAL 16 DAY)),
(14, 'vnpay', 'TXN013', 2490000, 'success', 'VNPAY123456801', '00', DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY)),
(15, 'vnpay', 'TXN014', 25592000, 'success', 'VNPAY123456802', '00', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(16, 'vnpay', 'TXN015', 5990000, 'success', 'VNPAY123456803', '00', DATE_SUB(NOW(), INTERVAL 11 DAY), DATE_SUB(NOW(), INTERVAL 11 DAY)),
(17, 'vnpay', 'TXN016', 13491000, 'success', 'VNPAY123456804', '00', DATE_SUB(NOW(), INTERVAL 13 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY)),
(18, 'vnpay', 'TXN017', 6990000, 'success', 'VNPAY123456805', '00', DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),
(19, 'vnpay', 'TXN018', 34392000, 'success', 'VNPAY123456806', '00', DATE_SUB(NOW(), INTERVAL 17 DAY), DATE_SUB(NOW(), INTERVAL 17 DAY)),
(20, 'vnpay', 'TXN019', 2990000, 'success', 'VNPAY123456807', '00', DATE_SUB(NOW(), INTERVAL 19 DAY), DATE_SUB(NOW(), INTERVAL 19 DAY)),
(21, 'vnpay', 'TXN020', 17091000, 'success', 'VNPAY123456808', '00', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(22, 'vnpay', 'TXN021', 7990000, 'success', 'VNPAY123456809', '00', DATE_SUB(NOW(), INTERVAL 21 DAY), DATE_SUB(NOW(), INTERVAL 21 DAY)),
(23, 'vnpay', 'TXN022', 19791000, 'success', 'VNPAY123456810', '00', DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY)),
(24, 'vnpay', 'TXN023', 490000, 'success', 'VNPAY123456811', '00', DATE_SUB(NOW(), INTERVAL 23 DAY), DATE_SUB(NOW(), INTERVAL 23 DAY)),
(25, 'vnpay', 'TXN024', 15291000, 'success', 'VNPAY123456812', '00', DATE_SUB(NOW(), INTERVAL 24 DAY), DATE_SUB(NOW(), INTERVAL 24 DAY)),
(26, 'vnpay', 'TXN025', 8990000, 'success', 'VNPAY123456813', '00', DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),
(27, 'vnpay', 'TXN026', 25191000, 'success', 'VNPAY123456814', '00', DATE_SUB(NOW(), INTERVAL 26 DAY), DATE_SUB(NOW(), INTERVAL 26 DAY)),
(28, 'vnpay', 'TXN027', 1290000, 'success', 'VNPAY123456815', '00', DATE_SUB(NOW(), INTERVAL 27 DAY), DATE_SUB(NOW(), INTERVAL 27 DAY))
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- DAILY STATISTICS SEEDER (Sample data for last 30 days)
-- ============================================
INSERT INTO daily_statistics (date, total_orders, total_revenue, total_users, total_products_sold) VALUES
(DATE_SUB(CURDATE(), INTERVAL 30 DAY), 1, 35980000, 1, 2),
(DATE_SUB(CURDATE(), INTERVAL 29 DAY), 0, 0, 0, 0),
(DATE_SUB(CURDATE(), INTERVAL 28 DAY), 1, 19791000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 27 DAY), 1, 1290000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 26 DAY), 1, 25191000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 25 DAY), 1, 18990000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 24 DAY), 1, 15291000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 23 DAY), 1, 490000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 22 DAY), 1, 19791000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 21 DAY), 1, 7990000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 20 DAY), 1, 10940000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 19 DAY), 1, 2990000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 18 DAY), 1, 17991000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 17 DAY), 1, 34392000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 16 DAY), 1, 16191000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 15 DAY), 1, 24990000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 14 DAY), 1, 20691000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 13 DAY), 1, 13491000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 12 DAY), 1, 2990000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 11 DAY), 1, 5990000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 10 DAY), 1, 27990000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 9 DAY), 1, 2490000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 8 DAY), 1, 6990000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 7 DAY), 1, 8990000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 6 DAY), 1, 12990000, 1, 1),
(DATE_SUB(CURDATE(), INTERVAL 5 DAY), 1, 26392000, 1, 2),
(DATE_SUB(CURDATE(), INTERVAL 4 DAY), 1, 25592000, 1, 2),
(DATE_SUB(CURDATE(), INTERVAL 3 DAY), 1, 36792000, 1, 2),
(DATE_SUB(CURDATE(), INTERVAL 2 DAY), 2, 22482000, 1, 2),
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 18990000, 1, 1)
ON DUPLICATE KEY UPDATE 
  total_orders=VALUES(total_orders),
  total_revenue=VALUES(total_revenue),
  total_users=VALUES(total_users),
  total_products_sold=VALUES(total_products_sold);

-- ============================================
-- UPDATE COUPON USED COUNT
-- ============================================
UPDATE coupons c
INNER JOIN (
  SELECT coupon_id, COUNT(*) as usage_count
  FROM coupon_usage
  GROUP BY coupon_id
) cu ON c.id = cu.coupon_id
SET c.used_count = cu.usage_count;

-- ============================================
-- RE-ENABLE FOREIGN KEY CHECKS
-- ============================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- BLOG/NEWS TABLES
-- ============================================

-- Blog Posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content LONGTEXT NOT NULL,
  featured_image VARCHAR(255),
  author_id INT NOT NULL,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  views INT DEFAULT 0,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at DATETIME NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_author_id (author_id),
  INDEX idx_status (status),
  INDEX idx_slug (slug),
  INDEX idx_published_at (published_at),
  FULLTEXT idx_search (title, excerpt, content)
);

-- Blog Comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT,
  parent_id INT NULL COMMENT 'For nested comments/replies',
  name VARCHAR(100) NOT NULL COMMENT 'Guest name if not logged in',
  email VARCHAR(100) COMMENT 'Guest email if not logged in',
  content TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'spam') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_id) REFERENCES blog_comments(id) ON DELETE CASCADE,
  INDEX idx_post_id (post_id),
  INDEX idx_user_id (user_id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_status (status)
);

-- Blog Categories/Tags (optional, for organizing posts)
CREATE TABLE IF NOT EXISTS blog_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug)
);

-- Blog Post Categories (many-to-many relationship)
CREATE TABLE IF NOT EXISTS blog_post_categories (
  post_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (post_id, category_id),
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE CASCADE
);

-- ============================================
-- BLOG SEEDER DATA
-- ============================================

-- Temporarily disable foreign key checks for blog data
SET FOREIGN_KEY_CHECKS = 0;

-- Blog Categories
INSERT INTO blog_categories (name, slug, description) VALUES
('Công nghệ', 'cong-nghe', 'Tin tức và đánh giá về công nghệ mới nhất'),
('Đánh giá sản phẩm', 'danh-gia-san-pham', 'Đánh giá chi tiết các sản phẩm công nghệ'),
('Hướng dẫn', 'huong-dan', 'Hướng dẫn sử dụng và mẹo vặt công nghệ'),
('Tin tức', 'tin-tuc', 'Tin tức mới nhất về công nghệ và thị trường'),
('So sánh', 'so-sanh', 'So sánh các sản phẩm công nghệ')
ON DUPLICATE KEY UPDATE name=name;

-- Blog Posts
INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, author_id, status, views, meta_title, meta_description, published_at) VALUES
('iPhone 15 Pro: Đánh giá chi tiết sau 1 tháng sử dụng', 'iphone-15-pro-danh-gia-chi-tiet', 'Trải nghiệm thực tế với iPhone 15 Pro sau 1 tháng sử dụng, từ camera đến hiệu năng và pin.', '<p>iPhone 15 Pro là một trong những flagship được mong đợi nhất năm 2024. Sau 1 tháng sử dụng, tôi có thể khẳng định đây là một sản phẩm xuất sắc với nhiều cải tiến đáng kể.</p><p>Camera 48MP cho chất lượng ảnh tuyệt vời, đặc biệt là trong điều kiện ánh sáng yếu. Chip A17 Pro mạnh mẽ, xử lý mọi tác vụ mượt mà. Pin sử dụng được cả ngày với mức sử dụng bình thường.</p>', 'https://picsum.photos/1200/600?random=1000', 1, 'published', 1250, 'iPhone 15 Pro Đánh giá', 'Đánh giá chi tiết iPhone 15 Pro sau 1 tháng sử dụng', DATE_SUB(NOW(), INTERVAL 30 DAY)),
('Top 5 Laptop tốt nhất cho sinh viên năm 2024', 'top-5-laptop-tot-nhat-cho-sinh-vien-2024', 'Danh sách 5 laptop giá rẻ, hiệu năng tốt phù hợp cho sinh viên với ngân sách hạn chế.', '<p>Lựa chọn laptop phù hợp cho sinh viên không chỉ về giá cả mà còn về hiệu năng và độ bền. Dưới đây là top 5 laptop tốt nhất cho sinh viên năm 2024.</p><p>1. MacBook Air M2 - Hiệu năng mạnh, pin lâu, màn hình đẹp<br>2. Dell XPS 13 - Thiết kế đẹp, hiệu năng tốt<br>3. ASUS ZenBook - Giá rẻ, hiệu năng ổn<br>4. Lenovo ThinkPad - Bền bỉ, phù hợp công việc<br>5. HP Pavilion - Giá rẻ, đủ dùng</p>', 'https://picsum.photos/1200/600?random=1001', 1, 'published', 890, 'Top 5 Laptop Sinh viên 2024', 'Danh sách 5 laptop tốt nhất cho sinh viên năm 2024', DATE_SUB(NOW(), INTERVAL 25 DAY)),
('Hướng dẫn bảo vệ điện thoại khỏi nước và bụi', 'huong-dan-bao-ve-dien-thoai-khoi-nuoc-va-bui', 'Các mẹo và cách bảo vệ điện thoại của bạn khỏi nước, bụi và các tác nhân gây hại khác.', '<p>Bảo vệ điện thoại khỏi nước và bụi là điều quan trọng để kéo dài tuổi thọ thiết bị. Dưới đây là các cách hiệu quả:</p><p>1. Sử dụng ốp lưng và kính cường lực<br>2. Tránh để điện thoại tiếp xúc với nước<br>3. Vệ sinh thường xuyên<br>4. Sử dụng túi chống nước khi đi biển<br>5. Bảo dưỡng định kỳ</p>', 'https://picsum.photos/1200/600?random=1002', 1, 'published', 650, 'Bảo vệ điện thoại', 'Hướng dẫn bảo vệ điện thoại khỏi nước và bụi', DATE_SUB(NOW(), INTERVAL 20 DAY)),
('So sánh AirPods Pro 2 vs Sony WH-1000XM5: Nên chọn cái nào?', 'so-sanh-airpods-pro-2-vs-sony-wh-1000xm5', 'So sánh chi tiết giữa AirPods Pro 2 và Sony WH-1000XM5 để giúp bạn lựa chọn phù hợp.', '<p>AirPods Pro 2 và Sony WH-1000XM5 đều là những tai nghe chống ồn hàng đầu. Dưới đây là so sánh chi tiết:</p><p><strong>AirPods Pro 2:</strong><br>- Thiết kế nhỏ gọn, không dây<br>- Tích hợp tốt với hệ sinh thái Apple<br>- Chống ồn tốt<br>- Giá cao hơn</p><p><strong>Sony WH-1000XM5:</strong><br>- Chống ồn tốt nhất thị trường<br>- Pin lâu hơn (30 giờ)<br>- Âm thanh Hi-Fi<br>- Giá hợp lý hơn</p>', 'https://picsum.photos/1200/600?random=1003', 1, 'published', 1120, 'So sánh AirPods vs Sony', 'So sánh AirPods Pro 2 và Sony WH-1000XM5', DATE_SUB(NOW(), INTERVAL 15 DAY)),
('iPad Pro 12.9 inch: Có đáng mua không?', 'ipad-pro-12-9-inch-co-dang-mua-khong', 'Đánh giá chi tiết iPad Pro 12.9 inch để xem có đáng bỏ tiền mua không.', '<p>iPad Pro 12.9 inch là tablet cao cấp nhất của Apple với chip M2 mạnh mẽ. Với giá gần 30 triệu, liệu có đáng mua?</p><p><strong>Ưu điểm:</strong><br>- Chip M2 cực mạnh<br>- Màn hình Liquid Retina XDR đẹp<br>- Hỗ trợ Apple Pencil và Magic Keyboard<br>- Phù hợp cho công việc chuyên nghiệp</p><p><strong>Nhược điểm:</strong><br>- Giá cao<br>- Nặng hơn các tablet khác<br>- Không thay thế được laptop hoàn toàn</p>', 'https://picsum.photos/1200/600?random=1004', 1, 'published', 780, 'iPad Pro 12.9 Đánh giá', 'Đánh giá iPad Pro 12.9 inch có đáng mua không', DATE_SUB(NOW(), INTERVAL 10 DAY)),
('Công nghệ sạc nhanh: Tất cả những gì bạn cần biết', 'cong-nghe-sac-nhanh-tat-ca-nhung-gi-ban-can-biet', 'Tìm hiểu về công nghệ sạc nhanh, các chuẩn sạc phổ biến và cách sử dụng an toàn.', '<p>Sạc nhanh đã trở thành tính năng không thể thiếu trên các thiết bị di động hiện đại. Dưới đây là tất cả những gì bạn cần biết:</p><p><strong>Các chuẩn sạc nhanh:</strong><br>- USB Power Delivery (PD)<br>- Qualcomm Quick Charge<br>- Apple Fast Charging<br>- OnePlus Warp Charge</p><p><strong>Lưu ý khi sử dụng:</strong><br>- Sử dụng cáp và adapter chính hãng<br>- Không sạc quá nóng<br>- Tránh sạc qua đêm</p>', 'https://picsum.photos/1200/600?random=1005', 1, 'published', 540, 'Công nghệ sạc nhanh', 'Tất cả về công nghệ sạc nhanh', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('Samsung Galaxy S24 Ultra: Đánh giá camera 200MP', 'samsung-galaxy-s24-ultra-danh-gia-camera-200mp', 'Trải nghiệm thực tế với camera 200MP trên Samsung Galaxy S24 Ultra.', '<p>Camera 200MP trên Galaxy S24 Ultra là một trong những điểm nhấn lớn nhất của sản phẩm này. Sau khi test thực tế:</p><p><strong>Chất lượng ảnh:</strong><br>- Độ phân giải cực cao, zoom xa vẫn rõ<br>- Màu sắc chân thực<br>- Xử lý ánh sáng yếu tốt</p><p><strong>Video:</strong><br>- Quay 8K mượt mà<br>- Chống rung tốt<br>- Âm thanh stereo</p>', 'https://picsum.photos/1200/600?random=1006', 1, 'published', 980, 'Samsung S24 Ultra Camera', 'Đánh giá camera 200MP Samsung S24 Ultra', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('MacBook Pro M3: Có nên nâng cấp từ M2?', 'macbook-pro-m3-co-nen-nang-cap-tu-m2', 'So sánh MacBook Pro M3 và M2 để quyết định có nên nâng cấp không.', '<p>MacBook Pro M3 vừa ra mắt với nhiều cải tiến. Liệu có đáng nâng cấp từ M2?</p><p><strong>Cải tiến của M3:</strong><br>- Hiệu năng tăng 15-20%<br>- Pin tốt hơn<br>- Hỗ trợ Ray Tracing</p><p><strong>Kết luận:</strong><br>- Nếu đang dùng M2: Không cần nâng cấp ngay<br>- Nếu đang dùng Intel: Nên nâng cấp<br>- Nếu mua mới: Chọn M3</p>', 'https://picsum.photos/1200/600?random=1007', 1, 'published', 720, 'MacBook Pro M3 vs M2', 'Có nên nâng cấp MacBook Pro M3 từ M2', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('Xiaomi 14 Pro: Flagship giá tốt với camera Leica', 'xiaomi-14-pro-flagship-gia-tot-voi-camera-leica', 'Đánh giá chi tiết Xiaomi 14 Pro - flagship Android với camera Leica và giá hợp lý.', '<p>Xiaomi 14 Pro là một trong những flagship Android giá tốt nhất hiện tại. Với camera Leica và chip Snapdragon 8 Gen 3, sản phẩm này có gì đặc biệt?</p><p><strong>Điểm mạnh:</strong><br>- Camera Leica 50MP chất lượng cao<br>- Chip Snapdragon 8 Gen 3 mạnh mẽ<br>- Sạc nhanh 120W<br>- Giá hợp lý hơn đối thủ</p><p><strong>Điểm yếu:</strong><br>- Hệ điều hành MIUI có nhiều quảng cáo<br>- Hỗ trợ update không lâu bằng Samsung/Apple</p>', 'https://picsum.photos/1200/600?random=1008', 1, 'published', 650, 'Xiaomi 14 Pro Đánh giá', 'Đánh giá Xiaomi 14 Pro với camera Leica', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Top 10 ứng dụng chỉnh sửa ảnh tốt nhất năm 2024', 'top-10-ung-dung-chinh-sua-anh-tot-nhat-2024', 'Danh sách 10 ứng dụng chỉnh sửa ảnh tốt nhất cho điện thoại và máy tính năm 2024.', '<p>Chỉnh sửa ảnh đã trở thành nhu cầu phổ biến. Dưới đây là top 10 ứng dụng tốt nhất:</p><p><strong>Cho điện thoại:</strong><br>1. Adobe Lightroom Mobile - Chuyên nghiệp<br>2. VSCO - Filter đẹp<br>3. Snapseed - Miễn phí, mạnh mẽ<br>4. PicsArt - Nhiều tính năng<br>5. Canva - Dễ sử dụng</p><p><strong>Cho máy tính:</strong><br>1. Adobe Photoshop - Tiêu chuẩn ngành<br>2. Adobe Lightroom - Xử lý RAW<br>3. GIMP - Miễn phí<br>4. Affinity Photo - Giá rẻ<br>5. Capture One - Chuyên nghiệp</p>', 'https://picsum.photos/1200/600?random=1009', 1, 'published', 890, 'Top 10 App Chỉnh ảnh 2024', 'Danh sách ứng dụng chỉnh sửa ảnh tốt nhất 2024', DATE_SUB(NOW(), INTERVAL 4 DAY)),
('Công nghệ AI trong điện thoại: Tương lai đã đến', 'cong-nghe-ai-trong-dien-thoai-tuong-lai-da-den', 'Tìm hiểu về công nghệ AI đang được tích hợp vào điện thoại thông minh hiện đại.', '<p>AI (Trí tuệ nhân tạo) đang thay đổi cách chúng ta sử dụng điện thoại. Từ camera AI đến trợ lý ảo, công nghệ này đang trở nên phổ biến.</p><p><strong>Ứng dụng AI trong điện thoại:</strong><br>- Camera AI: Nhận diện cảnh, tối ưu ảnh tự động<br>- Trợ lý ảo: Siri, Google Assistant, Bixby<br>- Xử lý ngôn ngữ tự nhiên<br>- Dự đoán hành vi người dùng<br>- Tối ưu pin và hiệu năng</p><p><strong>Tương lai:</strong><br>AI sẽ ngày càng thông minh hơn, giúp điện thoại hiểu người dùng tốt hơn và tự động hóa nhiều tác vụ.</p>', 'https://picsum.photos/1200/600?random=1010', 1, 'published', 1120, 'AI trong điện thoại', 'Công nghệ AI trong điện thoại thông minh', DATE_SUB(NOW(), INTERVAL 6 DAY)),
('Màn hình OLED vs LCD: Nên chọn loại nào?', 'man-hinh-oled-vs-lcd-nen-chon-loai-nao', 'So sánh chi tiết giữa màn hình OLED và LCD để giúp bạn lựa chọn phù hợp.', '<p>Màn hình là một trong những yếu tố quan trọng nhất của thiết bị điện tử. OLED và LCD có những ưu nhược điểm riêng.</p><p><strong>OLED (Organic Light-Emitting Diode):</strong><br>✅ Màu đen sâu, tương phản cao<br>✅ Tiết kiệm pin khi hiển thị nền đen<br>✅ Góc nhìn rộng<br>❌ Giá cao hơn<br>❌ Có thể bị burn-in</p><p><strong>LCD (Liquid Crystal Display):</strong><br>✅ Giá rẻ hơn<br>✅ Không bị burn-in<br>✅ Độ sáng cao<br>❌ Màu đen không sâu<br>❌ Tiêu thụ pin nhiều hơn</p>', 'https://picsum.photos/1200/600?random=1011', 1, 'published', 980, 'OLED vs LCD', 'So sánh màn hình OLED và LCD', DATE_SUB(NOW(), INTERVAL 8 DAY)),
('Hướng dẫn chọn tai nghe gaming tốt nhất', 'huong-dan-chon-tai-nghe-gaming-tot-nhat', 'Các tiêu chí và gợi ý để chọn tai nghe gaming phù hợp với nhu cầu của bạn.', '<p>Tai nghe gaming là phụ kiện quan trọng cho game thủ. Dưới đây là hướng dẫn chọn tai nghe phù hợp:</p><p><strong>Tiêu chí quan trọng:</strong><br>1. Chất lượng âm thanh: 7.1 surround sound<br>2. Microphone: Rõ ràng, có khử tiếng ồn<br>3. Độ thoải mái: Đệm tai mềm, nhẹ<br>4. Độ bền: Chịu được sử dụng lâu dài<br>5. Kết nối: USB, 3.5mm, hoặc không dây</p><p><strong>Gợi ý:</strong><br>- Budget: HyperX Cloud Stinger<br>- Mid-range: SteelSeries Arctis 7<br>- High-end: Audeze LCD-GX</p>', 'https://picsum.photos/1200/600?random=1012', 1, 'published', 750, 'Tai nghe Gaming', 'Hướng dẫn chọn tai nghe gaming tốt nhất', DATE_SUB(NOW(), INTERVAL 12 DAY)),
('Thị trường smartphone Việt Nam 2024: Xu hướng mới', 'thi-truong-smartphone-viet-nam-2024-xu-huong-moi', 'Phân tích thị trường smartphone Việt Nam năm 2024 và các xu hướng công nghệ mới.', '<p>Thị trường smartphone Việt Nam năm 2024 có nhiều thay đổi thú vị. Dưới đây là phân tích chi tiết:</p><p><strong>Xu hướng:</strong><br>- Giá smartphone trung bình tăng<br>- Người dùng quan tâm camera hơn<br>- 5G trở nên phổ biến<br>- Pin và sạc nhanh là ưu tiên<br>- Thiết kế mỏng nhẹ được ưa chuộng</p><p><strong>Thương hiệu phổ biến:</strong><br>1. Samsung - Dẫn đầu thị trường<br>2. Apple - Tăng trưởng mạnh<br>3. Xiaomi - Giá tốt<br>4. OPPO/Vivo - Camera đẹp<br>5. Realme - Giá rẻ</p>', 'https://picsum.photos/1200/600?random=1013', 1, 'published', 1050, 'Thị trường Smartphone VN 2024', 'Phân tích thị trường smartphone Việt Nam 2024', DATE_SUB(NOW(), INTERVAL 14 DAY)),
('Cách tối ưu pin laptop để sử dụng lâu hơn', 'cach-toi-uu-pin-laptop-de-su-dung-lau-hon', 'Các mẹo và thủ thuật để tối ưu pin laptop, kéo dài thời gian sử dụng.', '<p>Pin laptop là vấn đề quan trọng với nhiều người dùng. Dưới đây là các cách tối ưu:</p><p><strong>Mẹo tối ưu pin:</strong><br>1. Giảm độ sáng màn hình<br>2. Tắt Wi-Fi/Bluetooth khi không dùng<br>3. Đóng các ứng dụng không cần thiết<br>4. Sử dụng chế độ tiết kiệm pin<br>5. Tắt các ứng dụng khởi động cùng Windows/Mac<br>6. Cập nhật driver và hệ điều hành<br>7. Sử dụng SSD thay vì HDD</p><p><strong>Lưu ý:</strong><br>- Không để pin cạn kiệt hoàn toàn<br>- Sạc đầy và rút sạc thường xuyên<br>- Bảo dưỡng pin định kỳ</p>', 'https://picsum.photos/1200/600?random=1014', 1, 'published', 680, 'Tối ưu pin laptop', 'Cách tối ưu pin laptop để sử dụng lâu hơn', DATE_SUB(NOW(), INTERVAL 16 DAY)),
('Google Pixel 8 Pro: Đánh giá camera AI độc đáo', 'google-pixel-8-pro-danh-gia-camera-ai-doc-dao', 'Trải nghiệm thực tế với camera AI trên Google Pixel 8 Pro và các tính năng độc đáo.', '<p>Google Pixel 8 Pro nổi bật với camera AI mạnh mẽ. Sau khi test thực tế, đây là đánh giá:</p><p><strong>Điểm mạnh:</strong><br>- Camera AI xử lý ảnh tự động xuất sắc<br>- Magic Eraser xóa vật thể thông minh<br>- Night Sight chụp đêm tốt<br>- Video 4K 60fps mượt mà<br>- Google Tensor G3 xử lý AI nhanh</p><p><strong>Điểm yếu:</strong><br>- Giá cao<br>- Pin không quá ấn tượng<br>- Thiết kế không đổi mới nhiều</p><p><strong>Kết luận:</strong> Pixel 8 Pro là lựa chọn tốt cho người yêu thích chụp ảnh và công nghệ AI.</p>', 'https://picsum.photos/1200/600?random=1015', 1, 'published', 920, 'Google Pixel 8 Pro Camera', 'Đánh giá camera AI Google Pixel 8 Pro', DATE_SUB(NOW(), INTERVAL 18 DAY)),
('So sánh MacBook Air M2 vs MacBook Pro M3', 'so-sanh-macbook-air-m2-vs-macbook-pro-m3', 'So sánh chi tiết giữa MacBook Air M2 và MacBook Pro M3 để chọn laptop phù hợp.', '<p>MacBook Air M2 và MacBook Pro M3 đều là laptop tốt, nhưng phù hợp với nhu cầu khác nhau.</p><p><strong>MacBook Air M2:</strong><br>✅ Nhẹ, mỏng, dễ mang theo<br>✅ Giá rẻ hơn<br>✅ Pin tốt<br>❌ Hiệu năng thấp hơn<br>❌ Màn hình nhỏ hơn<br>❌ Ít cổng kết nối</p><p><strong>MacBook Pro M3:</strong><br>✅ Hiệu năng mạnh hơn<br>✅ Màn hình đẹp hơn (XDR)<br>✅ Nhiều cổng kết nối<br>❌ Nặng và dày hơn<br>❌ Giá cao hơn</p><p><strong>Nên chọn:</strong> Air M2 cho công việc văn phòng, Pro M3 cho công việc chuyên nghiệp.</p>', 'https://picsum.photos/1200/600?random=1016', 1, 'published', 1100, 'MacBook Air M2 vs Pro M3', 'So sánh MacBook Air M2 và MacBook Pro M3', DATE_SUB(NOW(), INTERVAL 20 DAY)),
('Công nghệ sạc không dây: Tiện lợi hay không cần thiết?', 'cong-nghe-sac-khong-day-tien-loi-hay-khong-can-thiet', 'Phân tích về công nghệ sạc không dây và liệu có đáng đầu tư không.', '<p>Sạc không dây đã trở nên phổ biến, nhưng có thực sự cần thiết?</p><p><strong>Ưu điểm:</strong><br>- Tiện lợi, không cần cắm dây<br>- Giảm hao mòn cổng sạc<br>- An toàn hơn (không lo chập điện)<br>- Thiết kế đẹp, gọn gàng</p><p><strong>Nhược điểm:</strong><br>- Sạc chậm hơn sạc có dây<br>- Phải đặt đúng vị trí<br>- Giá cao hơn<br>- Nóng hơn khi sạc</p><p><strong>Kết luận:</strong> Sạc không dây tiện lợi cho sử dụng hàng ngày, nhưng sạc có dây vẫn tốt hơn khi cần sạc nhanh.</p>', 'https://picsum.photos/1200/600?random=1017', 1, 'published', 580, 'Sạc không dây', 'Công nghệ sạc không dây có đáng đầu tư', DATE_SUB(NOW(), INTERVAL 22 DAY)),
('Hướng dẫn setup home office hoàn hảo', 'huong-dan-setup-home-office-hoan-hao', 'Các bước và thiết bị cần thiết để setup một home office chuyên nghiệp.', '<p>Làm việc tại nhà đã trở nên phổ biến. Dưới đây là hướng dẫn setup home office hoàn hảo:</p><p><strong>Thiết bị cần thiết:</strong><br>1. Laptop hoặc PC mạnh<br>2. Màn hình lớn (27 inch trở lên)<br>3. Bàn phím và chuột tốt<br>4. Webcam và microphone chất lượng<br>5. Tai nghe có khử tiếng ồn<br>6. Đèn bàn và ghế ergonomic</p><p><strong>Setup không gian:</strong><br>- Chọn góc yên tĩnh<br>- Ánh sáng tự nhiên tốt<br>- Bàn làm việc đủ rộng<br>- Tổ chức dây cáp gọn gàng</p>', 'https://picsum.photos/1200/600?random=1018', 1, 'published', 720, 'Setup Home Office', 'Hướng dẫn setup home office hoàn hảo', DATE_SUB(NOW(), INTERVAL 24 DAY)),
('OnePlus 12: Flagship giá tốt với sạc nhanh 100W', 'oneplus-12-flagship-gia-tot-voi-sac-nhanh-100w', 'Đánh giá OnePlus 12 - flagship Android với sạc nhanh 100W và giá hợp lý.', '<p>OnePlus 12 là flagship Android mới với nhiều tính năng ấn tượng. Đây là đánh giá chi tiết:</p><p><strong>Điểm mạnh:</strong><br>- Sạc nhanh 100W (sạc đầy trong 25 phút)<br>- Chip Snapdragon 8 Gen 3 mạnh mẽ<br>- Màn hình 120Hz mượt mà<br>- Camera Hasselblad chất lượng<br>- Giá hợp lý hơn đối thủ</p><p><strong>Điểm yếu:</strong><br>- Hỗ trợ update không lâu bằng Samsung<br>- OxygenOS đã không còn "gần stock Android"<br>- Thiết kế không đổi mới nhiều</p>', 'https://picsum.photos/1200/600?random=1019', 1, 'published', 850, 'OnePlus 12 Đánh giá', 'Đánh giá OnePlus 12 với sạc nhanh 100W', DATE_SUB(NOW(), INTERVAL 26 DAY)),
('Công nghệ 5G tại Việt Nam: Tình hình và triển vọng', 'cong-nghe-5g-tai-viet-nam-tinh-hinh-va-trien-vong', 'Phân tích về tình hình triển khai 5G tại Việt Nam và triển vọng phát triển.', '<p>5G đang được triển khai tại Việt Nam. Dưới đây là tình hình hiện tại:</p><p><strong>Tình hình hiện tại:</strong><br>- Viettel, VinaPhone, MobiFone đã triển khai 5G<br>- Phủ sóng chủ yếu ở các thành phố lớn<br>- Tốc độ nhanh hơn 4G đáng kể<br>- Giá cước đang giảm dần</p><p><strong>Triển vọng:</strong><br>- Phủ sóng rộng hơn trong 2-3 năm tới<br>- Ứng dụng trong IoT, smart city<br>- Cải thiện trải nghiệm streaming, gaming<br>- Hỗ trợ làm việc từ xa tốt hơn</p>', 'https://picsum.photos/1200/600?random=1020', 1, 'published', 950, '5G tại Việt Nam', 'Tình hình và triển vọng 5G tại Việt Nam', DATE_SUB(NOW(), INTERVAL 28 DAY))
ON DUPLICATE KEY UPDATE title=title;

-- Blog Post Categories (many-to-many)
INSERT INTO blog_post_categories (post_id, category_id) VALUES
(1, 2), (1, 1),
(2, 4), (2, 5),
(3, 3),
(4, 5), (4, 2),
(5, 2), (5, 1),
(6, 3), (6, 1),
(7, 2), (7, 1),
(8, 2), (8, 5),
(9, 2), (9, 1),
(10, 3), (10, 1),
(11, 1), (11, 4),
(12, 5), (12, 1),
(13, 3), (13, 1),
(14, 4), (14, 1),
(15, 3), (15, 1),
(16, 2), (16, 5),
(17, 3), (17, 1),
(18, 2), (18, 1),
(19, 2), (19, 1),
(20, 4), (20, 1)
ON DUPLICATE KEY UPDATE post_id=post_id;

-- Blog Comments
INSERT INTO blog_comments (post_id, user_id, parent_id, name, email, content, status, created_at) VALUES
(1, 2, NULL, 'Nguyễn Văn A', 'customer1@example.com', 'Bài viết rất hay! Tôi cũng đang dùng iPhone 15 Pro và đồng ý với đánh giá.', 'approved', DATE_SUB(NOW(), INTERVAL 28 DAY)),
(1, NULL, NULL, 'Khách hàng', 'guest1@example.com', 'Camera có thực sự tốt như vậy không?', 'approved', DATE_SUB(NOW(), INTERVAL 27 DAY)),
(1, 2, 2, 'Nguyễn Văn A', 'customer1@example.com', 'Camera rất tốt, đặc biệt là chụp đêm!', 'approved', DATE_SUB(NOW(), INTERVAL 26 DAY)),
(2, 3, NULL, 'Trần Thị B', 'customer2@example.com', 'Cảm ơn bài viết! Đang tìm laptop cho con đi học.', 'approved', DATE_SUB(NOW(), INTERVAL 23 DAY)),
(2, 4, NULL, 'Lê Văn C', 'customer3@example.com', 'MacBook Air M2 có đủ dùng cho lập trình không?', 'approved', DATE_SUB(NOW(), INTERVAL 22 DAY)),
(3, 5, NULL, 'Hoàng Văn E', 'customer5@example.com', 'Mẹo hay! Tôi sẽ áp dụng ngay.', 'approved', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(4, 6, NULL, 'Vũ Thị F', 'customer6@example.com', 'Đang phân vân giữa 2 cái này. Bài viết giúp ích nhiều!', 'approved', DATE_SUB(NOW(), INTERVAL 13 DAY)),
(4, 7, NULL, 'Đỗ Văn G', 'customer7@example.com', 'Tôi chọn Sony vì chống ồn tốt hơn.', 'approved', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(5, 8, NULL, 'Bùi Thị H', 'customer8@example.com', 'iPad Pro đắt quá, có nên mua iPad Air không?', 'approved', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(5, 1, 9, 'Quản trị viên', 'admin@example.com', 'iPad Air cũng rất tốt nếu ngân sách hạn chế!', 'approved', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(6, 9, NULL, 'Lý Văn I', 'customer9@example.com', 'Sạc nhanh rất tiện nhưng sợ hại pin.', 'approved', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(6, 1, 11, 'Quản trị viên', 'admin@example.com', 'Sạc nhanh hiện đại đã được tối ưu, không hại pin đâu bạn!', 'approved', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(7, 10, NULL, 'Đinh Thị K', 'customer10@example.com', 'Camera 200MP quá ấn tượng!', 'approved', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(8, 11, NULL, 'Trương Văn L', 'customer11@example.com', 'Đang dùng M2, không thấy cần nâng cấp lên M3.', 'approved', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(9, 12, NULL, 'Phan Thị M', 'customer12@example.com', 'Xiaomi 14 Pro giá tốt quá! Đang cân nhắc mua.', 'approved', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(10, 13, NULL, 'Võ Văn N', 'customer13@example.com', 'Lightroom Mobile là app chỉnh ảnh tốt nhất!', 'approved', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(11, 14, NULL, 'Dương Thị O', 'customer14@example.com', 'AI trong điện thoại thật sự hữu ích, đặc biệt là camera AI.', 'approved', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(12, 15, NULL, 'Ngô Văn P', 'customer15@example.com', 'OLED đẹp hơn LCD nhiều, đáng đầu tư!', 'approved', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(13, 5, NULL, 'Hoàng Văn E', 'customer5@example.com', 'HyperX Cloud Stinger là lựa chọn tốt cho ngân sách hạn chế.', 'approved', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(14, 6, NULL, 'Vũ Thị F', 'customer6@example.com', 'Thị trường smartphone VN đang phát triển mạnh!', 'approved', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(15, 7, NULL, 'Đỗ Văn G', 'customer7@example.com', 'Mẹo tối ưu pin rất hữu ích, pin laptop tôi đã tốt hơn!', 'approved', DATE_SUB(NOW(), INTERVAL 16 DAY)),
(16, 8, NULL, 'Bùi Thị H', 'customer8@example.com', 'Pixel 8 Pro camera AI quá tuyệt!', 'approved', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(17, 9, NULL, 'Lý Văn I', 'customer9@example.com', 'MacBook Air M2 đủ dùng cho công việc của tôi.', 'approved', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(18, 10, NULL, 'Đinh Thị K', 'customer10@example.com', 'Sạc không dây tiện nhưng vẫn thích sạc có dây hơn.', 'approved', DATE_SUB(NOW(), INTERVAL 22 DAY)),
(19, 11, NULL, 'Trương Văn L', 'customer11@example.com', 'Home office setup rất quan trọng, cảm ơn bài viết!', 'approved', DATE_SUB(NOW(), INTERVAL 24 DAY)),
(20, 12, NULL, 'Phan Thị M', 'customer12@example.com', 'OnePlus 12 sạc nhanh quá, chỉ 25 phút là đầy!', 'approved', DATE_SUB(NOW(), INTERVAL 26 DAY)),
(21, 13, NULL, 'Võ Văn N', 'customer13@example.com', '5G tại VN đang phát triển tốt, tốc độ nhanh hơn 4G nhiều!', 'approved', DATE_SUB(NOW(), INTERVAL 28 DAY)),
(9, NULL, NULL, 'Khách hàng', 'guest2@example.com', 'Camera Leica có thực sự tốt không?', 'approved', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(11, 1, 15, 'Quản trị viên', 'admin@example.com', 'AI sẽ ngày càng thông minh hơn trong tương lai!', 'approved', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(14, 1, 17, 'Quản trị viên', 'admin@example.com', 'Cảm ơn bạn đã quan tâm! Thị trường đang phát triển rất tốt.', 'approved', DATE_SUB(NOW(), INTERVAL 13 DAY))
ON DUPLICATE KEY UPDATE id=id;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
SELECT 'Database schema and seeder data created successfully!' AS message;
