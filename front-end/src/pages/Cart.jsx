import { useNavigate } from 'react-router-dom'
import { 
  TrashIcon, 
  ShoppingBagIcon,
  ArrowLeftIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'
import EmptyState from '../components/UI/EmptyState'
import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/formatPrice'

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Giỏ hàng trống')
      return
    }
    navigate('/checkout')
  }

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        await removeFromCart(cartItemId)
        toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
      } else {
        await updateQuantity(cartItemId, newQuantity)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const subtotal = getCartTotal()
  const shipping = subtotal >= 500000 ? 0 : 30000
  const total = subtotal + shipping

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyState
            icon={ShoppingBagIcon}
            title="Giỏ hàng trống"
            description="Hãy thêm sản phẩm vào giỏ hàng của bạn để tiếp tục mua sắm"
            actionLabel="Tiếp tục mua sắm"
            actionLink="/products"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/products"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Tiếp tục mua sắm
          </Link>
          <h1 className="text-4xl font-display font-bold">Giỏ hàng</h1>
          <p className="text-gray-600 mt-2">{cart.length} sản phẩm trong giỏ hàng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.product_id} className="card p-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <Link
                    to={`/products/${item.product_id}`}
                    className="flex-shrink-0 w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <img
                      src={item.image_url || 'https://via.placeholder.com/200x200?text=No+Image'}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product_id}`}
                      className="block"
                    >
                      <h3 className="font-semibold text-lg mb-2 hover:text-primary-600 transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    {item.variant && (
                      <p className="text-sm text-gray-600 mb-2">
                        {item.variant.variant_type}: {item.variant.variant_value}
                      </p>
                    )}
                    <p className="text-xl font-bold text-primary-600 mb-4">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item.id || item.product_id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                          aria-label="Giảm số lượng"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id || item.product_id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                          aria-label="Tăng số lượng"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={async () => {
                      try {
                        await removeFromCart(item.id || item.product_id)
                        toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
                      } catch (error) {
                        toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
                      }
                    }}
                    className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Xóa sản phẩm"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-display font-bold mb-6">Tổng kết đơn hàng</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                {subtotal < 500000 && (
                  <p className="text-sm text-gray-500">
                    Mua thêm {formatPrice(500000 - subtotal)} để được miễn phí vận chuyển
                  </p>
                )}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="btn btn-primary w-full mb-4"
              >
                Thanh toán
              </button>
              
              <Link
                to="/products"
                className="btn btn-secondary w-full text-center"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
