import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { HeartIcon, TrashIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import Loading from '../components/UI/Loading'
import EmptyState from '../components/UI/EmptyState'
import ProductCard from '../components/Product/ProductCard'
import Pagination from '../components/UI/Pagination'
import ConfirmDialog from '../components/UI/ConfirmDialog'

const Wishlist = () => {
  const { user } = useAuth()
  const { wishlist, loading, pagination, toggleWishlist, clearWishlist, fetchWishlist } = useWishlist()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [removing, setRemoving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const currentPage = parseInt(searchParams.get('page')) || 1

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    // Fetch wishlist with current page and search
    const searchTerm = searchParams.get('search') || ''
    fetchWishlist(currentPage, 12, searchTerm)
  }, [user, currentPage, fetchWishlist, navigate, searchParams])

  const handlePageChange = (page) => {
    const params = { page: page.toString() }
    const searchTerm = searchParams.get('search')
    if (searchTerm) {
      params.search = searchTerm
    }
    setSearchParams(params, { replace: true })
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const params = { page: '1' }
    if (search.trim()) {
      params.search = search.trim()
    }
    setSearchParams(params, { replace: true })
  }

  const handleClearSearch = () => {
    setSearch('')
    setSearchParams({ page: '1' }, { replace: true })
  }

  const handleRemove = async (productId) => {
    try {
      await toggleWishlist(productId)
      toast.success('Đã xóa khỏi danh sách yêu thích')
      // Refresh wishlist after removal
      const searchTerm = searchParams.get('search') || ''
      fetchWishlist(currentPage, 12, searchTerm)
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra')
    }
  }

  const handleClearAll = async () => {
    setRemoving(true)
    try {
      await clearWishlist()
      toast.success('Đã xóa tất cả khỏi danh sách yêu thích')
      // Refresh wishlist
      fetchWishlist(1, 12, '')
      setSearchParams({}, { replace: true })
      setSearch('')
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra')
    } finally {
      setRemoving(false)
      setDeleteConfirm(false)
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                Danh sách yêu thích
              </h1>
              <p className="text-gray-600">
                {pagination.total > 0 
                  ? `Bạn có ${pagination.total} sản phẩm trong danh sách yêu thích${pagination.totalPages > 1 ? ` (Trang ${currentPage}/${pagination.totalPages})` : ''}`
                  : searchParams.get('search') 
                    ? 'Không tìm thấy sản phẩm nào'
                    : 'Danh sách yêu thích của bạn đang trống'
                }
              </p>
            </div>
            {wishlist.length > 0 && (
              <button
                onClick={() => setDeleteConfirm(true)}
                disabled={removing}
                className="btn btn-secondary flex items-center justify-center"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                {removing ? 'Đang xóa...' : 'Xóa tất cả'}
              </button>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-sm"></div>
              <div className="relative bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 focus-within:shadow-xl focus-within:border-primary-500">
                <div className="flex items-center">
                  <div className="pl-4 pr-2">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm trong danh sách yêu thích..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 py-3 pr-4 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-400"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="mr-2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      aria-label="Xóa tìm kiếm"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="mr-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tìm kiếm
                  </button>
                </div>
              </div>
            </div>
          </form>
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

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm}
          onClose={() => setDeleteConfirm(false)}
          onConfirm={handleClearAll}
          title="Xóa tất cả khỏi danh sách yêu thích"
          message="Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi danh sách yêu thích? Hành động này không thể hoàn tác."
          type="danger"
        />
      </div>
    </div>
  )
}

export default Wishlist
