import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRightIcon, 
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import api from '../utils/api'
import { getMockProducts, getMockCategories } from '../services/mockData'
import Chatbot from '../components/Chatbot/Chatbot'
import ProductCard from '../components/Product/ProductCard'
import Loading from '../components/UI/Loading'
import EmptyState from '../components/UI/EmptyState'

const Home = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // Check if we should use mock data (for development or when API is unavailable)
    const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false
    
    if (USE_MOCK_DATA) {
      console.log('Using mock data (development mode)')
      setProducts(getMockProducts(8))
      setCategories(getMockCategories())
      setLoading(false)
      return
    }

    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products?limit=8&status=active'),
        api.get('/categories')
      ])
      const apiProducts = productsRes.data.products || []
      const apiCategories = categoriesRes.data.categories || []
      
      // Use API data if available, otherwise fallback to mock
      if (apiProducts.length > 0) {
        setProducts(apiProducts)
        setCategories(apiCategories)
      } else {
        console.log('No products from API, using mock data')
        setProducts(getMockProducts(8))
        setCategories(getMockCategories())
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      // Use mock data as fallback
      console.log('Using mock data as fallback')
      setProducts(getMockProducts(8))
      setCategories(getMockCategories())
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: TruckIcon,
      title: 'Miễn phí vận chuyển',
      description: 'Cho đơn hàng từ 500.000đ'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Bảo hành chính hãng',
      description: 'Cam kết chất lượng sản phẩm'
    },
    {
      icon: ArrowPathIcon,
      title: 'Đổi trả dễ dàng',
      description: 'Trong vòng 7 ngày'
    },
    {
      icon: SparklesIcon,
      title: 'Ưu đãi đặc biệt',
      description: 'Nhiều chương trình khuyến mãi'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 text-balance">
              Khám phá thế giới
              <span className="block text-accent-300">Công nghệ số</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Nơi hội tụ những sản phẩm công nghệ hàng đầu với chất lượng vượt trội và giá cả hợp lý
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="btn btn-primary text-lg px-8 py-4 inline-flex items-center justify-center group"
              >
                Mua sắm ngay
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/products?category_id=1"
                className="btn btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-600"
              >
                Xem sản phẩm nổi bật
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-display font-bold mb-4">Danh mục sản phẩm</h2>
              <p className="text-gray-600 text-lg">Khám phá đa dạng các danh mục sản phẩm</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category_id=${category.id}`}
                  className="card p-6 text-center group hover:scale-105 transition-transform"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center group-hover:from-primary-200 group-hover:to-primary-300 transition-colors">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-display font-bold mb-4">Sản phẩm nổi bật</h2>
              <p className="text-gray-600 text-lg">Những sản phẩm được yêu thích nhất</p>
            </div>
            <Link
              to="/products"
              className="btn btn-outline hidden md:inline-flex items-center"
            >
              Xem tất cả
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {loading ? (
            <Loading />
          ) : products.length === 0 ? (
            <EmptyState
              title="Chưa có sản phẩm"
              description="Hiện tại chưa có sản phẩm nào để hiển thị"
              actionLabel="Tìm kiếm sản phẩm"
              actionLink="/products"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ProductCard product={product} showWishlist={true} />
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Link
                  to="/products"
                  className="btn btn-primary inline-flex items-center md:hidden"
                >
                  Xem tất cả sản phẩm
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display font-bold mb-4">
            Đăng ký nhận thông tin khuyến mãi
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Nhận ngay mã giảm giá 10% cho đơn hàng đầu tiên
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="btn bg-white text-primary-600 hover:bg-gray-100 px-8">
              Đăng ký
            </button>
          </div>
        </div>
      </section>

      <Chatbot />
    </div>
  )
}

export default Home
