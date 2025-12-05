import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  FunnelIcon, 
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import api from '../utils/api'
import { getMockProducts, getMockCategories, searchMockProducts, getMockProductsByCategory } from '../services/mockData'
import ProductCard from '../components/Product/ProductCard'
import Loading from '../components/UI/Loading'
import EmptyState from '../components/UI/EmptyState'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category_id: searchParams.get('category_id') || '',
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page')) || 1,
    sort: searchParams.get('sort') || 'newest'
  })
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [filters])

  useEffect(() => {
    // Sync URL params with filters
    const params = new URLSearchParams()
    if (filters.category_id) params.set('category_id', filters.category_id)
    if (filters.search) params.set('search', filters.search)
    if (filters.page > 1) params.set('page', filters.page)
    if (filters.sort !== 'newest') params.set('sort', filters.sort)
    setSearchParams(params, { replace: true })
  }, [filters])

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories')
      setCategories(res.data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Use mock data as fallback
      setCategories(getMockCategories())
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    
    // Check if we should use mock data
    const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false
    
    if (USE_MOCK_DATA) {
      console.log('Using mock data (development mode)')
      let mockData = getMockProducts()
      
      // Apply filters to mock data
      if (filters.category_id) {
        mockData = getMockProductsByCategory(filters.category_id)
      }
      
      if (filters.search) {
        mockData = searchMockProducts(filters.search)
      }
      
      // Apply sorting
      if (filters.sort === 'price_low') {
        mockData.sort((a, b) => a.price - b.price)
      } else if (filters.sort === 'price_high') {
        mockData.sort((a, b) => b.price - a.price)
      }
      
      // Apply pagination
      const startIndex = (filters.page - 1) * 12
      const endIndex = startIndex + 12
      const paginatedData = mockData.slice(startIndex, endIndex)
      
      setProducts(paginatedData)
      setPagination({
        total: mockData.length,
        pages: Math.ceil(mockData.length / 12),
        current_page: filters.page,
        per_page: 12
      })
      setLoading(false)
      return
    }

    try {
      const params = new URLSearchParams()
      if (filters.category_id) params.append('category_id', filters.category_id)
      if (filters.search) params.append('search', filters.search)
      params.append('page', filters.page)
      params.append('limit', '12')
      
      // Add sorting
      if (filters.sort === 'price_low') {
        params.append('sort', 'price')
        params.append('order', 'asc')
      } else if (filters.sort === 'price_high') {
        params.append('sort', 'price')
        params.append('order', 'desc')
      }

      const res = await api.get(`/products?${params.toString()}`)
      const apiProducts = res.data.products || []
      
      // Use API data if available, otherwise fallback to mock
      if (apiProducts.length > 0) {
        setProducts(apiProducts)
        setPagination(res.data.pagination || {})
      } else {
        console.log('No products from API, using mock data')
        let mockData = getMockProducts()
        
        // Apply filters to mock data
        if (filters.category_id) {
          mockData = getMockProductsByCategory(filters.category_id)
        }
        
        if (filters.search) {
          mockData = searchMockProducts(filters.search)
        }
        
        // Apply sorting
        if (filters.sort === 'price_low') {
          mockData.sort((a, b) => a.price - b.price)
        } else if (filters.sort === 'price_high') {
          mockData.sort((a, b) => b.price - a.price)
        }
        
        // Apply pagination
        const startIndex = (filters.page - 1) * 12
        const endIndex = startIndex + 12
        const paginatedData = mockData.slice(startIndex, endIndex)
        
        setProducts(paginatedData)
        setPagination({
          total: mockData.length,
          pages: Math.ceil(mockData.length / 12),
          current_page: filters.page,
          per_page: 12
        })
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      // Use mock data as fallback
      console.log('Using mock data as fallback')
      let mockData = getMockProducts()
      
      // Apply filters to mock data
      if (filters.category_id) {
        mockData = getMockProductsByCategory(filters.category_id)
      }
      
      if (filters.search) {
        mockData = searchMockProducts(filters.search)
      }
      
      // Apply sorting
      if (filters.sort === 'price_low') {
        mockData.sort((a, b) => a.price - b.price)
      } else if (filters.sort === 'price_high') {
        mockData.sort((a, b) => b.price - a.price)
      }
      
      // Apply pagination
      const startIndex = (filters.page - 1) * 12
      const endIndex = startIndex + 12
      const paginatedData = mockData.slice(startIndex, endIndex)
      
      setProducts(paginatedData)
      setPagination({
        total: mockData.length,
        pages: Math.ceil(mockData.length / 12),
        current_page: filters.page,
        per_page: 12
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 })
  }

  const clearFilters = () => {
    setFilters({
      category_id: '',
      search: '',
      page: 1,
      sort: 'newest'
    })
  }

  const hasActiveFilters = filters.category_id || filters.search || filters.sort !== 'newest'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Sản phẩm</h1>
          <p className="text-gray-600">
            {pagination.total ? `Tìm thấy ${pagination.total} sản phẩm` : 'Khám phá bộ sưu tập của chúng tôi'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Bộ lọc</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Danh mục
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => handleFilterChange('category_id', '')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !filters.category_id
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Tất cả
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleFilterChange('category_id', cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.category_id === String(cat.id)
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sắp xếp
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="input text-sm"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_low">Giá: Thấp đến cao</option>
                  <option value="price_high">Giá: Cao đến thấp</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="card p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden btn btn-secondary flex items-center space-x-2"
              >
                <FunnelIcon className="h-5 w-5" />
                <span>Bộ lọc</span>
                {hasActiveFilters && (
                  <span className="badge badge-primary">
                    {[filters.category_id, filters.search, filters.sort !== 'newest'].filter(Boolean).length}
                  </span>
                )}
              </button>

              {/* Search - Mobile */}
              <div className="lg:hidden flex-1 w-full">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="input"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  aria-label="Grid view"
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  aria-label="List view"
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden card p-6 mb-6 animate-slide-down">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Bộ lọc</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục
                    </label>
                    <select
                      value={filters.category_id}
                      onChange={(e) => handleFilterChange('category_id', e.target.value)}
                      className="input"
                    >
                      <option value="">Tất cả danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sắp xếp
                    </label>
                    <select
                      value={filters.sort}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      className="input"
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="price_low">Giá: Thấp đến cao</option>
                      <option value="price_high">Giá: Cao đến thấp</option>
                    </select>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="btn btn-outline w-full"
                    >
                      Xóa tất cả bộ lọc
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Products Grid/List */}
            {loading ? (
              <Loading />
            ) : products.length === 0 ? (
              <EmptyState
                title="Không tìm thấy sản phẩm"
                description="Hãy thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác"
                actionLabel="Xóa bộ lọc"
                actionLink="/products"
              />
            ) : (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'
                      : 'space-y-4 mb-8'
                  }
                >
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ProductCard product={product} showWishlist={true} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                      disabled={filters.page === 1}
                      className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum
                        if (pagination.pages <= 5) {
                          pageNum = i + 1
                        } else if (filters.page <= 3) {
                          pageNum = i + 1
                        } else if (filters.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i
                        } else {
                          pageNum = filters.page - 2 + i
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setFilters({ ...filters, page: pageNum })}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              filters.page === pageNum
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                      disabled={filters.page === pagination.pages}
                      className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products
