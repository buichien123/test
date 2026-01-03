const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/database');
const { generateToken } = require('../utils/jwt');
const emailService = require('./emailService');

const register = async (userData) => {
  const { username, email, password, full_name, phone, address } = userData;

  // Validation
  if (!username || !email || !password) {
    throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
  }

  if (username.length < 3 || username.length > 50) {
    throw new Error('Username phải có từ 3 đến 50 ký tự');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Email không hợp lệ');
  }

  if (password.length < 6) {
    throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
  }

  // Check if user exists
  const [existingUser] = await pool.execute(
    'SELECT * FROM users WHERE email = ? OR username = ?',
    [email, username]
  );

  if (existingUser.length > 0) {
    throw new Error('Email hoặc username đã tồn tại');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password, full_name, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
    [username, email, hashedPassword, full_name || null, phone || null, address || null]
  );

  const token = generateToken(result.insertId, 'customer');

  const [newUser] = await pool.execute(
    'SELECT id, username, email, full_name, phone, address, role, created_at FROM users WHERE id = ?',
    [result.insertId]
  );

  return {
    token,
    user: newUser[0]
  };
};

const login = async (email, password) => {
  // Validation
  if (!email || !password) {
    throw new Error('Vui lòng nhập email và mật khẩu');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Email không hợp lệ');
  }

  // Find user
  const [users] = await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (users.length === 0) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }

  const user = users[0];

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }

  const token = generateToken(user.id, user.role);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      address: user.address,
      role: user.role
    }
  };
};

const getMe = async (userId) => {
  const [users] = await pool.execute(
    'SELECT id, username, email, full_name, phone, address, role, created_at FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    throw new Error('Không tìm thấy người dùng');
  }

  return users[0];
};

const updateProfile = async (userId, updateData) => {
  const { full_name, phone, address } = updateData;
  
  // Validation
  if (phone && phone.length > 20) {
    throw new Error('Số điện thoại không hợp lệ');
  }

  if (full_name && full_name.length > 100) {
    throw new Error('Họ và tên không được vượt quá 100 ký tự');
  }
  
  const [result] = await pool.execute(
    'UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?',
    [full_name || null, phone || null, address || null, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Không tìm thấy người dùng');
  }

  return await getMe(userId);
};

const changePassword = async (userId, oldPassword, newPassword) => {
  // Get user
  const [users] = await pool.execute(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    throw new Error('Không tìm thấy người dùng');
  }

  const user = users[0];

  // Verify old password
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new Error('Mật khẩu cũ không đúng');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await pool.execute(
    'UPDATE users SET password = ? WHERE id = ?',
    [hashedPassword, userId]
  );

  return { success: true };
};

const forgotPassword = async (email) => {
  // Find user
  const [users] = await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (users.length === 0) {
    // Don't reveal if email exists for security
    return { success: true, message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu' };
  }

  const user = users[0];

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour

  // Save reset token
  await pool.execute(
    'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
    [user.id, resetToken, expiresAt]
  );

  // Send email
  await emailService.sendPasswordResetEmail(
    user.email,
    resetToken,
    user.full_name || user.username
  );

  return { success: true, message: 'Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn' };
};

const resetPassword = async (token, newPassword) => {
  // Find valid reset token
  const [tokens] = await pool.execute(
    'SELECT * FROM password_resets WHERE token = ? AND used = FALSE AND expires_at > NOW()',
    [token]
  );

  if (tokens.length === 0) {
    throw new Error('Token không hợp lệ hoặc đã hết hạn');
  }

  const resetToken = tokens[0];

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await pool.execute(
    'UPDATE users SET password = ? WHERE id = ?',
    [hashedPassword, resetToken.user_id]
  );

  // Mark token as used
  await pool.execute(
    'UPDATE password_resets SET used = TRUE WHERE id = ?',
    [resetToken.id]
  );

  return { success: true };
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};

