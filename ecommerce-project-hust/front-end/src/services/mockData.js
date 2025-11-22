// Mock data service for frontend development and testing
// Comprehensive fake data for products, categories, and coupons

export const mockProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB',
    price: 29990000,
    stock: 15,
    category_id: 1,
    image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
    category_name: 'Điện thoại',
    description: 'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera 48MP chuyên nghiệp, màn hình Super Retina XDR 6.7 inch sắc nét. Pin bền bỉ, sạc nhanh 20W. Thiết kế titan cao cấp, chống nước IP68.',
    status: 'active'
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    price: 24990000,
    stock: 20,
    category_id: 1,
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
    category_name: 'Điện thoại',
    description: 'Flagship Android với camera 200MP siêu nét, bút S Pen tiện lợi, màn hình Dynamic AMOLED 2X 6.8 inch. Chip Snapdragon 8 Gen 3, pin 5000mAh, sạc nhanh 45W.',
    status: 'active'
  },
  {
    id: 3,
    name: 'Xiaomi 14 Pro',
    price: 19990000,
    stock: 18,
    category_id: 1,
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
    category_name: 'Điện thoại',
    description: 'Điện thoại Android cao cấp với chip Snapdragon 8 Gen 3, camera Leica 50MP, màn hình AMOLED 6.73 inch. Pin 4880mAh, sạc nhanh 120W siêu tốc.',
    status: 'active'
  },
  {
    id: 4,
    name: 'OPPO Find X7',
    price: 18990000,
    stock: 12,
    category_id: 1,
    image_url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop',
    category_name: 'Điện thoại',
    description: 'Flagship với camera Hasselblad chuyên nghiệp, sạc nhanh 100W, màn hình AMOLED 6.78 inch. Chip MediaTek Dimensity 9300, pin 5000mAh.',
    status: 'active'
  },
  {
    id: 5,
    name: 'MacBook Pro M3 14 inch',
    price: 45990000,
    stock: 8,
    category_id: 2,
    image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop',
    category_name: 'Laptop',
    description: 'Laptop chuyên nghiệp với chip M3 mạnh mẽ, màn hình Liquid Retina XDR 14 inch sắc nét, 18GB RAM. Pin 18 giờ, thiết kế mỏng nhẹ, bàn phím Magic Keyboard.',
    status: 'active'
  },
  {
    id: 6,
    name: 'Dell XPS 15',
    price: 32990000,
    stock: 10,
    category_id: 2,
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
    category_name: 'Laptop',
    description: 'Laptop cao cấp với màn hình OLED 15.6 inch 4K, Intel Core i7 gen 13, 16GB RAM, SSD 512GB. Card đồ họa RTX 4050, pin bền, thiết kế sang trọng.',
    status: 'active'
  },
  {
    id: 7,
    name: 'ASUS ROG Zephyrus G16',
    price: 39990000,
    stock: 6,
    category_id: 2,
    image_url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=400&fit=crop',
    category_name: 'Laptop',
    description: 'Laptop gaming cao cấp với RTX 4060, Intel Core i9, màn hình 16 inch 165Hz. RAM 32GB, SSD 1TB, tản nhiệt hiệu quả, RGB keyboard.',
    status: 'active'
  },
  {
    id: 8,
    name: 'Lenovo ThinkPad X1 Carbon',
    price: 28990000,
    stock: 14,
    category_id: 2,
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
    category_name: 'Laptop',
    description: 'Laptop doanh nhân siêu nhẹ chỉ 1.12kg, Intel Core i7, 16GB RAM, SSD 512GB. Màn hình 14 inch 2.8K, bàn phím ThinkPad nổi tiếng, bảo mật cao.',
    status: 'active'
  },
  {
    id: 9,
    name: 'iPad Pro 12.9 inch M2',
    price: 27990000,
    stock: 12,
    category_id: 3,
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    category_name: 'Tablet',
    description: 'Tablet chuyên nghiệp với chip M2 mạnh mẽ, màn hình Liquid Retina XDR 12.9 inch. Hỗ trợ Apple Pencil, Magic Keyboard, pin 10 giờ sử dụng.',
    status: 'active'
  },
  {
    id: 10,
    name: 'Samsung Galaxy Tab S9 Ultra',
    price: 22990000,
    stock: 9,
    category_id: 3,
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    category_name: 'Tablet',
    description: 'Tablet Android cao cấp với màn hình 14.6 inch AMOLED, bút S Pen, chip Snapdragon 8 Gen 2. Pin 11200mAh, sạc nhanh 45W, chống nước IP68.',
    status: 'active'
  },
  {
    id: 11,
    name: 'iPad Air 11 inch',
    price: 18990000,
    stock: 15,
    category_id: 3,
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    category_name: 'Tablet',
    description: 'Tablet đa năng với chip M2, màn hình Liquid Retina 11 inch. Hỗ trợ Apple Pencil, Magic Keyboard, thiết kế mỏng nhẹ, nhiều màu sắc.',
    status: 'active'
  },
  {
    id: 12,
    name: 'Tai nghe AirPods Pro 2',
    price: 5990000,
    stock: 50,
    category_id: 4,
    image_url: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop',
    category_name: 'Phụ kiện',
    description: 'Tai nghe không dây chống ồn chủ động với chip H2, chất lượng âm thanh Spatial Audio. Pin 6 giờ, case sạc MagSafe, chống nước IPX4.',
    status: 'active'
  },
  {
    id: 13,
    name: 'Chuột Logitech MX Master 3S',
    price: 2990000,
    stock: 40,
    category_id: 4,
    image_url: 'https://images.unsplash.com/photo-1527814054287-6b783f71e58a?w=400&h=400&fit=crop',
    category_name: 'Phụ kiện',
    description: 'Chuột không dây chuyên nghiệp với cảm biến 8K DPI, cuộn siêu mượt. Pin 70 ngày, kết nối đa thiết bị, thiết kế ergonomic.',
    status: 'active'
  },
  {
    id: 14,
    name: 'Bàn phím cơ Keychron K8',
    price: 2490000,
    stock: 30,
    category_id: 4,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop',
    category_name: 'Phụ kiện',
    description: 'Bàn phím cơ không dây, switch Gateron, đèn RGB. Kết nối Bluetooth và USB-C, pin 4000mAh, layout 87 keys compact.',
    status: 'active'
  },
  {
    id: 15,
    name: 'Apple Watch Series 9',
    price: 10990000,
    stock: 25,
    category_id: 5,
    image_url: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400&h=400&fit=crop',
    category_name: 'Đồng hồ thông minh',
    description: 'Đồng hồ thông minh với chip S9, màn hình Always-On Retina. Theo dõi sức khỏe, thể thao, pin 18 giờ, chống nước 50m.',
    status: 'active'
  },
  {
    id: 16,
    name: 'Samsung Galaxy Watch 6',
    price: 6990000,
    stock: 20,
    category_id: 5,
    image_url: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400&h=400&fit=crop',
    category_name: 'Đồng hồ thông minh',
    description: 'Smartwatch Android với màn hình AMOLED, pin 2 ngày. Theo dõi sức khỏe, GPS, chống nước 5ATM, nhiều mặt đồng hồ.',
    status: 'active'
  },
  {
    id: 17,
    name: 'Sony WH-1000XM5',
    price: 8990000,
    stock: 35,
    category_id: 6,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    category_name: 'Tai nghe',
    description: 'Tai nghe chống ồn chủ động hàng đầu, âm thanh Hi-Res, pin 30 giờ. Sạc nhanh 3 phút dùng 3 giờ, điều khiển cảm ứng.',
    status: 'active'
  },
  {
    id: 18,
    name: 'Bose QuietComfort 45',
    price: 7990000,
    stock: 28,
    category_id: 6,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    category_name: 'Tai nghe',
    description: 'Tai nghe chống ồn cao cấp, âm thanh sống động. Pin 24 giờ, sạc nhanh, thiết kế thoải mái, kết nối Bluetooth 5.1.',
    status: 'active'
  },
  {
    id: 19,
    name: 'Ốp lưng iPhone 15 Pro',
    price: 490000,
    stock: 100,
    category_id: 4,
    image_url: 'https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=400&h=400&fit=crop',
    category_name: 'Phụ kiện',
    description: 'Ốp lưng trong suốt chống sốc, hỗ trợ MagSafe. Bảo vệ camera, chống trầy xước, thiết kế mỏng nhẹ.',
    status: 'active'
  },
  {
    id: 20,
    name: 'Sạc không dây MagSafe',
    price: 1290000,
    stock: 60,
    category_id: 4,
    image_url: 'https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=400&h=400&fit=crop',
    category_name: 'Phụ kiện',
    description: 'Sạc không dây MagSafe 15W, tương thích iPhone. Thiết kế nhỏ gọn, an toàn, sạc nhanh hiệu quả.',
    status: 'active'
  }
]

export const mockCategories = [
  { id: 1, name: 'Điện thoại', description: 'Các loại điện thoại thông minh', image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop' },
  { id: 2, name: 'Laptop', description: 'Máy tính xách tay', image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop' },
  { id: 3, name: 'Tablet', description: 'Máy tính bảng', image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&h=200&fit=crop' },
  { id: 4, name: 'Phụ kiện', description: 'Phụ kiện điện tử', image_url: 'https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=200&h=200&fit=crop' },
  { id: 5, name: 'Đồng hồ thông minh', description: 'Smartwatch và đồng hồ thông minh', image_url: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=200&h=200&fit=crop' },
  { id: 6, name: 'Tai nghe', description: 'Tai nghe không dây và có dây', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop' }
]

export const mockCoupons = [
  {
    id: 1,
    code: 'WELCOME10',
    discount_type: 'percentage',
    discount_value: 10,
    min_purchase_amount: 100000,
    max_discount_amount: 500000,
    description: 'Giảm 10% cho khách hàng mới',
    status: 'active'
  },
  {
    id: 2,
    code: 'SAVE50K',
    discount_type: 'fixed',
    discount_value: 50000,
    min_purchase_amount: 500000,
    description: 'Giảm 50.000đ cho đơn hàng từ 500.000đ',
    status: 'active'
  },
  {
    id: 3,
    code: 'VIP20',
    discount_type: 'percentage',
    discount_value: 20,
    min_purchase_amount: 2000000,
    max_discount_amount: 1000000,
    description: 'Giảm 20% cho đơn hàng từ 2.000.000đ',
    status: 'active'
  }
]

// Helper functions
export const getMockProducts = (limit = null) => {
  const products = [...mockProducts]
  return limit ? products.slice(0, limit) : products
}

export const getMockCategories = () => [...mockCategories]

export const getMockCoupons = () => [...mockCoupons]

export const getMockProductById = (id) => {
  return mockProducts.find(p => p.id === parseInt(id))
}

export const getMockProductsByCategory = (categoryId) => {
  return mockProducts.filter(p => p.category_id === parseInt(categoryId))
}

export const searchMockProducts = (query) => {
  const lowerQuery = query.toLowerCase()
  return mockProducts.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.category_name.toLowerCase().includes(lowerQuery)
  )
}
