import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { toast } from 'react-toastify'
import AddressSelector from '../components/Checkout/AddressSelector'
import Loading from '../components/UI/Loading'
import { formatPrice, formatPriceNumber } from '../utils/formatPrice'

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('vnpay')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  
  const [formData, setFormData] = useState({
    phone: '',
    notes: '',
    address: {
      province: '',
      district: '',
      ward: '',
      street: '',
      full: ''
    }
  })

  useEffect(() => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt hàng')
      navigate('/login')
      return
    }

    if (cart.length === 0) {
      toast.error('Giỏ hàng trống')
      navigate('/cart')
      return
    }

    // Pre-fill form with user data
    setFormData(prev => ({
      ...prev,
      phone: user.phone || '',
      address: {
        province: '',
        district: '',
        ward: '',
        street: user.address || '',
        full: user.address || ''
      }
    }))
  }, [user, cart, navigate])

  const handleAddressChange = (address) => {
    setFormData(prev => ({
      ...prev,
      address
    }))
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá')
      return
    }

    setApplyingCoupon(true)
    setCouponError('')

    try {
      const subtotal = getCartTotal()
      const res = await api.get(`/coupons/validate?code=${couponCode}&total_amount=${subtotal}`)
      
      if (res.data.valid) {
        setAppliedCoupon(res.data.coupon)
        toast.success('Áp dụng mã giảm giá thành công!')
        setCouponCode('')
      } else {
        setCouponError(res.data.message || 'Mã giảm giá không hợp lệ')
      }
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Mã giảm giá không hợp lệ')
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0
    
    const subtotal = getCartTotal()
    if (subtotal < appliedCoupon.min_purchase_amount) return 0

    if (appliedCoupon.discount_type === 'percentage') {
      const discount = (subtotal * appliedCoupon.discount_value) / 100
      return appliedCoupon.max_discount_amount 
        ? Math.min(discount, appliedCoupon.max_discount_amount)
        : discount
    } else {
      return appliedCoupon.discount_value
    }
  }

  const calculateTotal = () => {
    const subtotal = getCartTotal()
    const discount = calculateDiscount()
    const shipping = subtotal >= 500000 ? 0 : 30000
    return subtotal - discount + shipping
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.address.full || !formData.phone) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng')
      return
    }

    setLoading(true)

    try {
      // Create order
      const orderData = {
        items: cart.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          quantity: item.quantity
        })),
        shipping_address: formData.address.full,
        phone: formData.phone,
        notes: formData.notes,
        coupon_code: appliedCoupon?.code || null
      }

      const orderRes = await api.post('/orders', orderData)
      const order = orderRes.data.order

      // If payment method is VNPay, create payment URL
      if (paymentMethod === 'vnpay') {
        try {
          const paymentRes = await api.post('/payment/create', {
            order_id: order.id
          })

          if (paymentRes.data.success && paymentRes.data.payment_url) {
            // Redirect to VNPay
            window.location.href = paymentRes.data.payment_url
            return
          }
        } catch (paymentError) {
          console.error('Payment creation error:', paymentError)
          toast.error('Không thể tạo thanh toán VNPay. Vui lòng thử lại.')
        }
      }

      // If COD or payment failed, just redirect to order detail
      toast.success('Đặt hàng thành công!')
      clearCart()
      navigate(`/orders/${order.id}`)
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng')
    } finally {
      setLoading(false)
    }
  }

  if (!user || cart.length === 0) {
    return <Loading fullScreen />
  }

  const subtotal = getCartTotal()
  const discount = calculateDiscount()
  const shipping = subtotal >= 500000 ? 0 : 30000
  const total = calculateTotal()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-display font-bold mb-8">Thanh toán</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <div className="card p-6">
                <h2 className="text-xl font-display font-bold mb-6">Thông tin giao hàng</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={user.full_name || user.username}
                        disabled
                        className="input bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="input bg-gray-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="input"
                      placeholder="0901234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ giao hàng <span className="text-red-500">*</span>
                    </label>
                    <AddressSelector
                      value={formData.address}
                      onChange={handleAddressChange}
                      error={!formData.address.full && formData.address.street ? 'Vui lòng chọn đầy đủ tỉnh/thành, quận/huyện, phường/xã' : ''}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú đơn hàng
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="input"
                      placeholder="Ghi chú cho người giao hàng (tùy chọn)"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="card p-6">
                <h2 className="text-xl font-display font-bold mb-6">Phương thức thanh toán</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="vnpay"
                      checked={paymentMethod === 'vnpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <CreditCardIcon className="h-6 w-6 text-primary-600 mr-3" />
                    <div>
                      <p className="font-semibold">Thanh toán qua VNPay</p>
                      <p className="text-sm text-gray-500">Thanh toán trực tuyến an toàn</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="mr-3 w-6 h-6 flex items-center justify-center">
                      💵
                    </div>
                    <div>
                      <p className="font-semibold">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-sm text-gray-500">Thanh toán khi nhận được hàng</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h2 className="text-xl font-display font-bold mb-6">Đơn hàng</h2>
                
                {/* Order Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product_id} className="flex items-start space-x-3">
                      <img
                        src={item.image_url || 'https://via.placeholder.com/60x60'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        {item.variant && (
                          <p className="text-xs text-gray-500">
                            {item.variant.variant_type}: {item.variant.variant_value}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Số lượng: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-primary-600 mt-1">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Section */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <TagIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Mã giảm giá</span>
                  </div>
                  
                  {appliedCoupon ? (
                    <div className="p-3 bg-green-50 rounded-lg mb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            {appliedCoupon.code}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        Giảm {appliedCoupon.discount_type === 'percentage' 
                          ? `${appliedCoupon.discount_value}%` 
                          : formatPrice(appliedCoupon.discount_value)}
                      </p>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase())
                          setCouponError('')
                        }}
                        placeholder="Nhập mã giảm giá"
                        className="flex-1 input text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleApplyCoupon()
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon}
                        className="btn btn-outline text-sm px-4 py-2 whitespace-nowrap"
                      >
                        {applyingCoupon ? '...' : 'Áp dụng'}
                      </button>
                    </div>
                  )}
                  
                  {couponError && (
                    <p className="text-xs text-red-600 mt-2 flex items-center">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      {couponError}
                    </p>
                  )}
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  
                  {subtotal < 500000 && (
                    <p className="text-xs text-gray-500">
                      Mua thêm {formatPrice(500000 - subtotal)} để được miễn phí vận chuyển
                    </p>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Tổng cộng:</span>
                      <span className="text-2xl font-bold text-primary-600">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !formData.address.full || !formData.phone}
                  className="btn btn-primary w-full mt-6"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                      Đang xử lý...
                    </span>
                  ) : paymentMethod === 'vnpay' ? (
                    'Thanh toán VNPay'
                  ) : (
                    'Đặt hàng (COD)'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Checkout
