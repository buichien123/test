import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCartIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../utils/formatPrice'

const CartDropdown = () => {
  const { cart, removeFromCart, getCartTotal, getCartCount } = useCart()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleCheckout = () => {
    setIsOpen(false)
    navigate('/checkout')
  }

  const handleViewCart = () => {
    setIsOpen(false)
    navigate('/cart')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Cart Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
        aria-label="Giỏ hàng"
      >
        <ShoppingCartIcon className="h-6 w-6" />
        {getCartCount() > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-scale-in">
            {getCartCount() > 99 ? '99+' : getCartCount()}
          </span>
        )}
      </button>

      {/* Dropdown Overlay */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[55]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-strong border border-gray-200 z-[60] animate-slide-down">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Giỏ hàng ({getCartCount()})
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Đóng"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="max-h-96 overflow-y-auto scrollbar-hide">
              {cart.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCartIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Giỏ hàng trống</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {cart.map((item) => (
                    <div key={item.product_id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <Link
                          to={`/products/${item.product_id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden"
                        >
                          <img
                            src={item.image_url || 'https://via.placeholder.com/64x64'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/products/${item.product_id}`}
                            onClick={() => setIsOpen(false)}
                            className="block"
                          >
                            <p className="text-sm font-medium text-gray-900 truncate hover:text-primary-600">
                              {item.name}
                            </p>
                          </Link>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-primary-600 font-semibold">
                              {formatPrice(item.price)}
                            </p>
                            <p className="text-xs text-gray-500">
                              x{item.quantity}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await removeFromCart(item.id || item.product_id)
                            } catch (error) {
                              console.error('Error removing from cart:', error)
                            }
                          }}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors"
                          aria-label="Xóa"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Tổng cộng:</span>
                  <span className="text-lg font-bold text-primary-600">
                    {formatPrice(getCartTotal())}
                  </span>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={handleCheckout}
                    className="btn btn-primary w-full text-sm py-2"
                  >
                    Thanh toán
                  </button>
                  <button
                    onClick={handleViewCart}
                    className="btn btn-secondary w-full text-sm py-2"
                  >
                    Xem giỏ hàng
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default CartDropdown

