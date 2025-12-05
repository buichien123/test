import { Link } from 'react-router-dom'
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { formatPrice } from '../../utils/formatPrice'

const ProductCard = ({ product, showWishlist = false }) => {
  const { user } = useAuth()
  const { isInWishlist, toggleWishlist, checkWishlistStatus } = useWishlist()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const isWishlisted = isInWishlist(product?.id)

  // Check wishlist status when component mounts (only once per product)
  useEffect(() => {
    if (user && showWishlist && product?.id) {
      // Only check if status is not already known
      const currentStatus = isInWishlist(product.id)
      if (currentStatus === undefined || currentStatus === null) {
        checkWishlistStatus(product.id)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]) // Only check when product changes

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock > 0) {
      try {
        await addToCart(product, 1, null)
        toast.success('Đã thêm vào giỏ hàng')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng')
      }
    } else {
      toast.error('Sản phẩm đã hết hàng')
    }
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.info('Vui lòng đăng nhập để sử dụng tính năng này')
      navigate('/login')
      return
    }

    if (wishlistLoading) return

    setWishlistLoading(true)
    try {
      const result = await toggleWishlist(product.id)
      toast.success(result.message || (result.inWishlist ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích'))
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra')
    } finally {
      setWishlistLoading(false)
    }
  }

  return (
    <div className="group card overflow-hidden relative animate-fade-in">
      {/* Image Container */}
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden bg-gray-100">
        <div className="aspect-square relative">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <img
            src={product.image_url || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.stock === 0 && (
              <span className="badge badge-danger">Hết hàng</span>
            )}
            {product.stock > 0 && product.stock < 10 && (
              <span className="badge badge-warning">Sắp hết</span>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {showWishlist && (
              <button
                onClick={handleWishlist}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                aria-label="Thêm vào yêu thích"
              >
                {isWishlisted ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5 text-gray-700" />
                )}
              </button>
            )}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="p-2 bg-white rounded-full shadow-md hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Thêm vào giỏ hàng"
            >
              <ShoppingCartIcon className="h-5 w-5 text-gray-700 group-hover:text-primary-600" />
            </button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {product.category_name && (
          <p className="text-sm text-gray-500 mb-2">{product.category_name}</p>
        )}
        
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-2xl font-bold text-primary-600">
              {formatPrice(product.price)}
            </p>
            {product.stock > 0 && (
              <p className="text-xs text-gray-500 mt-1">Còn {product.stock} sản phẩm</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard

