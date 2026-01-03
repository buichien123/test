const authService = require("../services/authService");

// Register
const register = async (req, res) => {
  try {
    const { username, email, password, full_name, phone, address } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng điền đầy đủ thông tin bắt buộc (username, email, password)",
      });
    }

    const result = await authService.register({
      username,
      email,
      password,
      full_name,
      phone,
      address,
    });

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi server khi đăng ký",
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    const result = await authService.login(email, password);

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({
      success: false,
      message: error.message || "Lỗi server khi đăng nhập",
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.userId);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(404).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { full_name, phone, address } = req.body;
    const user = await authService.updateProfile(req.user.userId, {
      full_name,
      phone,
      address,
    });

    res.json({
      success: true,
      message: "Cập nhật thông tin thành công",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    await authService.changePassword(
      req.user.userId,
      old_password,
      new_password
    );

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email",
      });
    }

    const result = await authService.forgotPassword(email);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    await authService.resetPassword(token, new_password);

    res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
