import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { formatPrice } from '../utils/formatPrice'
import { toast } from 'react-toastify'

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (user) {
      fetchOrder()
    } else {
      navigate('/login')
    }
  }, [id, user, navigate])

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/my-orders/${id}`)
      setOrder(res.data.order)
    } catch (error) {
      console.error('Error fetching order:', error)
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  const latestPayment = useMemo(() => order?.payments?.[0] || null, [order])

  const canRetryPayment =
    order &&
    order.payment_status !== 'paid' &&
    latestPayment &&
    latestPayment.payment_method === 'vnpay' &&
    latestPayment.status !== 'success'

  const handleRetryPayment = async () => {
    if (!order) return

    setPaying(true)
    try {
      const res = await api.post('/payment/create', { order_id: order.id })
      if (res.data?.payment_url) {
        window.location.href = res.data.payment_url
      } else {
        toast.error('Không thể tạo liên kết thanh toán. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Retry payment error:', error)
      toast.error(error.response?.data?.message || 'Không thể thanh toán lại.')
    } finally {
      setPaying(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      shipped: 'Đã giao hàng',
      delivered: 'Đã nhận hàng',
      cancelled: 'Đã hủy'
    }
    return texts[status] || status
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/orders')}
          className="text-primary-600 hover:text-primary-700 mb-4"
        >
          ← Quay lại danh sách đơn hàng
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Đơn hàng #{order.id}</h1>
              <p className="text-gray-600">
                Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusText(order.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Thông tin giao hàng</h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Địa chỉ:</strong> {order.shipping_address}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {order.phone}
                </p>
                {order.notes && (
                  <p>
                    <strong>Ghi chú:</strong> {order.notes}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Tổng kết</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(parseFloat(order.total_amount))}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Tổng cộng:</span>
                  <span className="text-primary-600">
                    {formatPrice(parseFloat(order.total_amount))}
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Trạng thái thanh toán:</span>
                  <span className="font-semibold text-gray-900">
                    {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>

                {latestPayment && (
                  <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    <p>
                      <strong>Lần thanh toán gần nhất:</strong>{' '}
                      {new Date(latestPayment.updated_at || latestPayment.created_at).toLocaleString('vi-VN')}
                    </p>
                    <p>
                      <strong>Trạng thái:</strong>{' '}
                      {latestPayment.status === 'success'
                        ? 'Thành công'
                        : latestPayment.status === 'pending'
                        ? 'Đang xử lý'
                        : 'Thất bại'}
                    </p>
                    {latestPayment.vnpay_response_code && (
                      <p>
                        <strong>Mã phản hồi:</strong> {latestPayment.vnpay_response_code}
                      </p>
                    )}
                  </div>
                )}

                {canRetryPayment && (
                  <button
                    type="button"
                    onClick={handleRetryPayment}
                    disabled={paying}
                    className="btn btn-primary w-full"
                  >
                    {paying ? 'Đang tạo liên kết thanh toán...' : 'Thanh toán lại qua VNPay'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Sản phẩm</h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <img
                    src={item.image_url || 'https://via.placeholder.com/100x100?text=No+Image'}
                    alt={item.product_name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product_name}</h3>
                    <p className="text-gray-600">Số lượng: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-lg">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail

