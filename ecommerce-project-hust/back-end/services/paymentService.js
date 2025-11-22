const crypto = require('crypto');
const pool = require('../config/database');

const VNPAY_CONFIG = {
  vnp_Url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_TmnCode: process.env.VNPAY_TMN_CODE || '',
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET || '',
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:5000/api/payment/callback'
};

const VNPAY_RESPONSE_MESSAGES = {
  '00': 'Giao dịch thành công',
  '01': 'Giao dịch chưa hoàn tất',
  '02': 'Merchant không hợp lệ',
  '03': 'Dữ liệu gửi sang không đúng định dạng',
  '04': 'Không có dữ liệu giao dịch',
  '05': 'Giao dịch bị từ chối',
  '06': 'Mã OrderId đã tồn tại',
  '07': 'Giao dịch bị nghi ngờ gian lận',
  '08': 'Giao dịch bị hủy bởi khách hàng',
  '09': 'Giao dịch hết thời gian thanh toán',
  '10': 'Đã vượt quá hạn mức thanh toán',
  '11': 'Giao dịch bị từ chối bởi ngân hàng phát hành thẻ',
  '12': 'Giao dịch bị từ chối bởi VNPAY',
  '13': 'Giao dịch chờ khách hàng xác nhận',
  '24': 'Giao dịch bị hủy'
};

const formatVNPayDate = (date) => {
  const pad = (number) => number.toString().padStart(2, '0');
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
};

const buildQueryString = (params, { encodeKey = true, sort = true } = {}) => {
  const keys = Object.keys(params);
  if (sort) {
    keys.sort();
  }
  return keys
    .map((key) => {
      const encodedKey = encodeKey ? encodeURIComponent(key) : key;
      const encodedValue = encodeURIComponent(params[key]).replace(/%20/g, '+');
      return `${encodedKey}=${encodedValue}`;
    })
    .join('&');
};

const ensureVNPayConfig = () => {
  if (!VNPAY_CONFIG.vnp_TmnCode || !VNPAY_CONFIG.vnp_HashSecret || !VNPAY_CONFIG.vnp_ReturnUrl) {
    throw new Error('Thiếu cấu hình VNPay. Vui lòng kiểm tra biến môi trường.');
  }
};

const createPaymentUrl = async (orderId, amount, orderInfo = '', clientIp = '127.0.0.1') => {
  ensureVNPayConfig();

  const order = await getOrderFromDB(orderId);
  if (!order) {
    throw new Error('Không tìm thấy đơn hàng');
  }

  const normalizedAmount = Math.round(Number(amount) * 100);
  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new Error('Số tiền thanh toán không hợp lệ');
  }

  const now = new Date();
  const txnRef = `ORDER${orderId}_${Date.now()}`;

  const vnpParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNPAY_CONFIG.vnp_TmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo || `Thanh toan don hang #${orderId}`,
    vnp_OrderType: 'other',
    vnp_Amount: normalizedAmount,
    vnp_ReturnUrl: VNPAY_CONFIG.vnp_ReturnUrl,
    vnp_IpAddr: clientIp,
    vnp_CreateDate: formatVNPayDate(now),
    vnp_ExpireDate: formatVNPayDate(new Date(now.getTime() + 15 * 60 * 1000))
  };

  const signData = buildQueryString(vnpParams, { encodeKey: false });
  const vnpSecureHash = crypto
    .createHmac('sha512', VNPAY_CONFIG.vnp_HashSecret)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex');

  const paymentParams = {
    ...vnpParams,
    vnp_SecureHash: vnpSecureHash
  };

  await savePaymentTransaction(orderId, txnRef, amount, 'pending');

  return {
    payment_url: `${VNPAY_CONFIG.vnp_Url}?${buildQueryString(paymentParams)}`,
    transaction_ref: txnRef
  };
};

const verifyPaymentCallback = async (queryParams) => {
  ensureVNPayConfig();
  const vnpParams = { ...queryParams };
  const secureHash = vnpParams['vnp_SecureHash'];
  delete vnpParams['vnp_SecureHash'];
  delete vnpParams['vnp_SecureHashType'];

  const signData = buildQueryString(vnpParams, { encodeKey: false });
  const expectedHash = crypto
    .createHmac('sha512', VNPAY_CONFIG.vnp_HashSecret)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex');

  if (secureHash !== expectedHash) {
    throw new Error('Invalid signature');
  }

  const orderId = parseInt(String(vnpParams['vnp_TxnRef']).split('_')[0].replace('ORDER', ''), 10);
  if (!orderId) {
    throw new Error('Order reference is invalid');
  }

  const responseCode = vnpParams['vnp_ResponseCode'];
  const transactionNo = vnpParams['vnp_TransactionNo'];
  const amount = Number(vnpParams['vnp_Amount']) / 100;

  let paymentStatus = 'failed';
  let orderPaymentStatus = 'unpaid';
  let message = VNPAY_RESPONSE_MESSAGES[responseCode] || `Giao dịch thất bại (mã: ${responseCode})`;

  if (responseCode === '00') {
    paymentStatus = 'success';
    orderPaymentStatus = 'paid';
    message = VNPAY_RESPONSE_MESSAGES['00'];
  }

  await pool.execute('UPDATE orders SET payment_status = ? WHERE id = ?', [orderPaymentStatus, orderId]);

  await pool.execute(
    `UPDATE payments SET 
     status = ?, 
     vnpay_transaction_no = ?,
     vnpay_response_code = ?,
     payment_date = NOW()
     WHERE order_id = ? AND transaction_id LIKE ?`,
    [paymentStatus, transactionNo, responseCode, orderId, `ORDER${orderId}_%`]
  );

  return {
    success: responseCode === '00',
    order_id: orderId,
    amount,
    transaction_no: transactionNo,
    response_code: responseCode,
    message
  };
};

const getOrderFromDB = async (orderId) => {
  const [orders] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
  return orders.length > 0 ? orders[0] : null;
};

const savePaymentTransaction = async (orderId, transactionId, amount, status) => {
  await pool.execute(
    'INSERT INTO payments (order_id, transaction_id, amount, status) VALUES (?, ?, ?, ?)',
    [orderId, transactionId, amount, status]
  );
};

module.exports = {
  createPaymentUrl,
  verifyPaymentCallback
};

