import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { formatPrice } from '../utils/formatPrice'
import { toast } from 'react-toastify'

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [payingOrderId, setPayingOrderId] = useState(null)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders')
      setOrders(res.data.orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRetryPayment = async (orderId) => {
    setPayingOrderId(orderId)
    try {
      const res = await api.post('/payment/create', { order_id: orderId })
      if (res.data?.payment_url) {
        window.location.href = res.data.payment_url
      } else {
        toast.error('Không thể tạo thanh toán VNPay. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Retry payment error:', error)
      toast.error(error.response?.data?.message || 'Không thể thanh toán lại.')
    } finally {
      setPayingOrderId(null)
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập để xem đơn hàng</p>
          <Link
            to="/login"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Đơn hàng của tôi</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">Bạn chưa có đơn hàng nào</p>
            <Link
              to="/products"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition inline-block"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const canRetryPayment =
                order.payment_status !== 'paid' &&
                order.last_payment_method === 'vnpay' &&
                order.last_payment_status !== 'success'

              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition block"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Đơn hàng #{order.id}
                      </h3>
                      <p className="text-gray-600">
                        Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')}
                      </p>
                      <p className="text-gray-600">
                        Số lượng sản phẩm: {order.item_count}
                      </p>
                      <p className="text-gray-600">
                        Thanh toán: {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary-600 font-bold text-xl mb-2">
                        {formatPrice(parseFloat(order.total_amount))}
                      </p>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                      {canRetryPayment && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            handleRetryPayment(order.id)
                          }}
                          className="mt-4 btn btn-primary w-full"
                          disabled={payingOrderId === order.id}
                        >
                          {payingOrderId === order.id ? 'Đang chuyển hướng...' : 'Thanh toán lại VNPay'}
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders

