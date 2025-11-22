import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import api from '../utils/api'
import Loading from '../components/UI/Loading'

const PaymentCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [orderId, setOrderId] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const orderIdParam = searchParams.get('order_id')
    const statusParam = searchParams.get('status')
    const messageParam = searchParams.get('message')

    if (statusParam) {
      setStatus(statusParam)
      if (messageParam) {
        setMessage(messageParam)
      }
    }

    if (orderIdParam) {
      setOrderId(orderIdParam)
      checkPaymentStatus(orderIdParam)
    } else {
      setStatus('error')
      setMessage('Không tìm thấy thông tin đơn hàng')
    }
  }, [searchParams])

  const checkPaymentStatus = async (orderId) => {
    try {
      const res = await api.get(`/orders/my-orders/${orderId}`)
      const order = res.data.order
      
      if (order.payment_status === 'paid') {
        setStatus('success')
        setMessage('Thanh toán thành công!')
      } else {
        setStatus('failed')
        setMessage('Thanh toán thất bại hoặc chưa hoàn tất')
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
      setStatus('error')
      setMessage('Không thể kiểm tra trạng thái thanh toán')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loading size="lg" />
          <p className="mt-4 text-gray-600">Đang xử lý thanh toán...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card p-8 text-center">
          {status === 'success' ? (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
                Thanh toán thành công!
              </h1>
              <p className="text-gray-600 mb-6">
                Đơn hàng của bạn đã được thanh toán thành công. Chúng tôi sẽ xử lý và giao hàng sớm nhất có thể.
              </p>
              {orderId && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Mã đơn hàng:</p>
                  <p className="text-lg font-semibold text-gray-900">#{orderId}</p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={`/orders/${orderId}`}
                  className="btn btn-primary flex-1"
                >
                  Xem đơn hàng
                </Link>
                <Link
                  to="/products"
                  className="btn btn-secondary flex-1"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <XCircleIcon className="h-12 w-12 text-red-600" />
              </div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
                Thanh toán thất bại
              </h1>
              <p className="text-gray-600 mb-6">
                {message || 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.'}
              </p>
              {orderId && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Mã đơn hàng:</p>
                  <p className="text-lg font-semibold text-gray-900">#{orderId}</p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                {orderId && (
                  <Link
                    to={`/orders/${orderId}`}
                    className="btn btn-outline flex-1"
                  >
                    Xem đơn hàng
                  </Link>
                )}
                <Link
                  to="/cart"
                  className="btn btn-primary flex-1"
                >
                  Quay lại giỏ hàng
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentCallback

