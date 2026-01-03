import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { toast } from 'react-toastify'
import Loading from '../../components/UI/Loading'
import Pagination from '../../components/UI/Pagination'
import ConfirmDialog from '../../components/UI/ConfirmDialog'
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  EyeIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'

const BlogComments = () => {
  const [comments, setComments] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [postFilter, setPostFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [selectedComment, setSelectedComment] = useState(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    fetchComments()
  }, [page, statusFilter, postFilter])

  const fetchPosts = async () => {
    try {
      const res = await api.get('/blog/posts', { params: { limit: 100, status: 'published' } })
      setPosts(res.data.posts || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const fetchComments = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 20,
        ...(statusFilter && { status: statusFilter }),
        ...(postFilter && { post_id: postFilter }),
        ...(search.trim() && { search: search.trim() })
      }
      const res = await api.get('/blog/comments', { params })
      setComments(res.data.comments || [])
      setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, pages: 1 })
    } catch (error) {
      toast.error('Lỗi khi tải danh sách bình luận')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (commentId, newStatus) => {
    try {
      await api.put(`/blog/comments/${commentId}/status`, { status: newStatus })
      toast.success('Cập nhật trạng thái thành công')
      fetchComments()
      setSelectedComment(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái')
    }
  }

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/blog/comments/${commentId}`)
      toast.success('Xóa bình luận thành công')
      fetchComments()
      setDeleteConfirm(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa bình luận')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      spam: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Đã từ chối',
      spam: 'Spam'
    }
    return texts[status] || status
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Quản lý bình luận
        </h1>
        <p className="text-gray-600">
          Duyệt và quản lý bình luận bài viết
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bình luận..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
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
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Đã từ chối</option>
            <option value="spam">Spam</option>
          </select>
          <select
            value={postFilter}
            onChange={(e) => {
              setPostFilter(e.target.value)
              setPage(1)
            }}
            className="input md:w-48"
          >
            <option value="">Tất cả bài viết</option>
            {posts.map((post) => (
              <option key={post.id} value={post.id}>
                {post.title.substring(0, 50)}...
              </option>
            ))}
          </select>
        </div>
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
                      Bình luận
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người bình luận
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bài viết
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        Không có bình luận nào
                      </td>
                    </tr>
                  ) : (
                    comments.map((comment) => (
                      <tr key={comment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 line-clamp-2 max-w-md">
                            {comment.content}
                          </p>
                          {comment.parent_id && (
                            <span className="text-xs text-gray-500">(Trả lời)</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {comment.user_name || comment.name || 'Khách'}
                          </div>
                          {comment.email && (
                            <div className="text-xs text-gray-500">{comment.email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={`/blog/${comment.post_slug || comment.post_id}`}
                            target="_blank"
                            className="text-sm text-primary-600 hover:text-primary-700 line-clamp-1 max-w-xs"
                            title={comment.post_title}
                          >
                            {comment.post_title ? (comment.post_title.substring(0, 40) + '...') : 'Xem bài viết'}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              comment.status
                            )}`}
                          >
                            {getStatusText(comment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedComment(comment)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Xem chi tiết"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            {comment.status !== 'approved' && (
                              <button
                                onClick={() => handleStatusChange(comment.id, 'approved')}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Duyệt"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                            )}
                            {comment.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatusChange(comment.id, 'rejected')}
                                className="text-yellow-600 hover:text-yellow-900 p-1"
                                title="Từ chối"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteConfirm(comment.id)}
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
                Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} bình luận
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

      {/* Comment Detail Modal */}
      {selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 transform transition-all animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Chi tiết bình luận</h2>
              <button
                onClick={() => setSelectedComment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Người bình luận</label>
                <p className="text-gray-900">{selectedComment.user_name || selectedComment.name || 'Khách'}</p>
                {selectedComment.email && (
                  <p className="text-sm text-gray-600">{selectedComment.email}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nội dung</label>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedComment.content}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedComment.status)}`}>
                  {getStatusText(selectedComment.status)}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                <p className="text-gray-900">{formatDate(selectedComment.created_at)}</p>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                {selectedComment.status !== 'approved' && (
                  <button
                    onClick={() => handleStatusChange(selectedComment.id, 'approved')}
                    className="btn btn-primary flex-1"
                  >
                    Duyệt
                  </button>
                )}
                {selectedComment.status !== 'rejected' && (
                  <button
                    onClick={() => handleStatusChange(selectedComment.id, 'rejected')}
                    className="btn btn-secondary flex-1"
                  >
                    Từ chối
                  </button>
                )}
                <button
                  onClick={() => {
                    setDeleteConfirm(selectedComment.id)
                    setSelectedComment(null)
                  }}
                  className="btn btn-secondary text-red-600 hover:text-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Xóa bình luận"
        message="Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác."
        type="danger"
      />
    </div>
  )
}

export default BlogComments

