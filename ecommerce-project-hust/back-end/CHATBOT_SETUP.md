# Hướng dẫn Setup Chatbot AI

## 📊 So sánh Gemini Pro vs ChatGPT Go (GPT-4o-mini)

### **Gemini Pro (Google) - ĐỀ XUẤT** ⭐

**Ưu điểm:**

- ✅ **Miễn phí tốt**: Free tier rộng rãi (60 requests/phút)
- ✅ **Hỗ trợ tiếng Việt xuất sắc**: Google có kinh nghiệm từ Google Translate
- ✅ **Context window lớn**: Lên đến 2 triệu token
- ✅ **Tốc độ nhanh**: Phản hồi nhanh cho chatbot
- ✅ **Dễ setup**: API key đơn giản

**Nhược điểm:**

- ⚠️ Có thể có rate limit ở free tier
- ⚠️ Ít phổ biến hơn OpenAI

**Chi phí:**

- Free tier: 60 requests/phút
- Paid: $0.00025/1K characters input, $0.0005/1K characters output

### **ChatGPT Go (GPT-4o-mini) - OpenAI**

**Ưu điểm:**

- ✅ **Rẻ**: $0.15/1M input tokens, $0.60/1M output tokens
- ✅ **Nhanh**: Độ trễ thấp
- ✅ **Phổ biến**: Nhiều tài liệu và community
- ✅ **Hỗ trợ đa phương tiện**: Text, image, video, audio

**Nhược điểm:**

- ⚠️ **Cần trả phí**: Không có free tier tốt như Gemini
- ⚠️ Context window nhỏ hơn: 128K tokens
- ⚠️ Hỗ trợ tiếng Việt tốt nhưng không bằng Gemini

**Chi phí:**

- $0.15/1M input tokens
- $0.60/1M output tokens
- ~$0.001-0.002 per 1000 messages (ước tính)

## 🎯 KHUYẾN NGHỊ

**Sử dụng Gemini Pro** vì:

1. Miễn phí tốt cho development và production nhỏ
2. Hỗ trợ tiếng Việt tốt hơn
3. Phù hợp với chatbot e-commerce
4. Dễ setup và maintain

## 📝 Hướng dẫn Setup

### Option 1: Gemini Pro (Khuyến nghị)

1. **Lấy API Key:**

   - Truy cập: https://aistudio.google.com/app/apikey
   - Đăng nhập bằng Google account
   - Click "Create API Key" hoặc "+ Create API Key"
   - **Khi được hỏi "Choose an imported project" (Chọn Cloud Project):**
     - **Option 1 (Khuyến nghị)**: Chọn project có sẵn trong dropdown (thường có project mặc định)
     - **Option 2**: Nếu không có project, click "Create project" để tạo mới:
       1. Đặt tên project (ví dụ: "TechStore-Chatbot")
       2. Click "Create"
       3. Quay lại và chọn project vừa tạo
     - **Option 3**: Có thể bỏ qua và tạo API key không cần project (nếu có option này)
   - Đặt tên cho API key (ví dụ: "DATN_HUST" hoặc "TechStore-Chatbot-Key")
   - Click "Create key"
   - **Copy API key ngay lập tức** (chỉ hiển thị 1 lần)

2. **Enable Generative AI API (Quan trọng!):**

   Nếu gặp lỗi "404 Not Found" hoặc "model not found", bạn cần enable API:

   - Truy cập: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
   - Đăng nhập bằng Google account (cùng account với API key)
   - Chọn project đã tạo ở bước 1
   - Click "Enable" để bật Generative Language API
   - Đợi vài phút để API được kích hoạt

3. **Cấu hình trong `.env`:**

   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Restart server:**
   ```bash
   npm run dev
   ```

### Option 2: ChatGPT Go (GPT-4o-mini)

1. **Lấy API Key:**

   - Truy cập: https://platform.openai.com/api-keys
   - Đăng nhập/Đăng ký tài khoản OpenAI
   - Tạo API key mới
   - **Lưu ý**: Cần thêm credit card để sử dụng (có free credit $5)

2. **Cấu hình trong `.env`:**

   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Restart server:**
   ```bash
   npm run dev
   ```

## 🔧 Cấu hình nâng cao

### Thay đổi AI Provider

Trong file `.env`, thay đổi:

```env
AI_PROVIDER=gemini  # hoặc 'openai'
```

### Tùy chỉnh System Prompt

Chỉnh sửa file `back-end/services/chatbotService.js`, function `buildSystemPrompt()` để thay đổi cách chatbot trả lời.

## 🧪 Test Chatbot

1. Mở website
2. Click vào icon chatbot ở góc dưới bên phải
3. Gửi tin nhắn: "Tìm sản phẩm iPhone"
4. Kiểm tra phản hồi

## 📋 Tính năng Chatbot

Chatbot có thể:

- ✅ Tìm kiếm sản phẩm theo tên
- ✅ Cung cấp thông tin sản phẩm (giá, mô tả, tồn kho)
- ✅ Kiểm tra tình trạng tồn kho
- ✅ Hướng dẫn đặt hàng
- ✅ Trả lời câu hỏi về chính sách (vận chuyển, đổi trả, bảo hành)
- ✅ Gợi ý sản phẩm tương tự

## 🐛 Troubleshooting

### Lỗi: "API key chưa được cấu hình"

- Kiểm tra file `.env` có đúng format không
- Đảm bảo không có khoảng trắng thừa
- Restart server sau khi thay đổi `.env`

### Lỗi: "404 Not Found" hoặc "model not found"

Nếu gặp lỗi này, có thể model name không đúng. Hãy chạy script để kiểm tra model nào có sẵn:

```bash
npm run list:gemini-models
```

Script này sẽ test các model phổ biến và cho biết model nào có sẵn với API key của bạn.

**Các bước khắc phục:**

1. **Chạy script list models:**

   ```bash
   cd back-end
   npm run list:gemini-models
   ```

2. **Kiểm tra kết quả:** Script sẽ hiển thị model nào available

3. **Nếu không có model nào available:**

   - Kiểm tra API key có đúng không
   - Đảm bảo Generative AI API đã được enable trong Google Cloud Console
   - Kiểm tra project trong Google Cloud Console có khớp với project khi tạo API key không

4. **Nếu có model available:** Code sẽ tự động sử dụng model đó (fallback logic)

### Lỗi: "Rate limit exceeded"

- Gemini: Đợi 1 phút rồi thử lại
- OpenAI: Kiểm tra billing và usage limits

### Chatbot không trả lời đúng

- Kiểm tra database có sản phẩm không
- Kiểm tra API key có hợp lệ không
- Xem logs trong console để debug

## 📚 Tài liệu tham khảo

- Gemini API: https://ai.google.dev/docs
- OpenAI API: https://platform.openai.com/docs
- Gemini Pricing: https://ai.google.dev/pricing
- OpenAI Pricing: https://openai.com/pricing

---

# 🏗️ TÀI LIỆU KỸ THUẬT CHI TIẾT - HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ

## 📋 TỔNG QUAN HỆ THỐNG

### Mô tả dự án

Hệ thống website thương mại điện tử (E-commerce) hiện đại với đầy đủ tính năng quản lý bán hàng, tích hợp AI Chatbot thông minh, hệ thống thanh toán trực tuyến VNPay, và giao diện quản trị toàn diện.

### Kiến trúc hệ thống

- **Kiến trúc**: Client-Server (3-tier Architecture)
  - **Presentation Layer**: React.js Frontend
  - **Business Logic Layer**: Node.js/Express.js Backend API
  - **Data Layer**: MySQL Database

### Công nghệ chính

- **Frontend**: React 18.2.0 + Vite + TailwindCSS
- **Backend**: Node.js + Express.js 4.18.2
- **Database**: MySQL 8.0+
- **AI Integration**: Google Gemini Pro / OpenAI GPT-4o-mini
- **Payment Gateway**: VNPay

---

## 🎨 FRONTEND - CÔNG NGHỆ VÀ KIẾN TRÚC

### 1. Core Technologies

#### React.js 18.2.0

**Lý do lựa chọn:**

- Virtual DOM giúp tối ưu hiệu năng render
- Component-based architecture dễ bảo trì và tái sử dụng
- Hooks API (useState, useEffect, useContext) giúp quản lý state hiệu quả
- Ecosystem phong phú với nhiều thư viện hỗ trợ
- React Router DOM 6.20.1 cho Single Page Application (SPA)

**Ứng dụng trong project:**

- Tạo 30+ components tái sử dụng (ProductCard, Navbar, Footer, etc.)
- Sử dụng React Context API cho state management toàn cục
- Lazy loading và code splitting để tối ưu performance
- Protected Routes cho phân quyền user/admin

#### Vite 5.0.8 (Build Tool)

**Ưu điểm:**

- Hot Module Replacement (HMR) cực nhanh trong development
- Build time nhanh hơn 10-100 lần so với Webpack
- Native ES Modules support
- Optimized production build với code splitting tự động

**Cấu hình:**

```javascript
// vite.config.js
- Dev server port: 3000
- Proxy API requests đến backend (port 5000)
- PostCSS integration cho TailwindCSS
- React plugin với Fast Refresh
```

#### TailwindCSS 3.3.6

**Lý do sử dụng:**

- Utility-first CSS framework giúp phát triển UI nhanh chóng
- File CSS production nhỏ gọn nhờ PurgeCSS
- Responsive design dễ dàng với breakpoints
- Customizable theme system

**Customization:**

- Custom color palette (primary, accent)
- Custom animations (fade-in, slide-up, scale-in)
- Custom shadows (soft, medium, strong)
- Custom fonts (Inter, Poppins)

### 2. State Management

#### Context API

**AuthContext:**

- Quản lý authentication state (user, token)
- Xử lý login/logout/register
- Token persistence với localStorage
- Auto token verification on mount

**CartContext:**

- Quản lý giỏ hàng (add, remove, update quantity)
- Sync cart giữa localStorage và database
- Real-time cart count và total calculation
- Support cho guest users (localStorage fallback)

**WishlistContext:**

- Quản lý danh sách yêu thích
- Sync với database khi user login
- Toggle add/remove products

### 3. Routing & Navigation

#### React Router DOM 6.20.1

**Route Structure:**

```
/ (Public Layout)
├── / (Home)
├── /products (Product List)
├── /products/:id (Product Detail)
├── /cart (Shopping Cart)
├── /blog (Blog List)
├── /blog/:slug (Blog Detail)
├── /login (Public Route)
├── /register (Public Route)
├── /forgot-password (Public Route)
├── /reset-password (Public Route)
├── /profile (Protected Route)
├── /wishlist (Protected Route)
├── /checkout (Protected Route)
├── /orders (Protected Route)
├── /orders/:id (Order Detail)
└── /payment/callback (Payment Callback)

/admin (Admin Layout - Admin Only)
├── /admin (Dashboard)
├── /admin/users (User Management)
├── /admin/products (Product Management)
├── /admin/categories (Category Management)
├── /admin/coupons (Coupon Management)
├── /admin/orders (Order Management)
├── /admin/blog (Blog Management)
├── /admin/blog/new (Create Blog)
├── /admin/blog/:id/edit (Edit Blog)
├── /admin/blog/comments (Comment Management)
└── /admin/statistics (Statistics & Reports)
```

**Route Guards:**

- **PublicRoute**: Chỉ cho phép truy cập khi chưa đăng nhập
- **ProtectedRoute**: Yêu cầu đăng nhập
- **AdminRoute**: Yêu cầu role admin

### 4. UI Components & Libraries

#### @heroicons/react 2.1.1

- 200+ SVG icons chất lượng cao
- Outline và Solid variants
- Tree-shakeable (chỉ import icons cần dùng)

#### react-toastify 9.1.3

- Toast notifications cho success/error/info messages
- Customizable position, duration, style
- Auto-dismiss và manual close

#### react-quill 2.0.0

- Rich Text Editor cho blog content
- WYSIWYG interface
- Support images, links, formatting
- HTML output

#### recharts 2.10.3

- Chart library cho admin statistics
- Line charts, Bar charts, Pie charts
- Responsive và customizable
- Animation support

### 5. HTTP Client & API Integration

#### Axios 1.6.2

**Features:**

- Interceptors cho request/response
- Automatic JSON transformation
- Request/Response interceptors cho token injection
- Error handling centralized

**API Configuration:**

```javascript
// utils/api.js
- Base URL: http://localhost:5000/api
- Auto token injection từ localStorage
- Auto redirect to login on 401 Unauthorized
- Centralized error handling
```

### 6. Styling & Design System

#### Custom Design Tokens

**Colors:**

- Primary: Blue shades (#0ea5e9 - Sky Blue)
- Accent: Purple shades (#d946ef - Fuchsia)
- Semantic colors: success, warning, error, info

**Typography:**

- Font Family: Inter (body), Poppins (headings)
- Font sizes: xs, sm, base, lg, xl, 2xl, 3xl, 4xl
- Font weights: 400, 500, 600, 700, 800

**Spacing:**

- Consistent spacing scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64

**Shadows:**

- soft: Subtle elevation
- medium: Card elevation
- strong: Modal/Dropdown elevation

### 7. Performance Optimization

**Techniques Applied:**

- **Code Splitting**: Lazy load admin pages
- **Image Optimization**: Lazy loading images, placeholder on error
- **Memoization**: useMemo, useCallback cho expensive calculations
- **Debouncing**: Search input debouncing
- **Virtual Scrolling**: Large product lists
- **Bundle Size**: Tree shaking, production build optimization

---

## ⚙️ BACKEND - CÔNG NGHỆ VÀ KIẾN TRÚC

### 1. Core Technologies

#### Node.js + Express.js 4.18.2

**Lý do lựa chọn:**

- Non-blocking I/O, event-driven architecture
- Hiệu năng cao cho API requests
- Ecosystem phong phú (npm packages)
- JavaScript full-stack (cùng ngôn ngữ với frontend)

**Architecture Pattern: MVC (Model-View-Controller)**

```
back-end/
├── config/          # Database configuration
├── controllers/     # Business logic handlers
├── services/        # Business logic layer
├── routes/          # API route definitions
├── middleware/      # Authentication, validation
├── utils/           # Helper functions
└── server.js        # Entry point
```

#### Express.js Middleware Stack

1. **CORS** (cors 2.8.5): Cross-Origin Resource Sharing

   - Allow frontend (localhost:3000) to access API
   - Credentials support for cookies/auth headers
   - Methods: GET, POST, PUT, DELETE, OPTIONS

2. **Body Parser**: JSON và URL-encoded parsing

   - express.json() - Parse JSON request body
   - express.urlencoded() - Parse form data

3. **Authentication Middleware** (middleware/auth.js):

   - JWT token verification
   - User role authorization
   - Token expiration handling

4. **Error Handling Middleware**:
   - Centralized error handling
   - Consistent error response format
   - 404 handler cho unknown routes

### 2. Database Layer

#### MySQL2 3.6.5 (Promise-based)

**Lý do chọn MySQL:**

- Relational database phù hợp với e-commerce (nhiều relationships)
- ACID compliance đảm bảo data integrity
- Transaction support cho orders/payments
- Mature ecosystem, nhiều tools hỗ trợ

**Connection Pool Configuration:**

```javascript
// config/database.js
- Host: localhost
- Connection Limit: 10
- Wait for connections: true
- Queue limit: 0 (unlimited)
- Auto reconnect on connection loss
```

**Database Schema (14 tables):**

1. **users**: User accounts (customer/admin)
2. **categories**: Product categories
3. **products**: Product information
4. **product_variants**: Product variants (color, size, storage)
5. **product_images**: Multiple images per product
6. **orders**: Order information
7. **order_items**: Order line items
8. **cart_items**: Shopping cart
9. **wishlist**: User wishlist
10. **coupons**: Discount coupons
11. **payments**: Payment transactions (VNPay)
12. **password_resets**: Password reset tokens
13. **blog_posts**: Blog articles
14. **blog_comments**: Blog comments

**Key Relationships:**

- users → orders (1:N)
- orders → order_items (1:N)
- products → product_variants (1:N)
- products → product_images (1:N)
- users → cart_items (1:N)
- users → wishlist (1:N)
- blog_posts → blog_comments (1:N)

**Indexes for Performance:**

- Primary keys on all tables
- Foreign key indexes
- Status indexes (product.status, order.status)
- Email index (users.email - UNIQUE)
- Category index (products.category_id)

### 3. Authentication & Security

#### JWT (jsonwebtoken 9.0.2)

**Token Structure:**

```javascript
{
  userId: number,
  role: 'customer' | 'admin',
  iat: timestamp,
  exp: timestamp (7 days)
}
```

**Security Features:**

- Secret key từ environment variable
- Token expiration (7 days default)
- Refresh token support (optional)
- Token verification middleware

#### bcryptjs 2.4.3

**Password Hashing:**

- Salt rounds: 10
- One-way hashing (không thể decrypt)
- Compare hashed passwords securely

**Password Reset Flow:**

1. User requests reset → Generate crypto token
2. Send email with reset link (token in URL)
3. Token expires after 1 hour
4. Verify token → Allow password change

#### Security Best Practices

- Environment variables cho sensitive data (.env)
- SQL injection prevention (parameterized queries)
- XSS protection (input validation)
- CORS configuration
- Rate limiting (optional - có thể thêm)

### 4. API Architecture

#### RESTful API Design

**Naming Convention:**

- Resources: Plural nouns (/products, /orders)
- HTTP Methods: GET, POST, PUT, DELETE
- Status Codes: 200, 201, 400, 401, 403, 404, 500

**API Endpoints (12 modules):**

1. **Auth Routes** (/api/auth)

   - POST /register - User registration
   - POST /login - User login
   - GET /me - Get current user
   - PUT /profile - Update profile
   - PUT /change-password - Change password
   - POST /forgot-password - Request password reset
   - POST /reset-password - Reset password with token

2. **Product Routes** (/api/products)

   - GET / - List products (pagination, filters)
   - GET /:id - Get product detail
   - POST / - Create product (admin)
   - PUT /:id - Update product (admin)
   - DELETE /:id - Delete product (admin)
   - GET /:id/variants - Get product variants
   - POST /:id/images - Upload product images

3. **Category Routes** (/api/categories)

   - GET / - List categories
   - GET /:id - Get category detail
   - POST / - Create category (admin)
   - PUT /:id - Update category (admin)
   - DELETE /:id - Delete category (admin)

4. **Cart Routes** (/api/cart)

   - GET / - Get user cart
   - POST / - Add to cart
   - PUT /:id - Update cart item quantity
   - DELETE /:id - Remove from cart
   - DELETE / - Clear cart

5. **Order Routes** (/api/orders)

   - GET / - List user orders
   - GET /:id - Get order detail
   - POST / - Create order (checkout)
   - PUT /:id/status - Update order status (admin)
   - GET /admin/all - List all orders (admin)

6. **Coupon Routes** (/api/coupons)

   - GET / - List coupons
   - POST /validate - Validate coupon code
   - POST / - Create coupon (admin)
   - PUT /:id - Update coupon (admin)
   - DELETE /:id - Delete coupon (admin)

7. **Payment Routes** (/api/payment)

   - POST /create - Create VNPay payment URL
   - GET /callback - VNPay callback handler
   - GET /success - Payment success page
   - GET /failed - Payment failed page

8. **Wishlist Routes** (/api/wishlist)

   - GET / - Get user wishlist
   - POST / - Add to wishlist
   - DELETE /:id - Remove from wishlist

9. **User Routes** (/api/users) - Admin only

   - GET / - List all users
   - GET /:id - Get user detail
   - PUT /:id - Update user
   - DELETE /:id - Delete user
   - PUT /:id/role - Change user role

10. **Blog Routes** (/api/blog)

    - GET /posts - List blog posts
    - GET /posts/:slug - Get post by slug
    - POST /posts - Create post (admin)
    - PUT /posts/:id - Update post (admin)
    - DELETE /posts/:id - Delete post (admin)
    - GET /posts/:id/comments - Get post comments
    - POST /posts/:id/comments - Add comment
    - DELETE /comments/:id - Delete comment (admin)

11. **Statistics Routes** (/api/statistics) - Admin only

    - GET /overview - Dashboard overview
    - GET /revenue - Revenue statistics
    - GET /products - Product statistics
    - GET /users - User statistics

12. **Chatbot Routes** (/api/chatbot)
    - POST /chat - Send message to AI chatbot
    - GET /products/search - Search products for chatbot

**Response Format:**

```javascript
// Success Response
{
  success: true,
  data: {...},
  message: "Success message"
}

// Error Response
{
  success: false,
  message: "Error message",
  errors: [...]  // Validation errors (optional)
}
```

### 5. AI Chatbot Integration

#### Google Gemini Pro (@google/generative-ai 0.24.1)

**Model: gemini-2.5-flash (Recommended)**

**Features:**

- Free tier: 60 requests/minute
- Context window: 2M tokens
- Excellent Vietnamese language support
- Fast response time (< 2 seconds)

**Configuration:**

```javascript
{
  temperature: 0.7,      // Creativity level
  topK: 40,              // Token sampling
  topP: 0.95,            // Nucleus sampling
  maxOutputTokens: 1024  // Max response length
}
```

**Fallback Models:**

- gemini-2.0-flash
- gemini-1.5-flash
- gemini-1.5-pro
- gemini-1.0-pro

#### OpenAI GPT-4o-mini (openai 4.20.1) - Alternative

**Model: gpt-4o-mini**

**Features:**

- Cost: $0.15/1M input tokens, $0.60/1M output tokens
- Context window: 128K tokens
- Fast response time
- Multimodal support (text, image, audio)

**Configuration:**

```javascript
{
  model: "gpt-4o-mini",
  temperature: 0.7,
  max_tokens: 800
}
```

#### Chatbot Service Architecture

**System Prompt Engineering:**

```javascript
// buildSystemPrompt()
- Role: Trợ lý bán hàng thông minh
- Context: Product catalog (30 products)
- Capabilities:
  1. Tìm kiếm sản phẩm theo tên/mô tả
  2. Cung cấp thông tin chi tiết (giá, tồn kho)
  3. Kiểm tra tình trạng tồn kho
  4. Hướng dẫn mua hàng
  5. Trả lời về chính sách (vận chuyển, bảo hành, đổi trả)
- Response format: Tiếng Việt, thân thiện, chuyên nghiệp
- Product ID extraction: Luôn bao gồm (ID: X) trong response
```

**Conversation Flow:**

1. User sends message
2. Extract search intent from message
3. Get relevant product context from database
4. Build conversation history (last 6 messages)
5. Send to AI API (Gemini/OpenAI)
6. Extract product IDs from AI response
7. Fetch product details from database
8. Return response with product cards

**Product Context Injection:**

```javascript
// getProductContext(searchQuery)
- Query active products from database
- Filter by search query (if provided)
- Limit to 30 products
- Format: "ID: X, Tên: Y, Giá: Z, Tồn kho: W"
- Inject into system prompt
```

**Product ID Extraction:**

```javascript
// extractProductIds(text)
- Regex patterns: /\(?ID:\s*(\d+)\)?/gi
- Extract all product IDs from AI response
- Fetch full product details from database
- Return as product cards in frontend
```

### 6. Payment Integration

#### VNPay Payment Gateway

**Configuration:**

```javascript
{
  vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_TmnCode: process.env.VNPAY_TMN_CODE,
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
  vnp_ReturnUrl: 'http://localhost:5000/api/payment/callback'
}
```

**Payment Flow:**

1. User clicks "Thanh toán" on checkout page
2. Backend creates VNPay payment URL
   - Generate transaction reference (ORDER{id}\_{timestamp})
   - Calculate amount (VND \* 100)
   - Create secure hash (HMAC SHA512)
   - Save payment transaction to database
3. Redirect user to VNPay payment page
4. User completes payment on VNPay
5. VNPay redirects back to callback URL
6. Backend verifies payment signature
7. Update order status (paid/unpaid)
8. Update payment transaction status
9. Redirect to success/failed page

**Security:**

- HMAC SHA512 signature verification
- Transaction reference validation
- Amount validation
- Response code handling (24 codes)

**Payment Status:**

- pending: Chờ thanh toán
- success: Thanh toán thành công
- failed: Thanh toán thất bại

**VNPay Response Codes:**

- 00: Giao dịch thành công
- 01-24: Various error codes (see VNPAY_RESPONSE_MESSAGES)

### 7. Email Service

#### Nodemailer 6.9.7

**SMTP Configuration:**

```javascript
{
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,  // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD  // App password
  }
}
```

**Email Templates:**

1. **Password Reset Email:**

   - Subject: "Đặt lại mật khẩu"
   - Content: Reset link with token
   - Expiration: 1 hour
   - HTML template with branding

2. **Order Confirmation Email:**
   - Subject: "Xác nhận đơn hàng #{orderId}"
   - Content: Order details, total amount, status
   - HTML template with order summary

**Email Verification:**

- Auto-verify SMTP connection on startup
- Graceful fallback if email not configured
- Error logging for debugging

### 8. Validation & Error Handling

#### express-validator 7.0.1

**Validation Rules:**

- Email format validation
- Password strength (min 6 characters)
- Required fields validation
- Number range validation
- Custom validators

**Example:**

```javascript
// Register validation
[
  body("email").isEmail().withMessage("Email không hợp lệ"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu tối thiểu 6 ký tự"),
  body("username").notEmpty().withMessage("Username là bắt buộc"),
];
```

**Error Response:**

```javascript
{
  success: false,
  message: "Validation failed",
  errors: [
    { field: "email", message: "Email không hợp lệ" }
  ]
}
```

### 9. Environment Configuration

#### dotenv 16.3.1

**Environment Variables:**

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ecommerce_db

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# AI Chatbot
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key

# VNPay
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5000/api/payment/callback

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 10. Utility Functions

#### JWT Utils (utils/jwt.js)

- generateToken(userId, role): Generate JWT token
- Token expiration: 7 days default
- Secret key validation

#### Crypto Utils

- crypto.randomBytes(): Generate reset tokens
- crypto.createHmac(): VNPay signature

#### Date Utils (moment 2.29.4)

- Format dates for VNPay (YYYYMMDDHHmmss)
- Calculate expiration times
- Timezone handling

---

## 🗄️ DATABASE DESIGN

### 1. Schema Overview

**Total Tables: 14**

- Core tables: 5 (users, categories, products, orders, order_items)
- Extended tables: 9 (variants, images, cart, wishlist, coupons, payments, password_resets, blog, comments)

### 2. Key Design Decisions

#### Normalization

- 3rd Normal Form (3NF)
- Minimal data redundancy
- Foreign key constraints for referential integrity

#### Denormalization for Performance

- Store product name/price in order_items (snapshot at purchase time)
- Cache cart item details (avoid JOIN on every cart view)

#### Indexes Strategy

- Primary keys: Clustered index
- Foreign keys: Non-clustered index
- Status fields: Index for filtering
- Email: Unique index for fast lookup

### 3. Table Details

#### users

```sql
id, username, email, password, full_name, phone, address, role, created_at, updated_at
- role: ENUM('customer', 'admin')
- Indexes: email (UNIQUE), role
```

#### products

```sql
id, name, description, price, stock, image_url, category_id, status, created_at, updated_at
- status: ENUM('active', 'inactive')
- Indexes: category_id, status
- Foreign key: category_id → categories(id)
```

#### product_variants

```sql
id, product_id, variant_type, variant_value, price_adjustment, stock, created_at
- variant_type: 'color', 'size', 'storage', etc.
- price_adjustment: Difference from base price
- Indexes: product_id
```

#### orders

```sql
id, user_id, total_amount, status, shipping_address, phone, notes, coupon_id, discount_amount, payment_status, created_at, updated_at
- status: ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled')
- payment_status: ENUM('unpaid', 'paid', 'refunded')
- Indexes: user_id, status, payment_status
```

#### payments

```sql
id, order_id, transaction_id, amount, status, vnpay_transaction_no, vnpay_response_code, payment_date, created_at
- status: ENUM('pending', 'success', 'failed')
- Indexes: order_id, transaction_id
```

### 4. Relationships

#### One-to-Many

- users → orders
- users → cart_items
- users → wishlist
- categories → products
- products → product_variants
- products → product_images
- orders → order_items
- blog_posts → blog_comments

#### Many-to-One

- orders → users
- products → categories
- order_items → products

#### Optional Relationships

- orders → coupons (nullable)
- order_items → product_variants (nullable)

### 5. Data Integrity

#### Constraints

- NOT NULL: Essential fields (email, password, price, etc.)
- UNIQUE: email, username
- FOREIGN KEY: Cascade delete for dependent records
- CHECK: price >= 0, stock >= 0 (implicit)

#### Triggers (Optional - not implemented yet)

- Update product stock on order creation
- Update order total on order_items change
- Log order status changes

### 6. Sample Data (Seeder)

**Categories:** 6 categories

- Điện thoại, Laptop, Tablet, Phụ kiện, Âm thanh, Đồng hồ

**Products:** 50+ products

- iPhone, Samsung, Laptop Dell/HP/Lenovo
- AirPods, Apple Watch, Accessories

**Users:** 5 users

- 1 admin: admin@example.com / admin123
- 4 customers: test users

**Coupons:** 5 coupons

- WELCOME10, SUMMER20, FREESHIP, etc.

**Blog Posts:** 10+ posts

- Tech news, product reviews, buying guides

---

## 🔐 SECURITY FEATURES

### 1. Authentication Security

- Password hashing với bcrypt (salt rounds: 10)
- JWT token với expiration
- Secure token storage (localStorage)
- Token verification middleware
- Role-based access control (RBAC)

### 2. API Security

- CORS configuration (whitelist frontend origin)
- Input validation với express-validator
- SQL injection prevention (parameterized queries)
- XSS protection (input sanitization)
- Error message sanitization (no stack traces in production)

### 3. Payment Security

- HMAC SHA512 signature verification
- Transaction reference validation
- Amount tampering prevention
- Secure callback URL
- HTTPS required in production

### 4. Data Security

- Environment variables cho sensitive data
- .gitignore cho .env file
- Database connection pooling
- Prepared statements (SQL injection prevention)

### 5. Best Practices

- Principle of least privilege (database user permissions)
- Regular security updates (npm audit)
- HTTPS in production
- Rate limiting (can be added)
- CSRF protection (can be added)

---

## 📊 PERFORMANCE OPTIMIZATION

### 1. Frontend Optimization

- Code splitting với React.lazy()
- Image lazy loading
- Debouncing search input
- Memoization (useMemo, useCallback)
- Virtual scrolling for large lists
- Production build minification
- Gzip compression

### 2. Backend Optimization

- Database connection pooling
- Query optimization (indexes)
- Caching strategies (can add Redis)
- Pagination for large datasets
- Async/await for non-blocking I/O
- Compression middleware (can add)

### 3. Database Optimization

- Proper indexing strategy
- Query optimization (EXPLAIN)
- Connection pooling
- Prepared statements
- Avoid N+1 queries

### 4. Network Optimization

- API response compression
- Minimize payload size
- HTTP/2 support (production)
- CDN for static assets (production)

---

## 🧪 TESTING & DEBUGGING

### 1. Development Tools

- **Nodemon**: Auto-restart server on file changes
- **React DevTools**: Component inspection
- **Redux DevTools**: State debugging (if using Redux)
- **Postman**: API testing
- **MySQL Workbench**: Database management

### 2. Logging

- Console.log for development
- Error logging in catch blocks
- Database connection status
- Email service status
- AI API status

### 3. Error Handling

- Try-catch blocks in async functions
- Centralized error middleware
- Consistent error response format
- User-friendly error messages
- Stack traces in development only

---

## 🚀 DEPLOYMENT CONSIDERATIONS

### 1. Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Use HTTPS
- [ ] Configure production database
- [ ] Set secure JWT secret
- [ ] Configure production email
- [ ] Set up VNPay production credentials
- [ ] Enable CORS for production domain
- [ ] Add rate limiting
- [ ] Add compression middleware
- [ ] Set up logging service
- [ ] Configure CDN for static assets
- [ ] Set up monitoring (Sentry, New Relic)
- [ ] Database backups
- [ ] SSL certificate

### 2. Hosting Options

**Frontend:**

- Vercel (recommended for React)
- Netlify
- AWS S3 + CloudFront
- Firebase Hosting

**Backend:**

- Heroku
- AWS EC2
- DigitalOcean
- Railway
- Render

**Database:**

- AWS RDS
- DigitalOcean Managed MySQL
- PlanetScale
- ClearDB (Heroku)

### 3. Environment Variables

- Use platform-specific environment variable management
- Never commit .env to git
- Use different .env for dev/staging/production

---

## 📈 SCALABILITY CONSIDERATIONS

### 1. Horizontal Scaling

- Load balancer (Nginx, AWS ELB)
- Multiple backend instances
- Session management (Redis)
- Database replication (master-slave)

### 2. Vertical Scaling

- Increase server resources (CPU, RAM)
- Database optimization
- Caching layer (Redis, Memcached)

### 3. Microservices (Future)

- Separate services: Auth, Product, Order, Payment
- API Gateway
- Message queue (RabbitMQ, Kafka)
- Service discovery

### 4. Caching Strategy

- Redis for session storage
- Cache product catalog
- Cache user cart
- Cache statistics data
- CDN for static assets

---

## 🔄 CI/CD PIPELINE (Future Enhancement)

### 1. Continuous Integration

- GitHub Actions / GitLab CI
- Automated testing
- Code linting (ESLint, Prettier)
- Build verification

### 2. Continuous Deployment

- Automated deployment to staging
- Manual approval for production
- Database migration scripts
- Rollback strategy

### 3. Monitoring

- Application monitoring (Sentry)
- Performance monitoring (New Relic)
- Log aggregation (ELK Stack)
- Uptime monitoring (UptimeRobot)

---

## 📚 DEPENDENCIES SUMMARY

### Frontend Dependencies

```json
{
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "react-router-dom": "6.20.1",
  "axios": "1.6.2",
  "@heroicons/react": "2.1.1",
  "react-toastify": "9.1.3",
  "react-quill": "2.0.0",
  "quill": "2.0.3",
  "recharts": "2.10.3"
}
```

### Backend Dependencies

```json
{
  "express": "4.18.2",
  "mysql2": "3.6.5",
  "bcryptjs": "2.4.3",
  "jsonwebtoken": "9.0.2",
  "cors": "2.8.5",
  "dotenv": "16.3.1",
  "express-validator": "7.0.1",
  "nodemailer": "6.9.7",
  "@google/generative-ai": "0.24.1",
  "openai": "4.20.1",
  "crypto": "1.0.1",
  "moment": "2.29.4"
}
```

### Dev Dependencies

```json
{
  "vite": "5.0.8",
  "@vitejs/plugin-react": "4.2.1",
  "tailwindcss": "3.3.6",
  "autoprefixer": "10.4.16",
  "postcss": "8.4.32",
  "nodemon": "3.0.2"
}
```

---

## 🎯 KEY FEATURES SUMMARY

### User Features

1. ✅ User registration & login
2. ✅ Profile management
3. ✅ Password reset via email
4. ✅ Product browsing & search
5. ✅ Product filtering by category
6. ✅ Product detail with variants
7. ✅ Shopping cart (add/remove/update)
8. ✅ Wishlist
9. ✅ Checkout process
10. ✅ VNPay payment integration
11. ✅ Order history
12. ✅ Order tracking
13. ✅ AI Chatbot support
14. ✅ Blog reading & comments
15. ✅ Coupon/discount codes

### Admin Features

1. ✅ Dashboard with statistics
2. ✅ User management (CRUD)
3. ✅ Product management (CRUD)
4. ✅ Category management (CRUD)
5. ✅ Order management (view, update status)
6. ✅ Coupon management (CRUD)
7. ✅ Blog management (CRUD)
8. ✅ Comment moderation
9. ✅ Revenue statistics
10. ✅ Product statistics
11. ✅ User statistics
12. ✅ Charts & reports (Recharts)

### Technical Features

1. ✅ RESTful API architecture
2. ✅ JWT authentication
3. ✅ Role-based access control
4. ✅ AI chatbot (Gemini/OpenAI)
5. ✅ Payment gateway (VNPay)
6. ✅ Email service (Nodemailer)
7. ✅ Rich text editor (Quill)
8. ✅ Responsive design (TailwindCSS)
9. ✅ SPA with React Router
10. ✅ State management (Context API)
11. ✅ Database seeding scripts
12. ✅ Environment configuration

---

## 🏆 PROJECT HIGHLIGHTS

### Innovation Points

1. **AI-Powered Chatbot**: Tích hợp Gemini Pro AI cho trải nghiệm mua sắm thông minh
2. **Smart Product Recommendation**: Chatbot tự động gợi ý sản phẩm dựa trên ngữ cảnh
3. **Real-time Payment**: Tích hợp VNPay cho thanh toán trực tuyến an toàn
4. **Modern UI/UX**: Giao diện hiện đại với TailwindCSS và animations
5. **Comprehensive Admin Panel**: Quản trị toàn diện với charts và statistics

### Technical Excellence

1. **Clean Architecture**: MVC pattern, separation of concerns
2. **Scalable Design**: Modular structure, easy to extend
3. **Security First**: JWT, bcrypt, input validation, SQL injection prevention
4. **Performance Optimized**: Code splitting, lazy loading, caching
5. **Developer Experience**: Hot reload, TypeScript-ready, ESLint

### Business Value

1. **Complete E-commerce Solution**: Đầy đủ tính năng từ A-Z
2. **AI Customer Support**: Giảm tải cho customer service
3. **Payment Integration**: Tăng conversion rate với thanh toán online
4. **Analytics Dashboard**: Data-driven decision making
5. **Content Marketing**: Blog system cho SEO và engagement

---

## 📝 CONCLUSION

Hệ thống E-commerce này được xây dựng với các công nghệ hiện đại và best practices, đảm bảo:

- **Hiệu năng cao**: Tối ưu từ frontend đến backend
- **Bảo mật tốt**: Nhiều lớp bảo vệ cho dữ liệu và giao dịch
- **Dễ bảo trì**: Code sạch, có cấu trúc, comments đầy đủ
- **Khả năng mở rộng**: Kiến trúc modular, dễ thêm tính năng mới
- **Trải nghiệm người dùng tốt**: UI/UX hiện đại, responsive, AI chatbot

Đây là một project hoàn chỉnh, production-ready, phù hợp cho đồ án tốt nghiệp hoặc dự án thực tế.
