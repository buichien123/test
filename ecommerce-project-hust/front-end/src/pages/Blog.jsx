import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendarIcon, UserIcon, EyeIcon, ChatBubbleLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import api from '../utils/api'
import Loading from '../components/UI/Loading'
import Pagination from '../components/UI/Pagination'
import { formatPrice } from '../utils/formatPrice'

const Blog = () => {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category_id') || '')
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 })

  const currentPage = parseInt(searchParams.get('page')) || 1

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [currentPage, searchParams])

  const fetchCategories = async () => {
    try {
      const res = await api.get('/blog/categories')
      setCategories(res.data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: 12,
        status: 'published',
        ...(searchParams.get('search') && { search: searchParams.get('search') }),
        ...(searchParams.get('category_id') && { category_id: searchParams.get('category_id') })
      }
      const res = await api.get('/blog/posts', { params })
      setPosts(res.data.posts || [])
      setPagination(res.data.pagination || { page: 1, limit: 12, total: 0, pages: 1 })
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const params = { page: '1' }
    if (search.trim()) {
      params.search = search.trim()
    }
    if (selectedCategory) {
      params.category_id = selectedCategory
    }
    setSearchParams(params, { replace: true })
  }

  const handleCategoryChange = (categoryId) => {
    const params = { page: '1' }
    if (search.trim()) {
      params.search = search.trim()
    }
    if (categoryId) {
      params.category_id = categoryId
    }
    setSelectedCategory(categoryId || '')
    setSearchParams(params, { replace: true })
  }

  const handlePageChange = (page) => {
    const params = { page: page.toString() }
    if (searchParams.get('search')) {
      params.search = searchParams.get('search')
    }
    if (searchParams.get('category_id')) {
      params.category_id = searchParams.get('category_id')
    }
    setSearchParams(params, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const stripHtml = (html) => {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            Tin tức & Blog
          </h1>
          <p className="text-gray-600 text-lg">
            Cập nhật những thông tin mới nhất về sản phẩm và công nghệ
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary px-8"
              >
                Tìm kiếm
              </button>
            </div>
          </form>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tất cả
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory == category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.name} {category.post_count > 0 && `(${category.post_count})`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-500 text-lg">Không tìm thấy bài viết nào</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug || post.id}`}
                  className="card overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  {post.featured_image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {post.categories && post.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.categories.map((cat) => (
                          <span
                            key={cat.id}
                            className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded"
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {stripHtml(post.excerpt)}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <UserIcon className="h-4 w-4" />
                          <span>{post.author_name || post.author_username || 'Admin'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{formatDate(post.published_at || post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>{post.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChatBubbleLeftIcon className="h-4 w-4" />
                        <span>{post.comment_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
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

export default Blog

