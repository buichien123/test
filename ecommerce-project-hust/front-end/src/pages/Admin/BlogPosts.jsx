import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { toast } from 'react-toastify'
import Loading from '../../components/UI/Loading'
import Pagination from '../../components/UI/Pagination'
import ConfirmDialog from '../../components/UI/ConfirmDialog'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline'

const BlogPosts = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchPosts()
  }, [page, statusFilter])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 20,
        ...(statusFilter && { status: statusFilter }),
        ...(search && { search })
      }
      const res = await api.get('/blog/posts', { params })
      setPosts(res.data.posts || [])
      setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, pages: 1 })
    } catch (error) {
      toast.error('Lỗi khi tải danh sách bài viết')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId) => {
    try {
      await api.delete(`/blog/posts/${postId}`)
      toast.success('Xóa bài viết thành công')
      fetchPosts()
      setDeleteConfirm(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa bài viết')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status) => {
    const texts = {
      draft: 'Bản nháp',
      published: 'Đã xuất bản',
      archived: 'Đã lưu trữ'
    }
    return texts[status] || status
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchPosts()
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Quản lý bài viết
          </h1>
          <p className="text-gray-600">
            Quản lý tất cả bài viết blog/tin tức
          </p>
        </div>
        <Link
          to="/admin/blog/new"
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Tạo bài viết mới
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 shadow-md">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="input md:w-48"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="draft">Bản nháp</option>
            <option value="published">Đã xuất bản</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
          <button type="submit" className="btn btn-primary">
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="card overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tác giả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lượt xem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày đăng
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        Không có bài viết nào
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {post.featured_image && (
                              <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                {post.title}
                              </div>
                              {post.categories && post.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {post.categories.slice(0, 2).map((cat) => (
                                    <span
                                      key={cat.id}
                                      className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded"
                                    >
                                      {cat.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {post.author_name || post.author_username || 'Admin'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              post.status
                            )}`}
                          >
                            {getStatusText(post.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {post.views || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(post.published_at || post.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/blog/${post.slug || post.id}`}
                              target="_blank"
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Xem"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </Link>
                            <Link
                              to={`/admin/blog/${post.id}/edit`}
                              className="text-primary-600 hover:text-primary-900 p-1"
                              title="Sửa"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => setDeleteConfirm(post.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Xóa"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.total > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} bài viết
              </div>
              {pagination.pages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Xóa bài viết"
        message="Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác."
        type="danger"
      />
    </div>
  )
}

export default BlogPosts

