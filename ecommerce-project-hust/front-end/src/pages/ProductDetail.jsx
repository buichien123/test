import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
  CheckBadgeIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { toast } from 'react-toastify'
import Loading from '../components/UI/Loading'
import ProductCard from '../components/Product/ProductCard'
import { formatPrice, formatPriceNumber } from '../utils/formatPrice'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { isInWishlist, toggleWishlist, checkWishlistStatus } = useWishlist()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [images, setImages] = useState([])
  const [variants, setVariants] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariants, setSelectedVariants] = useState({}) // Track variants by type: { size: variant, color: variant }
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    fetchProduct()
  }, [id])

  // Check wishlist status when product loads
  useEffect(() => {
    if (user && product?.id) {
      checkWishlistStatus(product.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]) // Only check when product changes, not when user changes

  const isWishlisted = isInWishlist(product?.id)

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`)
      const productData = res.data.product
      setProduct(productData)

      // Set images
      if (productData.images && productData.images.length > 0) {
        setImages(productData.images)
      } else if (productData.image_url) {
        setImages([{ image_url: productData.image_url, is_primary: true }])
      }

      // Set variants
      if (productData.variants) {
        setVariants(productData.variants)
      }

      // Fetch related products
      if (productData.related_products) {
        setRelatedProducts(productData.related_products)
      }

      // Set reviews (already included in product data)
      if (productData.reviews) {
        setReviews(productData.reviews)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Không tìm thấy sản phẩm')
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }


  // Check if all required variants are selected
  const areAllVariantsSelected = () => {
    if (variants.length === 0) return true // No variants required

    // Get all unique variant types
    const variantTypes = [...new Set(variants.map(v => v.variant_type))]

    // Check if all types are selected
    return variantTypes.every(type => selectedVariants[type] !== undefined)
  }

  const handleAddToCart = async () => {
    // Validate variants selection
    if (variants.length > 0 && !areAllVariantsSelected()) {
      const missingTypes = [...new Set(variants.map(v => v.variant_type))]
        .filter(type => !selectedVariants[type])
        .map(type => type.charAt(0).toUpperCase() + type.slice(1))
        .join(', ')

      toast.error(`Vui lòng chọn đầy đủ: ${missingTypes}`)
      return
    }

    if (currentStock < quantity) {
      toast.error('Số lượng vượt quá tồn kho')
      return
    }

    try {
      // Get the first selected variant ID (or null if none selected) for backend
      const selectedVariantIds = Object.values(selectedVariants).map(v => v.id)
      const variantId = selectedVariantIds.length > 0 ? selectedVariantIds[0] : null

      // Prepare all selected variants for display in cart
      const allSelectedVariants = Object.values(selectedVariants).map(v => ({
        variant_type: v.variant_type,
        variant_value: v.variant_value
      }))

      const productToAdd = {
        ...product,
        variant_id: variantId,
        variant: allSelectedVariants.length > 0 ? allSelectedVariants : null,
        variants: allSelectedVariants // Store all variants for cart display
      }
      await addToCart(productToAdd, quantity, variantId)
      toast.success('Đã thêm vào giỏ hàng')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng')
    }
  }

  const handleWishlist = async () => {
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

  const getCurrentPrice = () => {
    const priceAdjustments = Object.values(selectedVariants).reduce((sum, variant) => {
      return sum + (variant.price_adjustment || 0)
    }, 0)
    return product.price + priceAdjustments
  }

  const getCurrentStock = () => {
    // If variants are selected, use the minimum stock among selected variants
    // Otherwise use product stock
    if (Object.keys(selectedVariants).length > 0) {
      const variantStocks = Object.values(selectedVariants).map(v => v.stock || 0)
      return Math.min(...variantStocks)
    }
    return product.stock
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  if (loading) {
    return <Loading fullScreen />
  }

  if (!product) {
    return null
  }

  const currentStock = getCurrentStock()
  const currentPrice = getCurrentPrice()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link to="/" className="hover:text-primary-600">Trang chủ</Link></li>
            <li>/</li>
            <li><Link to="/products" className="hover:text-primary-600">Sản phẩm</Link></li>
            {product.category_name && (
              <>
                <li>/</li>
                <li><Link to={`/products?category_id=${product.category_id}`} className="hover:text-primary-600">{product.category_name}</Link></li>
              </>
            )}
            <li>/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="card overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Image Gallery */}
            <div>
              <div className="relative mb-4">
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    src={images[selectedImage]?.image_url || product.image_url || 'https://via.placeholder.com/600x600?text=No+Image'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {currentStock === 0 && (
                  <div className="absolute top-4 left-4">
                    <span className="badge badge-danger">Hết hàng</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                        ? 'border-primary-600 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <img
                        src={image.image_url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <Link
                  to={`/products?category_id=${product.category_id}`}
                  className="badge badge-primary mb-2"
                >
                  {product.category_name || 'Chưa phân loại'}
                </Link>
                <h1 className="text-4xl font-display font-bold mb-4">{product.name}</h1>

                {/* Rating */}
                {reviews.length > 0 && (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarSolidIcon
                          key={star}
                          className={`h-5 w-5 ${star <= Math.round(averageRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {averageRating.toFixed(1)} ({reviews.length} đánh giá)
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                <p className="text-4xl font-bold text-primary-600 mb-2">
                  {formatPrice(currentPrice)}
                </p>
                {Object.values(selectedVariants).some(v => v.price_adjustment > 0) && (
                  <p className="text-sm text-gray-500">
                    Giá gốc: {formatPrice(product.price)}
                  </p>
                )}
              </div>

              {/* Variants */}
              {variants.length > 0 && (
                <div className="mb-6">
                  {Object.entries(
                    variants.reduce((acc, variant) => {
                      if (!acc[variant.variant_type]) {
                        acc[variant.variant_type] = []
                      }
                      acc[variant.variant_type].push(variant)
                      return acc
                    }, {})
                  ).map(([type, typeVariants]) => {
                    const isSelected = selectedVariants[type] !== undefined
                    return (
                      <div key={type} className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                          {type}: {!isSelected && <span className="text-red-500 text-xs">(Bắt buộc)</span>}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {typeVariants.map((variant) => {
                            const isVariantSelected = selectedVariants[type]?.id === variant.id
                            return (
                              <button
                                key={variant.id}
                                onClick={() => {
                                  setSelectedVariants(prev => ({
                                    ...prev,
                                    [type]: variant
                                  }))
                                  setQuantity(1)
                                }}
                                disabled={variant.stock === 0}
                                className={`px-4 py-2 rounded-lg border-2 transition-all ${isVariantSelected
                                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                                  : 'border-gray-300 hover:border-gray-400'
                                  } ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {variant.variant_value}
                                {variant.price_adjustment > 0 && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    (+{formatPriceNumber(variant.price_adjustment)} ₫)
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                  {!areAllVariantsSelected() && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Lưu ý:</strong> Vui lòng chọn đầy đủ các tùy chọn trên trước khi thêm vào giỏ hàng.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Stock Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                {currentStock > 0 ? (
                  <p className="text-green-600 font-semibold flex items-center">
                    <CheckBadgeIcon className="h-5 w-5 mr-2" />
                    Còn {currentStock} sản phẩm
                  </p>
                ) : (
                  <p className="text-red-600 font-semibold">Hết hàng</p>
                )}
              </div>

              {/* Quantity & Actions */}
              {currentStock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng:
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(currentStock, parseInt(e.target.value) || 1)))}
                      className="w-20 text-center input"
                      min="1"
                      max={currentStock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0 || (variants.length > 0 && !areAllVariantsSelected())}
                  className="btn btn-primary flex-1 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Thêm vào giỏ hàng
                </button>
                <button
                  onClick={handleWishlist}
                  className="btn btn-outline flex items-center justify-center"
                >
                  {isWishlisted ? (
                    <HeartSolidIcon className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <TruckIcon className="h-5 w-5 text-primary-600" />
                  <span>Miễn phí vận chuyển</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <ShieldCheckIcon className="h-5 w-5 text-primary-600" />
                  <span>Bảo hành chính hãng</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8 pt-6">
              {['description', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab === 'description' ? 'Mô tả sản phẩm' : `Đánh giá (${reviews.length})`}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'description' ? (
              <div className="prose max-w-none">
                {product.description ? (
                  <div
                    className="text-gray-700 product-description"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                    style={{
                      lineHeight: '1.8',
                      fontSize: '15px'
                    }}
                  />
                ) : (
                  <p className="text-gray-500">Chưa có mô tả cho sản phẩm này.</p>
                )}
                <style jsx global>{`
                  .product-description h1,
                  .product-description h2,
                  .product-description h3,
                  .product-description h4 {
                    color: #111827;
                    font-weight: 700;
                    margin-top: 1.5rem;
                    margin-bottom: 1rem;
                  }
                  .product-description p {
                    margin-bottom: 1rem;
                    line-height: 1.8;
                  }
                  .product-description ul,
                  .product-description ol {
                    margin: 1rem 0;
                    padding-left: 2rem;
                  }
                  .product-description li {
                    margin-bottom: 0.5rem;
                  }
                  .product-description img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    margin: 1.5rem 0;
                  }
                  .product-description a {
                    color: #2563eb;
                    text-decoration: underline;
                  }
                  .product-description a:hover {
                    color: #1d4ed8;
                  }
                  .product-description strong {
                    font-weight: 700;
                    color: #111827;
                  }
                  .product-description em {
                    font-style: italic;
                  }
                  .product-description blockquote {
                    border-left: 4px solid #2563eb;
                    padding-left: 1rem;
                    margin: 1.5rem 0;
                    font-style: italic;
                    color: #6b7280;
                  }
                `}</style>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Chưa có đánh giá nào cho sản phẩm này.</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{review.user_name || 'Khách hàng'}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarSolidIcon
                                key={star}
                                className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 mt-2">{review.comment}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-display font-bold text-gray-900">Sản phẩm liên quan</h2>
              <Link
                to="/products"
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 transition-colors"
              >
                Xem tất cả
                <ArrowLeftIcon className="h-4 w-4 rotate-180" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} showWishlist={true} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail
