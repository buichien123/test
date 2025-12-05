const userService = require('../services/userService');

// Create user (Admin only)
const createUser = async (req, res) => {
  try {
    const userData = req.body;
    const user = await userService.createUser(userData);

    res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công',
      user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server khi tạo người dùng'
    });
  }
};

// Get all users (Admin only)
const getUsers = async (req, res) => {
  try {
    const filters = {
      role: req.query.role,
      search: req.query.search,
      page: req.query.page || 1,
      limit: req.query.limit || 20
    };

    const result = await userService.getAllUsers(filters);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy danh sách người dùng'
    });
  }
};

// Get user by ID (Admin only)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy người dùng'
    });
  }
};

// Update user (Admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    const user = await userService.updateUser(id, userData);

    res.json({
      success: true,
      message: 'Cập nhật người dùng thành công',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server khi cập nhật người dùng'
    });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);

    res.json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server khi xóa người dùng'
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};

