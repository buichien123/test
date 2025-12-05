import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { toast } from 'react-toastify'
import Loading from '../../components/UI/Loading'
import Pagination from '../../components/UI/Pagination'
import { formatPrice } from '../../utils/formatPrice'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  CalendarIcon,
  DocumentTextIcon,
  TruckIcon
} from '@heroicons/react/24/outline'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [page, statusFilter, paymentFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 20,
        ...(statusFilter && { status: statusFilter }),
        ...(paymentFilter && { payment_status: paymentFilter })
      }
      const res = await api.get('/orders/all', { params })
      setOrders(res.data.orders)
      setPagination(res.data.pagination)
    } catch (error) {
      toast.error('Lỗi khi tải danh sách đơn hàng')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderDetail = async (orderId) => {
    setDetailLoading(true)
    try {
      const res = await api.get(`/orders/${orderId}`)
      setSelectedOrder(res.data.order)
    } catch (error) {
      toast.error('Lỗi khi tải chi tiết đơn hàng')
      console.error(error)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleViewDetail = (order) => {
    setSelectedOrder(order) // Show basic info first
    fetchOrderDetail(order.id) // Then fetch full details
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus })
      toast.success('Cập nhật trạng thái đơn hàng thành công')
      fetchOrders()
      if (selectedOrder && selectedOrder.id === orderId) {
        fetchOrderDetail(orderId)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái')
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

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusText = (status) => {
    const texts = {
      paid: 'Đã thanh toán',
      unpaid: 'Chưa thanh toán',
      refunded: 'Đã hoàn tiền'
    }
    return texts[status] || status
  }

  const getPaymentMethodText = (method) => {
    const texts = {
      cod: 'Thanh toán khi nhận hàng',
      vnpay: 'VNPay',
      bank_transfer: 'Chuyển khoản ngân hàng'
    }
    return texts[method] || method
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Quản lý đơn hàng
        </h1>
        <p className="text-gray-600">
          Quản lý tất cả đơn hàng trong hệ thống
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng (Mã đơn, tên khách hàng, email)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="input md:w-48"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipped">Đã giao hàng</option>
            <option value="delivered">Đã nhận hàng</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value)
              setPage(1)
            }}
            className="input md:w-48"
          >
            <option value="">Tất cả thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="unpaid">Chưa thanh toán</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="card overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thanh toán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày đặt
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        Không có đơn hàng nào
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">#{order.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.full_name || order.username}</div>
                          <div className="text-sm text-gray-500">{order.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatPrice(parseFloat(order.total_amount))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {order.item_count || 0} sản phẩm
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                              order.payment_status
                            )}`}
                          >
                            {getPaymentStatusText(order.payment_status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewDetail(order)}
                            className="text-primary-600 hover:text-primary-900 font-semibold transition-colors"
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.total > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} đơn hàng
              </div>
              {pagination.pages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-6 my-8 transform transition-all animate-scale-in">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Đơn hàng #{selectedOrder.id}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Ngày đặt: {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-12">
                <Loading />
              </div>
            ) : (
              <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {/* Customer Info */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Thông tin khách hàng</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Họ và tên</p>
                        <p className="text-sm font-medium text-gray-900">{selectedOrder.full_name || selectedOrder.username || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{selectedOrder.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Số điện thoại</p>
                        <p className="text-sm font-medium text-gray-900">{selectedOrder.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Địa chỉ giao hàng</p>
                        <p className="text-sm font-medium text-gray-900">{selectedOrder.shipping_address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Status & Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TruckIcon className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Trạng thái đơn hàng</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Trạng thái hiện tại</p>
                        <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusText(selectedOrder.status)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Cập nhật trạng thái</p>
                        <div className="flex flex-wrap gap-2">
                          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(selectedOrder.id, status)}
                              disabled={selectedOrder.status === status}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                selectedOrder.status === status
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200 hover:shadow-md'
                              }`}
                            >
                              {getStatusText(status)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCardIcon className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Thanh toán</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Trạng thái thanh toán</p>
                        <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                          {getPaymentStatusText(selectedOrder.payment_status)}
                        </span>
                      </div>
                      {selectedOrder.payments && selectedOrder.payments.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Lịch sử thanh toán</p>
                          <div className="space-y-2">
                            {selectedOrder.payments.map((payment, idx) => (
                              <div key={idx} className="bg-gray-50 rounded-lg p-3 text-xs">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium">{getPaymentMethodText(payment.payment_method)}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${getPaymentStatusColor(payment.status)}`}>
                                    {getPaymentStatusText(payment.status)}
                                  </span>
                                </div>
                                {payment.vnpay_transaction_no && (
                                  <p className="text-gray-500">Mã GD: {payment.vnpay_transaction_no}</p>
                                )}
                                {payment.payment_date && (
                                  <p className="text-gray-500">Ngày: {new Date(payment.payment_date).toLocaleString('vi-VN')}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingBagIcon className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Sản phẩm trong đơn hàng</h3>
                    <span className="ml-auto text-sm text-gray-500">
                      {selectedOrder.items?.length || 0} sản phẩm
                    </span>
                  </div>
                  <div className="space-y-3">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                          <img
                            src={item.image_url || 'https://via.placeholder.com/80x80'}
                            alt={item.product_name}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{item.product_name}</h4>
                            {item.variant_type && item.variant_value && (
                              <p className="text-xs text-gray-500 mb-1">
                                {item.variant_type}: {item.variant_value}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Số lượng: <span className="font-semibold text-gray-900">{item.quantity}</span></span>
                              <span>Đơn giá: <span className="font-semibold text-gray-900">{formatPrice(item.price)}</span></span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Thành tiền</p>
                            <p className="text-lg font-bold text-primary-600">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-8">Chưa có sản phẩm</p>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tổng tiền sản phẩm</span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(parseFloat(selectedOrder.total_amount) + parseFloat(selectedOrder.discount_amount || 0))}
                      </span>
                    </div>
                    {selectedOrder.discount_amount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Giảm giá {selectedOrder.coupon_code && `(${selectedOrder.coupon_code})`}</span>
                        <span className="font-semibold text-green-600">
                          -{formatPrice(selectedOrder.discount_amount)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                      <span className="text-2xl font-bold text-primary-600">
                        {formatPrice(parseFloat(selectedOrder.total_amount))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <DocumentTextIcon className="h-5 w-5 text-yellow-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Ghi chú</h3>
                    </div>
                    <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
