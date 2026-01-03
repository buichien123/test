const pool = require('../config/database');

const getAllUsers = async (filters = {}) => {
  const { role, search, page = 1, limit = 20 } = filters;

  // Validate and convert limit and offset to integers
  let limitInt = parseInt(limit, 10);
  let pageInt = parseInt(page, 10);
  
  if (isNaN(limitInt) || limitInt < 1) {
    limitInt = 20;
  }
  if (isNaN(pageInt) || pageInt < 1) {
    pageInt = 1;
  }
  
  const offsetInt = Math.max(0, (pageInt - 1) * limitInt);

  let query = `
    SELECT id, username, email, full_name, phone, address, role, created_at, updated_at
    FROM users
    WHERE 1=1
  `;
  const params = [];

  if (role) {
    query += ' AND role = ?';
    params.push(role);
  }

  if (search) {
    query += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  // Use template literal for LIMIT/OFFSET after validation
  query += ` ORDER BY created_at DESC LIMIT ${limitInt} OFFSET ${offsetInt}`;

  const [users] = await pool.execute(query, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
  const countParams = [];

  if (role) {
    countQuery += ' AND role = ?';
    countParams.push(role);
  }

  if (search) {
    countQuery += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
    const searchTerm = `%${search}%`;
    countParams.push(searchTerm, searchTerm, searchTerm);
  }

  const [countResult] = await pool.execute(countQuery, countParams);
  const total = countResult[0].total;

  return {
    users,
    pagination: {
      page: pageInt,
      limit: limitInt,
      total,
      pages: Math.ceil(total / limitInt)
    }
  };
};

const getUserById = async (userId) => {
  const [users] = await pool.execute(
    'SELECT id, username, email, full_name, phone, address, role, created_at, updated_at FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    throw new Error('Không tìm thấy người dùng');
  }

  return users[0];
};

const updateUser = async (userId, userData) => {
  const { full_name, phone, address, role, password } = userData;

  const updateFields = [];
  const params = [];

  if (full_name !== undefined) {
    updateFields.push('full_name = ?');
    params.push(full_name);
  }

  if (phone !== undefined) {
    updateFields.push('phone = ?');
    params.push(phone);
  }

  if (address !== undefined) {
    updateFields.push('address = ?');
    params.push(address);
  }

  if (role !== undefined) {
    updateFields.push('role = ?');
    params.push(role);
  }

  if (password !== undefined && password !== '') {
    if (password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    }
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    updateFields.push('password = ?');
    params.push(hashedPassword);
  }

  if (updateFields.length === 0) {
    throw new Error('Không có dữ liệu để cập nhật');
  }

  params.push(userId);

  await pool.execute(
    `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
    params
  );

  return await getUserById(userId);
};

const createUser = async (userData) => {
  const { username, email, password, full_name, phone, address, role } = userData;

  // Validation
  if (!username || !email || !password) {
    throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc (username, email, password)');
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
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password, full_name, phone, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [username, email, hashedPassword, full_name || null, phone || null, address || null, role || 'customer']
  );

  return await getUserById(result.insertId);
};

const deleteUser = async (userId) => {
  const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

  if (result.affectedRows === 0) {
    throw new Error('Không tìm thấy người dùng');
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};

