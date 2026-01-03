const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Không có token xác thực' 
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ 
        success: false, 
        message: 'Lỗi cấu hình server' 
      });
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token đã hết hạn' 
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token không hợp lệ' 
      });
    }
    return res.status(401).json({ 
      success: false, 
      message: 'Token không hợp lệ hoặc đã hết hạn' 
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Chưa xác thực' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Không có quyền truy cập' 
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };

