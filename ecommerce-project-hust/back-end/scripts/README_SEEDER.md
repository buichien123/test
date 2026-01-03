# Database Seeder Script

## Mô tả

Script `db_seed.js` tự động tạo cấu trúc database và dữ liệu mẫu (seeder) nếu chưa có.

## Cách sử dụng

```bash
# Chạy seeder
npm run db_seed

# Hoặc
npm run db:seed
```

## Tính năng

✅ **Tự động kiểm tra và tạo database** nếu chưa có  
✅ **Tự động tạo cấu trúc bảng** nếu chưa có  
✅ **Chỉ thêm dữ liệu mẫu** nếu database chưa có dữ liệu  
✅ **Không xóa dữ liệu hiện có** - an toàn để chạy nhiều lần  
✅ **Bỏ qua lỗi trùng lặp** - không gây lỗi nếu đã có dữ liệu  

## Dữ liệu mẫu bao gồm

- **5 Users** (1 admin + 4 customers)
- **6 Categories** 
- **18 Products** với mô tả đầy đủ
- **Product Variants** (màu sắc, dung lượng, kích thước)
- **Product Images**
- **6 Coupons** (mã giảm giá)
- **6 Orders** với các trạng thái khác nhau
- **Order Items**
- **Cart Items**
- **Product Reviews**
- **Wishlist**
- **Payments**
- **Product Relations**
- **Daily Statistics**

## Thông tin đăng nhập mẫu

**Admin:**
- Email: `admin@example.com`
- Password: `123456`

**Customer:**
- Email: `customer1@example.com` đến `customer4@example.com`
- Password: `123456`

## Cấu hình

Script sử dụng các biến môi trường từ file `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ecommerce_db
```

Nếu không có file `.env`, script sẽ sử dụng giá trị mặc định.

## Lưu ý

- Script sẽ **không xóa** dữ liệu hiện có
- Nếu database đã có dữ liệu, script sẽ bỏ qua việc seed
- Để reset database, bạn cần xóa database thủ công trước:
  ```sql
  DROP DATABASE ecommerce_db;
  ```
  Sau đó chạy lại `npm run db_seed`

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra thông tin trong file `.env`
- Đảm bảo user có quyền tạo database

### Lỗi "Table already exists"
- Đây là lỗi bình thường, script sẽ bỏ qua
- Nếu muốn reset, xóa database và chạy lại

### Không có dữ liệu được insert
- Kiểm tra xem database đã có dữ liệu chưa
- Script chỉ insert nếu database trống
- Xóa dữ liệu thủ công nếu muốn seed lại

