import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { HeartIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import Loading from '../components/UI/Loading'
import EmptyState from '../components/UI/EmptyState'
import ProductCard from '../components/Product/ProductCard'
import Pagination from '../components/UI/Pagination'

const Wishlist = () => {
  const { user } = useAuth()
  const { wishlist, loading, pagination, toggleWishlist, clearWishlist, fetchWishlist } = useWishlist()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [removing, setRemoving] = useState(false)
  const currentPage = parseInt(searchParams.get('page')) || 1

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    // Fetch wishlist with current page
    fetchWishlist(currentPage, 12)
  }, [user, currentPage, fetchWishlist, navigate])

  const handlePageChange = (page) => {
    setSearchParams({ page: page.toString() }, { replace: true })
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRemove = async (productId) => {
    try {
      await toggleWishlist(productId)
      toast.success('Đã xóa khỏi danh sách yêu thích')
      // Refresh wishlist after removal
      fetchWishlist(currentPage, 12)
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra')
    }
  }

  const handleClearAll = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả khỏi danh sách yêu thích?')) {
      return
    }

    setRemoving(true)
    try {
      await clearWishlist()
      toast.success('Đã xóa tất cả khỏi danh sách yêu thích')
      // Refresh wishlist
      fetchWishlist(1, 12)
      setSearchParams({}, { replace: true })
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra')
    } finally {
      setRemoving(false)
    }
  }

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      addToCart(product, 1)
      toast.success('Đã thêm vào giỏ hàng')
    } else {
      toast.error('Sản phẩm đã hết hàng')
    }
  }

  if (loading) {
    return <Loading />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                Danh sách yêu thích
              </h1>
              <p className="text-gray-600">
                {pagination.total > 0 
                  ? `Bạn có ${pagination.total} sản phẩm trong danh sách yêu thích${pagination.totalPages > 1 ? ` (Trang ${currentPage}/${pagination.totalPages})` : ''}`
                  : 'Danh sách yêu thích của bạn đang trống'
                }
              </p>
            </div>
            {wishlist.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={removing}
                className="btn btn-secondary flex items-center"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                {removing ? 'Đang xóa...' : 'Xóa tất cả'}
              </button>
            )}
          </div>
        </div>

        {/* Wishlist Content */}
        {wishlist.length === 0 ? (
          <EmptyState
            icon={<HeartIcon className="h-16 w-16 text-gray-400" />}
            title="Danh sách yêu thích trống"
            description="Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy khám phá và thêm sản phẩm yêu thích của bạn!"
            action={
              <Link to="/products" className="btn btn-primary">
                Khám phá sản phẩm
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((item) => {
                // Convert wishlist item to product format for ProductCard
                const product = {
                  id: item.product_id,
                  name: item.name,
                  price: item.price,
                  image_url: item.image_url,
                  stock: item.stock,
                  category_name: item.category_name
                }
                return (
                  <ProductCard 
                    key={item.id} 
                    product={product}
                    showWishlist={true}
                  />
                )
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Wishlist
