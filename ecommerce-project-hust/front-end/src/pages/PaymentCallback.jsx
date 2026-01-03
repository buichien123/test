import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { toast } from 'react-toastify'
import api from '../utils/api'
import Loading from '../components/UI/Loading'
import { useCart } from '../context/CartContext'

const PaymentCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const [status, setStatus] = useState('loading')
  const [orderId, setOrderId] = useState(null)
  const [message, setMessage] = useState('')
  const toastShown = useRef(false) // Track if toast has been shown

  useEffect(() => {
    // Prevent multiple executions
    if (toastShown.current) return

    const orderIdParam = searchParams.get('order_id')
    const statusParam = searchParams.get('status')
    const messageParam = searchParams.get('message')
    
    // If VNPAY redirects directly, try to extract order_id from vnp_TxnRef
    let extractedOrderId = orderIdParam
    if (!extractedOrderId) {
      const vnpTxnRef = searchParams.get('vnp_TxnRef')
      if (vnpTxnRef) {
        // Format: ORDER{orderId}_{timestamp}
        const match = vnpTxnRef.match(/^ORDER(\d+)_/)
        if (match && match[1]) {
          extractedOrderId = match[1]
        }
      }
    }

    if (statusParam) {
      setStatus(statusParam)
      if (messageParam) {
        setMessage(messageParam)
      }
    }

    if (extractedOrderId) {
      setOrderId(extractedOrderId)
      checkPaymentStatus(extractedOrderId, searchParams)
    } else {
      setStatus('error')
      setMessage('Không tìm thấy thông tin đơn hàng')
      if (!toastShown.current) {
        toast.error('Không tìm thấy thông tin đơn hàng')
        toastShown.current = true
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const checkPaymentStatus = async (orderId, searchParamsObj) => {
    // Prevent multiple calls
    if (toastShown.current) return
    
    // Mark as processing immediately to prevent duplicate calls
    toastShown.current = true

    try {
      // Check if we have VNPAY params (direct redirect from VNPAY)
      const vnpResponseCode = searchParamsObj?.get('vnp_ResponseCode')
      const vnpTxnRef = searchParamsObj?.get('vnp_TxnRef')
      const vnpSecureHash = searchParamsObj?.get('vnp_SecureHash')
      
      // If VNPAY redirected directly, verify payment with backend first
      if (vnpTxnRef && vnpSecureHash) {
        try {
          // Convert URLSearchParams to object for API call
          const vnpParams = {}
          searchParamsObj.forEach((value, key) => {
            if (key.startsWith('vnp_')) {
              vnpParams[key] = value
            }
          })

          // Call backend to verify and update payment status
          const verifyRes = await api.get('/payment/verify', { params: vnpParams })
          
          if (verifyRes.data.success) {
            const result = verifyRes.data
            
            if (result.response_code === '00') {
              setStatus('success')
              setMessage(result.message || 'Thanh toán thành công!')
              toast.success(result.message || 'Giao dịch thành công')
              // Clear cart after successful payment
              clearCart()
              return
            } else {
              setStatus('failed')
              setMessage(result.message || 'Thanh toán thất bại')
              toast.error(result.message || 'Thanh toán thất bại')
              return
            }
          }
        } catch (verifyError) {
          console.error('Error verifying payment with backend:', verifyError)
          // Reset toastShown to allow fallback check
          toastShown.current = false
          // Continue to check order status as fallback
        }
      }

      // Fallback: check order status from backend (only if verify didn't work)
      if (!toastShown.current) {
        toastShown.current = true
        const res = await api.get(`/orders/my-orders/${orderId}`)
        const order = res.data.order
        
        if (order.payment_status === 'paid') {
          setStatus('success')
          setMessage('Thanh toán thành công!')
          toast.success('Giao dịch thành công')
          // Clear cart after successful payment
          clearCart()
        } else {
          setStatus('failed')
          setMessage('Thanh toán thất bại hoặc chưa hoàn tất')
          toast.error('Thanh toán thất bại hoặc chưa hoàn tất')
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
      setStatus('error')
      setMessage('Không thể kiểm tra trạng thái thanh toán')
      if (!toastShown.current) {
        toast.error('Không thể kiểm tra trạng thái thanh toán')
        toastShown.current = true
      }
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
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link
                  to={`/orders/${orderId}`}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors flex-1 text-center"
                >
                  Xem đơn hàng
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors flex-1 text-center"
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
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                {orderId && (
                  <Link
                    to={`/orders/${orderId}`}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-primary-600 text-primary-600 font-semibold hover:bg-primary-50 transition-colors flex-1 text-center"
                  >
                    Xem đơn hàng
                  </Link>
                )}
                <Link
                  to="/cart"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors flex-1 text-center"
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

