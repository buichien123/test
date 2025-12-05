import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingCartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import CartDropdown from '../Cart/CartDropdown'
import api from '../../utils/api'
import { formatPrice } from '../../utils/formatPrice'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { getCartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    // Close mobile menu when route changes
    setMobileMenuOpen(false)
    setSearchOpen(false)
  }, [location])

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const res = await api.get(`/products?search=${encodeURIComponent(query)}&limit=5`)
      setSearchResults(res.data.products || [])
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
      setSearchResults([])
    }
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-xl">🛍️</span>
            </div>
            <span className="text-2xl font-display font-bold text-gray-900 hidden sm:block">
              TechStore
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${location.pathname === '/'
                  ? 'text-primary-600'
                  : 'text-gray-700 hover:text-primary-600'
                }`}
            >
              Trang chủ
            </Link>
            <Link
              to="/products"
              className={`text-sm font-medium transition-colors ${location.pathname.startsWith('/products')
                  ? 'text-primary-600'
                  : 'text-gray-700 hover:text-primary-600'
                }`}
            >
              Sản phẩm
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {searchQuery && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-strong border border-gray-200 overflow-hidden z-[60]">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="block p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      onClick={() => {
                        setSearchQuery('')
                        setSearchResults([])
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image_url || 'https://via.placeholder.com/60x60'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-primary-600 font-semibold">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Icon - Mobile */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
              aria-label="Tìm kiếm"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>

            {/* Cart Dropdown */}
            <CartDropdown />

            {/* Wishlist */}
            {user && (
              <Link
                to="/wishlist"
                className="hidden md:block relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
                aria-label="Yêu thích"
              >
                <HeartIcon className="h-6 w-6" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/orders"
                  className="text-sm text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Đơn hàng
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <UserIcon className="h-5 w-5 text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">
                    {user.full_name || user.username}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-primary text-sm py-2"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary text-sm py-2"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 animate-slide-down relative z-[45]">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {searchQuery && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-strong border border-gray-200 overflow-hidden z-[60] max-h-96 overflow-y-auto">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="block p-4 hover:bg-gray-50 border-b border-gray-100"
                      onClick={() => {
                        setSearchQuery('')
                        setSearchResults([])
                        setSearchOpen(false)
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image_url || 'https://via.placeholder.com/60x60'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-primary-600 font-semibold">
                            {product.price.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-[45] md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="md:hidden py-4 border-t border-gray-200 animate-slide-down relative z-[46] bg-white">
              <div className="flex flex-col space-y-4">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Trang chủ
                </Link>
                <Link
                  to="/products"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sản phẩm
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/orders"
                      className="text-gray-700 hover:text-primary-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Đơn hàng
                    </Link>
                    <Link
                      to="/profile"
                      className="text-gray-700 hover:text-primary-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Tài khoản
                    </Link>
                    <Link
                      to="/wishlist"
                      className="text-gray-700 hover:text-primary-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Yêu thích
                    </Link>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2 mb-4">
                        <UserIcon className="h-5 w-5 text-gray-700" />
                        <span className="text-gray-900 font-medium">
                          {user.full_name || user.username}
                        </span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="btn btn-primary w-full"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <Link
                      to="/login"
                      className="block text-center text-gray-700 hover:text-primary-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      className="btn btn-primary w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Đăng ký
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
