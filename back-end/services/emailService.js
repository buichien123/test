const nodemailer = require('nodemailer');
require('dotenv').config();

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify email configuration (only if email is configured)
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter.verify((error, success) => {
    if (error) {
      console.log('⚠️  Email service not configured properly:', error.message);
      console.log('   Email features (password reset) will not work until configured.');
    } else {
      console.log('✅ Email service ready');
    }
  });
} else {
  console.log('⚠️  Email service not configured (EMAIL_USER/EMAIL_PASSWORD missing)');
  console.log('   Email features (password reset) will not work.');
}

const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"E-Commerce" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Đặt lại mật khẩu',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">Đặt lại mật khẩu</h2>
        <p>Xin chào ${userName || 'bạn'},</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Vui lòng click vào link bên dưới để đặt lại mật khẩu:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Đặt lại mật khẩu
        </a>
        <p>Link này sẽ hết hạn sau 1 giờ.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        <p>Trân trọng,<br>Đội ngũ E-Commerce</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Send email error:', error);
    return { success: false, error: error.message };
  }
};

const sendOrderConfirmationEmail = async (email, order, userName) => {
  const mailOptions = {
    from: `"E-Commerce" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Xác nhận đơn hàng #${order.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">Cảm ơn bạn đã đặt hàng!</h2>
        <p>Xin chào ${userName || 'bạn'},</p>
        <p>Đơn hàng #${order.id} của bạn đã được tiếp nhận thành công.</p>
        <h3>Thông tin đơn hàng:</h3>
        <ul>
          <li>Mã đơn hàng: #${order.id}</li>
          <li>Tổng tiền: ${parseFloat(order.total_amount).toLocaleString('vi-VN')}đ</li>
          <li>Trạng thái: ${order.status}</li>
        </ul>
        <p>Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.</p>
        <p>Trân trọng,<br>Đội ngũ E-Commerce</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Send email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendOrderConfirmationEmail
};

