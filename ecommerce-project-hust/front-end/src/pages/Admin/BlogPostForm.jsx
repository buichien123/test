import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { toast } from 'react-toastify'
import Loading from '../../components/UI/Loading'
import RichTextEditor from '../../components/Editor/RichTextEditor'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const BlogPostForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featured_image: '',
    status: 'draft',
    meta_title: '',
    meta_description: '',
    category_ids: [],
    published_at: ''
  })

  useEffect(() => {
    fetchCategories()
    if (isEditing) {
      fetchPost()
    }
  }, [id])

  const fetchCategories = async () => {
    try {
      const res = await api.get('/blog/categories')
      setCategories(res.data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchPost = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/blog/posts/${id}`)
      const post = res.data.post
      setFormData({
        title: post.title || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        featured_image: post.featured_image || '',
        status: post.status || 'draft',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        category_ids: post.categories ? post.categories.map(c => c.id) : [],
        published_at: post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : ''
      })
    } catch (error) {
      toast.error('Lỗi khi tải bài viết')
      navigate('/admin/blog')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề')
      return
    }

    if (!formData.content.trim()) {
      toast.error('Vui lòng nhập nội dung')
      return
    }

    setSaving(true)
    try {
      const submitData = {
        ...formData,
        published_at: formData.published_at || null
      }

      if (isEditing) {
        await api.put(`/blog/posts/${id}`, submitData)
        toast.success('Cập nhật bài viết thành công')
      } else {
        await api.post('/blog/posts', submitData)
        toast.success('Tạo bài viết thành công')
      }
      navigate('/admin/blog')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu bài viết')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      const categoryId = parseInt(value)
      setFormData(prev => ({
        ...prev,
        category_ids: checked
          ? [...prev.category_ids, categoryId]
          : prev.category_ids.filter(id => id !== categoryId)
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/blog')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Quay lại
        </button>
        <h1 className="text-3xl font-display font-bold text-gray-900">
          {isEditing ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Nhập tiêu đề bài viết..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tóm tắt
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              className="input"
              placeholder="Tóm tắt ngắn gọn về bài viết..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung *
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
              placeholder="Nhập nội dung bài viết..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh đại diện (URL)
            </label>
            <input
              type="url"
              name="featured_image"
              value={formData.featured_image}
              onChange={handleChange}
              className="input"
              placeholder="https://example.com/image.jpg"
            />
            {formData.featured_image && (
              <div className="mt-2">
                <img
                  src={formData.featured_image}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={category.id}
                      checked={formData.category_ids.includes(category.id)}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Status and Publishing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
              >
                <option value="draft">Bản nháp</option>
                <option value="published">Đã xuất bản</option>
                <option value="archived">Đã lưu trữ</option>
              </select>
            </div>

            {formData.status === 'published' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày giờ xuất bản
                </label>
                <input
                  type="datetime-local"
                  name="published_at"
                  value={formData.published_at}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO (Tùy chọn)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  className="input"
                  placeholder="Tiêu đề SEO..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  rows={3}
                  className="input"
                  placeholder="Mô tả SEO..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/blog')}
            className="btn btn-secondary"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo bài viết'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BlogPostForm

